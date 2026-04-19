import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'

export default function AuthSuccess() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { setUser } = useAuth()

  useEffect(() => {
    const token = searchParams.get('token')
    const userStr = searchParams.get('user')

    if (token && userStr) {
      try {
        const user = JSON.parse(userStr)
        localStorage.setItem('token', token)
        setUser(user)
        toast.success(`Welcome back, ${user.name}!`)
        navigate('/', { replace: true })
      } catch (err) {
        toast.error('Authentication failed')
        navigate('/login', { replace: true })
      }
    } else {
      toast.error('Missing authentication data')
      navigate('/login', { replace: true })
    }
  }, [searchParams, navigate, setUser])

  return (
    <div className="loading-screen" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', gap: 16 }}>
      <div className="spinner"></div>
      <p style={{ color: 'var(--text-secondary)' }}>Finalizing your login...</p>
    </div>
  )
}
