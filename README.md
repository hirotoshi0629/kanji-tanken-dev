# かん字たんけん！ v1.0 COMPLETE CANDIDATE

無料・端末内判定を維持した完成版候補です。

- 1〜6年の学年・巻選択
- レビュー済み142問から各回ランダム10問（同じ漢字は重複させない）
- 漢字1字、熟語、送り仮名の手書き
- 送り仮名は文字数を隠す横長マス
- 答えを見る（練習扱い）
- 10問終了後の結果画面
- もう10問／ホームへ戻る
- 学習履歴・ポイントは端末内保存

# かん字たんけん！ v0.10

## 今回の修正
- 漢字マスが縦長につぶれないよう、正方形サイズを優先するレイアウトに修正。
- 「問い合わせた」のように漢字と送り仮名が交互に並び、マスが細くなる問題を、より単純な「先生にわけを問う。」へ変更。
- 「答えを見る」ボタンを追加。どうしても分からないときは正答を表示し、その後に写して練習できる。
- 答えを見た問題は通常の正解ポイントを付けず、練習として記録する。

# かん字たんけん！どうぶつスクール NEW — Web/PWA v0.3

TeamsでURL配布 → iPad Safariで利用 → 必要ならホーム画面へ追加、を前提にしたWeb版です。

## すでに入っているもの
- 正式漢字マスター 1026字
- reviewed問題 142問
- 学年・巻選択
- 1セット10問・対象漢字重複なし
- iPad直接書字キャンバス
- 1画戻す / 全消去
- ポイント・相棒成長・コレクションの端末内保存
- PWA manifest / service worker
- GitHub Pages Actions
- 手書きAI用の安全なHTTPSバックエンド接続口
- AI未接続時は偽判定をせず「AI接続準備中」

## GitHub Pages公開
1. このフォルダの中身をGitHubリポジトリのルートへアップロード
2. `main` ブランチへpush
3. GitHub > Settings > Pages > Source を GitHub Actions にする
4. Actions完了後にPages URLをTeamsへ貼る

## AIについて
Google ML Kit Digital Ink Recognition はiOS/Android向けSDKであり、
GitHub Pages上のJavaScriptからそのまま呼ぶ構成にはしていません。
Web版では秘密鍵をHTMLへ埋め込まないため、手書きAIだけHTTPSバックエンドへ分離します。

`backend-template/README.md` にリクエスト/レスポンス仕様があります。

## 安全性
- 氏名を扱わない
- 手書き画像を保存しない
- 学習履歴はlocalStorage
- APIキーを公開リポジトリへ置かない


## Web v0.2
手書きAIバックエンドを追加しました。

構成:
Teams → GitHub Pages(PWA) → Vercel HTTPS API → OpenAI vision判定

ポイント:
- APIキーはGitHub Pagesへ置かない
- 手書きストロークだけから一時SVGを作る
- OpenAI Responses APIへ画像入力
- Structured Outputsで4段階判定をJSON固定
- `store:false`
- AIが別字を認識しているのに正解扱いする矛盾をサーバー側で防止
- API障害・低信頼時は `uncertain`。子どもを誤って×にしない
- Web画面に「AI接続」設定を追加


## Web v0.3 — Deployment Ready
- 日本語の公開手順 `DEPLOYMENT_GUIDE_JA.md`
- GitHub Pages Workflowを現行Actionsへ更新
- Vercel用 `.env.example` / `.gitignore`
- `ALLOWED_ORIGIN` によるブラウザCORS制限
- API応答に `Cache-Control: no-store`
- AI出力トークン上限
- 教師用 `setup-check.html`
- TeamsへはGitHub Pages URLだけ配る構成


## v0.9.1 修正
- 送り仮名の手書きが正しいのに不正解になる偽陰性を抑制。
- 漢字用認識器の候補だけを理由に、ひらがなの送り仮名を不正解にしない。
- 送り仮名は、完全一致候補が得られた場合はそれを使い、得られない場合は筆跡量・横方向の広がりを使った保守的な端末内確認へフォールバック。


## v1.2 50 ANIMALS
- Animal collection expanded to 50 species.
- Unlocks use lifetime earned PT, so spending PT on care never re-locks friends.
- Friendship is saved separately for each animal.
- Collection progress is shown in the animal room.


## v1.4 DAILY QUEST + BADGES
- 50-animal encyclopedia
- next-animal progress
- per-animal friendship stages
- new-animal unlock celebration
- fixes home friendship progress bar


## v1.5 QUESTION AUDIT + SAFETY
- 142問すべての出題データを機械検査。
- 「簡単」のように、赤線が「かん」だけなのに周囲の「単」まで解答へ混入する不具合を修正。
- 現在の問題バンクは「対象漢字1字＋必要な送り仮名」のみを手書き解答とする。
- 隣接して画面に印刷されている漢字を解答へ取り込まない。
- 起動時にも整合性チェックを行い、壊れた問題は出題候補から除外する。
- 東京書籍マスターとの配当学年照合も実施。


## v1.6 Release Candidate + Stability
- 全問題の出題整合性監査を継続。
- 壊れた端末内保存データがあっても起動停止しない安全読み込み。
- 答え合わせ連打によるPT二重加算を防止。
- 正解前に「次へ」が進まないガード。
- 教材JSONの読み込み失敗時に子ども向けの安全なエラー表示。
- Service Workerをv1.6へ更新し、旧版キャッシュを削除。


## v1.7 READING MASTER 2066
この版では「1026字」だけではなく、教材マスターにある **2066の読みターゲット**を正式に別IDで管理します。

- 漢字マスター: 1026 / 1026
- 読みターゲット: 2066 / 2066
- 読み替えも別ターゲットとして保持
- 初出学年・初出巻・ページを保持
- 現在のレビュー済み問題は従来の142問を維持
- 自然な語・例文が未レビューの読みターゲットを児童へ自動出題しない
- 未整備ターゲットは `data/question_work_queue_2004.json` で作業管理
- `Tools/audit_2066_readings.py` で教材マスターの完全性を自動監査
- `reading-coverage.html` で巻別カバレッジを確認可能

重要:
**2066件の読み情報が揃ったことと、2066件の問題文が完成したことは別です。**
Excel/教材マスターには読み・学年・巻・ページはありますが、各読みを自然かつ一意に出題する語句・例文までは含まれていません。
そのため、問題文の創作を正本扱いせず、レビュー済み問題だけ児童へ出す安全ゲートを維持します。


## v1.8 READING COVERAGE BATCH 1
- 読み照合のカタカナ/ひらがな正規化バグを修正。
- 一上の未カバー読みをレビュー済み問題として追加。
- 一上の読みターゲット: 32/32。
- 全体の読みカバレッジ: 94/2066。
- レビュー済み問題: 164問。


## v1.10 MIX MODE + READING BATCH 3
- 1〜4年に「上下ミックス」追加
- ミックス時は上・下から原則5問ずつ、同じ漢字を重複出題しない
- 一下の送り仮名を伴う高信頼読みを追加


## v1.0 FINAL
最終受け入れ監査済み。2066読み・2136レビュー済み問題を収録。詳細は FINAL_ACCEPTANCE_REPORT_v1.0.json を参照してください。
