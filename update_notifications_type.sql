-- notificationsテーブルのtype制約を更新
-- プロジェクト応募関連の通知タイプを追加

-- 1. 既存の制約を削除
alter table public.notifications drop constraint if exists notifications_type_check;

-- 2. 新しい制約を追加（application_status と project_application を含む）
alter table public.notifications add constraint notifications_type_check 
  check (type in (
    'important', 
    'update', 
    'psychology', 
    'other', 
    'like', 
    'match',
    'application_status',    -- 応募ステータス更新通知
    'project_application',   -- プロジェクト応募通知
    'message'                -- メッセージ通知
  ));
