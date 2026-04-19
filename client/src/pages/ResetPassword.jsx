import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography } from 'antd';
import { LockOutlined } from '@ant-design/icons';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import api from '../lib/axios';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setUser } = useAuth();
  const [form] = Form.useForm();
  const [email, setEmail] = useState('');

  React.useEffect(() => {
    const params = new URLSearchParams(location.search);
    const emailParam = params.get('email');
    if (emailParam) {
      setEmail(emailParam);
      form.setFieldsValue({ email: emailParam });
    }
  }, [location, form]);

  const onFinish = async (values) => {
    try {
      await api.post('/auth/reset-password', { 
        email: values.email,
        otp: values.otp,
        password: values.password 
      });
      toast.success('Password reset successfully! Please log in with your new password.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid or expired OTP');
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
          <Typography.Title level={2} style={{ textAlign: 'center', color: 'var(--text-primary)', marginBottom: 8 }}>Set New Password</Typography.Title>
          <Typography.Text style={{ display: 'block', textAlign: 'center', color: 'var(--text-secondary)', marginBottom: 32 }}>Please enter your new password below.</Typography.Text>
          
          <Form form={form} onFinish={onFinish} layout="vertical" size="large">
            <Form.Item 
              name="email" 
              label={<span style={{ color: 'var(--text-primary)' }}>Email</span>}
              rules={[{ required: true, type: 'email', message: 'Please enter your email' }]}
            >
              <Input prefix={<LockOutlined style={{ color: 'var(--text-secondary)' }} />} placeholder="you@college.edu" style={{ borderRadius: 'var(--radius)' }} />
            </Form.Item>

            <Form.Item 
              name="otp" 
              label={<span style={{ color: 'var(--text-primary)' }}>6-Digit OTP</span>}
              rules={[
                { required: true, message: 'Please enter the OTP' },
                { pattern: /^[0-9]{6}$/, message: 'Must be a 6-digit number' }
              ]}
            >
              <Input placeholder="000000" style={{ borderRadius: 'var(--radius)', textAlign: 'center', letterSpacing: 4, fontWeight: 700 }} maxLength={6} />
            </Form.Item>

            <Form.Item 
              name="password" 
              label={<span style={{ color: 'var(--text-primary)' }}>New Password</span>}
              rules={[
                { required: true, message: 'Please enter your new password' },
                { min: 8, message: 'Must be at least 8 characters' }
              ]}
            >
              <Input.Password prefix={<LockOutlined style={{ color: 'var(--text-secondary)' }} />} placeholder="••••••••" style={{ borderRadius: 'var(--radius)' }} />
            </Form.Item>

            <Form.Item 
              name="confirmPassword" 
              label={<span style={{ color: 'var(--text-primary)' }}>Confirm Password</span>}
              dependencies={['password']} 
              rules={[
                { required: true, message: 'Please confirm your password' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('password') === value) return Promise.resolve();
                    return Promise.reject(new Error('Passwords do not match'));
                  },
                }),
              ]}
            >
              <Input.Password prefix={<LockOutlined style={{ color: 'var(--text-secondary)' }} />} placeholder="••••••••" style={{ borderRadius: 'var(--radius)' }} />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" block style={{ height: 'auto', padding: '12px', fontSize: 16, borderRadius: 'var(--radius)', backgroundColor: 'var(--accent)', border: 'none' }}>
                Reset Password
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </div>
  );
};

export default ResetPassword;
