-- project_applications テーブルに is_read カラムを追加
-- 募集（自分のプロジェクトへの応募）の未読管理用

-- 1. is_read カラムを追加
ALTER TABLE project_applications ADD COLUMN IF NOT EXISTS is_read BOOLEAN DEFAULT FALSE;

-- 2. 既存のレコードを既読として設定（任意）
-- UPDATE project_applications SET is_read = TRUE WHERE is_read IS NULL;

-- 3. UPDATE用のRLSポリシーを追加（プロジェクトオーナーが既読にできるように）
DROP POLICY IF EXISTS "Project owners can update application read status" ON project_applications;

CREATE POLICY "Project owners can update application read status"
ON project_applications FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM projects
        WHERE projects.id = project_applications.project_id
        AND projects.owner_id = auth.uid()
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM projects
        WHERE projects.id = project_applications.project_id
        AND projects.owner_id = auth.uid()
    )
);

