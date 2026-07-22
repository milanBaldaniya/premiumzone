import { useState } from 'react';
import {
  Table, Button, Modal, Form, Input, Select, InputNumber, Switch, Space, Popconfirm, Typography, Image, Tag, App,
} from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { useGetBannersQuery, useCreateBannerMutation, useDeleteBannerMutation } from '../store/api/adminApi';

const { Title } = Typography;

const PLACEMENTS = ['hero', 'promo', 'category', 'brand', 'sidebar'].map((p) => ({ value: p, label: p }));

export default function Banners() {
  const { message } = App.useApp();
  const { data, isFetching } = useGetBannersQuery({ limit: 100 });
  const [createBanner] = useCreateBannerMutation();
  const [deleteBanner] = useDeleteBannerMutation();

  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();

  const onFinish = async (values) => {
    const payload = {
      ...values,
      image: { url: values.imageUrl },
    };
    delete payload.imageUrl;
    try {
      await createBanner(payload).unwrap();
      message.success('Banner created');
      setOpen(false);
      form.resetFields();
    } catch (err) {
      message.error(err?.data?.message || 'Save failed');
    }
  };

  const columns = [
    {
      title: 'Preview',
      dataIndex: ['image', 'url'],
      render: (url) => <Image src={url} width={80} height={44} style={{ objectFit: 'cover', borderRadius: 6 }} />,
    },
    { title: 'Title', dataIndex: 'title', render: (v) => <strong>{v}</strong> },
    { title: 'Placement', dataIndex: 'placement', render: (v) => <Tag color="gold">{v}</Tag> },
    { title: 'Order', dataIndex: 'sortOrder' },
    { title: 'Active', dataIndex: 'isActive', render: (v) => <Tag color={v ? 'green' : 'red'}>{v ? 'Active' : 'Inactive'}</Tag> },
    {
      title: 'Actions',
      render: (_, row) => (
        <Popconfirm title="Delete banner?" onConfirm={() => deleteBanner(row._id).unwrap().then(() => message.success('Deleted'))}>
          <Button size="small" danger icon={<DeleteOutlined />} />
        </Popconfirm>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
        <Title level={3} className="font-display" style={{ margin: 0 }}>Banners</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setOpen(true)}>Add Banner</Button>
      </div>

      <Table rowKey="_id" columns={columns} dataSource={data?.data || []} loading={isFetching} scroll={{ x: 700 }} />

      <Modal title="New Banner" open={open} onCancel={() => setOpen(false)} onOk={() => form.submit()} destroyOnClose>
        <Form form={form} layout="vertical" onFinish={onFinish} initialValues={{ placement: 'hero', isActive: true, ctaText: 'Shop Now', ctaLink: '/products', sortOrder: 0 }}>
          <Form.Item name="title" label="Title" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="subtitle" label="Subtitle"><Input /></Form.Item>
          <Form.Item name="imageUrl" label="Image URL" rules={[{ required: true }]}>
            <Input placeholder="https://res.cloudinary.com/…" />
          </Form.Item>
          <Space style={{ display: 'flex' }} align="baseline">
            <Form.Item name="placement" label="Placement">
              <Select style={{ width: 160 }} options={PLACEMENTS} />
            </Form.Item>
            <Form.Item name="sortOrder" label="Sort Order">
              <InputNumber min={0} style={{ width: 120 }} />
            </Form.Item>
            <Form.Item name="isActive" label="Active" valuePropName="checked"><Switch /></Form.Item>
          </Space>
          <Space style={{ display: 'flex' }} align="baseline">
            <Form.Item name="ctaText" label="CTA Text"><Input /></Form.Item>
            <Form.Item name="ctaLink" label="CTA Link"><Input /></Form.Item>
          </Space>
        </Form>
      </Modal>
    </div>
  );
}
