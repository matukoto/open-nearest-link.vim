import type { Denops } from 'jsr:@denops/core';
import { assertEquals } from 'jsr:@std/assert';
import { assertSpyCalls, spy } from 'jsr:@std/testing/mock';
import { test } from 'jsr:@std/testing/bdd';
import { isValidUrl, URL_PATTERN } from './utils.ts';

import * as fn from 'jsr:@denops/std/function';
import * as helper from 'jsr:@denops/std/helper';

// モックのDenops型を作成
type MockDenops = {
  name: string;
  cmd: (cmd: string, options?: unknown) => Promise<void>;
  call: (fn: string, ...args: unknown[]) => Promise<unknown>;
  dispatcher: Record<string, unknown>;
};

// テストヘルパー関数
function createMockDenops(): MockDenops {
  return {
    name: 'open-nearest-link',
    cmd: async (): Promise<void> => {},
    call: async (fn: string, ...args: unknown[]): Promise<unknown> => {
      switch (fn) {
        case 'line':
          return args[0] || 1;
        case 'col':
          return args[0] || 1;
        case 'getline':
          return '';
        default:
          return undefined;
      }
    },
    dispatcher: {},
  };
}

test('URL Pattern matches valid URLs', () => {
  const testCases = [
    {
      input: 'Check out https://example.com for more info',
      expected: ['https://example.com'],
    },
    {
      input: 'Multiple URLs: http://test.com and https://example.org',
      expected: ['http://test.com', 'https://example.org'],
    },
    {
      input: 'No URLs here',
      expected: [],
    },
    {
      input: 'Complex URL: https://sub.domain.com/path?param=value#hash',
      expected: ['https://sub.domain.com/path?param=value#hash'],
    },
  ];

  for (const { input, expected } of testCases) {
    const matches = Array.from(input.matchAll(URL_PATTERN)).map((m) => m[0]);
    assertEquals(matches, expected);
  }
});

test('isValidUrl validates URLs correctly', () => {
  const testCases = [
    { url: 'https://example.com', expected: true },
    { url: 'http://localhost:8080', expected: true },
    { url: 'not-a-url', expected: false },
    { url: 'https://', expected: false },
  ];

  for (const { url, expected } of testCases) {
    const result = isValidUrl(url);
    assertEquals(
      result,
      expected,
      `isValidUrl('${url}') should return ${expected}`,
    );
  }
});

test('main function registers command', async () => {
  const denops = createMockDenops();
  const cmdSpy = spy(denops, 'cmd');

  // main関数をインポートして実行
  const { main } = await import('./main.ts');
  await main(denops as unknown as Denops);

  assertSpyCalls(cmdSpy, 1);
});

test('openNearestLink returns error when no URLs in buffer', async () => {
  const denops = createMockDenops();
  const echoSpy = spy(helper, 'echo');
  
  // モックの設定
  denops.call = async (fn: string, ...args: unknown[]): Promise<unknown> => {
    if (fn === 'line') {
      return args[0] === '$' ? 3 : 2; // カーソル行は2、バッファは3行
    }
    if (fn === 'getline') {
      return 'This is a test line without any URLs';
    }
    if (fn === 'col') return 1;
    return undefined;
  };

  const { main } = await import('./main.ts');
  await main(denops as unknown as Denops);

  // openNearestLink を実行
  await denops.dispatcher.openNearestLink();

  // エラーメッセージが表示されることを確認
  assertSpyCalls(echoSpy, 1);
  const [[_denops, message]] = echoSpy.calls[0].args;
  assertEquals(message, 'No URLs found in the buffer');
});

test('openNearestLink selects nearest URL to cursor position', async () => {
  const denops = createMockDenops();
  const commandSpy = spy(Deno.Command.prototype, 'output');

  const buffer = [
    'First URL: https://example1.com',
    'Some text here',
    'Second URL: https://example2.com'
  ];

  // モックの設定
  denops.call = async (fn: string, ...args: unknown[]): Promise<unknown> => {
    if (fn === 'line') {
      return args[0] === '$' ? buffer.length : 2; // カーソルは2行目
    }
    if (fn === 'getline') {
      const lineNum = typeof args[0] === 'number' ? args[0] : 2;
      return buffer[lineNum - 1];
    }
    if (fn === 'col') return 5; // カーソルは左側
    return undefined;
  };

  const { main } = await import('./main.ts');
  await main(denops as unknown as Denops);

  // openNearestLink を実行
  await denops.dispatcher.openNearestLink();

  // 距離的に近い上のURLが選択されることを確認
  assertSpyCalls(commandSpy, 1);
  const args = commandSpy.calls[0].self.args;
  assertEquals(args[args.length - 1], 'https://example1.com');
});

test('openNearestLink selects URL below cursor when multiple URLs have same distance', async () => {
  const denops = createMockDenops();
  const commandSpy = spy(Deno.Command.prototype, 'output');
  
  const buffer = [
    'Above URL: https://example1.com',
    'Some text here',
    'Below URL: https://example2.com'
  ];

  // モックの設定
  denops.call = async (fn: string, ...args: unknown[]): Promise<unknown> => {
    if (fn === 'line') {
      return args[0] === '$' ? buffer.length : 2; // カーソルは2行目
    }
    if (fn === 'getline') {
      const lineNum = typeof args[0] === 'number' ? args[0] : 2;
      return buffer[lineNum - 1];
    }
    if (fn === 'col') return 10; // カーソルは中央
    return undefined;
  };

  const { main } = await import('./main.ts');
  await main(denops as unknown as Denops);

  // openNearestLink を実行
  await denops.dispatcher.openNearestLink();

  // 下側のURLが選択されることを確認
  assertSpyCalls(commandSpy, 1);
  const args = commandSpy.calls[0].self.args;
  assertEquals(args[args.length - 1], 'https://example2.com');
});

test('openNearestLink selects nearest URL in 2D space', async () => {
  const denops = createMockDenops();
  const commandSpy = spy(Deno.Command.prototype, 'output');
  
  const buffer = [
    'Far: https://example1.com',
    'Near:      https://example2.com',
    'Also far: https://example3.com'
  ];

  // モックの設定
  denops.call = async (fn: string, ...args: unknown[]): Promise<unknown> => {
    if (fn === 'line') {
      return args[0] === '$' ? buffer.length : 2; // カーソルは2行目
    }
    if (fn === 'getline') {
      const lineNum = typeof args[0] === 'number' ? args[0] : 2;
      return buffer[lineNum - 1];
    }
    if (fn === 'col') return 7; // カーソルは"Near:"の直後
    return undefined;
  };

  const { main } = await import('./main.ts');
  await main(denops as unknown as Denops);

  // openNearestLink を実行
  await denops.dispatcher.openNearestLink();

  // 2次元距離で最も近いURLが選択されることを確認
  assertSpyCalls(commandSpy, 1);
  const args = commandSpy.calls[0].self.args;
  assertEquals(args[args.length - 1], 'https://example2.com');
});
