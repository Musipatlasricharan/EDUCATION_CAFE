import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography } from 'antd';
import { MailOutlined } from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';
import api from '../lib/axios';
import toast from 'react-hot-toast';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [emailSent, setEmailSent] = useState(false);

  const onFinish = async (values) => {
    try {
      await api.post('/auth/forgot-password', values);
      toast.success('OTP sent to your email!');
      navigate(`/reset-password?email=${encodeURIComponent(values.email)}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send reset email');
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
        
        <Card style={{ padding: '20px', borderRadius: 'var(--radius)', border: '1px solid var(--border)', backgroundColor: 'var(--card-bg)' }}>
          <Typography.Title level={2} style={{ textAlign: 'center', color: 'var(--text-primary)', marginBottom: 8 }}>Reset your password</Typography.Title>
          
          {emailSent ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{ color: 'var(--success)', marginBottom: 24, padding: 16, backgroundColor: 'rgba(16, 185, 129, 0.1)', borderRadius: 'var(--radius)' }}>
                We've sent a password reset link to your email. Please check your inbox.
              </div>
              <Button type="primary" block onClick={() => navigate('/login')} style={{ height: 'auto', padding: '12px', fontSize: 16, borderRadius: 'var(--radius)', backgroundColor: 'var(--accent)', border: 'none' }}>
                Return to Login
              </Button>
            </div>
          ) : (
            <>
              <Typography.Text style={{ display: 'block', textAlign: 'center', color: 'var(--text-secondary)', marginBottom: 32 }}>
                Enter your email address and we'll send you a 6-digit OTP to reset your password.
              </Typography.Text>
              
              <Form onFinish={onFinish} layout="vertical" size="large">
                <Form.Item 
                  name="email" 
                  label={<span style={{ color: 'var(--text-primary)' }}>Email</span>}
                  rules={[{ required: true, type: 'email', message: 'Please enter a valid email' }]}
                >
                  <Input prefix={<MailOutlined style={{ color: 'var(--text-secondary)' }} />} placeholder="you@college.edu" style={{ borderRadius: 'var(--radius)' }} />
                </Form.Item>

                <Form.Item>
                  <Button type="primary" htmlType="submit" block style={{ height: 'auto', padding: '12px', fontSize: 16, borderRadius: 'var(--radius)', backgroundColor: 'var(--accent)', border: 'none' }}>
                    Send OTP
                  </Button>
                </Form.Item>
              </Form>
            </>
          )}

          <p style={{ textAlign: 'center', marginTop: 32, fontSize: 14, color: 'var(--text-secondary)' }}>
            Remember your password? <Link to="/login" style={{ fontWeight: 600, color: 'var(--accent)' }}>Sign in</Link>
          </p>
        </Card>
      </div>
    </div>
  );
};

export default ForgotPassword;
