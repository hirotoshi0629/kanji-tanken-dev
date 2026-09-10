# v3.7 先生別ログイン版

## Vercel環境変数（Production）
- DATABASE_URL: Neonの接続文字列
- TEACHER_TOKEN_SECRET: 長いランダム文字列
- TEACHER_SETUP_SECRET: 初回管理者作成専用の長いランダム文字列
- CRON_SECRET: 年度自動整理専用の別の長いランダム文字列

TEACHER_PASSWORD は不要です。

## Neon SQL
更新後の NEON_SCHEMA.sql をSQL Editorで再実行してください。`if not exists`なので既存表は消しません。teachers表が追加されます。

## 初回だけ
1. /teacher-setup.html を開く
2. TEACHER_SETUP_SECRET と自分の教師ID・ログインパスワードを入力
3. 管理者作成後は /teacher.html へ
4. 管理者は教師画面から各先生のID・初期パスワード・担当学年/組を作成

担任は自分の担当クラスだけ閲覧できます。管理者は全体を閲覧できます。
