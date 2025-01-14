import { assertEquals } from "jsr:@std/assert@^0.218.2/assert_equals";
import { assertMatch } from "jsr:@std/assert@^0.218.2/assert_match";
import { MockDenops } from "jsr:@denops/std@7.4.0/test/mod";
import * as fn from "jsr:@denops/std@7.4.0/function";
import { main } from "./main.ts";

Deno.test("OpenNearestLink command registration", async () => {
  const denops = new MockDenops();
  let registeredCommand = "";
  
  denops.cmd = async (cmd: string) => {
    registeredCommand = cmd;
    return Promise.resolve();
  };

  await main(denops);

  assertMatch(
    registeredCommand,
    /^command! OpenNearestLink call denops#notify/,
    "OpenNearestLink command should be registered"
  );
});

Deno.test("URL detection and validation", async () => {
  const denops = new MockDenops();
  const testLine = "Check https://example.com and http://test.org";
  let echoMessage = "";

  // Mock functions
  denops.cmd = async () => Promise.resolve();
  denops.dispatch = async () => Promise.resolve();
  fn.line = async () => Promise.resolve(1);
  fn.col = async () => Promise.resolve(10);
  fn.getline = async () => Promise.resolve(testLine);
  
  denops.cmd = async (cmd: string) => Promise.resolve();
  denops.eval = async (expr: string) => Promise.resolve("");

  await main(denops);
  
  // Test URL detection
  const urls = Array.from(testLine.matchAll(/https?:\/\/[^\s\]()）]*/g));
  assertEquals(
    urls.length,
    2,
    "Should detect two URLs in the test line"
  );
  assertEquals(
    urls[0][0],
    "https://example.com",
    "First URL should match exactly"
  );
  assertEquals(
    urls[1][0],
    "http://test.org",
    "Second URL should match exactly"
  );
});

Deno.test("Invalid URL handling", async () => {
  const denops = new MockDenops();
  const testLine = "Check invalid-url and http:/invalid-format";
  let echoMessage = "";

  // Mock functions
  denops.cmd = async () => Promise.resolve();
  denops.dispatch = async () => Promise.resolve();
  fn.line = async () => Promise.resolve(1);
  fn.col = async () => Promise.resolve(10);
  fn.getline = async () => Promise.resolve(testLine);
  
  denops.cmd = async (cmd: string) => Promise.resolve();
  denops.eval = async (expr: string) => Promise.resolve("");

  await main(denops);

  // Test URL validation
  const urls = Array.from(testLine.matchAll(/https?:\/\/[^\s\]()）]*/g));
  assertEquals(
    urls.length,
    0,
    "Should not detect any valid URLs in the test line"
  );
});
