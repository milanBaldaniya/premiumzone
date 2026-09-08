import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Form, Input, Button, Card, Typography, App } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useLoginMutation } from '../store/api/adminApi';
import { setCredentials, selectIsAuth } from '../store/slices/authSlice';

const { Title, Text } = Typography;

export default function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isAuth = useSelector(selectIsAuth);
  const [login, { isLoading }] = useLoginMutation();
  const { message } = App.useApp();

  if (isAuth) {
    navigate('/', { replace: true });
  }

  const onFinish = async (values) => {
    try {
      const res = await login(values).unwrap();
      const role = res.data.user.role;
      if (!['admin', 'super_admin'].includes(role)) {
        message.error('Access denied — admin credentials required');
        return;
      }
      dispatch(setCredentials(res.data));
      message.success('Welcome back');
      navigate('/', { replace: true });
    } catch (err) {
      message.error(err?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="login-bg">
      <Card style={{ width: 400, borderRadius: 20 }} styles={{ body: { padding: 40 } }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div
            style={{
              width: 56,
              height: 56,
              margin: '0 auto',
              display: 'grid',
              placeItems: 'center',
              borderRadius: 14,
              background: '#0F172A',
              color: '#D4AF37',
              fontSize: 28,
              fontWeight: 700,
              fontFamily: 'Playfair Display, serif',
            }}
          >
            P
          </div>
          <Title level={3} style={{ marginTop: 16, marginBottom: 4 }}>
            Premium Zone
          </Title>
          <Text type="secondary">Sign in to your console</Text>
        </div>

        <Form layout="vertical" onFinish={onFinish} requiredMark={false} size="large">
          <Form.Item
            name="email"
            label="Email"
            rules={[{ required: true, type: 'email', message: 'Enter a valid email' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="admin@luxe.com" />
          </Form.Item>
          <Form.Item name="password" label="Password" rules={[{ required: true }]}>
            <Input.Password prefix={<LockOutlined />} placeholder="••••••••" />
          </Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            block
            loading={isLoading}
            style={{ background: '#D4AF37', color: '#0F172A', border: 'none', fontWeight: 700 }}
          >
            Sign In
          </Button>
        </Form>
      </Card>
    </div>
  );
}
