import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card, Row, Col, Typography, Tag, Table, Descriptions, Select, Input, Button, Space, Timeline, Spin, App,
} from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { useGetOrderQuery, useUpdateOrderStatusMutation } from '../store/api/adminApi';
import { STATUS_COLORS } from './Orders';

const { Title, Text } = Typography;
const STATUS_FLOW = ['pending', 'confirmed', 'packed', 'shipped', 'delivered', 'cancelled', 'returned', 'refunded'];

export default function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { message } = App.useApp();
  const { data, isLoading } = useGetOrderQuery(id);
  const [updateStatus, { isLoading: updating }] = useUpdateOrderStatusMutation();

  const order = data?.data;
  const [status, setStatus] = useState();
  const [tracking, setTracking] = useState('');

  useEffect(() => {
    if (order) {
      setStatus(order.status);
      setTracking(order.trackingNumber || '');
    }
  }, [order]);

  if (isLoading || !order) {
    return <div style={{ display: 'grid', placeItems: 'center', height: 300 }}><Spin size="large" /></div>;
  }

  const handleUpdate = async () => {
    try {
      await updateStatus({ id, status, trackingNumber: tracking }).unwrap();
      message.success('Order updated');
    } catch (err) {
      message.error(err?.data?.message || 'Update failed');
    }
  };

  const itemColumns = [
    { title: 'Product', dataIndex: 'name' },
    { title: 'SKU', dataIndex: 'sku' },
    { title: 'Price', dataIndex: 'price', render: (v) => `$${v}` },
    { title: 'Qty', dataIndex: 'quantity' },
    { title: 'Subtotal', dataIndex: 'subtotal', render: (v) => `$${v}` },
  ];

  return (
    <div>
      <Space style={{ marginBottom: 20 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/orders')} />
        <Title level={3} className="font-display" style={{ margin: 0 }}>
          {order.orderNumber}
        </Title>
        <Tag color={STATUS_COLORS[order.status]}>{order.status}</Tag>
      </Space>

      <Row gutter={16}>
        <Col xs={24} lg={16}>
          <Card title="Items" style={{ marginBottom: 16 }}>
            <Table rowKey={(r) => r.sku + r.name} columns={itemColumns} dataSource={order.items} pagination={false} scroll={{ x: 600 }} />
            <div style={{ marginTop: 16, maxWidth: 280, marginLeft: 'auto' }}>
              <Summary label="Subtotal" value={order.itemsTotal} />
              {order.discountAmount > 0 && <Summary label="Discount" value={-order.discountAmount} />}
              <Summary label="Shipping" value={order.shippingFee} />
              {order.taxAmount > 0 && <Summary label="Tax" value={order.taxAmount} />}
              <div style={{ borderTop: '1px solid #e2e8f0', marginTop: 8, paddingTop: 8 }}>
                <Summary label="Total" value={order.grandTotal} bold />
              </div>
            </div>
          </Card>

          <Card title="Status History">
            <Timeline
              items={order.statusHistory?.map((h) => ({
                color: STATUS_COLORS[h.status] === 'green' ? 'green' : 'blue',
                children: (
                  <>
                    <Text strong style={{ textTransform: 'capitalize' }}>{h.status}</Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {h.note} · {dayjs(h.at).format('MMM D, YYYY h:mm A')}
                    </Text>
                  </>
                ),
              }))}
            />
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card title="Update Status" style={{ marginBottom: 16 }}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Select
                value={status}
                onChange={setStatus}
                style={{ width: '100%' }}
                options={STATUS_FLOW.map((s) => ({ value: s, label: s }))}
              />
              <Input placeholder="Tracking number" value={tracking} onChange={(e) => setTracking(e.target.value)} />
              <Button type="primary" block loading={updating} onClick={handleUpdate}>
                Save
              </Button>
            </Space>
          </Card>

          <Card title="Customer" style={{ marginBottom: 16 }}>
            <Descriptions column={1} size="small">
              <Descriptions.Item label="Name">{order.user?.name || order.shippingAddress?.fullName}</Descriptions.Item>
              <Descriptions.Item label="Email">{order.user?.email || '—'}</Descriptions.Item>
              <Descriptions.Item label="Payment">{order.paymentMethod?.toUpperCase()}</Descriptions.Item>
            </Descriptions>
          </Card>

          <Card title="Shipping Address">
            <Text>{order.shippingAddress?.fullName}</Text>
            <br />
            <Text type="secondary">{order.shippingAddress?.phone}</Text>
            <br />
            <Text type="secondary">
              {order.shippingAddress?.line1}, {order.shippingAddress?.city}, {order.shippingAddress?.state}{' '}
              {order.shippingAddress?.postalCode}, {order.shippingAddress?.country}
            </Text>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

const Summary = ({ label, value, bold }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
    <Text type={bold ? undefined : 'secondary'} strong={bold}>{label}</Text>
    <Text strong={bold}>${value?.toLocaleString()}</Text>
  </div>
);
