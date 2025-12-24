import { useQuery } from '@tanstack/react-query';
import { fetchProjects } from '../api/projects';
import { queryKeys } from '../queryKeys';

export function useProjectsList(
  sort: 'recommended' | 'newest' | 'deadline' = 'recommended',
  userId?: string
) {
  return useQuery({
    queryKey: queryKeys.projects.list(sort, userId), // userId含めてブロック状態変更時にキャッシュ更新
    queryFn: () => fetchProjects({ sort, userId }),
    staleTime: 5 * 60 * 1000, // 5分
    gcTime: 30 * 60 * 1000, // 30分
  });
}
