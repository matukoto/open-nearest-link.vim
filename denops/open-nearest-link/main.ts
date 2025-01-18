import type { Entrypoint } from 'jsr:@denops/std@7.4.0';
import { assert, is } from 'jsr:@core/unknownutil@3.18.1';

export const main: Entrypoint = (denops) => {
  denops.dispatcher = {
    fetch: (url) => {
      console.log(url);
    },
  };
};
