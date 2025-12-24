import { supabase } from '../../lib/supabase';

/**
 * 双方向ブロック関係にあるユーザーIDを取得
 * - 自分がブロックした相手
 * - 自分をブロックした相手
 * の両方を含む
 * 
 * @param userId 現在のユーザーID
 * @returns ブロック関係にあるユーザーIDのSet
 */
export async function fetchBlockedUserIds(userId: string): Promise<Set<string>> {
    const { data, error } = await supabase
        .from('blocks')
        .select('blocker_id, blocked_id')
        .or(`blocker_id.eq.${userId},blocked_id.eq.${userId}`);

    if (error) {
        console.error('Error fetching blocks:', error);
        return new Set();
    }

    const blockedIds = new Set<string>();
    data?.forEach(block => {
        // 自分がブロックした相手
        if (block.blocker_id === userId) {
            blockedIds.add(block.blocked_id);
        }
        // 自分をブロックした相手
        if (block.blocked_id === userId) {
            blockedIds.add(block.blocker_id);
        }
    });

    return blockedIds;
}
