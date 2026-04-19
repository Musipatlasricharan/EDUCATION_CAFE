import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../lib/axios'
import toast from 'react-hot-toast'

export const useResources = (filters) => {
  return useQuery({
    queryKey: ['resources', filters],
    queryFn: async () => {
      const { data } = await api.get('/resources', { params: filters })
      return data
    }
  })
}

export const useResource = (id) => {
  return useQuery({
    queryKey: ['resource', id],
    queryFn: async () => {
      if (!id) return null
      const { data } = await api.get(`/resources/${id}`)
      return data.data
    },
    enabled: !!id,
    retry: false
  })
}

export const useMyResources = () => {
  return useQuery({
    queryKey: ['my-resources'],
    queryFn: async () => {
      const { data } = await api.get('/resources/my')
      return data.data
    }
  })
}

export const useUploadResource = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (formData) => {
      const { data } = await api.post('/resources', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      return data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resources'] })
      queryClient.invalidateQueries({ queryKey: ['my-resources'] })
      queryClient.invalidateQueries({ queryKey: ['user-stats'] })
      queryClient.invalidateQueries({ queryKey: ['leaderboard'] })
      toast.success('Resource uploaded successfully!')
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Upload failed')
  })
}

export const useDeleteResource = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id) => await api.delete(`/resources/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resources'] })
      queryClient.invalidateQueries({ queryKey: ['my-resources'] })
      toast.success('Resource deleted')
    }
  })
}

export const useRateResource = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, data }) => await api.post(`/resources/${id}/rate`, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['resource', variables.id] })
      toast.success('Rating submitted')
    }
  })
}

export const useToggleLike = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id) => {
      const { data } = await api.post(`/resources/${id}/like`)
      return data
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['resource', id] })
      queryClient.invalidateQueries({ queryKey: ['resources'] })
    }
  })
}
