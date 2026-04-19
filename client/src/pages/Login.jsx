import React from 'react';
import { Form, Input, Button, Card, Typography, Space } from 'antd';
import { MailOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import api from '../lib/axios';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const onFinish = async (values) => {
    try {
      await login(values);
      toast.success('Login successful!');
      navigate('/', { replace: true });
    } catch (err) {
      if (err.response?.status === 401 || err.response?.data?.message === 'Invalid credentials') {
        const email = values.email;
        toast.error('Account not found. Redirecting to registration...');
        setTimeout(() => {
          navigate('/register', { state: { email } });
        }, 1500);
      } else {
        toast.error(err.response?.data?.message || 'Login failed');
      }
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
          <Typography.Title level={2} style={{ textAlign: 'center', color: 'var(--text-primary)', marginBottom: 8 }}>Welcome back</Typography.Title>
          <Typography.Text style={{ display: 'block', textAlign: 'center', color: 'var(--text-secondary)', marginBottom: 32 }}>Sign in to access your study resources</Typography.Text>

          <Form onFinish={onFinish} layout="vertical" size="large">
            <Form.Item
              name="email"
              label={<span style={{ color: 'var(--text-primary)' }}>Email</span>}
              rules={[{ required: true, type: 'email', message: 'Please enter a valid email' }]}
            >
              <Input prefix={<MailOutlined style={{ color: 'var(--text-secondary)' }} />} placeholder="you@college.edu" style={{ borderRadius: 'var(--radius)' }} />
            </Form.Item>

            <Form.Item
              name="password"
              label={
                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                  <span style={{ color: 'var(--text-primary)' }}>Password</span>
                  <Link to="/forgot-password" style={{ fontSize: 13, color: 'var(--accent)' }}>Forgot password?</Link>
                </div>
              }
              rules={[{ required: true, message: 'Please enter your password' }]}
            >
              <Input.Password prefix={<LockOutlined style={{ color: 'var(--text-secondary)' }} />} placeholder="••••••••" style={{ borderRadius: 'var(--radius)' }} />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" block style={{ height: 'auto', padding: '12px', fontSize: 16, borderRadius: 'var(--radius)', backgroundColor: 'var(--accent)', border: 'none' }}>
                Sign In
              </Button>
            </Form.Item>

            <div style={{ display: 'flex', alignItems: 'center', gap: 16, margin: '16px 0' }}>
              <div style={{ flex: 1, height: 1, backgroundColor: 'var(--border)' }}></div>
              <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>OR</span>
              <div style={{ flex: 1, height: 1, backgroundColor: 'var(--border)' }}></div>
            </div>

            <Button
              type="default"
              block
              style={{ height: 'auto', padding: '12px', fontSize: 16, borderRadius: 'var(--radius)', color: 'var(--text-primary)', borderColor: 'var(--border)' }}
              onClick={() => window.location.href = `${import.meta.env.VITE_API_URL}/auth/google`}
            >
              Continue with Google
            </Button>
          </Form>

          <p style={{ textAlign: 'center', marginTop: 32, fontSize: 14, color: 'var(--text-secondary)' }}>
            Don't have an account? <Link to="/register" style={{ fontWeight: 600, color: 'var(--accent)' }}>Create an account</Link>
          </p>
        </Card>
      </div>
    </div>
  );
};

export default Login;
