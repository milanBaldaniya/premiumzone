import { useState } from 'react';
import { Table, Button, Modal, Form, Input, Switch, Space, Popconfirm, Typography, Tag, App } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import {
  useGetCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
} from '../store/api/adminApi';

const { Title } = Typography;

export default function Categories() {
  const { message } = App.useApp();
  const { data, isFetching } = useGetCategoriesQuery({ limit: 100 });
  const [createCategory] = useCreateCategoryMutation();
  const [updateCategory] = useUpdateCategoryMutation();
  const [deleteCategory] = useDeleteCategoryMutation();

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form] = Form.useForm();

  const openModal = (record) => {
    setEditing(record);
    form.setFieldsValue(record || { isActive: true, isFeatured: false });
    setOpen(true);
  };

  const onFinish = async (values) => {
    try {
      if (editing) await updateCategory({ id: editing._id, ...values }).unwrap();
      else await createCategory(values).unwrap();
      message.success(editing ? 'Category updated' : 'Category created');
      setOpen(false);
      form.resetFields();
      setEditing(null);
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
    { title: 'Name', dataIndex: 'name', render: (v) => <strong>{v}</strong> },
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

      <Table rowKey="_id" columns={columns} dataSource={data?.data || []} loading={isFetching} scroll={{ x: 600 }} />

      <Modal
        title={editing ? 'Edit Category' : 'New Category'}
        open={open}
        onCancel={() => { setOpen(false); setEditing(null); form.resetFields(); }}
        onOk={() => form.submit()}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item name="name" label="Name" rules={[{ required: true }]}>
            <Input placeholder="Luxury Watches" />
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
