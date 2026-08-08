import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Button, Input, Space, Tag, Image, Popconfirm, Typography, App } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import { useGetProductsQuery, useDeleteProductMutation } from '../store/api/adminApi';

const { Title } = Typography;

const STATUS_COLORS = { active: 'green', draft: 'orange', archived: 'default' };
const GENDER_LABELS = { men: 'Men', women: 'Women', unisex: 'Unisex' };

export default function Products() {
  const navigate = useNavigate();
  const { message } = App.useApp();
  const [params, setParams] = useState({ page: 1, limit: 10, search: '' });
  const { data, isFetching } = useGetProductsQuery(params);
  const [deleteProduct] = useDeleteProductMutation();

  const products = data?.data || [];
  const meta = data?.meta || {};

  const handleDelete = async (id) => {
    try {
      await deleteProduct(id).unwrap();
      message.success('Product deleted');
    } catch {
      message.error('Delete failed');
    }
  };

  const columns = [
    {
      title: 'Product',
      dataIndex: 'name',
      render: (name, row) => (
        <Space>
          <Image
            src={row.thumbnail?.url}
            width={44}
            height={44}
            style={{ objectFit: 'cover', borderRadius: 8 }}
            fallback="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='44' height='44'><rect width='100%' height='100%' fill='%23e2e8f0'/></svg>"
          />
          <div>
            <div style={{ fontWeight: 600 }}>{name}</div>
            <div style={{ fontSize: 12, color: '#94a3b8' }}>{row.sku}</div>
          </div>
        </Space>
      ),
    },
    { title: 'Brand', dataIndex: ['brand', 'name'], render: (v) => v || '—' },
    { title: 'Category', dataIndex: ['category', 'name'], render: (v) => v || '—' },
    {
      title: 'Gender',
      dataIndex: 'gender',
      render: (g) => <Tag>{GENDER_LABELS[g] || 'Unisex'}</Tag>,
    },
    {
      title: 'Price',
      dataIndex: 'price',
      render: (price, row) => (
        <span>
          ₹{row.discountPrice > 0 ? row.discountPrice : price}
          {row.discountPrice > 0 && (
            <span style={{ color: '#94a3b8', textDecoration: 'line-through', marginLeft: 6, fontSize: 12 }}>
              ₹{price}
            </span>
          )}
        </span>
      ),
    },
    {
      title: 'Stock',
      dataIndex: 'stock',
      render: (stock, row) => (
        <Tag color={stock <= (row.lowStockThreshold || 5) ? 'red' : 'green'}>{stock}</Tag>
      ),
    },
    { title: 'Status', dataIndex: 'status', render: (s) => <Tag color={STATUS_COLORS[s]}>{s}</Tag> },
    {
      title: 'Actions',
      render: (_, row) => (
        <Space>
          <Button size="small" icon={<EditOutlined />} onClick={() => navigate(`/products/${row._id}/edit`)} />
          <Popconfirm title="Delete this product?" onConfirm={() => handleDelete(row._id)}>
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <Title level={3} className="font-display" style={{ margin: 0 }}>
          Products
        </Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/products/new')}>
          Add Product
        </Button>
      </div>

      <Input
        prefix={<SearchOutlined />}
        placeholder="Search products…"
        allowClear
        style={{ maxWidth: 320, marginBottom: 16 }}
        onChange={(e) => setParams((p) => ({ ...p, search: e.target.value, page: 1 }))}
      />

      <Table
        rowKey="_id"
        columns={columns}
        dataSource={products}
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
