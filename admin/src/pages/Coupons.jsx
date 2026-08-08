import { useState } from 'react';
import {
  Table, Button, Modal, Form, Input, InputNumber, Select, DatePicker, Space, Popconfirm, Typography, Tag, App,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import {
  useGetCouponsQuery,
  useCreateCouponMutation,
  useUpdateCouponMutation,
  useDeleteCouponMutation,
} from '../store/api/adminApi';

const { Title } = Typography;

export default function Coupons() {
  const { message } = App.useApp();
  const { data, isFetching } = useGetCouponsQuery({ limit: 100 });
  const [createCoupon] = useCreateCouponMutation();
  const [updateCoupon] = useUpdateCouponMutation();
  const [deleteCoupon] = useDeleteCouponMutation();

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form] = Form.useForm();

  const openModal = (record) => {
    setEditing(record);
    form.setFieldsValue(
      record
        ? { ...record, expiresAt: record.expiresAt ? dayjs(record.expiresAt) : null }
        : { type: 'percentage', value: 10, perUserLimit: 1 }
    );
    setOpen(true);
  };

  const onFinish = async (values) => {
    const payload = { ...values, expiresAt: values.expiresAt?.toISOString() };
    try {
      if (editing) await updateCoupon({ id: editing._id, ...payload }).unwrap();
      else await createCoupon(payload).unwrap();
      message.success(editing ? 'Coupon updated' : 'Coupon created');
      setOpen(false);
      form.resetFields();
      setEditing(null);
    } catch (err) {
      message.error(err?.data?.message || 'Save failed');
    }
  };

  const columns = [
    { title: 'Code', dataIndex: 'code', render: (v) => <Tag color="gold" style={{ fontWeight: 700 }}>{v}</Tag> },
    {
      title: 'Discount',
      render: (_, r) => (r.type === 'percentage' ? `${r.value}%` : `₹${r.value}`),
    },
    { title: 'Min Order', dataIndex: 'minOrderAmount', render: (v) => `₹${v || 0}` },
    { title: 'Used', render: (_, r) => `${r.usedCount || 0}${r.usageLimit ? ` / ${r.usageLimit}` : ''}` },
    { title: 'Expires', dataIndex: 'expiresAt', render: (d) => (d ? dayjs(d).format('MMM D, YYYY') : '—') },
    { title: 'Status', dataIndex: 'isActive', render: (v) => <Tag color={v ? 'green' : 'red'}>{v ? 'Active' : 'Inactive'}</Tag> },
    {
      title: 'Actions',
      render: (_, row) => (
        <Space>
          <Button size="small" icon={<EditOutlined />} onClick={() => openModal(row)} />
          <Popconfirm title="Delete coupon?" onConfirm={() => deleteCoupon(row._id).unwrap().then(() => message.success('Deleted'))}>
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
        <Title level={3} className="font-display" style={{ margin: 0 }}>Coupons</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal(null)}>Add Coupon</Button>
      </div>

      <Table rowKey="_id" columns={columns} dataSource={data?.data || []} loading={isFetching} scroll={{ x: 800 }} />

      <Modal
        title={editing ? 'Edit Coupon' : 'New Coupon'}
        open={open}
        onCancel={() => { setOpen(false); setEditing(null); form.resetFields(); }}
        onOk={() => form.submit()}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item name="code" label="Code" rules={[{ required: true }]}>
            <Input placeholder="PPZ20" style={{ textTransform: 'uppercase' }} />
          </Form.Item>
          <Space style={{ display: 'flex' }} align="baseline">
            <Form.Item name="type" label="Type" rules={[{ required: true }]}>
              <Select
                style={{ width: 140 }}
                options={[{ value: 'percentage', label: 'Percentage' }, { value: 'fixed', label: 'Fixed (₹)' }]}
              />
            </Form.Item>
            <Form.Item name="value" label="Value" rules={[{ required: true }]}>
              <InputNumber min={0} style={{ width: 120 }} />
            </Form.Item>
            <Form.Item name="minOrderAmount" label="Min Order (₹)">
              <InputNumber min={0} style={{ width: 120 }} />
            </Form.Item>
          </Space>
          <Space style={{ display: 'flex' }} align="baseline">
            <Form.Item name="usageLimit" label="Usage Limit">
              <InputNumber min={0} style={{ width: 140 }} placeholder="Unlimited" />
            </Form.Item>
            <Form.Item name="perUserLimit" label="Per User Limit">
              <InputNumber min={1} style={{ width: 140 }} />
            </Form.Item>
          </Space>
          <Form.Item name="expiresAt" label="Expires At" rules={[{ required: true }]}>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
