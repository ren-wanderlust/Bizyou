import { useQuery } from '@tanstack/react-query';
import { fetchNotifications } from '../api/notifications';
import { queryKeys } from '../queryKeys';

export function useNotifications(userId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.notifications.list(userId || ''),
    queryFn: () => fetchNotifications(userId || null),
    enabled: !!userId,
    staleTime: 2 * 60 * 1000, // 2分
    gcTime: 10 * 60 * 1000, // 10分
  });
}
