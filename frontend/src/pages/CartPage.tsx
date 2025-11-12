import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, Row, Col, Typography, Button, Space, InputNumber, List, Divider } from 'antd'
import { DeleteOutlined, ShoppingCartOutlined, RightOutlined } from '@ant-design/icons'
import { useCartStore } from '@/store/cartStore'

const { Title, Text } = Typography

const CartPage: React.FC = () => {
  const navigate = useNavigate()
  const { items, totalAmount, totalQuantity, removeItem, updateQuantity } = useCartStore()

  const handleQuantityChange = (id: string, quantity: number | null) => {
    if (quantity && quantity > 0) {
      updateQuantity(id, quantity)
    }
  }

  const handleRemoveItem = (id: string) => {
    removeItem(id)
  }

  const handleCheckout = () => {
    if (items.length === 0) {
      return
    }
    navigate('/order/confirm')
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Title level={2} className="mb-8">
          购物车 ({totalQuantity})
        </Title>

        {items.length === 0 ? (
          <Card className="text-center py-16">
            <ShoppingCartOutlined style={{ fontSize: '64px', color: '#ccc' }} />
            <Title level={3} className="mt-4 text-gray-500">
              购物车是空的
            </Title>
            <Text className="text-gray-400">
              快去选购您需要的产品吧！
            </Text>
            <div className="mt-6">
              <Button 
                type="primary" 
                size="large"
                onClick={() => navigate('/')}
              >
                去购物
              </Button>
            </div>
          </Card>
        ) : (
          <Row gutter={[24, 24]}>
            {/* 购物车商品列表 */}
            <Col xs={24} lg={16}>
              <Card>
                <List
                  dataSource={items}
                  renderItem={(item) => (
                    <List.Item
                      actions={[
                        <Button
                          type="text"
                          danger
                          icon={<DeleteOutlined />}
                          onClick={() => handleRemoveItem(item.id)}
                        >
                          删除
                        </Button>
                      ]}
                    >
                      <List.Item.Meta
                        avatar={
                          <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                            {item.image ? (
                              <img src={item.image} alt={item.productName} className="w-full h-full object-cover" />
                            ) : (
                              <Text className="text-gray-500 text-xs">图片</Text>
                            )}
                          </div>
                        }
                        title={item.productName}
                        description={
                          <Space direction="vertical" size="small">
                            {Object.entries(item.configData || {}).map(([key, value]: [string, any]) => (
                              <Text key={key} type="secondary">
                                {value.name}: {value.value}
                              </Text>
                            ))}
                            <Text type="secondary">
                              单价: ¥{item.price.toFixed(2)}
                            </Text>
                          </Space>
                        }
                      />
                      <div>
                        <InputNumber
                          min={1}
                          max={1000}
                          value={item.quantity}
                          onChange={(value) => handleQuantityChange(item.id, value || 1)}
                          className="w-24"
                        />
                        <div className="mt-2">
                          <Text className="text-lg font-bold text-red-600">
                            ¥{(item.price * item.quantity).toFixed(2)}
                          </Text>
                        </div>
                      </div>
                    </List.Item>
                  )}
                />
              </Card>
            </Col>

            {/* 订单摘要 */}
            <Col xs={24} lg={8}>
              <Card>
                <Title level={4}>订单摘要</Title>
                <Divider />
                <div className="space-y-4">
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
                  onClick={handleCheckout}
                  disabled={items.length === 0}
                >
                  去结算 <RightOutlined />
                </Button>
                <Button
                  className="w-full mt-3"
                  onClick={() => navigate('/')}
                >
                  继续购物
                </Button>
              </Card>

              {/* 配送信息 */}
              <Card className="mt-6">
                <Title level={5}>配送信息</Title>
                <Text type="secondary" className="block mt-2">
                  我们提供多种配送方式，支持同城配送和全国快递。具体配送时间和费用会根据您的地址和选择的配送方式而定。
                </Text>
              </Card>

              {/* 售后服务 */}
              <Card className="mt-6">
                <Title level={5}>售后服务</Title>
                <Space direction="vertical" size="small" className="mt-2">
                  <Text type="secondary">• 质量问题免费重印</Text>
                  <Text type="secondary">• 7天无理由退换</Text>
                  <Text type="secondary">• 24小时客服支持</Text>
                  <Text type="secondary">• 专业设计咨询</Text>
                </Space>
              </Card>
            </Col>
          </Row>
        )}
      </div>
    </div>
  )
}

export default CartPage