-- =====================================================
-- profiles テーブルの RLS (Row Level Security) 設定
-- =====================================================
-- 
-- このファイルは、profiles テーブルに RLS を有効化し、
-- 適切なセキュリティポリシーを設定します。
--
-- 実行方法: Supabase Dashboard > SQL Editor でこのファイルを実行
-- =====================================================

begin;

-- RLSを有効化（既に有効な場合はエラーにならない）
alter table public.profiles enable row level security;

-- 既存ポリシーを一旦消す（名前はあなたの表示に合わせる）
drop policy if exists "Public profiles are viewable by everyone." on public.profiles;
drop policy if exists "Users can insert their own profile." on public.profiles;
drop policy if exists "Users can update own profile." on public.profiles;
drop policy if exists "Users can delete own profile." on public.profiles; -- 念のため

-- 読み取りは公開（必要なら authenticated のみにしてOK）
create policy "Public profiles are viewable by everyone."
on public.profiles
for select
to public
using (true);

-- 作成は authenticated のみ + 自分の行だけ
create policy "Users can insert their own profile."
on public.profiles
for insert
to authenticated
with check (auth.uid() = id);

-- 更新も authenticated のみ + 自分の行だけ（USING と WITH CHECK 両方）
create policy "Users can update own profile."
on public.profiles
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

-- 削除も authenticated のみ + 自分の行だけ（念のため）
create policy "Users can delete own profile."
on public.profiles
for delete
to authenticated
using (auth.uid() = id);

commit;

-- =====================================================
-- ポリシー確認用クエリ（実行後、確認用に実行してください）
-- =====================================================
-- 
-- SELECT 
--     schemaname,
--     tablename,
--     policyname,
--     permissive,
--     roles,
--     cmd,
--     qual,
--     with_check
-- FROM pg_policies
-- WHERE tablename = 'profiles'
-- ORDER BY policyname;
-- 
-- =====================================================
