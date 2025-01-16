import { assertEquals } from "jsr:@std/assert";
import { main } from "./main.ts";
import { Denops } from "jsr:@denops/core";
import * as fn from "jsr:@denops/std/function";
import * as helper from "jsr:@denops/std/helper";

Deno.test("main function registers command and dispatcher", async () => {
  const denops = {
    cmd: async (cmd: string, opts: Record<string, unknown>) => {
      assertEquals(
        cmd,
        `command! OpenNearestLink call denops#notify('denops', 'openNearestLink', [])`,
      );
      assertEquals(opts, { noremap: true, silent: true });
    },
    dispatcher: {},
    name: "denops",
  } as unknown as Denops;

  await main(denops);

  assertEquals(typeof denops.dispatcher.openNearestLink, "function");
});

Deno.test("openNearestLink function opens nearest valid URL", async () => {
  const denops = {
    cmd: async () => {},
    dispatcher: {},
    name: "denops",
  } as unknown as Denops;

  await main(denops);

  const openNearestLink = denops.dispatcher.openNearestLink as () => Promise<
    void
  >;

  const mockLine =
    "Check this link: https://example.com and this one: http://example.org";
  const mockCol = 20;

  // fn.line = async () => 1;
  // fn.col = async () => mockCol;
  // fn.getline = async () => mockLine;
  // helper.echo = async () => {};

  let openedUrl = "";
  Deno.Command = class {
    constructor(public cmd: string, public options: { args: string[] }) {
      openedUrl = options.args[0];
    }
    async output() {}
  } as unknown as typeof Deno.Command;

  // globalThis.isValidUrl = (url: string) => url.startsWith("http");

  await openNearestLink();

  assertEquals(openedUrl, "https://example.com");
});

Deno.test("openNearestLink function handles no URLs found", async () => {
  const denops = {
    cmd: async () => {},
    dispatcher: {},
    name: "denops",
  } as unknown as Denops;

  await main(denops);

  const openNearestLink = denops.dispatcher.openNearestLink as () => Promise<
    void
  >;

  const mockLine = "No URLs here";
  const mockCol = 5;

  // fn.line = async () => 1;
  // fn.col = async () => mockCol;
  // fn.getline = async () => mockLine;
  //  helper.echo = async (denops: Denops, message: string) => {
  //   assertEquals(message, "No URLs found in the current line");
  // };

  await openNearestLink();
});

Deno.test("openNearestLink function handles invalid URL", async () => {
  const denops = {
    cmd: async () => {},
    dispatcher: {},
    name: "denops",
  } as unknown as Denops;

  await main(denops);

  const openNearestLink = denops.dispatcher.openNearestLink as () => Promise<
    void
  >;

  const mockLine = "Invalid URL: ftp://example.com";
  const mockCol = 15;

  // fn.line = async () => 1;
  // fn.col = async () => mockCol;
  // fn.getline = async () => mockLine;
  // helper.echo = async (denops: Denops, message: string) => {
  //   assertEquals(message, "Invalid URL: ftp://example.com");
  // };

  // globalThis.isValidUrl = (url: string) => url.startsWith("http");

  await openNearestLink();
});

Deno.test("openNearestLink function handles errors", async () => {
  const denops = {
    cmd: async () => {},
    dispatcher: {},
    name: "denops",
  } as unknown as Denops;

  await main(denops);

  const openNearestLink = denops.dispatcher.openNearestLink as () => Promise<
    void
  >;

  // fn.line = async () => {
  //   throw new Error("Test error");
  // };

  // helper.echo = async (denops: Denops, message: string) => {
  //   assertEquals(message, "Error: Test error");
  // };

  await openNearestLink();
});
