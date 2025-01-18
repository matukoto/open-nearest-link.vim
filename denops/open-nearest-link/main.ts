import type { Entrypoint } from 'jsr:@denops/std';
import { assert, is } from 'jsr:@core/unknownutil';

export const main: Entrypoint = (denops) => {
  denops.dispatcher = {
    fetch: async (url) => {
      assert(url, is.String);
      const text = await postchanFetch(url);
      console.log(text);
    },
  };
};

async function postchanFetch(url: string): Promise<string> {
  const response = await fetch(url);
  const text = await response.text();
  return text;
}
