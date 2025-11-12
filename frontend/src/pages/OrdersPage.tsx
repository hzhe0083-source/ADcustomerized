import React, { useState, useEffect } from 'react'
import { Card, Table, Tag, Button, Space, Typography, Input, Select, Row, Col, Modal } from 'antd'
import { EyeOutlined, SearchOutlined, FilterOutlined } from '@ant-design/icons'
import { getOrders } from '@/services/api'
import { formatDate } from '@/utils/format'

const { Title, Text } = Typography
const { Search } = Input
const { Option } = Select

interface Order {
  id: string
  orderNumber: string
  status: string
  totalAmount: number
  customerName: string
  phone: string
  createdAt: string
  items: any[]
}

const OrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(false)
  const [searchText, setSearchText] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [modalVisible, setModalVisible] = useState(false)

  const statusColors = {
    pending: 'orange',
    confirmed: 'blue',
    processing: 'processing',
    completed: 'success',
    cancelled: 'error',
  }

  const statusLabels = {
    pending: '待确认',
    confirmed: '已确认',
    processing: '生产中',
    completed: '已完成',
    cancelled: '已取消',
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const response = await getOrders()
      setOrders(response.data)
    } catch (error) {
      console.error('获取订单列表失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (value: string) => {
    setSearchText(value)
  }

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status)
  }

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order)
    setModalVisible(true)
  }

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.orderNumber.toLowerCase().includes(searchText.toLowerCase()) ||
                         order.customerName.toLowerCase().includes(searchText.toLowerCase())
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const columns = [
    {
      title: '订单号',
      dataIndex: 'orderNumber',
      key: 'orderNumber',
      width: 180,
    },
    {
      title: '客户姓名',
      dataIndex: 'customerName',
      key: 'customerName',
      width: 120,
    },
    {
      title: '联系电话',
      dataIndex: 'phone',
      key: 'phone',
      width: 120,
    },
    {
      title: '订单金额',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      width: 100,
      render: (amount: number) => `¥${amount.toFixed(2)}`,
    },
    {
      title: '订单状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => (
        <Tag color={statusColors[status as keyof typeof statusColors]}>
          {statusLabels[status as keyof typeof statusLabels]}
        </Tag>
      ),
    },
    {
      title: '下单时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 160,
      render: (date: string) => formatDate(date),
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      render: (_: any, record: Order) => (
        <Button
          type="link"
          icon={<EyeOutlined />}
          onClick={() => handleViewOrder(record)}
        >
          查看
        </Button>
      ),
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Title level={2}>我的订单</Title>
          <Text type="secondary">查看和管理您的所有订单</Text>
        </div>

        {/* 搜索和筛选 */}
        <Card className="mb-6">
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} sm={12} md={8}>
              <Search
                placeholder="搜索订单号或客户姓名"
                allowClear
                enterButton={<SearchOutlined />}
                onSearch={handleSearch}
                className="w-full"
              />
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Select
                placeholder="筛选订单状态"
                allowClear
                value={statusFilter}
                onChange={handleStatusFilter}
                className="w-full"
                suffixIcon={<FilterOutlined />}
              >
                <Option value="all">全部状态</Option>
                <Option value="pending">待确认</Option>
                <Option value="confirmed">已确认</Option>
                <Option value="processing">生产中</Option>
                <Option value="completed">已完成</Option>
                <Option value="cancelled">已取消</Option>
              </Select>
            </Col>
            <Col xs={24} sm={24} md={8}>
              <Space className="w-full" style={{ justifyContent: 'flex-end' }}>
                <Button onClick={fetchOrders}>刷新</Button>
              </Space>
            </Col>
          </Row>
        </Card>

        {/* 订单列表 */}
        <Card>
          <Table
            columns={columns}
            dataSource={filteredOrders}
            rowKey="id"
            loading={loading}
            pagination={{
              total: filteredOrders.length,
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total) => `共 ${total} 条记录`,
            }}
            scroll={{ x: 800 }}
          />
        </Card>

        {/* 订单详情模态框 */}
        <Modal
          title={`订单详情 - ${selectedOrder?.orderNumber}`}
          visible={modalVisible}
          onCancel={() => setModalVisible(false)}
          footer={[
            <Button key="close" onClick={() => setModalVisible(false)}>
              关闭
            </Button>,
          ]}
          width={800}
        >
          {selectedOrder && (
            <div>
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <Text strong>客户姓名：</Text>
                  <Text>{selectedOrder.customerName}</Text>
                </Col>
                <Col span={12}>
                  <Text strong>联系电话：</Text>
                  <Text>{selectedOrder.phone}</Text>
                </Col>
                <Col span={12}>
                  <Text strong>订单状态：</Text>
                  <Tag color={statusColors[selectedOrder.status as keyof typeof statusColors]}>
                    {statusLabels[selectedOrder.status as keyof typeof statusLabels]}
                  </Tag>
                </Col>
                <Col span={12}>
                  <Text strong>订单金额：</Text>
                  <Text>¥{selectedOrder.totalAmount.toFixed(2)}</Text>
                </Col>
                <Col span={24}>
                  <Text strong>下单时间：</Text>
                  <Text>{formatDate(selectedOrder.createdAt)}</Text>
                </Col>
              </Row>

              <hr className="my-4" />

              <div>
                <Text strong>商品详情：</Text>
                <div className="mt-2">
                  {selectedOrder.items?.map((item, index) => (
                    <div key={index} className="mb-2 p-2 bg-gray-50 rounded">
                      <Text>{item.productName}</Text>
                      <br />
                      <Text type="secondary">
                        数量：{item.quantity} | 单价：¥{item.unitPrice?.toFixed(2)}
                      </Text>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </div>
  )
}

export default OrdersPage