import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, Form, Input, Select, Button, Row, Col, Typography, Space, Divider, Checkbox, message } from 'antd'
import { ShoppingCartOutlined, UserOutlined, PhoneOutlined, ClockCircleOutlined } from '@ant-design/icons'
import { useCartStore } from '@/store/cartStore'
import { useAuthStore } from '@/store/authStore'
import { createOrder } from '@/services/api'

const { Title, Text } = Typography
const { TextArea } = Input
const { Option } = Select

interface OrderForm {
  customerName: string
  phone: string
  email: string
  address: string
  deliveryMethod: string
  deliveryDate: string
  notes: string
  agreeTerms: boolean
}

const OrderConfirmPage: React.FC = () => {
  const navigate = useNavigate()
  const [form] = Form.useForm()
  const { items, totalAmount, clearCart } = useCartStore()
  const { user } = useAuthStore()
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (values: OrderForm) => {
    if (!values.agreeTerms) {
      message.error('请先同意服务条款')
      return
    }

    if (items.length === 0) {
      message.error('购物车为空')
      return
    }

    setLoading(true)
    try {
      const orderData = {
        customerName: values.customerName,
        phone: values.phone,
        email: values.email,
        address: values.address,
        deliveryMethod: values.deliveryMethod,
        deliveryDate: values.deliveryDate,
        notes: values.notes,
        items: items.map(item => ({
          productId: item.productId,
          productName: item.productName,
          quantity: item.quantity,
          price: item.price,
          configs: item.configData || {}
        })),
        totalAmount: totalAmount
      }

      const response = await createOrder(orderData)
      
      if (response.data?.success) {
        message.success('订单提交成功！')
        clearCart()
        navigate(`/order/success/${response.data.data.orderId}`)
      } else {
        message.error(response.data?.message || '订单提交失败')
      }
    } catch (error) {
      message.error('订单提交失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  const deliveryMethods = [
    { value: 'standard', label: '标准配送（3-5个工作日）', price: 0 },
    { value: 'express', label: '快速配送（1-2个工作日）', price: 20 },
    { value: 'same_day', label: '当日达（仅限同城）', price: 50 },
    { value: 'pickup', label: '门店自提（免费）', price: 0 }
  ]

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Title level={2} className="mb-8">
          确认订单
        </Title>

        <Row gutter={[24, 24]}>
          {/* 订单商品列表 */}
          <Col xs={24} lg={16}>
            <Card>
              <Title level={4}>订单商品</Title>
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                    <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                      {item.image ? (
                        <img src={item.image} alt={item.productName} className="w-full h-full object-cover" />
                      ) : (
                        <ShoppingCartOutlined style={{ fontSize: '24px', color: '#ccc' }} />
                      )}
                    </div>
                    <div className="flex-1">
                      <Text strong>{item.productName}</Text>
                      <div className="text-sm text-gray-600">
                        {Object.entries(item.configData || {}).map(([key, value]: [string, any]) => (
                          <div key={key}>{value.name}: {value.value}</div>
                        ))}
                      </div>
                      <Text type="secondary">数量: {item.quantity}</Text>
                    </div>
                    <div className="text-right">
                      <Text className="text-lg font-bold text-red-600">
                        ¥{(item.price * item.quantity).toFixed(2)}
                      </Text>
                      <div className="text-sm text-gray-500">
                        单价: ¥{item.price.toFixed(2)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <Divider />
              <div className="flex justify-between items-center">
                <Text>商品总计:</Text>
                <Text className="text-xl font-bold text-red-600">
                  ¥{totalAmount.toFixed(2)}
                </Text>
              </div>
            </Card>

            {/* 配送信息 */}
            <Card className="mt-6">
              <Title level={4}>配送信息</Title>
              <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                initialValues={{
                  customerName: user?.name || '',
                  phone: user?.phone || '',
                  email: user?.email || '',
                  deliveryMethod: 'standard',
                  agreeTerms: false
                }}
              >
                <Row gutter={16}>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      label="收货人姓名"
                      name="customerName"
                      rules={[{ required: true, message: '请输入收货人姓名' }]}
                    >
                      <Input prefix={<UserOutlined />} placeholder="请输入收货人姓名" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      label="联系电话"
                      name="phone"
                      rules={[
                        { required: true, message: '请输入联系电话' },
                        { pattern: /^1[3-9]\d{9}$/, message: '请输入有效的手机号码' }
                      ]}
                    >
                      <Input prefix={<PhoneOutlined />} placeholder="请输入手机号码" />
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item
                  label="邮箱地址"
                  name="email"
                  rules={[
                    { required: true, message: '请输入邮箱地址' },
                    { type: 'email', message: '请输入有效的邮箱地址' }
                  ]}
                >
                  <Input placeholder="请输入邮箱地址" />
                </Form.Item>

                <Form.Item
                  label="详细地址"
                  name="address"
                  rules={[{ required: true, message: '请输入详细地址' }]}
                >
                  <TextArea
                    rows={3}
                    placeholder="请输入详细地址，包括街道、门牌号等信息"
                  />
                </Form.Item>

                <Row gutter={16}>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      label="配送方式"
                      name="deliveryMethod"
                      rules={[{ required: true, message: '请选择配送方式' }]}
                    >
                      <Select placeholder="请选择配送方式">
                        {deliveryMethods.map((method) => (
                          <Option key={method.value} value={method.value}>
                            {method.label} {method.price > 0 && `(+¥${method.price})`}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      label="期望送达日期"
                      name="deliveryDate"
                      rules={[{ required: true, message: '请选择期望送达日期' }]}
                    >
                      <Input
                        prefix={<ClockCircleOutlined />}
                        type="date"
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item
                  label="订单备注"
                  name="notes"
                >
                  <TextArea
                    rows={3}
                    placeholder="请输入订单备注信息（可选）"
                  />
                </Form.Item>

                <Form.Item
                  name="agreeTerms"
                  valuePropName="checked"
                  rules={[
                    {
                      validator: (_, value) =>
                        value ? Promise.resolve() : Promise.reject(new Error('请先同意服务条款'))
                    }
                  ]}
                >
                  <Checkbox>
                    我已阅读并同意 <a href="#" target="_blank">服务条款</a> 和 <a href="#" target="_blank">隐私政策</a>
                  </Checkbox>
                </Form.Item>
              </Form>
            </Card>
          </Col>

          {/* 订单摘要 */}
          <Col xs={24} lg={8}>
            <Card>
              <Title level={4}>订单摘要</Title>
              <Divider />
              <div className="space-y-3">
                <div className="flex justify-between">
                  <Text>商品总计:</Text>
                  <Text>¥{totalAmount.toFixed(2)}</Text>
                </div>
                <div className="flex justify-between">
                  <Text>运费:</Text>
                  <Text>¥0.00</Text>
                </div>
                <div className="flex justify-between">
                  <Text>优惠:</Text>
                  <Text>-¥0.00</Text>
                </div>
                <Divider />
                <div className="flex justify-between items-center">
                  <Title level={4} className="mb-0">总计:</Title>
                  <Title level={3} className="mb-0 text-red-600">
                    ¥{totalAmount.toFixed(2)}
                  </Title>
                </div>
              </div>

              <Button
                type="primary"
                size="large"
                className="w-full mt-6"
                loading={loading}
                onClick={() => form.submit()}
                disabled={items.length === 0}
              >
                提交订单
              </Button>

              <Button
                className="w-full mt-3"
                onClick={() => navigate('/cart')}
              >
                返回购物车
              </Button>
            </Card>

            {/* 客服信息 */}
            <Card className="mt-6">
              <Title level={5}>需要帮助？</Title>
              <Space direction="vertical" size="small" className="mt-2">
                <Text type="secondary">客服热线: 400-123-4567</Text>
                <Text type="secondary">工作时间: 9:00-18:00</Text>
                <Text type="secondary">在线客服: 24小时服务</Text>
              </Space>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  )
}

export default OrderConfirmPage