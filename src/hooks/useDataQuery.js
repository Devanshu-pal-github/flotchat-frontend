import { useQuery, useMutation } from '@tanstack/react-query'
import { getProfiles, postChatQuery } from '../services/api.js'

export function useArgoProfiles(filters) {
  return useQuery({
    queryKey: ['argo-profiles', filters],
    queryFn: () => getProfiles(filters),
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
  })
}

export function useChatQuery() {
  return useMutation({
    mutationFn: (message) => postChatQuery(message),
  })
}
