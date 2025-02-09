import type { Denops } from 'jsr:@denops/core';
import * as fn from 'jsr:@denops/std/function';
import * as helper from 'jsr:@denops/std/helper';

import { isValidUrl, URL_PATTERN } from './utils.ts';

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
        // カーソル位置を取得
        const [currentLine, currentCol] = await Promise.all([
          fn.line(denops, '.'),
          fn.col(denops, '.'),
        ]);

        // バッファの全行数を取得
        const lastLine = await fn.line(denops, '$');
        
        // バッファ内の全てのURLを収集
        const urlMatches: Array<{url: string; line: number; col: number}> = [];
        
        for (let lineNum = 1; lineNum <= lastLine; lineNum++) {
          const lineContent = await fn.getline(denops, lineNum);
          const matches = Array.from(lineContent.matchAll(URL_PATTERN)) as UrlMatch[];
          
          for (const match of matches) {
            urlMatches.push({
              url: match[0],
              line: lineNum,
              col: match.index,
            });
          }
        }

        if (urlMatches.length === 0) {
          await helper.echo(denops, 'No URLs found in the buffer');
          return;
        }

        // カーソルからの距離を計算し、距離でソート
        const distances = urlMatches.map(match => ({
          ...match,
          distance: Math.sqrt(
            Math.pow(match.line - currentLine, 2) +
            Math.pow(match.col - currentCol, 2)
          ),
          belowCursor: match.line >= currentLine
        })).sort((a, b) => a.distance - b.distance);

        // 最小距離を持つURLを見つける
        const minDistance = distances[0].distance;
        const nearestUrls = distances.filter(d => Math.abs(d.distance - minDistance) < 0.0001);

        // 同じ距離のURLが複数ある場合、カーソル行以下のものを優先
        const belowUrls = nearestUrls.filter(u => u.belowCursor);
        const selectedUrl = belowUrls.length > 0 ? belowUrls[0] : nearestUrls[0];

        // URLの検証
        const url = selectedUrl.url;
        if (!isValidUrl(url)) {
          await helper.echo(denops, `Invalid URL: ${url}`);
          return;
        }
        if (Deno.build.os === 'windows') {
          await new Deno.Command('cmd', {
            args: ['/c', 'start', url],
          }).output();
        } else {
          await new Deno.Command('open', {
            args: [url],
          }).output();
        }
      } catch (error) {
        console.error(error);
        if (error instanceof Error) {
          await helper.echo(denops, `Error: ${error.message}`);
        } else {
          await helper.echo(denops, `An unknown error occurred`);
        }
      }
    },
  };
}
