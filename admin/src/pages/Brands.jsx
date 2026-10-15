import { useState } from 'react';
import { Button, Modal, Form, Input, Switch, Space, Popconfirm, Typography, Tag, Image, App } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import {
  useGetBrandsQuery,
  useCreateBrandMutation,
  useUpdateBrandMutation,
  useDeleteBrandMutation,
} from '../store/api/adminApi';
import ResponsiveTable from '../components/ResponsiveTable';
import ImageUploader from '../components/ImageUploader';

const { Title } = Typography;

export default function Brands() {
  const { message } = App.useApp();
  const { data, isFetching } = useGetBrandsQuery({ limit: 100 });
  const [createBrand] = useCreateBrandMutation();
  const [updateBrand] = useUpdateBrandMutation();
  const [deleteBrand] = useDeleteBrandMutation();

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [logo, setLogo] = useState([]);
  const [logoUploading, setLogoUploading] = useState(false);
  const [form] = Form.useForm();

  const openModal = (record) => {
    setEditing(record);
    setLogo(record?.logo ? [record.logo] : []);
    setLogoUploading(false);
    form.setFieldsValue(record || { isActive: true, isFeatured: false });
    setOpen(true);
  };

  const onFinish = async (values) => {
    const payload = { ...values, logo: logo[0] || null };
    try {
      if (editing) await updateBrand({ id: editing._id, ...payload }).unwrap();
      else await createBrand(payload).unwrap();
      message.success(editing ? 'Brand updated' : 'Brand created');
      setOpen(false);
      form.resetFields();
      setEditing(null);
      setLogo([]);
    } catch (err) {
      message.error(err?.data?.message || 'Save failed');
    }
  };

  const columns = [
    {
      title: 'Brand',
      dataIndex: 'name',
      render: (name, row) => (
        <Space>
          {row.logo?.url ? (
            <Image src={row.logo.url} width={40} height={40} style={{ objectFit: 'contain', borderRadius: 6 }} />
          ) : (
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 6,
                background: '#0F172A',
                color: '#D4AF37',
                display: 'grid',
                placeItems: 'center',
                fontWeight: 700,
                flexShrink: 0,
              }}
            >
              {name?.[0]?.toUpperCase()}
            </div>
          )}
          <strong>{name}</strong>
        </Space>
      ),
    },
    { title: 'Country', dataIndex: 'country', render: (v) => v || '—' },
    { title: 'Featured', dataIndex: 'isFeatured', render: (v) => (v ? <Tag color="gold">Featured</Tag> : '—') },
    { title: 'Active', dataIndex: 'isActive', render: (v) => <Tag color={v ? 'green' : 'red'}>{v ? 'Active' : 'Inactive'}</Tag> },
    {
      title: 'Actions',
      render: (_, row) => (
        <Space>
          <Button size="small" icon={<EditOutlined />} onClick={() => openModal(row)} />
          <Popconfirm title="Delete this brand?" onConfirm={() => deleteBrand(row._id).unwrap().then(() => message.success('Deleted')).catch(() => message.error('Failed'))}>
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
        <Title level={3} className="font-display" style={{ margin: 0 }}>Brands</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal(null)}>Add Brand</Button>
      </div>

      <ResponsiveTable rowKey="_id" columns={columns} dataSource={data?.data || []} loading={isFetching} scroll={{ x: 600 }} />

      <Modal
        title={editing ? 'Edit Brand' : 'New Brand'}
        open={open}
        onCancel={() => { setOpen(false); setEditing(null); setLogo([]); setLogoUploading(false); form.resetFields(); }}
        onOk={() => form.submit()}
        okButtonProps={{ disabled: logoUploading }}
        okText={logoUploading ? 'Waiting for upload…' : 'OK'}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item label="Logo">
            <ImageUploader value={logo} onChange={setLogo} folder="brands" max={1} onUploadingChange={setLogoUploading} />
          </Form.Item>
          <Form.Item name="name" label="Name" rules={[{ required: true }]}>
            <Input placeholder="Rolex" />
          </Form.Item>
          <Form.Item name="country" label="Country">
            <Input placeholder="Switzerland" />
          </Form.Item>
          <Form.Item name="website" label="Website">
            <Input placeholder="https://" />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Space size="large">
            <Form.Item name="isFeatured" label="Featured" valuePropName="checked"><Switch /></Form.Item>
            <Form.Item name="isActive" label="Active" valuePropName="checked"><Switch /></Form.Item>
          </Space>
        </Form>
      </Modal>
    </div>
  );
}
