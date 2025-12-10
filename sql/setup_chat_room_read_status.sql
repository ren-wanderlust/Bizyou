-- チームチャット用の既読管理テーブル
-- このSQLをSupabaseのSQLエディタで実行してください

-- 1. chat_room_read_status テーブルの作成
CREATE TABLE IF NOT EXISTS public.chat_room_read_status (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  chat_room_id uuid REFERENCES public.chat_rooms(id) ON DELETE CASCADE NOT NULL,
  last_read_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, chat_room_id)
);

-- 2. RLS（行レベルセキュリティ）の有効化
ALTER TABLE public.chat_room_read_status ENABLE ROW LEVEL SECURITY;

-- 3. SELECT ポリシー: 自分の既読状態のみ見れる
CREATE POLICY "Users can view their own read status"
ON public.chat_room_read_status FOR SELECT
USING (auth.uid() = user_id);

-- 4. INSERT ポリシー: 自分の既読状態のみ作成できる
CREATE POLICY "Users can insert their own read status"
ON public.chat_room_read_status FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- 5. UPDATE ポリシー: 自分の既読状態のみ更新できる
CREATE POLICY "Users can update their own read status"
ON public.chat_room_read_status FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 6. パフォーマンス用インデックス
CREATE INDEX IF NOT EXISTS chat_room_read_status_user_id_idx 
ON public.chat_room_read_status(user_id);

CREATE INDEX IF NOT EXISTS chat_room_read_status_chat_room_id_idx 
ON public.chat_room_read_status(chat_room_id);

CREATE INDEX IF NOT EXISTS chat_room_read_status_user_room_idx 
ON public.chat_room_read_status(user_id, chat_room_id);

-- 7. updated_at を自動更新するトリガー
CREATE OR REPLACE FUNCTION update_chat_room_read_status_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_chat_room_read_status_updated_at_trigger
BEFORE UPDATE ON public.chat_room_read_status
FOR EACH ROW
EXECUTE FUNCTION update_chat_room_read_status_updated_at();

CREATE POLICY "Users can mark received messages as read"
ON public.messages FOR UPDATE
USING (auth.uid() = receiver_id)
WITH CHECK (auth.uid() = receiver_id);