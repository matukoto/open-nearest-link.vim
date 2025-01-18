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
      console.log(text);

      // Create a new buffer
      const bufinfo = await buffer.open(denops, 'hello');
      const { bufnr } = bufinfo;
      // const bufnr = await fn.bufadd(denops, '');
      await fn.bufload(denops, bufnr);

      // Write some text to the buffer
      await buffer.replace(denops, bufnr, text.split('\n'));
      //
      // // Open a popup window showing the buffer
      // const popupWindow = await popup.open(denops, {
      //   bufnr,
      //   relative: 'editor',
      //   width: 200,
      //   height: 200,
      //   row: 10,
      //   col: 10,
      // });
      //
      // // Config a popup window
      // await popup.config(denops, popupWindow.winid, {
      //   title: 'Hello, world!',
      // });
      //
      // // Wait 3 seconds
      await new Promise((resolve) => setTimeout(resolve, 3000));
      //
      // // Close the popup window
      // await popupWindow.close();
    },
  };
};

async function postchanFetch(url: string): Promise<string> {
  const response = await fetch(url);
  const text = await response.text();
  return text;
}
