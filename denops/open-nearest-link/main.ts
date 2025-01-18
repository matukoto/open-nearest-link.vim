import type { Entrypoint } from 'jsr:@denops/std';
import { assert, is } from 'jsr:@core/unknownutil';
import * as buffer from 'jsr:@denops/std/buffer';
import * as fn from 'jsr:@denops/std/function';
import * as popup from 'jsr:@denops/std/popup';

export const main: Entrypoint = (denops) => {
  denops.dispatcher = {
    fetch: async (url) => {
      assert(url, is.String);
      const text = await postchanFetch(url);

      // Create a new buffer
      const bufnr = await fn.bufadd(denops, '');
      await fn.bufload(denops, bufnr);
      // Write some text to the buffer
      await buffer.replace(denops, bufnr, text.split('\n'));

      // Open a popup window showing the buffer
      await using _popupWindow = await popup.open(denops, {
        bufnr,
        relative: 'editor',
        width: 200,
        height: 20,
        row: 10,
        col: 3,
      });

      // Wait 3 seconds
      // redrawしないとpopupWindow が描画されない
      await denops.cmd('redraw');
      await new Promise((resolve) => setTimeout(resolve, 3000));
    },
  };
};

async function postchanFetch(url: string): Promise<string> {
  const response = await fetch(url);
  const text = await response.text();
  return text;
}
