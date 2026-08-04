import { Table, Typography, Tag, Rate, Button, Space, App } from 'antd';
import { CheckOutlined, StopOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { useGetReviewsQuery, useModerateReviewMutation } from '../store/api/adminApi';

const { Title, Paragraph } = Typography;

export default function Reviews() {
  const { message } = App.useApp();
  const { data, isFetching } = useGetReviewsQuery({ limit: 50, sort: '-createdAt' });
  const [moderate] = useModerateReviewMutation();

  const setApproval = async (id, isApproved) => {
    try {
      await moderate({ id, isApproved }).unwrap();
      message.success(isApproved ? 'Approved' : 'Hidden');
    } catch {
      message.error('Failed');
    }
  };

  const columns = [
    { title: 'Product', dataIndex: ['product', 'name'], render: (v) => v || '—' },
    { title: 'Customer', dataIndex: ['user', 'name'], render: (v) => v || '—' },
    { title: 'Rating', dataIndex: 'rating', render: (v) => <Rate disabled defaultValue={v} style={{ fontSize: 14 }} /> },
    {
      title: 'Review',
      render: (_, r) => (
        <div style={{ maxWidth: 320 }}>
          {r.title && <strong>{r.title}</strong>}
          <Paragraph ellipsis={{ rows: 2 }} style={{ margin: 0, color: '#64748b' }}>{r.comment}</Paragraph>
        </div>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'isApproved',
      render: (v) => <Tag color={v ? 'green' : 'orange'}>{v ? 'Approved' : 'Hidden'}</Tag>,
    },
    { title: 'Date', dataIndex: 'createdAt', render: (d) => dayjs(d).format('MMM D, YYYY') },
    {
      title: 'Actions',
      render: (_, row) => (
        <Space>
          <Button size="small" type="primary" ghost icon={<CheckOutlined />} onClick={() => setApproval(row._id, true)} />
          <Button size="small" danger icon={<StopOutlined />} onClick={() => setApproval(row._id, false)} />
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Title level={3} className="font-display" style={{ marginBottom: 20 }}>Reviews</Title>
      <Table rowKey="_id" columns={columns} dataSource={data?.data || []} loading={isFetching} scroll={{ x: 900 }} />
    </div>
  );
}
