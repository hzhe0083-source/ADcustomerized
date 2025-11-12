import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Card, Button, Row, Col, Typography, Space, Steps, Divider, List } from 'antd'
import { CheckCircleOutlined, ShoppingCartOutlined, PrinterOutlined, TruckOutlined, SmileOutlined, LeftOutlined, HomeOutlined } from '@ant-design/icons'
import { getOrderById } from '@/services/api'

const { Title, Text } = Typography

const OrderSuccessPage: React.FC = () => {
  const navigate = useNavigate()
  const { orderId } = useParams<{ orderId: string }>()
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) return
      
      try {
        const response = await getOrderById(orderId)
        if (response.data?.success) {
          setOrder(response.data)
        } else {
          console.error('获取订单失败:', response.data?.message)
        }
      } catch (error) {
        console.error('获取订单失败:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchOrder()
  }, [orderId])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <CheckCircleOutlined style={{ fontSize: '64px', color: '#52c41a' }} />
          <Title level={3} className="mt-4">订单处理中...</Title>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="text-center">
          <Title level={3}>订单不存在</Title>
          <Text>无法找到订单信息，请检查订单号是否正确</Text>
          <div className="mt-4">
            <Button type="primary" onClick={() => navigate('/')}>
              返回首页
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  const orderSteps = [
    {
      title: '订单确认',
      description: '订单已确认',
      status: 'finish' as const,
      icon: <CheckCircleOutlined />
    },
    {
      title: '生产制作',
      description: '正在安排生产',
      status: 'process' as const,
      icon: <PrinterOutlined />
    },
    {
      title: '配送中',
      description: '等待配送',
      status: 'wait' as const,
      icon: <TruckOutlined />
    },
    {
      title: '已完成',
      description: '订单完成',
      status: 'wait' as const,
      icon: <SmileOutlined />
    }
  ]

  const deliveryMethodText = {
    standard: '标准配送（3-5个工作日）',
    express: '快速配送（1-2个工作日）',
    same_day: '当日达（仅限同城）',
    pickup: '门店自提'
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 成功提示 */}
        <Card className="mb-8 bg-green-50 border-green-200">
          <div className="text-center py-8">
            <CheckCircleOutlined style={{ fontSize: '80px', color: '#52c41a' }} />
            <Title level={2} className="mt-4 text-green-700">
              订单提交成功！
            </Title>
            <Text className="text-lg text-green-600">
              订单号: {order.orderNumber || order.id}
            </Text>
            <Text className="block mt-2 text-gray-600">
              我们将尽快为您安排生产，请保持电话畅通
            </Text>
          </div>
        </Card>

        {/* 订单进度 */}
        <Card className="mb-8">
          <Title level={4}>订单进度</Title>
          <Steps current={1} items={orderSteps} />
        </Card>

        <Row gutter={[24, 24]}>
          {/* 订单详情 */}
          <Col xs={24} lg={16}>
            <Card>
              <Title level={4}>订单详情</Title>
              <Divider />
              
              <div className="space-y-4">
                <Row>
                  <Col span={8}><Text strong>订单编号:</Text></Col>
                  <Col span={16}><Text>{order.orderNumber || order.id}</Text></Col>
                </Row>
                <Row>
                  <Col span={8}><Text strong>下单时间:</Text></Col>
                  <Col span={16}><Text>{new Date(order.createdAt).toLocaleString()}</Text></Col>
                </Row>
                <Row>
                  <Col span={8}><Text strong>收货人:</Text></Col>
                  <Col span={16}><Text>{order.customerName}</Text></Col>
                </Row>
                <Row>
                  <Col span={8}><Text strong>联系电话:</Text></Col>
                  <Col span={16}><Text>{order.phone}</Text></Col>
                </Row>
                <Row>
                  <Col span={8}><Text strong>配送方式:</Text></Col>
                  <Col span={16}><Text>{deliveryMethodText[order.deliveryMethod as keyof typeof deliveryMethodText]}</Text></Col>
                </Row>
                <Row>
                  <Col span={8}><Text strong>期望送达:</Text></Col>
                  <Col span={16}><Text>{order.deliveryDate}</Text></Col>
                </Row>
                {order.notes && (
                  <Row>
                    <Col span={8}><Text strong>订单备注:</Text></Col>
                    <Col span={16}><Text>{order.notes}</Text></Col>
                  </Row>
                )}
              </div>

              <Divider />

              {/* 商品列表 */}
              <Title level={5}>商品清单</Title>
              <List
                dataSource={order.items}
                renderItem={(item: any) => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={
                        <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                          <ShoppingCartOutlined style={{ fontSize: '20px', color: '#ccc' }} />
                        </div>
                      }
                      title={item.productName}
                      description={
                        <Space direction="vertical" size="small">
                          {Object.entries(item.configs || {}).map(([key, value]: [string, any]) => (
                            <Text key={key} type="secondary">
                              {value.name}: {value.value}
                            </Text>
                          ))}
                          <Text type="secondary">数量: {item.quantity}</Text>
                        </Space>
                      }
                    />
                    <div>
                      <Text className="font-bold">
                        ¥{(item.price * item.quantity).toFixed(2)}
                      </Text>
                      <div className="text-sm text-gray-500">
                        单价: ¥{item.price.toFixed(2)}
                      </div>
                    </div>
                  </List.Item>
                )}
              />
            </Card>
          </Col>

          {/* 侧边栏 */}
          <Col xs={24} lg={8}>
            {/* 订单金额 */}
            <Card>
              <Title level={4}>订单金额</Title>
              <Divider />
              <div className="space-y-3">
                <div className="flex justify-between">
                  <Text>商品总计:</Text>
                  <Text>¥{order.totalAmount.toFixed(2)}</Text>
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
                    ¥{order.totalAmount.toFixed(2)}
                  </Title>
                </div>
              </div>
            </Card>

            {/* 后续操作 */}
            <Card className="mt-6">
              <Title level={5}>后续操作</Title>
              <Space direction="vertical" className="w-full mt-3">
                <Button type="primary" block onClick={() => navigate('/order/list')}>
                  查看订单列表
                </Button>
                <Button 
                  icon={<HomeOutlined />}
                  block 
                  onClick={() => navigate('/')}
                >
                  返回首页
                </Button>
                <Button 
                  icon={<LeftOutlined />}
                  block 
                  onClick={() => navigate(-1)}
                >
                  返回上页
                </Button>
              </Space>
            </Card>

            {/* 重要提醒 */}
            <Card className="mt-6 bg-blue-50 border-blue-200">
              <Title level={5}>重要提醒</Title>
              <Space direction="vertical" size="small" className="mt-2">
                <Text type="secondary">• 请保持电话畅通，方便我们联系您</Text>
                <Text type="secondary">• 生产进度可在订单详情中查看</Text>
                <Text type="secondary">• 如有问题请及时联系客服</Text>
                <Text type="secondary">• 支持7天无理由退换货</Text>
              </Space>
            </Card>

            {/* 联系客服 */}
            <Card className="mt-6">
              <Title level={5}>联系客服</Title>
              <Space direction="vertical" className="mt-2">
                <Text type="secondary">客服热线: 400-123-4567</Text>
                <Text type="secondary">工作时间: 9:00-18:00</Text>
                <Text type="secondary">在线客服: 24小时服务</Text>
                <Button type="link" block>
                  在线咨询
                </Button>
              </Space>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  )
}

export default OrderSuccessPage