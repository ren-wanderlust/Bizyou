import { supabase } from '../../lib/supabase';
import { Profile } from '../../types';
import { mapProfileRowToProfile } from '../../utils/profileMapper';

export interface ReceivedLike {
  sender_id: string;
  is_read: boolean;
  is_read_as_match: boolean;
  sender?: Profile;
}

export interface ReceivedLikesResult {
  profiles: Profile[];
  unreadInterestIds: Set<string>;
  unreadMatchIds: Set<string>;
}

/**
 * 受信いいねを取得
 * @param userId ユーザーID
 * @returns プロフィール配列と未読IDセット
 */
export async function fetchReceivedLikes(userId: string): Promise<ReceivedLikesResult> {
  const { data: likes, error } = await supabase
    .from('likes')
    .select(`
      sender_id,
      is_read,
      is_read_as_match,
      sender:profiles!sender_id (
        id,
        name,
        age,
        university,
        company,
        grade,
        image,
        bio,
        skills,
        seeking_for,
        seeking_roles,
        status_tags,
        is_student,
        created_at
      )
    `)
    .eq('receiver_id', userId);

  if (error) throw error;

  if (!likes || likes.length === 0) {
    return {
      profiles: [],
      unreadInterestIds: new Set(),
      unreadMatchIds: new Set(),
    };
  }

  // Extract unread IDs
  const unreadInterestIds = new Set<string>(
    likes.filter(l => !l.is_read).map(l => l.sender_id)
  );

  const unreadMatchIds = new Set<string>(
    likes.filter(l => !l.is_read_as_match).map(l => l.sender_id)
  );

  // Map profiles directly from the joined data
  const profiles: Profile[] = likes
    .filter(like => like.sender)
    .map((like: any) => mapProfileRowToProfile(like.sender));

  return {
    profiles,
    unreadInterestIds,
    unreadMatchIds,
  };
}
