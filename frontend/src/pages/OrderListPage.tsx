import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, Table, Tag, Button, Space, Typography, Row, Col, Input, Select, DatePicker, message } from 'antd'
import { EyeOutlined, SearchOutlined, ReloadOutlined } from '@ant-design/icons'
import { getOrders } from '@/services/api'
import { useAuthStore } from '@/store/authStore'

const { Title, Text } = Typography
const { RangePicker } = DatePicker
const { Option } = Select

interface Order {
  id: string
  orderNumber: string
  customerName: string
  phone: string
  totalAmount: number
  status: string
  deliveryMethod: string
  deliveryDate: string
  createdAt: string
  items: any[]
}

const OrderListPage: React.FC = () => {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(false)
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  })
  const [filters, setFilters] = useState({
    status: '',
    dateRange: null as any,
    searchText: ''
  })

  const fetchOrders = async (page = 1, pageSize = 10) => {
    if (!user?.id) return
    
    setLoading(true)
    try {
      const response = await getOrders({
        userId: user.id,
        page,
        pageSize,
        status: filters.status,
        startDate: filters.dateRange?.[0]?.format('YYYY-MM-DD'),
        endDate: filters.dateRange?.[1]?.format('YYYY-MM-DD'),
        searchText: filters.searchText
      })

      const data = (response && (response as any).results) ? (response as any) : { results: response || [], count: 0 }
      setOrders(data.results || [])
      setPagination({
        current: page,
        pageSize,
        total: data.count || (data.results?.length || 0)
      })
    } catch (error) {
      message.error('获取订单列表失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders(pagination.current, pagination.pageSize)
  }, [user?.id])

  const handleTableChange = (newPagination: any) => {
    fetchOrders(newPagination.current, newPagination.pageSize)
  }

  const handleSearch = () => {
    fetchOrders(1, pagination.pageSize)
  }

  const handleReset = () => {
    setFilters({
      status: '',
      dateRange: null,
      searchText: ''
    })
    fetchOrders(1, pagination.pageSize)
  }

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
      standard: '标准配送',
      express: '快速配送',
      same_day: '当日达',
      pickup: '门店自提'
    }
    return methodTexts[method] || method
  }

  const columns = [
    {
      title: '订单号',
      dataIndex: 'orderNumber',
      key: 'orderNumber',
      width: 120,
      render: (text: string) => <Text strong>{text}</Text>
    },
    {
      title: '客户姓名',
      dataIndex: 'customerName',
      key: 'customerName',
      width: 100
    },
    {
      title: '联系电话',
      dataIndex: 'phone',
      key: 'phone',
      width: 120
    },
    {
      title: '订单金额',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      width: 100,
      render: (amount: number) => (
        <Text strong className="text-red-600">
          ¥{amount.toFixed(2)}
        </Text>
      )
    },
    {
      title: '订单状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>
          {getStatusText(status)}
        </Tag>
      )
    },
    {
      title: '配送方式',
      dataIndex: 'deliveryMethod',
      key: 'deliveryMethod',
      width: 120,
      render: (method: string) => (
        <Text>{getDeliveryMethodText(method)}</Text>
      )
    },
    {
      title: '期望送达',
      dataIndex: 'deliveryDate',
      key: 'deliveryDate',
      width: 120,
      render: (date: string) => (
        <Text>{new Date(date).toLocaleDateString()}</Text>
      )
    },
    {
      title: '下单时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 160,
      render: (date: string) => (
        <Text>{new Date(date).toLocaleString()}</Text>
      )
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      render: (_: any, record: Order) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/order/detail/${record.id}`)}
          >
            查看
          </Button>
        </Space>
      )
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Row justify="space-between" align="middle" className="mb-6">
          <Col>
            <Title level={2}>我的订单</Title>
          </Col>
          <Col>
            <Button
              type="primary"
              icon={<ReloadOutlined />}
              onClick={() => fetchOrders(pagination.current, pagination.pageSize)}
              loading={loading}
            >
              刷新
            </Button>
          </Col>
        </Row>

        {/* 搜索和筛选 */}
        <Card className="mb-6">
          <Row gutter={16} align="middle">
            <Col xs={24} sm={8}>
              <Input
                placeholder="搜索订单号、客户姓名、电话"
                prefix={<SearchOutlined />}
                value={filters.searchText}
                onChange={(e) => setFilters({ ...filters, searchText: e.target.value })}
                onPressEnter={handleSearch}
              />
            </Col>
            <Col xs={24} sm={4}>
              <Select
                placeholder="订单状态"
                style={{ width: '100%' }}
                value={filters.status}
                onChange={(value) => setFilters({ ...filters, status: value })}
                allowClear
              >
                <Option value="">全部状态</Option>
                <Option value="pending">待确认</Option>
                <Option value="confirmed">已确认</Option>
                <Option value="producing">生产中</Option>
                <Option value="completed">已完成</Option>
                <Option value="delivered">已送达</Option>
                <Option value="cancelled">已取消</Option>
              </Select>
            </Col>
            <Col xs={24} sm={6}>
              <RangePicker
                style={{ width: '100%' }}
                value={filters.dateRange}
                onChange={(dates) => setFilters({ ...filters, dateRange: dates })}
              />
            </Col>
            <Col xs={24} sm={6}>
              <Space>
                <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
                  搜索
                </Button>
                <Button onClick={handleReset}>重置</Button>
              </Space>
            </Col>
          </Row>
        </Card>

        {/* 订单列表 */}
        <Card>
          <Table
            columns={columns}
            dataSource={orders}
            loading={loading}
            pagination={{
              current: pagination.current,
              pageSize: pagination.pageSize,
              total: pagination.total,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total) => `共 ${total} 条记录`
            }}
            onChange={handleTableChange}
            rowKey="id"
            scroll={{ x: 1200 }}
          />
        </Card>
      </div>
    </div>
  )
}

export default OrderListPage
