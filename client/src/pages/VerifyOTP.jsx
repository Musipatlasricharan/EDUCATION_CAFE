import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import api from '../lib/axios';
import toast from 'react-hot-toast';

export default function VerifyOTP() {
  const { register, handleSubmit, formState: { isSubmitting } } = useForm();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const emailParam = params.get('email');
    if (emailParam) {
      setEmail(emailParam);
    } else {
      toast.error('No email provided for verification');
      navigate('/register');
    }
  }, [location, navigate]);

  const onSubmit = async (data) => {
    try {
      await api.post('/auth/verify-otp', { email, otp: data.otp });
      toast.success('Account verified successfully! Please login.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Verification failed. Please try again.');
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-primary)', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 440 }}>
        <div style={{ marginBottom: 40, textAlign: 'center' }}>
          <Link to="/" style={{ fontSize: 32, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-1px', textDecoration: 'none' }}>
            Edu<span style={{ color: 'var(--accent)' }}>Cafe</span>
          </Link>
        </div>
        
        <div className="card" style={{ padding: '40px' }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8, color: 'var(--text-primary)', textAlign: 'center' }}>Verify your account</h1>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 32, textAlign: 'center' }}>
            We've sent a 6-digit code to <br /><strong>{email}</strong>
          </p>
          
          <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div>
              <label style={{ display: 'block', fontSize: 14, fontWeight: 500, marginBottom: 8 }}>6-Digit OTP</label>
              <input 
                type="text" 
                className="input-field" 
                {...register('otp', { 
                  required: 'OTP is required',
                  pattern: { value: /^[0-9]{6}$/, message: 'Must be a 6-digit number' }
                })} 
                placeholder="000000"
                style={{ textAlign: 'center', fontSize: 24, letterSpacing: 8, fontWeight: 700 }}
                maxLength={6}
              />
            </div>

            <button type="submit" disabled={isSubmitting} className="btn-primary" style={{ padding: '12px', fontSize: 16 }}>
              {isSubmitting ? 'Verifying...' : 'Verify Account'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 32, fontSize: 14, color: 'var(--text-secondary)' }}>
            Didn't receive the code? <button onClick={() => toast.error('Check your spam folder or try again later.')} style={{ background: 'none', border: 'none', color: 'var(--accent)', fontWeight: 600, cursor: 'pointer', padding: 0 }}>Resend OTP</button>
          </p>
          
          <div style={{ textAlign: 'center', marginTop: 16 }}>
             <Link to="/register" style={{ fontSize: 14, color: 'var(--text-secondary)', textDecoration: 'none' }}>← Back to Register</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
