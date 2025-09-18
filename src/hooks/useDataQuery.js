import { useQuery, useMutation } from '@tanstack/react-query'
import { getProfiles, postChatQuery, getProfileMeasurements } from '../services/api.js'

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

export function useProfileMeasurements(profileId) {
  return useQuery({
    queryKey: ['argo-measurements', profileId],
    queryFn: async () => {
      if (!profileId) return null
      try {
        return await getProfileMeasurements(profileId)
      } catch (e) {
        return null
      }
    },
    enabled: !!profileId,
    staleTime: 60 * 1000,
  })
}
