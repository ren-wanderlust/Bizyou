import { supabase } from '../../lib/supabase';
import { Profile } from '../../types';
import { mapProfileRowToProfile } from '../../utils/profileMapper';
import { fetchBlockedUserIds } from './blocks';

export interface FetchProfilesParams {
  pageNumber: number;
  pageSize: number;
  userId?: string; // 現在のユーザーID（ブロックフィルタ用）
}

export interface FetchProfilesResult {
  profiles: Profile[];
  hasMore: boolean;
}

/**
 * プロフィール一覧を取得（ページネーション対応）
 * @param pageNumber ページ番号（0始まり）
 * @param pageSize 1ページあたりの件数
 * @param userId 現在のユーザーID（ブロックフィルタ用）
 * @returns プロフィール配列と次ページ有無
 */
export async function fetchProfiles({
  pageNumber,
  pageSize,
  userId,
}: FetchProfilesParams): Promise<FetchProfilesResult> {
  // ブロックユーザー取得
  let blockedIds = new Set<string>();
  if (userId) {
    blockedIds = await fetchBlockedUserIds(userId);
  }

  const from = pageNumber * pageSize;
  const to = from + pageSize - 1;

  const { data, error } = await supabase
    .from('profiles')
    .select('id, name, age, university, company, grade, image, bio, skills, seeking_for, seeking_roles, status_tags, is_student, created_at, last_active_at, github_url')
    .order('last_active_at', { ascending: false, nullsFirst: false })
    .range(from, to);

  if (error) throw error;

  // ブロックユーザーを除外 + 自分自身も除外
  const filteredData = (data || []).filter((item: any) => {
    if (userId && item.id === userId) return false; // 自分自身を除外
    if (blockedIds.has(item.id)) return false; // ブロック相手を除外
    return true;
  });

  const mappedProfiles: Profile[] = filteredData.map((item: any) =>
    mapProfileRowToProfile(item)
  );

  return {
    profiles: mappedProfiles,
    hasMore: (data?.length || 0) === pageSize,
  };
}
