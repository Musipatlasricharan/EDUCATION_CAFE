import { useForm } from 'react-hook-form'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import api from '../lib/axios'
import toast from 'react-hot-toast'

export default function EditProfile() {
  const { user, setUser } = useAuth()
  const navigate = useNavigate()
  const { register, handleSubmit, formState: { isSubmitting } } = useForm({
    defaultValues: {
      name: user.name,
      college: user.college,
      course: user.course,
      year: user.year,
      bio: user.bio
    }
  })

  const onSubmit = async (data) => {
    try {
      const { data: res } = await api.put('/users/profile', data)
      setUser(res.data)
      toast.success('Profile updated!')
      navigate('/profile')
    } catch (err) {
      toast.error('Failed to update profile')
    }
  }

  return (
    <div style={{ maxWidth: 600, margin: '0 auto' }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24 }}>Edit Profile</h1>
      
      <div className="card" style={{ padding: 32 }}>
        <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div>
            <label style={{ display: 'block', fontSize: 14, fontWeight: 500, marginBottom: 8 }}>Name</label>
            <input className="input-field" {...register('name')} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 14, fontWeight: 500, marginBottom: 8 }}>Bio</label>
            <textarea className="input-field" {...register('bio')} rows={3} placeholder="Tell us about yourself" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <div>
              <label style={{ display: 'block', fontSize: 14, fontWeight: 500, marginBottom: 8 }}>College</label>
              <input className="input-field" {...register('college')} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 14, fontWeight: 500, marginBottom: 8 }}>Year</label>
              <select className="input-field" {...register('year')}>
                <option value="1">1st Year</option>
                <option value="2">2nd Year</option>
                <option value="3">3rd Year</option>
                <option value="4">4th Year</option>
                <option value="PG">Postgrad</option>
              </select>
            </div>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 14, fontWeight: 500, marginBottom: 8 }}>Course / Major</label>
            <input className="input-field" {...register('course')} />
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 16 }}>
            <button type="button" onClick={() => navigate('/profile')} className="btn-primary" style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}>Cancel</button>
            <button type="submit" disabled={isSubmitting} className="btn-primary">
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
