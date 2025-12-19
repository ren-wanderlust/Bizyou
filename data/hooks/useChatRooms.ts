import { useQuery } from '@tanstack/react-query';
import { fetchChatRooms } from '../api/chatRooms';
import { queryKeys } from '../queryKeys';

export function useChatRooms(userId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.chatRooms.list(userId || ''),
    queryFn: () => {
      return fetchChatRooms(userId!);
    },
    enabled: !!userId,
    staleTime: 2 * 60 * 1000, // 2分（チャットは更新頻度が高いため短め）
    gcTime: 10 * 60 * 1000, // 10分
    refetchOnMount: 'always', // 復帰時の取りこぼし防止: マウント時は常に再取得
    refetchOnReconnect: true, // 再接続時も再取得
  });
}
