-- ===================================
-- TANTEI - 探偵・興信所向け案件管理SaaS
-- Supabase テーブル作成SQL
-- ===================================

-- casesテーブル
CREATE TABLE IF NOT EXISTS cases (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_number   TEXT NOT NULL UNIQUE,          -- 案件番号（自動採番: TN-2024-0001）
  case_type     TEXT NOT NULL,                  -- 案件種別
  client_name   TEXT NOT NULL,                  -- 依頼人名
  client_kana   TEXT,                           -- 依頼人フリガナ
  client_phone  TEXT,                           -- 依頼人電話番号
  client_email  TEXT,                           -- 依頼人メールアドレス
  subject_name  TEXT,                           -- 調査対象者名
  start_date    DATE,                           -- 受任日
  due_date      DATE,                           -- 完了予定日
  retainer_fee  INTEGER DEFAULT 0,              -- 着手金額（円）
  total_fee     INTEGER DEFAULT 0,              -- 総費用（円）
  status        TEXT NOT NULL DEFAULT '相談中', -- ステータス
  notes         TEXT,                           -- 備考
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
);

-- ステータスの制約
ALTER TABLE cases ADD CONSTRAINT cases_status_check
  CHECK (status IN ('相談中', '受任', '調査中', '報告済', '完了', '請求済'));

-- 案件種別の制約
ALTER TABLE cases ADD CONSTRAINT cases_case_type_check
  CHECK (case_type IN ('浮気・不倫調査', '人物調査', '身辺調査', '企業調査', 'その他'));

-- updated_at を自動更新するトリガー
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER cases_updated_at
  BEFORE UPDATE ON cases
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ===================================
-- 案件番号の自動採番シーケンス
-- ===================================
CREATE SEQUENCE IF NOT EXISTS case_number_seq START 1;

-- 案件番号を自動生成する関数
-- 形式: TN-YYYY-NNNN (例: TN-2024-0001)
CREATE OR REPLACE FUNCTION generate_case_number()
RETURNS TEXT AS $$
BEGIN
  RETURN 'TN-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(nextval('case_number_seq')::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql;

-- ===================================
-- Row Level Security (RLS) 設定
-- 自分の案件しか見えないようにする
-- ===================================
ALTER TABLE cases ENABLE ROW LEVEL SECURITY;

-- 自分のデータのみ参照可能
CREATE POLICY "cases_select_own" ON cases
  FOR SELECT USING (auth.uid() = user_id);

-- 自分のデータのみ登録可能
CREATE POLICY "cases_insert_own" ON cases
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 自分のデータのみ更新可能
CREATE POLICY "cases_update_own" ON cases
  FOR UPDATE USING (auth.uid() = user_id);

-- 自分のデータのみ削除可能
CREATE POLICY "cases_delete_own" ON cases
  FOR DELETE USING (auth.uid() = user_id);

-- ===================================
-- インデックス
-- ===================================
CREATE INDEX IF NOT EXISTS cases_user_id_idx ON cases(user_id);
CREATE INDEX IF NOT EXISTS cases_status_idx ON cases(status);
CREATE INDEX IF NOT EXISTS cases_created_at_idx ON cases(created_at DESC);
