import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../lib/axios'
import toast from 'react-hot-toast'

export const useMyGroups = () => {
  return useQuery({
    queryKey: ['my-groups'],
    queryFn: async () => {
      const { data } = await api.get('/groups')
      return data.data
    }
  })
}

export const useDiscoverGroups = () => {
  return useQuery({
    queryKey: ['discover-groups'],
    queryFn: async () => {
      const { data } = await api.get('/groups?discover=true')
      return data.data
    }
  })
}

export const useGroup = (id) => {
  return useQuery({
    queryKey: ['group', id],
    queryFn: async () => {
      if (!id) return null
      const { data } = await api.get(`/groups/${id}`)
      return data.data
    },
    enabled: !!id
  })
}

export const useGroupMembers = (id) => {
  return useQuery({
    queryKey: ['group-members', id],
    queryFn: async () => {
      if (!id) return null
      const { data } = await api.get(`/groups/${id}/members`)
      return data.data
    },
    enabled: !!id
  })
}

export const useCreateGroup = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (groupData) => {
      const { data } = await api.post('/groups', groupData)
      return data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-groups'] })
      toast.success('Group created successfully!')
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to create group')
  })
}

export const useJoinGroup = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (code) => {
      const { data } = await api.post(`/groups/join/${code}`)
      return data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-groups'] })
      toast.success('Joined group!')
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to join group')
  })
}

export const useLeaveGroup = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id) => await api.post(`/groups/${id}/leave`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-groups'] })
      toast.success('Left group')
    }
  })
}
