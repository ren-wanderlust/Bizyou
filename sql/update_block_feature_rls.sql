-- =============================================
-- ブロック機能: RLS アップデート
-- SupabaseのSQL Editorで実行してください
-- =============================================

-- =============================================
-- 1. blocks テーブル: 双方向読み取り許可
-- =============================================
-- 現在のポリシー: 自分がブロックしたレコードのみ読み取り可能
-- 変更後: 自分がブロックした OR 自分がブロックされたレコードを読み取り可能
-- 理由: クライアント側で双方向ブロックをチェックするため

DROP POLICY IF EXISTS "Users can view their own blocks" ON public.blocks;
DROP POLICY IF EXISTS "Users can view their blocks" ON public.blocks;
DROP POLICY IF EXISTS "Users can view blocks involving them" ON public.blocks;

CREATE POLICY "Users can view blocks involving them" ON public.blocks
FOR SELECT USING (
    auth.uid() = blocker_id OR auth.uid() = blocked_id
);

-- =============================================
-- 2. messages テーブル: ブロック時のINSERT拒否
-- =============================================
-- 現在のポリシー: sender_id = auth.uid() のみチェック
-- 変更後: sender_id = auth.uid() かつ ブロック関係にない場合のみ許可
-- 理由: ブロックされたユーザーからのメッセージをDBレベルで拒否

DROP POLICY IF EXISTS "Users can insert their own messages" ON public.messages;
DROP POLICY IF EXISTS "Users can insert messages if not blocked" ON public.messages;

CREATE POLICY "Users can insert messages if not blocked" 
ON public.messages FOR INSERT
WITH CHECK (
    auth.uid() = sender_id
    AND receiver_id IS NOT NULL
    AND NOT EXISTS (
        SELECT 1 FROM public.blocks
        WHERE (blocker_id = receiver_id AND blocked_id = sender_id)
           OR (blocker_id = sender_id AND blocked_id = receiver_id)
    )
);

-- 注意: グループチャット（chat_room_id が NOT NULL）の場合は
-- receiver_id が NULL になるため、上記ポリシーの receiver_id IS NOT NULL で
-- 除外されます。グループチャットには別のポリシーが適用されます。

-- =============================================
-- 確認用クエリ
-- =============================================
-- SELECT * FROM pg_policies WHERE tablename IN ('blocks', 'messages');
