# TANTEI - 探偵・興信所向け案件管理SaaS

探偵事務所・興信所が案件を受付から完了・請求まで一元管理できるWebアプリケーションです。

## 概要

- 案件の登録・編集・削除
- ステータス管理（相談中 → 受任 → 調査中 → 報告済 → 完了 → 請求済）
- 請求書のプレビュー・PDF出力
- ダッシュボードによる案件サマリー表示
- メールアドレス＋パスワード認証（ユーザーごとにデータ分離）

## 使用技術

| カテゴリ | 技術 |
|---|---|
| フロントエンド | Next.js 16 (App Router) |
| 言語 | TypeScript |
| スタイリング | Tailwind CSS |
| バックエンド・DB | Supabase (PostgreSQL + Auth) |
| ホスティング | Vercel |

## セットアップ手順

### 1. リポジトリをクローン

```bash
git clone https://github.com/yabuta16/tantei-app.git
cd tantei-app
npm install
```

### 2. Supabaseプロジェクトを作成

[supabase.com](https://supabase.com) でプロジェクトを作成し、`supabase/schema.sql` をSQL Editorで実行してテーブルを作成します。

### 3. 環境変数を設定

`.env.local` を作成して以下を記入します：

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 4. 開発サーバーを起動

```bash
npm run dev
```

[http://localhost:3000](http://localhost:3000) をブラウザで開きます。

### 5. ユーザーを作成

Supabaseダッシュボードの **Authentication → Users → Add user** からユーザーを作成してログインします。

## 使い方

1. ログイン後、ダッシュボードで案件のサマリーを確認
2. 「案件一覧」から新規案件を登録
3. 案件詳細画面でステータスを変更
4. 完了後「請求書」ボタンから請求書をPDF出力

## デプロイ方法（Vercel）

1. [vercel.com](https://vercel.com) にGitHubアカウントでログイン
2. 「Add New Project」→ `tantei-app` をImport
3. Environment Variablesに `NEXT_PUBLIC_SUPABASE_URL` と `NEXT_PUBLIC_SUPABASE_ANON_KEY` を設定
4. 「Deploy」をクリック
5. Supabaseの **Authentication → URL Configuration** にVercelのURLを登録
