# 無料・端末内手書き判定版

この版は OpenAI API / Vercel API を答え合わせに使用しません。
手書き認識はブラウザ内で Kanji Canvas を利用します。

- Project: Kanji Canvas — https://github.com/asdfjkl/kanjicanvas
- Copyright (c) 2019-2024 Dominik Klein; Copyright (c) 2020 Seth Clydesdale
- License: MIT-style license（元プロジェクトの LICENSE.TXT に従う）

認識用 JavaScript と参照パターンは jsDelivr 経由で読み込みます。そのため、初回利用時にはインターネット接続が必要です。API利用料は発生しません。

## 判定方針
- 正解漢字が第1候補: 「せいかい」
- 第2〜第6候補: 多少の崩れを許容して「せいかい／ほぼせいかい」
- 正解漢字が上位候補にない: 「なおしてみよう」
- 認識不能: 無理に×にせず再挑戦

学校で本格運用する前に、各学年の配当漢字について実機iPadで誤判定テストを行ってください。
