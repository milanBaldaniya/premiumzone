import { useState } from 'react';
import {
  Table, Button, Modal, Form, Input, Select, InputNumber, Switch, Space, Popconfirm, Typography, Image, Tag, App,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import {
  useGetBannersQuery,
  useCreateBannerMutation,
  useUpdateBannerMutation,
  useDeleteBannerMutation,
} from '../store/api/adminApi';
import ImageUploader from '../components/ImageUploader';

const { Title } = Typography;

const PLACEMENTS = ['hero', 'promo', 'category', 'brand', 'sidebar'].map((p) => ({ value: p, label: p }));

export default function Banners() {
  const { message } = App.useApp();
  const { data, isFetching } = useGetBannersQuery({ limit: 100 });
  const [createBanner] = useCreateBannerMutation();
  const [updateBanner] = useUpdateBannerMutation();
  const [deleteBanner] = useDeleteBannerMutation();

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [images, setImages] = useState([]);
  const [form] = Form.useForm();

  const openModal = (record) => {
    setEditing(record);
    setImages(record?.image ? [record.image] : []);
    form.setFieldsValue(
      record || { placement: 'hero', isActive: true, ctaText: 'Shop Now', ctaLink: '/products', sortOrder: 0 }
    );
    setOpen(true);
  };

  const onFinish = async (values) => {
    if (!images[0]) {
      message.error('Please upload a banner image');
      return;
    }
    const payload = { ...values, image: images[0] };
    try {
      if (editing) await updateBanner({ id: editing._id, ...payload }).unwrap();
      else await createBanner(payload).unwrap();
      message.success(editing ? 'Banner updated' : 'Banner created');
      setOpen(false);
      form.resetFields();
      setEditing(null);
      setImages([]);
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
        <Space>
          <Button size="small" icon={<EditOutlined />} onClick={() => openModal(row)} />
          <Popconfirm title="Delete banner?" onConfirm={() => deleteBanner(row._id).unwrap().then(() => message.success('Deleted'))}>
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
        <Title level={3} className="font-display" style={{ margin: 0 }}>Banners</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal(null)}>Add Banner</Button>
      </div>

      <Table rowKey="_id" columns={columns} dataSource={data?.data || []} loading={isFetching} scroll={{ x: 700 }} />

      <Modal
        title={editing ? 'Edit Banner' : 'New Banner'}
        open={open}
        onCancel={() => { setOpen(false); setEditing(null); setImages([]); form.resetFields(); }}
        onOk={() => form.submit()}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item name="title" label="Title" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="subtitle" label="Subtitle"><Input /></Form.Item>
          <Form.Item label="Banner Image" required>
            <ImageUploader value={images} onChange={setImages} folder="banners" max={1} />
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
