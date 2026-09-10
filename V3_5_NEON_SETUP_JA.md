# v3.5 Neon 教師用学習履歴 — 初回設定

## この版の考え方
- 実名はクラウドに保存しません。
- 児童コード（例 `3-1-07`）と必要最小限の学習履歴だけを保存します。
- どうぶつ・家具・手紙・たまごなどのゲーム情報は教師クラウドへ送りません。
- Neon はアイドル時に計算資源が休止しても、次のアクセスで自動的に起動する方式なので、
  長期休業後に先生が「再開」ボタンを押す運用を前提にしません。

## Vercel に設定する環境変数
今回必要なのは3つです。

1. `DATABASE_URL`
   - Neon の接続文字列
   - 例: `postgresql://...`
2. `TEACHER_PASSWORD`
   - 先生用画面に入るパスワード
3. `TEACHER_TOKEN_SECRET`
   - 十分長いランダムな秘密文字列
   - 教師ログイン後の認証トークン署名に使います

以前のSupabase版で使う予定だった
`SUPABASE_URL` と `SUPABASE_SERVICE_ROLE_KEY` は不要です。

## Neon 側
Neonでデータベースを作成し、SQL Editorで `NEON_SCHEMA.sql` を一度だけ実行します。

## 先生用画面
公開URLの末尾に `/teacher.html` を付けます。

例:
`https://kanji-tanken.vercel.app/teacher.html`

## 学校での運用
学校・自治体のクラウド利用/情報セキュリティ方針を確認してから本運用してください。
