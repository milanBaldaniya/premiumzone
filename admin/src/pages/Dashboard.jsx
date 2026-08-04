import { Row, Col, Card, Statistic, Typography, Spin, Empty } from 'antd';
import {
  DollarOutlined,
  ShoppingCartOutlined,
  TeamOutlined,
  ShoppingOutlined,
  WarningOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import {
  useGetDashboardStatsQuery,
  useGetSalesChartQuery,
  useGetTopProductsQuery,
  useGetOrderStatusBreakdownQuery,
} from '../store/api/adminApi';
import { COLORS } from '../theme/antdTheme';

const { Title } = Typography;
const money = (v) => `$${(v || 0).toLocaleString()}`;
const PIE_COLORS = ['#0F172A', '#D4AF37', '#B8942A', '#64748b', '#94a3b8', '#cbd5e1', '#e2e8f0', '#334155'];

function StatCard({ icon, title, value, prefix, color, bg }) {
  return (
    <Card>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div className="stat-icon" style={{ background: bg, color }}>
          {icon}
        </div>
        <Statistic title={title} value={value} prefix={prefix} valueStyle={{ fontWeight: 700 }} />
      </div>
    </Card>
  );
}

export default function Dashboard() {
  const { data: statsData, isLoading } = useGetDashboardStatsQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });
  const { data: salesData } = useGetSalesChartQuery('monthly');
  const { data: topData } = useGetTopProductsQuery();
  const { data: statusData } = useGetOrderStatusBreakdownQuery();

  const stats = statsData?.data || {};
  const sales = salesData?.data || [];
  const top = topData?.data || [];
  const statusBreakdown = statusData?.data || [];

  if (isLoading) {
    return <div style={{ display: 'grid', placeItems: 'center', height: 400 }}><Spin size="large" /></div>;
  }

  return (
    <div>
      <Title level={3} className="font-display" style={{ marginBottom: 24 }}>
        Dashboard
      </Title>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <StatCard icon={<DollarOutlined />} title="Total Revenue" value={money(stats.totalRevenue)} color="#16a34a" bg="#dcfce7" />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard icon={<DollarOutlined />} title="This Month" value={money(stats.monthRevenue)} color="#D4AF37" bg="#fef9e7" />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard icon={<ShoppingCartOutlined />} title="Total Orders" value={stats.totalOrders} color="#0F172A" bg="#e2e8f0" />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard icon={<ClockCircleOutlined />} title="Pending Orders" value={stats.pendingOrders} color="#ea580c" bg="#ffedd5" />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard icon={<TeamOutlined />} title="Customers" value={stats.totalCustomers} color="#2563eb" bg="#dbeafe" />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard icon={<ShoppingOutlined />} title="Products" value={stats.totalProducts} color="#7c3aed" bg="#ede9fe" />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard icon={<WarningOutlined />} title="Low Stock" value={stats.lowStockProducts} color="#dc2626" bg="#fee2e2" />
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={16}>
          <Card title="Revenue — Last 30 Days">
            {sales.length ? (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={sales}>
                  <defs>
                    <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={COLORS.accent} stopOpacity={0.4} />
                      <stop offset="95%" stopColor={COLORS.accent} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v) => money(v)} />
                  <Area type="monotone" dataKey="revenue" stroke={COLORS.accent} strokeWidth={2} fill="url(#rev)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <Empty description="No sales data yet" />
            )}
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="Orders by Status">
            {statusBreakdown.length ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={statusBreakdown} dataKey="count" nameKey="status" cx="50%" cy="50%" outerRadius={90} label>
                    {statusBreakdown.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <Empty description="No orders yet" />
            )}
          </Card>
        </Col>
        <Col xs={24}>
          <Card title="Top Selling Products">
            {top.length ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={top}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-15} textAnchor="end" height={70} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="unitsSold" fill={COLORS.primary} radius={[6, 6, 0, 0]} name="Units Sold" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <Empty description="No sales data yet" />
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
}
