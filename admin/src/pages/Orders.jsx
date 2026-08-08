import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Tag, Typography, Select, Input, Space } from 'antd';
import { EyeOutlined, SearchOutlined } from '@ant-design/icons';
import { useGetOrdersQuery } from '../store/api/adminApi';
import dayjs from 'dayjs';

const { Title } = Typography;

export const STATUS_COLORS = {
  pending: 'orange',
  confirmed: 'blue',
  packed: 'cyan',
  shipped: 'geekblue',
  delivered: 'green',
  cancelled: 'red',
  returned: 'volcano',
  refunded: 'purple',
};

const STATUS_OPTIONS = Object.keys(STATUS_COLORS).map((s) => ({ value: s, label: s }));

export default function Orders() {
  const navigate = useNavigate();
  const [params, setParams] = useState({ page: 1, limit: 10 });
  // Always fetch fresh on mount and poll every 20s so new customer orders appear live.
  const { data, isFetching } = useGetOrdersQuery(params, {
    refetchOnMountOrArgChange: true,
    pollingInterval: 20000,
  });
  const orders = data?.data || [];
  const meta = data?.meta || {};

  const columns = [
    { title: 'Order #', dataIndex: 'orderNumber', render: (v) => <strong>{v}</strong> },
    { title: 'Customer', dataIndex: ['user', 'name'], render: (v, r) => v || r.shippingAddress?.fullName || '—' },
    { title: 'Items', dataIndex: 'items', render: (items) => items?.length || 0 },
    { title: 'Total', dataIndex: 'grandTotal', render: (v) => `₹${v?.toLocaleString()}` },
    {
      title: 'Payment',
      dataIndex: 'paymentStatus',
      render: (s) => <Tag color={s === 'paid' ? 'green' : 'orange'}>{s}</Tag>,
    },
    { title: 'Status', dataIndex: 'status', render: (s) => <Tag color={STATUS_COLORS[s]}>{s}</Tag> },
    { title: 'Date', dataIndex: 'createdAt', render: (d) => dayjs(d).format('MMM D, YYYY') },
    {
      title: '',
      render: (_, row) => (
        <EyeOutlined style={{ cursor: 'pointer', color: '#D4AF37' }} onClick={() => navigate(`/orders/${row._id}`)} />
      ),
    },
  ];

  return (
    <div>
      <Title level={3} className="font-display" style={{ marginBottom: 20 }}>
        Orders
      </Title>

      <Space style={{ marginBottom: 16 }} wrap>
        <Input
          prefix={<SearchOutlined />}
          placeholder="Search order #"
          allowClear
          onChange={(e) => setParams((p) => ({ ...p, search: e.target.value, page: 1 }))}
          style={{ width: 240 }}
        />
        <Select
          allowClear
          placeholder="Filter by status"
          options={STATUS_OPTIONS}
          style={{ width: 200 }}
          onChange={(status) => setParams((p) => ({ ...p, status, page: 1 }))}
        />
      </Space>

      <Table
        rowKey="_id"
        columns={columns}
        dataSource={orders}
        loading={isFetching}
        scroll={{ x: 900 }}
        onRow={(row) => ({ onClick: () => navigate(`/orders/${row._id}`), style: { cursor: 'pointer' } })}
        pagination={{
          current: meta.page,
          total: meta.total,
          pageSize: meta.limit,
          onChange: (page) => setParams((p) => ({ ...p, page })),
        }}
      />
    </div>
  );
}
