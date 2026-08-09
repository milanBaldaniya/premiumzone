import { useEffect } from 'react';
import { Card, Form, Input, InputNumber, Switch, Button, Row, Col, Typography, Spin, App } from 'antd';
import { useGetSettingsQuery, useUpdateSettingsMutation } from '../store/api/adminApi';

const { Title } = Typography;

export default function Settings() {
  const { message } = App.useApp();
  const { data, isLoading } = useGetSettingsQuery();
  const [updateSettings, { isLoading: saving }] = useUpdateSettingsMutation();
  const [form] = Form.useForm();

  useEffect(() => {
    if (data?.data) form.setFieldsValue(data.data);
  }, [data, form]);

  const onFinish = async (values) => {
    try {
      await updateSettings(values).unwrap();
      message.success('Settings saved');
    } catch (err) {
      message.error(err?.data?.message || 'Save failed (super admin only)');
    }
  };

  if (isLoading) return <div style={{ display: 'grid', placeItems: 'center', height: 300 }}><Spin size="large" /></div>;

  return (
    <div>
      <Title level={3} className="font-display" style={{ marginBottom: 20 }}>Settings</Title>
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Row gutter={16}>
          <Col xs={24} lg={12}>
            <Card title="Store" style={{ marginBottom: 16 }}>
              <Form.Item name={['store', 'name']} label="Store Name"><Input /></Form.Item>
              <Form.Item name={['store', 'tagline']} label="Tagline"><Input /></Form.Item>
              <Form.Item name={['store', 'email']} label="Contact Email"><Input /></Form.Item>
              <Form.Item name={['store', 'phone']} label="Contact Phone"><Input /></Form.Item>
              <Form.Item
                name={['store', 'whatsapp']}
                label="WhatsApp Number"
                extra="Country code + number, digits only (e.g. 919876543210). Powers the 'Order via WhatsApp' buttons on the storefront."
              >
                <Input placeholder="919876543210" />
              </Form.Item>
              <Form.Item name={['store', 'currency']} label="Currency"><Input /></Form.Item>
            </Card>
          </Col>
          <Col xs={24} lg={12}>
            <Card title="Shipping & Tax" style={{ marginBottom: 16 }}>
              <Form.Item name={['shipping', 'freeShippingThreshold']} label="Free Shipping Threshold (₹)">
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
              <Form.Item name={['shipping', 'flatRate']} label="Flat Shipping Rate (₹)">
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
              <Form.Item name={['shipping', 'taxPercent']} label="Tax (%)">
                <InputNumber min={0} max={100} style={{ width: '100%' }} />
              </Form.Item>
            </Card>

            <Card title="Features" style={{ marginBottom: 16 }}>
              <Form.Item name={['features', 'codEnabled']} label="Cash on Delivery" valuePropName="checked"><Switch /></Form.Item>
              <Form.Item name={['features', 'reviewsEnabled']} label="Reviews" valuePropName="checked"><Switch /></Form.Item>
              <Form.Item name={['features', 'wishlistEnabled']} label="Wishlist" valuePropName="checked"><Switch /></Form.Item>
              <Form.Item name={['features', 'maintenanceMode']} label="Maintenance Mode" valuePropName="checked"><Switch /></Form.Item>
            </Card>
          </Col>
          <Col xs={24} lg={12}>
            <Card title="Social Links">
              <Form.Item name={['social', 'instagram']} label="Instagram"><Input /></Form.Item>
              <Form.Item name={['social', 'facebook']} label="Facebook"><Input /></Form.Item>
              <Form.Item name={['social', 'twitter']} label="Twitter"><Input /></Form.Item>
              <Form.Item name={['social', 'youtube']} label="YouTube"><Input /></Form.Item>
            </Card>
          </Col>
        </Row>
        <Button type="primary" htmlType="submit" loading={saving} size="large" style={{ marginTop: 8 }}>
          Save Settings
        </Button>
      </Form>
    </div>
  );
}
