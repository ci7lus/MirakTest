export const trimCommentForFlow = (s: string) => {
  return s
    .replace(/https?:\/\/[\w!?/+\-_~;.,*&@#$%()'[\]]+\s?/g, "") // URL削除
    .replace(/#.+\s?/g, "") // ハッシュタグ削除
    .replace(/@\w+?\s?/g, "") // メンション削除
    .replace(/^\/nicoad.*/, "") // ニコニ広告削除
    .replace(/^\/\w+\s?/, "") // コマンド削除
}
