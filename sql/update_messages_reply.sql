-- メッセージテーブルにリプライ機能用のカラムを追加
-- このSQLをSupabaseのSQLエディタで実行してください

-- reply_toカラムを追加 (JSON形式でリプライ元の情報を保存)
alter table public.messages 
add column if not exists reply_to jsonb;

-- 既存のデータにはnullが入ります
