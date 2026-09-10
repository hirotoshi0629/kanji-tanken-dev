# 手書きAIバックエンド — Vercel公開用

このフォルダだけをVercelへ公開します。

## 環境変数
Vercel Project → Settings → Environment Variables に次を登録します。

- `OPENAI_API_KEY` — OpenAI APIキー。秘密情報。
- `OPENAI_MODEL` — `gpt-5.6-luna` 推奨。
- `ALLOWED_ORIGIN` — GitHub PagesのサイトのOrigin。
  例: `https://teacher-name.github.io`

環境変数を追加・変更したら、Vercelで再デプロイしてください。

## 公開後の確認
ブラウザで次を開きます。

`https://あなたのVercelドメイン/api/recognize`

次のようなJSONが出れば接続口は正常です。

```json
{"status":"ok","service":"kanjiquest-handwriting","version":"0.2"}
```

## セキュリティ
- APIキーはフロントエンドに置かない。
- `.env` をGitHubへアップロードしない。
- 児童の氏名・Teams情報は送らない。
- 手書き画像をファイル保存しない。
- OpenAI Responses APIは `store:false`。
- AI低信頼時やAPI障害時は `uncertain`。
- `ALLOWED_ORIGIN` で学校用GitHub Pagesからのブラウザアクセスに絞れる。
