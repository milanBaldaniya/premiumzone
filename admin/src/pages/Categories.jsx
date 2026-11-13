import { useState } from 'react';
import { Button, Modal, Form, Input, Switch, Space, Popconfirm, Typography, Tag, Image, App } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import {
  useGetCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
} from '../store/api/adminApi';
import ResponsiveTable from '../components/ResponsiveTable';
import ImageUploader from '../components/ImageUploader';

const { Title } = Typography;

export default function Categories() {
  const { message } = App.useApp();
  const { data, isFetching } = useGetCategoriesQuery({ limit: 100 });
  const [createCategory] = useCreateCategoryMutation();
  const [updateCategory] = useUpdateCategoryMutation();
  const [deleteCategory] = useDeleteCategoryMutation();

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [image, setImage] = useState([]);
  const [imageUploading, setImageUploading] = useState(false);
  const [form] = Form.useForm();

  const openModal = (record) => {
    setEditing(record);
    setImage(record?.image?.url ? [record.image] : []);
    setImageUploading(false);
    form.setFieldsValue(record || { isActive: true, isFeatured: false });
    setOpen(true);
  };

  const onFinish = async (values) => {
    const payload = { ...values, image: image[0] || null };
    try {
      if (editing) await updateCategory({ id: editing._id, ...payload }).unwrap();
      else await createCategory(payload).unwrap();
      message.success(editing ? 'Category updated' : 'Category created');
      setOpen(false);
      form.resetFields();
      setEditing(null);
      setImage([]);
    } catch (err) {
      message.error(err?.data?.message || 'Save failed');
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteCategory(id).unwrap();
      message.success('Deleted');
    } catch (err) {
      message.error(err?.data?.message || 'Delete failed');
    }
  };

  const columns = [
    {
      title: 'Category',
      dataIndex: 'name',
      render: (name, row) => (
        <Space>
          {row.image?.url ? (
            <Image src={row.image.url} width={40} height={40} style={{ objectFit: 'cover', borderRadius: 6 }} />
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
    { title: 'Slug', dataIndex: 'slug' },
    { title: 'Featured', dataIndex: 'isFeatured', render: (v) => (v ? <Tag color="gold">Featured</Tag> : '—') },
    { title: 'Active', dataIndex: 'isActive', render: (v) => <Tag color={v ? 'green' : 'red'}>{v ? 'Active' : 'Inactive'}</Tag> },
    {
      title: 'Actions',
      render: (_, row) => (
        <Space>
          <Button size="small" icon={<EditOutlined />} onClick={() => openModal(row)} />
          <Popconfirm title="Delete this category?" onConfirm={() => handleDelete(row._id)}>
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
        <Title level={3} className="font-display" style={{ margin: 0 }}>Categories</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal(null)}>Add Category</Button>
      </div>

      <ResponsiveTable rowKey="_id" columns={columns} dataSource={data?.data || []} loading={isFetching} scroll={{ x: 600 }} />

      <Modal
        title={editing ? 'Edit Category' : 'New Category'}
        open={open}
        onCancel={() => { setOpen(false); setEditing(null); setImage([]); setImageUploading(false); form.resetFields(); }}
        onOk={() => form.submit()}
        okButtonProps={{ disabled: imageUploading }}
        okText={imageUploading ? 'Waiting for upload…' : 'OK'}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item label="Image">
            <ImageUploader value={image} onChange={setImage} folder="categories" max={1} onUploadingChange={setImageUploading} />
          </Form.Item>
          <Form.Item name="name" label="Name" rules={[{ required: true }]}>
            <Input placeholder="Men's Watch" />
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
