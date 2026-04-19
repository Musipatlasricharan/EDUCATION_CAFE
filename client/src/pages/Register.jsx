import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import api from '../lib/axios'
import toast from 'react-hot-toast'
import { useAuth } from '../contexts/AuthContext'

export default function Register() {
  const { register, handleSubmit, formState: { errors, isSubmitting }, watch } = useForm()
  const navigate = useNavigate()
  const { register: registerUser } = useAuth()

  const password = watch('password')

  const onSubmit = async (data) => {
    try {
      // Register the user and automatically log them in
      await registerUser(data)
      toast.success('Account created successfully!')
      navigate('/')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed')
    }
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-primary)' }}>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
        <div style={{ width: '100%', maxWidth: 500 }}>
          <div style={{ marginBottom: 40, textAlign: 'center' }}>
            <Link to="/" style={{ fontSize: 32, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-1px' }}>
              Edu<span style={{ color: 'var(--accent)' }}>Cafe</span>
            </Link>
          </div>

          <div className="card" style={{ padding: '40px' }}>
            <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8, color: 'var(--text-primary)' }}>Create an account</h1>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 32 }}>Join your college's largest resource network</p>

            <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 14, fontWeight: 500, marginBottom: 8 }}>Full Name</label>
                <input
                  type="text"
                  className="input-field"
                  {...register('name', { required: 'Name is required' })}
                  placeholder="John Doe"
                />
                {errors.name && <p style={{ color: 'var(--danger)', fontSize: 13, marginTop: 4 }}>{errors.name.message}</p>}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 14, fontWeight: 500, marginBottom: 8 }}>Email</label>
                <input
                  type="email"
                  className="input-field"
                  {...register('email', { required: 'Email is required' })}
                  placeholder="you@college.edu"
                />
                {errors.email && <p style={{ color: 'var(--danger)', fontSize: 13, marginTop: 4 }}>{errors.email.message}</p>}
              </div>

              <div style={{ display: 'flex', gap: 16 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: 14, fontWeight: 500, marginBottom: 8 }}>College</label>
                  <input
                    type="text"
                    className="input-field"
                    {...register('college', { required: 'College is required' })}
                    placeholder="University Name"
                  />
                  {errors.college && <p style={{ color: 'var(--danger)', fontSize: 13, marginTop: 4 }}>{errors.college.message}</p>}
                </div>
                <div style={{ width: 120 }}>
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
                <input
                  type="text"
                  className="input-field"
                  {...register('course')}
                  placeholder="Computer Science"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 14, fontWeight: 500, marginBottom: 8 }}>Password</label>
                <input
                  type="password"
                  className="input-field"
                  {...register('password', {
                    required: 'Password is required',
                    minLength: { value: 8, message: 'Must be at least 8 characters' },
                    pattern: {
                      value: /^(?=.*\d)(?=.*[A-Z])/,
                      message: 'Password must contain at least one number and one uppercase letter'
                    }
                  })}
                  placeholder="••••••••"
                />
                {errors.password && <p style={{ color: 'var(--danger)', fontSize: 13, marginTop: 4 }}>{errors.password.message}</p>}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 14, fontWeight: 500, marginBottom: 8 }}>Confirm Password</label>
                <input
                  type="password"
                  className="input-field"
                  {...register('confirmPassword', {
                    validate: value => value === password || 'Passwords do not match'
                  })}
                  placeholder="••••••••"
                />
                {errors.confirmPassword && <p style={{ color: 'var(--danger)', fontSize: 13, marginTop: 4 }}>{errors.confirmPassword.message}</p>}
              </div>

              <button type="submit" disabled={isSubmitting} className="btn-primary" style={{ marginTop: 16, padding: '12px', fontSize: 16 }}>
                {isSubmitting ? 'Creating account...' : 'Create Account'}
              </button>
            </form>

            <p style={{ textAlign: 'center', marginTop: 32, fontSize: 14, color: 'var(--text-secondary)' }}>
              Already have an account? <Link to="/login" style={{ fontWeight: 600, color: 'var(--accent)' }}>Sign in instead</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
