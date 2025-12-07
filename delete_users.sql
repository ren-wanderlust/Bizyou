-- =============================================
-- 17ユーザー一括削除スクリプト（修正版v2）
-- SupabaseのSQL Editorで実行してください
-- =============================================

DO $$
DECLARE
    user_ids UUID[] := ARRAY[
        '28d833c7-9ce7-4ea2-9186-f2cad5296efe'::uuid,
        '320cb61f-8fb5-4849-8709-aa1ce8202b57'::uuid,
        '3ba73442-da33-44af-8d6a-929384608e4d'::uuid,
        '3bfb1d4e-4803-4d79-95df-cf2b89d2d9f9'::uuid,
        '4acb700e-89e9-430b-ace2-5136e295eec2'::uuid,
        '4f4322bb-ec96-436f-b6bc-33f2fc6068d6'::uuid,
        '604cba41-69e6-484a-847d-067530b748a0'::uuid,
        '81fc79f6-79e7-4f21-961d-51e9aedcd905'::uuid,
        'a497281e-2eec-4ec5-ba8c-938de297bfe0'::uuid,
        'abbd9595-ad7f-4b85-8780-8d0d8113620e'::uuid,
        'ad7af7a4-9567-4f79-81e0-3acf709d1972'::uuid,
        'c68f2698-d293-4b11-85ae-4184b6d5603d'::uuid,
        'd239fb9d-2ec1-479b-8c8c-195e3a91821d'::uuid,
        'd42be74a-54a1-42c3-8962-d121521e26bc'::uuid,
        'e9e27a96-0a35-4e62-bb10-e96a56278097'::uuid,
        'eda9005e-3e7e-4c98-99c5-603c5b497e7b'::uuid,
        'f8ec2ecd-8ba8-47a5-af34-e1fe88d9bcbe'::uuid
    ];
    target_user_id UUID;
    deleted_count INT := 0;
BEGIN
    FOREACH target_user_id IN ARRAY user_ids
    LOOP
        -- 1. チャットメッセージを削除
        BEGIN
            DELETE FROM messages WHERE sender_id = target_user_id OR receiver_id = target_user_id;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'messages削除スキップ: %', SQLERRM;
        END;
        
        -- 2. いいねを削除
        BEGIN
            DELETE FROM likes WHERE user_id = target_user_id OR target_id = target_user_id;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'likes削除スキップ: %', SQLERRM;
        END;
        
        -- 3. マッチを削除
        BEGIN
            DELETE FROM matches WHERE user1_id = target_user_id OR user2_id = target_user_id;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'matches削除スキップ: %', SQLERRM;
        END;
        
        -- 4. プロジェクト申請を削除
        BEGIN
            DELETE FROM project_applications WHERE user_id = target_user_id;
            DELETE FROM project_applications WHERE project_id IN (
                SELECT id FROM projects WHERE owner_id = target_user_id
            );
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'project_applications削除スキップ: %', SQLERRM;
        END;
        
        -- 5. プロジェクトのテーマを削除
        BEGIN
            DELETE FROM project_themes WHERE project_id IN (
                SELECT id FROM projects WHERE owner_id = target_user_id
            );
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'project_themes削除スキップ: %', SQLERRM;
        END;
        
        -- 6. プロジェクトのロールを削除
        BEGIN
            DELETE FROM project_roles WHERE project_id IN (
                SELECT id FROM projects WHERE owner_id = target_user_id
            );
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'project_roles削除スキップ: %', SQLERRM;
        END;
        
        -- 7. プロジェクトを削除
        BEGIN
            DELETE FROM projects WHERE owner_id = target_user_id;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'projects削除スキップ: %', SQLERRM;
        END;
        
        -- 8. プッシュトークンを削除
        BEGIN
            DELETE FROM push_tokens WHERE user_id = target_user_id;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'push_tokens削除スキップ: %', SQLERRM;
        END;
        
        -- 9. プロフィールを削除
        BEGIN
            DELETE FROM profiles WHERE id = target_user_id;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'profiles削除スキップ: %', SQLERRM;
        END;
        
        -- 10. 認証ユーザーを削除
        BEGIN
            DELETE FROM auth.users WHERE id = target_user_id;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'auth.users削除スキップ: %', SQLERRM;
        END;
        
        deleted_count := deleted_count + 1;
        RAISE NOTICE '処理完了 [%/17]: %', deleted_count, target_user_id;
    END LOOP;
    
    RAISE NOTICE '========================================';
    RAISE NOTICE '合計 17 ユーザーの処理が完了しました';
    RAISE NOTICE '========================================';
END $$;
