// URLの正規表現パターン
export const URL_PATTERN = /https?:\/\/[^\s\]()）]*/g;

export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}
