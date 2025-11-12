import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Card, Button, Row, Col, Typography, Space, Tag, Divider, List, Steps, Timeline } from 'antd'
import { LeftOutlined, PrinterOutlined, TruckOutlined, CheckCircleOutlined, ClockCircleOutlined, UserOutlined, PhoneOutlined, EnvironmentOutlined } from '@ant-design/icons'
import { getOrderById } from '@/services/api'

const { Title, Text } = Typography

const OrderDetailPage: React.FC = () => {
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
          setOrder(response.data.data)
        } else {
          console.error('获取订单失败:', response.data?.message || '未知错误')
        }
      } catch (error) {
        console.error('获取订单失败:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchOrder()
  }, [orderId])

  const getStatusColor = (status: string) => {
    const statusColors: Record<string, string> = {
      pending: 'orange',
      confirmed: 'blue',
      producing: 'cyan',
      completed: 'green',
      delivered: 'purple',
      cancelled: 'red'
    }
    return statusColors[status] || 'default'
  }

  const getStatusText = (status: string) => {
    const statusTexts: Record<string, string> = {
      pending: '待确认',
      confirmed: '已确认',
      producing: '生产中',
      completed: '已完成',
      delivered: '已送达',
      cancelled: '已取消'
    }
    return statusTexts[status] || status
  }

  const getDeliveryMethodText = (method: string) => {
    const methodTexts: Record<string, string> = {
      standard: '标准配送（3-5个工作日）',
      express: '快速配送（1-2个工作日）',
      same_day: '当日达（仅限同城）',
      pickup: '门店自提'
    }
    return methodTexts[method] || method
  }

  const getOrderSteps = (currentStatus: string) => {
    const statusOrder = ['pending', 'confirmed', 'producing', 'completed', 'delivered']
    const currentIndex = statusOrder.indexOf(currentStatus)

    return [
      {
        title: '订单确认',
        description: '订单已确认',
        status: currentIndex >= 0 ? 'finish' : 'wait',
        icon: <CheckCircleOutlined />
      },
      {
        title: '生产制作',
        description: '正在安排生产',
        status: currentIndex >= 2 ? 'finish' : currentIndex === 1 ? 'process' : 'wait',
        icon: <PrinterOutlined />
      },
      {
        title: '配送中',
        description: '等待配送',
        status: currentIndex >= 3 ? 'finish' : currentIndex === 2 ? 'process' : 'wait',
        icon: <TruckOutlined />
      },
      {
        title: '已完成',
        description: '订单完成',
        status: currentIndex >= 4 ? 'finish' : currentIndex === 3 ? 'process' : 'wait',
        icon: <ClockCircleOutlined />
      }
    ]
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ClockCircleOutlined style={{ fontSize: '64px', color: '#ccc' }} />
          <Title level={3} className="mt-4">加载中...</Title>
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
            <Button type="primary" onClick={() => navigate('/order/list')}>
              返回订单列表
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  // 模拟订单时间线数据
  const timelineItems = [
    {
      color: 'green',
      dot: <CheckCircleOutlined />,
      children: (
        <div>
          <Text strong>订单已确认</Text>
          <br />
          <Text type="secondary">{new Date(order.createdAt).toLocaleString()}</Text>
          <br />
          <Text>您的订单已确认，我们正在安排生产</Text>
        </div>
      )
    }
  ]

  if (order.status !== 'pending') {
    timelineItems.push({
      color: 'blue',
      dot: <PrinterOutlined />,
      children: (
        <div>
          <Text strong>生产中</Text>
          <br />
          <Text type="secondary">{new Date(order.updatedAt).toLocaleString()}</Text>
          <br />
          <Text>您的订单正在生产中，请耐心等待</Text>
        </div>
      )
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 页面标题 */}
        <Row justify="space-between" align="middle" className="mb-6">
          <Col>
            <Title level={2}>
              订单详情
            </Title>
          </Col>
          <Col>
            <Space>
              <Button
                icon={<LeftOutlined />}
                onClick={() => navigate(-1)}
              >
                返回
              </Button>
              <Button
                icon={<PrinterOutlined />}
                onClick={() => window.print()}
              >
                打印
              </Button>
            </Space>
          </Col>
        </Row>

        {/* 订单状态卡片 */}
        <Card className="mb-8">
          <Row justify="space-between" align="middle">
            <Col>
              <Space>
                <Text strong>订单状态:</Text>
                <Tag color={getStatusColor(order.status)} style={{ fontSize: '14px', padding: '4px 8px' }}>
                  {getStatusText(order.status)}
                </Tag>
              </Space>
            </Col>
            <Col>
              <Text strong>订单号: {order.orderNumber || order.id}</Text>
            </Col>
          </Row>
        </Card>

        {/* 订单进度 */}
        <Card className="mb-8">
          <Title level={4}>订单进度</Title>
          <Steps 
            current={getOrderSteps(order.status).findIndex(step => step.status === 'process')}
          >
            {getOrderSteps(order.status).map((step, index) => (
              <Steps.Step 
                key={index} 
                title={step.title}
                description={step.description}
                status={step.status as any}
                icon={step.icon}
              />
            ))}
          </Steps>
        </Card>

        <Row gutter={[24, 24]}>
          {/* 订单信息 */}
          <Col xs={24} lg={16}>
            <Card className="mb-6">
              <Title level={4}>订单信息</Title>
              <Divider />
              
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12}>
                  <Space direction="vertical" size="small">
                    <Space>
                      <UserOutlined />
                      <Text strong>收货人:</Text>
                      <Text>{order.customerName}</Text>
                    </Space>
                    <Space>
                      <PhoneOutlined />
                      <Text strong>联系电话:</Text>
                      <Text>{order.phone}</Text>
                    </Space>
                    <Space>
                      <Text strong>邮箱:</Text>
                      <Text>{order.email}</Text>
                    </Space>
                  </Space>
                </Col>
                <Col xs={24} sm={12}>
                  <Space direction="vertical" size="small">
                    <Space>
                      <EnvironmentOutlined />
                      <Text strong>配送方式:</Text>
                      <Text>{getDeliveryMethodText(order.deliveryMethod)}</Text>
                    </Space>
                    <Space>
                      <Text strong>期望送达:</Text>
                      <Text>{new Date(order.deliveryDate).toLocaleDateString()}</Text>
                    </Space>
                    <Space>
                      <Text strong>下单时间:</Text>
                      <Text>{new Date(order.createdAt).toLocaleString()}</Text>
                    </Space>
                  </Space>
                </Col>
              </Row>

              {order.notes && (
                <div className="mt-4">
                  <Text strong>订单备注:</Text>
                  <div className="mt-2 p-3 bg-gray-50 rounded">
                    <Text>{order.notes}</Text>
                  </div>
                </div>
              )}
            </Card>

            {/* 商品清单 */}
            <Card className="mb-6">
              <Title level={4}>商品清单</Title>
              <Divider />
              <List
                dataSource={order.items}
                renderItem={(item: any) => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={
                        <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                          <PrinterOutlined style={{ fontSize: '20px', color: '#ccc' }} />
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
                    <div className="text-right">
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

            {/* 订单时间线 */}
            <Card>
              <Title level={4}>订单时间线</Title>
              <Divider />
              <Timeline items={timelineItems} />
            </Card>
          </Col>

          {/* 侧边栏 */}
          <Col xs={24} lg={8}>
            {/* 收货地址 */}
            <Card className="mb-6">
              <Title level={5}>收货地址</Title>
              <Divider />
              <Text>{order.address}</Text>
            </Card>

            {/* 订单金额 */}
            <Card className="mb-6">
              <Title level={5}>订单金额</Title>
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

            {/* 操作按钮 */}
            <Card className="mb-6">
              <Title level={5}>操作</Title>
              <Divider />
              <Space direction="vertical" className="w-full">
                <Button type="primary" block onClick={() => navigate('/order/list')}>
                  返回订单列表
                </Button>
                <Button block onClick={() => navigate('/')}>
                  返回首页
                </Button>
                {order.status === 'pending' && (
                  <Button danger block>
                    取消订单
                  </Button>
                )}
              </Space>
            </Card>

            {/* 联系客服 */}
            <Card>
              <Title level={5}>联系客服</Title>
              <Divider />
              <Space direction="vertical" className="w-full">
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

export default OrderDetailPage