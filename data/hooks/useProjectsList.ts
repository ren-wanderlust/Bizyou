import { useQuery } from '@tanstack/react-query';
import { fetchProjects } from '../api/projects';
import { queryKeys } from '../queryKeys';

export function useProjectsList(sort: 'recommended' | 'newest' | 'deadline' = 'recommended') {
  return useQuery({
    queryKey: queryKeys.projects.list(sort),
    queryFn: () => fetchProjects({ sort }),
    staleTime: 5 * 60 * 1000, // 5分
    gcTime: 30 * 60 * 1000, // 30分
  });
}
