import { assertEquals } from "std/assert";
import { assertSpyCalls, spy } from "std/testing/mock";
import { test } from "std/testing/bdd";
import { URL_PATTERN, isValidUrl } from "./utils.ts";

// モックのDenops型を作成
type MockDenops = {
  name: string;
  cmd: (cmd: string, options: unknown) => Promise<void>;
  dispatcher: unknown;
};

// テストヘルパー関数
function createMockDenops(): MockDenops {
  return {
    name: "open-nearest-link",
    cmd: async () => {},
    dispatcher: {},
  };
}

test("URL Pattern matches valid URLs", () => {
  const testCases = [
    {
      input: "Check out https://example.com for more info",
      expected: ["https://example.com"],
    },
    {
      input: "Multiple URLs: http://test.com and https://example.org",
      expected: ["http://test.com", "https://example.org"],
    },
    {
      input: "No URLs here",
      expected: [],
    },
    {
      input: "Complex URL: https://sub.domain.com/path?param=value#hash",
      expected: ["https://sub.domain.com/path?param=value#hash"],
    },
  ];

  for (const { input, expected } of testCases) {
    const matches = Array.from(input.matchAll(URL_PATTERN)).map((m) => m[0]);
    assertEquals(matches, expected);
  }
});

test("isValidUrl validates URLs correctly", () => {
  const testCases = [
    { url: "https://example.com", expected: true },
    { url: "http://localhost:8080", expected: true },
    { url: "not-a-url", expected: false },
    { url: "https://", expected: false },
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

test("main function registers command", async () => {
  const denops = createMockDenops();
  const cmdSpy = spy(denops, "cmd");

  // main関数をインポートして実行
  const { main } = await import("./main.ts");
  await main(denops as any);

  assertSpyCalls(cmdSpy, 1);
});
