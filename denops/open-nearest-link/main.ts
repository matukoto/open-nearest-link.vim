import { type Denops } from "jsr:@denops/core";
import * as fn from "jsr:@denops/std/function";
import * as helper from "jsr:@denops/std/helper";

// URLの正規表現パターン
const URL_PATTERN = /https?:\/\/[^\s\]()）]*/g;

interface UrlMatch extends RegExpMatchArray {
  index: number;
}

export async function main(denops: Denops): Promise<void> {
  // コマンドの登録
  await denops.cmd(
    `command! OpenNearestLink call denops#notify('${denops.name}', 'openNearestLink', [])`,
    { noremap: true, silent: true },
  );

  // イベントハンドラの登録
  denops.dispatcher = {
    async openNearestLink(): Promise<void> {
      try {
        // 現在のカーソル位置を取得
        const [line, col] = await Promise.all([
          fn.line(".", denops),
          fn.col(".", denops),
        ]);

        // 現在の行の内容を取得
        const currentLine = await fn.getline(".", denops);

        // URLを検索
        const urls = Array.from(
          currentLine.matchAll(URL_PATTERN),
        ) as UrlMatch[];
        if (urls.length === 0) {
          await helper.echo(denops, "No URLs found in the current line");
          return;
        }

        // カーソルに最も近いURLを見つける
        let nearestUrl = urls[0];
        let minDistance = Math.abs(nearestUrl.index - col);

        for (const match of urls) {
          const distance = Math.abs(match.index - col);
          if (distance < minDistance) {
            minDistance = distance;
            nearestUrl = match;
          }
        }

        // URLの検証
        const url = nearestUrl[0];
        if (!isValidUrl(url)) {
          await helper.echo(denops, `Invalid URL: ${url}`);
          return;
        }
        if (Deno.build.os === "windows") {
          await new Deno.Command("cmd", {
            args: ["/c", "start", url],
          }).output();
        } else {
          await new Deno.Command("open", {
            args: [url],
          }).output();
        }
      } catch (error) {
        console.error(error);
        await helper.echo(denops, `Error: ${error.message}`);
      }
    },
  };
}
