import { useQuery } from '@tanstack/react-query';
import { fetchReceivedLikes } from '../api/likes';
import { queryKeys } from '../queryKeys';

export function useReceivedLikes(userId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.receivedLikes.detail(userId || ''),
    queryFn: () => fetchReceivedLikes(userId!),
    enabled: !!userId,
    staleTime: 2 * 60 * 1000, // 2分
    gcTime: 10 * 60 * 1000, // 10分
  });
}
