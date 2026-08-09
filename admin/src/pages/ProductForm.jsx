import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Form, Input, InputNumber, Select, Switch, Button, Card, Row, Col, Typography, Space, App, Spin, Tooltip,
} from 'antd';
import { ArrowLeftOutlined, ReloadOutlined } from '@ant-design/icons';
import {
  useGetProductQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useGetBrandsQuery,
  useGetCategoriesQuery,
} from '../store/api/adminApi';
import ImageUploader from '../components/ImageUploader';

const { Title } = Typography;
const { TextArea } = Input;

// e.g. ("Rolex", "Submariner Date") -> "ROLEX-SUBMARINER-DATE-4F2A"
const generateSku = (brandName, productName) => {
  const slug = (s) =>
    (s || '')
      .toUpperCase()
      .replace(/[^A-Z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  const base = [slug(brandName), slug(productName)].filter(Boolean).join('-');
  const suffix = Math.random().toString(36).slice(2, 6).toUpperCase();
  return base ? `${base}-${suffix}` : suffix;
};

export default function ProductForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { message } = App.useApp();
  const [form] = Form.useForm();

  const { data: productData, isLoading } = useGetProductQuery(id, { skip: !isEdit });
  const { data: brandsData } = useGetBrandsQuery({ limit: 100 });
  const { data: categoriesData } = useGetCategoriesQuery({ limit: 100 });
  const [createProduct, { isLoading: creating }] = useCreateProductMutation();
  const [updateProduct, { isLoading: updating }] = useUpdateProductMutation();

  const [gallery, setGallery] = useState([]);
  // Once the admin manually edits the SKU (or we're editing an existing product),
  // stop silently overwriting it as they keep typing the name/brand.
  const [skuTouched, setSkuTouched] = useState(isEdit);

  useEffect(() => {
    if (productData?.data) {
      const p = productData.data;
      form.setFieldsValue({
        ...p,
        brand: p.brand?._id,
        category: p.category?._id,
      });
      setGallery(p.gallery?.length ? p.gallery : [p.thumbnail].filter(Boolean));
    }
  }, [productData, form]);

  const regenerateSku = () => {
    const brandName = brandsData?.data?.find((b) => b._id === form.getFieldValue('brand'))?.name;
    form.setFieldValue('sku', generateSku(brandName, form.getFieldValue('name')));
  };

  const handleValuesChange = (changed) => {
    if (skuTouched) return;
    if (!('name' in changed) && !('brand' in changed)) return;
    const brandName = brandsData?.data?.find((b) => b._id === form.getFieldValue('brand'))?.name;
    const name = form.getFieldValue('name');
    if (!brandName && !name) return;
    form.setFieldValue('sku', generateSku(brandName, name));
  };

  const onFinish = async (rawValues) => {
    // Derive thumbnail (first image) + gallery from the uploader
    const values = {
      ...rawValues,
      gallery,
      thumbnail: gallery[0] || undefined,
    };
    try {
      if (isEdit) {
        await updateProduct({ id, ...values }).unwrap();
        message.success('Product updated');
      } else {
        await createProduct(values).unwrap();
        message.success('Product created');
      }
      navigate('/products');
    } catch (err) {
      message.error(err?.data?.message || err?.data?.errors?.[0]?.message || 'Save failed');
    }
  };

  if (isEdit && isLoading) {
    return <div style={{ display: 'grid', placeItems: 'center', height: 300 }}><Spin size="large" /></div>;
  }

  return (
    <div>
      <Space style={{ marginBottom: 20 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/products')} />
        <Title level={3} className="font-display" style={{ margin: 0 }}>
          {isEdit ? 'Edit Product' : 'New Product'}
        </Title>
      </Space>

      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        onValuesChange={handleValuesChange}
        initialValues={{ status: 'active', stock: 0, price: 0, currency: 'INR', gender: 'unisex', paymentMethod: 'online' }}
      >
        <Row gutter={16}>
          <Col xs={24} lg={16}>
            <Card title="Basic Information" style={{ marginBottom: 16 }}>
              <Form.Item name="name" label="Product Name" rules={[{ required: true }]}>
                <Input placeholder="Rolex Submariner Date" />
              </Form.Item>
              <Form.Item name="sku" label="SKU" rules={[{ required: true }]} extra="Auto-generated from brand + name — edit anytime.">
                <Input
                  placeholder="ROLEX-SUB-126610"
                  onChange={() => setSkuTouched(true)}
                  suffix={
                    <Tooltip title="Regenerate">
                      <ReloadOutlined onClick={regenerateSku} style={{ cursor: 'pointer', color: '#8c8c8c' }} />
                    </Tooltip>
                  }
                />
              </Form.Item>
              <Form.Item name="shortDescription" label="Short Description">
                <Input placeholder="One-line summary" maxLength={300} />
              </Form.Item>
              <Form.Item name="description" label="Description" rules={[{ required: true }]}>
                <TextArea rows={6} placeholder="Full product description…" />
              </Form.Item>
              <Form.Item name="warranty" label="Warranty">
                <Input placeholder="2 Years International" />
              </Form.Item>
            </Card>

            <Card title="Images" style={{ marginBottom: 16 }}>
              <Typography.Paragraph type="secondary" style={{ marginTop: -8 }}>
                The first image is used as the thumbnail. Images upload to Cloudinary instantly.
              </Typography.Paragraph>
              <ImageUploader value={gallery} onChange={setGallery} folder="products" max={8} />
            </Card>

            <Card title="Pricing & Inventory">
              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item name="price" label="Price (₹)" rules={[{ required: true }]}>
                    <InputNumber min={0} style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item name="discountPrice" label="Discount Price (₹)">
                    <InputNumber min={0} style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item name="stock" label="Stock" rules={[{ required: true }]}>
                    <InputNumber min={0} style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
              </Row>
            </Card>
          </Col>

          <Col xs={24} lg={8}>
            <Card title="Organization" style={{ marginBottom: 16 }}>
              <Form.Item name="brand" label="Brand" rules={[{ required: true }]}>
                <Select
                  showSearch
                  optionFilterProp="label"
                  placeholder="Select brand"
                  options={brandsData?.data?.map((b) => ({ value: b._id, label: b.name }))}
                />
              </Form.Item>
              <Form.Item name="category" label="Category" rules={[{ required: true }]}>
                <Select
                  showSearch
                  optionFilterProp="label"
                  placeholder="Select category"
                  options={categoriesData?.data?.map((c) => ({ value: c._id, label: c.name }))}
                />
              </Form.Item>
              <Form.Item name="gender" label="Gender" rules={[{ required: true }]}>
                <Select
                  options={[
                    { value: 'men', label: 'Men' },
                    { value: 'women', label: 'Women' },
                    { value: 'unisex', label: 'Unisex' },
                  ]}
                />
              </Form.Item>
              <Form.Item name="status" label="Status">
                <Select
                  options={[
                    { value: 'active', label: 'Active' },
                    { value: 'draft', label: 'Draft' },
                    { value: 'archived', label: 'Archived' },
                  ]}
                />
              </Form.Item>
              <Form.Item
                name="paymentMethod"
                label="Payment Method"
                rules={[{ required: true }]}
                extra="Advance Payment skips Razorpay and sends the customer to WhatsApp to order/pay directly."
              >
                <Select
                  options={[
                    { value: 'online', label: 'Online Payment (Razorpay)' },
                    { value: 'advance', label: 'Advance Payment (WhatsApp)' },
                  ]}
                />
              </Form.Item>
            </Card>

            <Card title="Visibility">
              <Form.Item name="isFeatured" label="Featured" valuePropName="checked">
                <Switch />
              </Form.Item>
              <Form.Item name="isTrending" label="Trending" valuePropName="checked">
                <Switch />
              </Form.Item>
              <Form.Item name="isNewArrival" label="New Arrival" valuePropName="checked">
                <Switch />
              </Form.Item>
              <Form.Item name="isBestSeller" label="Best Seller" valuePropName="checked">
                <Switch />
              </Form.Item>
            </Card>
          </Col>
        </Row>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 8 }}>
          <Button onClick={() => navigate('/products')}>Cancel</Button>
          <Button type="primary" htmlType="submit" loading={creating || updating}>
            {isEdit ? 'Update Product' : 'Create Product'}
          </Button>
        </div>
      </Form>
    </div>
  );
}
