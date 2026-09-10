# かん字たんけん！ — GitHub Pages + Vercel 公開手順

この手順のゴールは1つです。

**Teamsに貼れる1本のURLを作る。**

---

## 全体像

1. WebアプリをGitHubへ置く
2. GitHub Pagesで公開する
3. AIバックエンドをVercelへ置く
4. VercelへOpenAI APIキーを登録する
5. WebアプリへVercelのURLを設定する
6. iPadで1問テストする
7. TeamsへGitHub Pages URLを配る

---

# A. GitHub Pagesを公開する

## 1
GitHubで新しいリポジトリを作ります。

例:
`kanji-tanken`

公開範囲は学校の運用方針に合わせて選んでください。

## 2
このパッケージのうち、`backend-vercel` 以外のWebファイルをリポジトリへ入れます。

重要なもの:
- `index.html`
- `styles.css`
- `app.js`
- `config.js`
- `manifest.webmanifest`
- `service-worker.js`
- `data/`
- `.github/workflows/pages.yml`

## 3
`main` ブランチへ保存します。

## 4
GitHub:
**Settings → Pages**

公開方法を **GitHub Actions** にします。

## 5
GitHub上部の **Actions** を開き、
`Deploy GitHub Pages` が成功するまで待ちます。

成功するとPages URLができます。

例:
`https://YOUR-NAME.github.io/kanji-tanken/`

このURLを控えます。

---

# B. AIバックエンドをVercelへ公開する

## 1
`backend-vercel` を別のGitHubリポジトリへ入れるのが一番分かりやすいです。

例:
`kanji-tanken-ai`

## 2
Vercelへログインし、
**Add New Project → Import Git Repository**

から `kanji-tanken-ai` を選びます。

## 3
VercelのProjectを開き、

**Settings → Environment Variables**

で3つ登録します。

### OPENAI_API_KEY
あなたのOpenAI APIキー。

**絶対にGitHubへ書かないでください。**

### OPENAI_MODEL
```
gpt-5.6-luna
```

### ALLOWED_ORIGIN
GitHub PagesのOrigin。

例:
```
https://YOUR-NAME.github.io
```

注意:
リポジトリ名 `/kanji-tanken/` はここには付けません。
Originは `https://YOUR-NAME.github.io` までです。

## 4
環境変数を保存後、Vercelを再デプロイします。

## 5
公開されたVercel URLの末尾へ `/api/recognize` を付けて開きます。

例:
`https://kanji-tanken-ai.vercel.app/api/recognize`

JSONで `status: ok` が出ればAIバックエンド入口は正常です。

---

# C. WebアプリとAIを接続する

方法は2つあります。

## おすすめ: config.js に設定

GitHub側の `config.js` を開き、

```js
window.KQ_CONFIG = {
  recognitionEndpoint: "https://あなたのVercelドメイン/api/recognize"
};
```

にします。

mainへ保存するとGitHub Pagesが自動更新されます。

## テストだけする場合

Webアプリ上部の **AI接続** を押して、
Vercel URLを入力しても構いません。

こちらはそのiPad/ブラウザだけに保存されます。

---

# D. iPad最終テスト

GitHub Pages URLをiPadのSafariで開きます。

次だけ確認します。

1. 学年・巻を選べる
2. 10問開始できる
3. 指で漢字を書ける
4. 1画もどせる
5. AIで答え合わせできる
6. 正解なら「せいかい／ほぼせいかい」
7. わざと別字を書くと「なおしてみよう」
8. 通信を切った場合に「×」ではなく「AIが判断できない」
9. 10問後にポイントが残る
10. Safariを閉じて開いても学習データが残る

---

# E. Teamsへ配る

配るのは **GitHub Pages URLだけ** です。

Vercel URLやOpenAI APIキーは児童へ配りません。

例:
`https://YOUR-NAME.github.io/kanji-tanken/`

Teamsの投稿に、

「このURLをSafariで開いてください」

として掲載します。

必要に応じてSafariの共有ボタンから
**ホーム画面に追加**
すると、アプリに近い見た目で起動できます。

---

# 絶対にしないこと

- APIキーを `config.js` に書く
- APIキーを `app.js` に書く
- APIキーをGitHubへアップロードする
- TeamsへVercel管理画面URLを配る
- AIが判断できない回答を無理に×にする

---

# 完成判定

次の3つが揃えばTeams配布準備完了です。

- GitHub Pages URLがiPadで開く
- AI接続が「接続済み」
- 実際の手書き3〜5字で判定できる

その後は、子ども数人で短い試用をしてからクラス全体へ広げるのがおすすめです。
