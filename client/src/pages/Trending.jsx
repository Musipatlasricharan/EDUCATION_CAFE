import { useQuery } from '@tanstack/react-query'
import api from '../lib/axios'
import ResourceCard from '../components/resources/ResourceCard'
import { TrendingUp } from 'lucide-react'

export default function Trending() {
  const { data: resources, isLoading } = useQuery({
    queryKey: ['trending'],
    queryFn: async () => {
      try {
        const { data } = await api.get('/resources/trending')
        return data?.data || []
      } catch (error) {
        console.error('Failed to fetch trending:', error)
        return []
      }
    }
  })

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <TrendingUp size={28} color="var(--accent)" />
        <h1 style={{ fontSize: 24, fontWeight: 700 }}>Trending Resources</h1>
      </div>

      {isLoading ? (
        <div className="loading-screen" style={{ minHeight: 200 }}><div className="spinner"></div></div>
      ) : resources?.length === 0 ? (
        <div className="card" style={{ padding: 40, textAlign: 'center' }}>
          <p style={{ color: 'var(--text-secondary)' }}>No trending resources right now.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 24 }}>
          {resources?.map(resource => (
            <ResourceCard key={resource._id} resource={resource} />
          ))}
        </div>
      )}
    </div>
  )
}
