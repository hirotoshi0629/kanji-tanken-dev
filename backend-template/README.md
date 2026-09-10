# 手書きAIバックエンド（安全な接続先）について

GitHub Pages側にはAPIキーを置きません。

フロントエンドは `localStorage["kq.recognitionEndpoint"]` に保存されたHTTPS URLへ、
次のJSONをPOSTします。

```json
{
  "expected": "本",
  "reading": "ほん",
  "strokes": [[{"x":10,"y":20,"t":1234}]],
  "canvas": {"width": 600, "height": 500}
}
```

返却JSON:
```json
{
  "status": "excellent",
  "recognizedText": "本",
  "message": "せいかい！",
  "hint": null
}
```

status:
- excellent
- accepted
- revise
- uncertain

重要:
- APIキーをindex.html/app.jsへ書かない
- 子どもの氏名を送らない
- 手書き画像を永続保存しない
- 判定後のストロークデータもサーバーへ保存しない
- 低信頼時は uncertain を返す
