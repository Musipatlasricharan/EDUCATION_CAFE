import { useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import api from '../lib/axios'
import ResourceCard from '../components/resources/ResourceCard'

export default function SearchResults() {
  const [searchParams] = useSearchParams()
  const query = searchParams.get('q')

  const { data, isLoading } = useQuery({
    queryKey: ['search', query],
    queryFn: async () => {
      if (!query) return []
      const { data } = await api.get('/resources', { params: { search: query } })
      return data.data
    },
    enabled: !!query
  })

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24 }}>
        Search Results for "{query}"
      </h1>

      {isLoading ? (
        <div className="loading-screen" style={{ minHeight: 200 }}><div className="spinner"></div></div>
      ) : data?.length === 0 ? (
        <div className="card" style={{ padding: 40, textAlign: 'center' }}>
          <p style={{ color: 'var(--text-secondary)' }}>No results found.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 24 }}>
          {data?.map(resource => (
            <ResourceCard key={resource._id} resource={resource} />
          ))}
        </div>
      )}
    </div>
  )
}
