import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useJoinGroup } from '../hooks/useGroups'
import api from '../lib/axios'
import toast from 'react-hot-toast'

export default function JoinGroup() {
  const { code } = useParams()
  const navigate = useNavigate()
  const joinGroup = useJoinGroup()
  const [error, setError] = useState('')

  useEffect(() => {
    const join = async () => {
      try {
        const { data } = await api.get(`/groups/join/${code}`)
        if (data.joined) {
          toast.success(`You are already in ${data.data.name}`)
        } else {
          toast.success(`Successfully joined ${data.data.name}`)
        }
        navigate(`/groups/${data.data._id}`)
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to join group')
      }
    }
    
    if (code) {
      join()
    }
  }, [code, navigate])

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <div className="card" style={{ padding: 40, textAlign: 'center', maxWidth: 400, width: '100%' }}>
        {error ? (
          <>
            <h2 style={{ fontSize: 24, fontWeight: 700, color: 'var(--danger)', marginBottom: 16 }}>Invalid Invite</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>{error}</p>
            <button onClick={() => navigate('/groups')} className="btn-primary">View My Groups</button>
          </>
        ) : (
          <>
            <div className="spinner" style={{ margin: '0 auto 24px' }}></div>
            <h2 style={{ fontSize: 20, fontWeight: 600 }}>Joining Group...</h2>
            <p style={{ color: 'var(--text-secondary)' }}>Please wait while we add you to the group.</p>
          </>
        )}
      </div>
    </div>
  )
}
