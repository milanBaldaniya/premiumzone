import { useEffect, useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Layout, Menu, Avatar, Dropdown, Button, Typography, Grid, Drawer } from 'antd';
import {
  DashboardOutlined,
  ShoppingOutlined,
  ShoppingCartOutlined,
  AppstoreOutlined,
  TagsOutlined,
  GiftOutlined,
  TeamOutlined,
  StarOutlined,
  PictureOutlined,
  SettingOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from '@ant-design/icons';
import { logout, selectUser } from '../../store/slices/authSlice';

const { Header, Sider, Content } = Layout;
const { useBreakpoint } = Grid;

const MENU = [
  { key: '/', icon: <DashboardOutlined />, label: 'Dashboard' },
  { key: '/products', icon: <ShoppingOutlined />, label: 'Products' },
  { key: '/orders', icon: <ShoppingCartOutlined />, label: 'Orders' },
  { key: '/categories', icon: <AppstoreOutlined />, label: 'Categories' },
  { key: '/brands', icon: <TagsOutlined />, label: 'Brands' },
  { key: '/coupons', icon: <GiftOutlined />, label: 'Coupons' },
  { key: '/customers', icon: <TeamOutlined />, label: 'Customers' },
  { key: '/reviews', icon: <StarOutlined />, label: 'Reviews' },
  { key: '/banners', icon: <PictureOutlined />, label: 'Banners' },
  { key: '/settings', icon: <SettingOutlined />, label: 'Settings' },
];

const Logo = ({ collapsed }) => (
  <div
    style={{
      height: 64,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 10,
      color: '#fff',
    }}
  >
    <span
      style={{
        width: 34,
        height: 34,
        display: 'grid',
        placeItems: 'center',
        borderRadius: 9,
        background: '#D4AF37',
        color: '#0F172A',
        fontWeight: 700,
        fontFamily: 'Playfair Display, serif',
      }}
    >
      P
    </span>
    {!collapsed && (
      <span style={{ fontFamily: 'Playfair Display, serif', fontSize: 18, fontWeight: 700 }}>
        Premium Zone
      </span>
    )}
  </div>
);

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const screens = useBreakpoint();
  const isMobile = !screens.lg;

  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Closing the drawer when the viewport grows past the breakpoint avoids it
  // staying stuck open (as an overlay) once the desktop Sider takes over.
  useEffect(() => {
    if (!isMobile) setMobileOpen(false);
  }, [isMobile]);

  // Highlight the closest matching top-level route
  const selectedKey =
    MENU.map((m) => m.key)
      .filter((k) => k !== '/' && location.pathname.startsWith(k))
      .sort((a, b) => b.length - a.length)[0] || '/';

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const handleNavigate = (key) => {
    navigate(key);
    if (isMobile) setMobileOpen(false);
  };

  const menu = (
    <Menu
      theme="dark"
      mode="inline"
      selectedKeys={[selectedKey]}
      onClick={({ key }) => handleNavigate(key)}
      items={MENU}
    />
  );

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* Desktop: static in-flow sidebar */}
      {!isMobile && (
        <Sider collapsible collapsed={collapsed} trigger={null} width={240} collapsedWidth={80}>
          <Logo collapsed={collapsed} />
          {menu}
        </Sider>
      )}

      {/* Mobile: overlay drawer, floats above content with a backdrop instead of squeezing it */}
      <Drawer
        placement="left"
        closable={false}
        onClose={() => setMobileOpen(false)}
        open={isMobile && mobileOpen}
        width={240}
        styles={{ body: { padding: 0, background: '#001529' } }}
      >
        <Logo collapsed={false} />
        {menu}
      </Drawer>

      <Layout>
        <Header
          style={{
            padding: '0 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
          }}
        >
          <Button
            type="text"
            icon={collapsed || isMobile ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => (isMobile ? setMobileOpen((o) => !o) : setCollapsed((c) => !c))}
          />
          <Dropdown
            menu={{
              items: [
                { key: 'role', label: <Typography.Text type="secondary">{user?.role}</Typography.Text>, disabled: true },
                { type: 'divider' },
                { key: 'logout', icon: <LogoutOutlined />, label: 'Logout', onClick: handleLogout },
              ],
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
              <Avatar style={{ background: '#0F172A', color: '#D4AF37' }}>
                {user?.name?.[0]?.toUpperCase() || 'A'}
              </Avatar>
              <span style={{ fontWeight: 600 }}>{user?.name}</span>
            </div>
          </Dropdown>
        </Header>

        <Content style={{ margin: 24 }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
