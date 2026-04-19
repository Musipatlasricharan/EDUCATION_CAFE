import { createContext, useState, useEffect, useContext } from 'react'
import api from '../lib/axios'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('token')
      if (token) {
        try {
          const { data } = await api.get('/auth/me')
          setUser(data.user)
        } catch {
          localStorage.removeItem('token')
        } finally {
          setLoading(false)
        }
      } else {
        setLoading(false)
      }
    }
    loadUser()
  }, [])

  const login = async (credentials) => {
    const { data } = await api.post('/auth/login', credentials)
    localStorage.setItem('token', data.token)
    setUser(data.user)
    return data
  }

  const register = async (userData) => {
    const { data } = await api.post('/auth/register', userData)
    localStorage.setItem('token', data.token)
    setUser(data.user)
    return data
  }

  const logout = () => {
    localStorage.removeItem('token')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
