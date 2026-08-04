import { useState } from 'react';
import { Table, Input, Typography, Tag, Switch, Avatar, App } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { useGetCustomersQuery, useUpdateCustomerStatusMutation } from '../store/api/adminApi';

const { Title } = Typography;

export default function Customers() {
  const { message } = App.useApp();
  const [params, setParams] = useState({ page: 1, limit: 10, role: 'customer' });
  const { data, isFetching } = useGetCustomersQuery(params);
  const [updateStatus] = useUpdateCustomerStatusMutation();
  const meta = data?.meta || {};

  const toggle = async (id, isActive) => {
    try {
      await updateStatus({ id, isActive }).unwrap();
      message.success('Status updated');
    } catch {
      message.error('Update failed');
    }
  };

  const columns = [
    {
      title: 'Customer',
      dataIndex: 'name',
      render: (name, row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Avatar src={row.avatar?.url} style={{ background: '#0F172A', color: '#D4AF37' }}>
            {name?.[0]?.toUpperCase()}
          </Avatar>
          <div>
            <div style={{ fontWeight: 600 }}>{name}</div>
            <div style={{ fontSize: 12, color: '#94a3b8' }}>{row.email}</div>
          </div>
        </div>
      ),
    },
    { title: 'Phone', dataIndex: 'phone', render: (v) => v || '—' },
    {
      title: 'Verified',
      dataIndex: 'isEmailVerified',
      render: (v) => <Tag color={v ? 'green' : 'orange'}>{v ? 'Verified' : 'Pending'}</Tag>,
    },
    { title: 'Provider', dataIndex: 'provider', render: (v) => <Tag>{v}</Tag> },
    { title: 'Joined', dataIndex: 'createdAt', render: (d) => dayjs(d).format('MMM D, YYYY') },
    {
      title: 'Active',
      dataIndex: 'isActive',
      render: (v, row) => <Switch checked={v} onChange={(checked) => toggle(row._id, checked)} />,
    },
  ];

  return (
    <div>
      <Title level={3} className="font-display" style={{ marginBottom: 20 }}>Customers</Title>
      <Input
        prefix={<SearchOutlined />}
        placeholder="Search by name, email, phone…"
        allowClear
        style={{ maxWidth: 320, marginBottom: 16 }}
        onChange={(e) => setParams((p) => ({ ...p, search: e.target.value, page: 1 }))}
      />
      <Table
        rowKey="_id"
        columns={columns}
        dataSource={data?.data || []}
        loading={isFetching}
        scroll={{ x: 800 }}
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
