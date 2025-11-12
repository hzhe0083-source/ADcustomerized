import React, { useState, useEffect } from 'react'
import { Table, Card, Button, Space, Tag, Badge, DatePicker, Select, Input, Row, Col, Modal, Form, message } from 'antd'
import { ReloadOutlined, SearchOutlined, EyeOutlined, EditOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { getWorkOrders, updateWorkOrderStatus } from '@/services/api'
import dayjs from 'dayjs'

const { RangePicker } = DatePicker
const { Option } = Select

interface WorkOrder {
  id: string
  orderId: string
  productName: string
  quantity: number
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
  priority: 'low' | 'medium' | 'high'
  assignedTo: string
  estimatedHours: number
  actualHours: number
  startDate: string
  endDate: string
  notes: string
  createdAt: string
  updatedAt: string
}

const WorkOrderListPage: React.FC = () => {
  const navigate = useNavigate()
  const [form] = Form.useForm()
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([])
  const [loading, setLoading] = useState(false)
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [priorityFilter, setPriorityFilter] = useState<string>('')
  const [searchText, setSearchText] = useState('')
  const [dateRange, setDateRange] = useState<any>(null)
  const [editModalVisible, setEditModalVisible] = useState(false)
  const [editingWorkOrder, setEditingWorkOrder] = useState<WorkOrder | null>(null)

  const statusColors = {
    pending: 'default',
    in_progress: 'processing',
    completed: 'success',
    cancelled: 'error'
  }

  const statusLabels = {
    pending: '待处理',
    in_progress: '进行中',
    completed: '已完成',
    cancelled: '已取消'
  }

  const priorityColors = {
    low: 'blue',
    medium: 'orange',
    high: 'red'
  }

  const priorityLabels = {
    low: '低',
    medium: '中',
    high: '高'
  }

  const fetchWorkOrders = async () => {
    setLoading(true)
    try {
      const params = {
        status: statusFilter || undefined,
        priority: priorityFilter || undefined,
        searchText: searchText || undefined,
        startDate: dateRange?.[0]?.format('YYYY-MM-DD') || undefined,
        endDate: dateRange?.[1]?.format('YYYY-MM-DD') || undefined,
      }
      
      const response = await getWorkOrders(params)
      setWorkOrders(response.data)
    } catch (error) {
      message.error('获取工作订单失败')
      console.error('获取工作订单失败:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchWorkOrders()
  }, [statusFilter, priorityFilter, searchText, dateRange])

  const handleViewDetails = (workOrder: WorkOrder) => {
    navigate(`/work-order/detail/${workOrder.id}`)
  }

  const handleEditStatus = (workOrder: WorkOrder) => {
    setEditingWorkOrder(workOrder)
    form.setFieldsValue({
      status: workOrder.status,
      notes: workOrder.notes,
    })
    setEditModalVisible(true)
  }

  const handleUpdateStatus = async (values: any) => {
    if (!editingWorkOrder) return
    
    try {
      await updateWorkOrderStatus(editingWorkOrder.id, values.status)
      message.success('状态更新成功')
      setEditModalVisible(false)
      fetchWorkOrders()
    } catch (error) {
      message.error('状态更新失败')
      console.error('状态更新失败:', error)
    }
  }

  const columns = [
    {
      title: '工作订单号',
      dataIndex: 'id',
      key: 'id',
      width: 120,
    },
    {
      title: '订单号',
      dataIndex: 'orderId',
      key: 'orderId',
      width: 120,
    },
    {
      title: '产品名称',
      dataIndex: 'productName',
      key: 'productName',
      ellipsis: true,
    },
    {
      title: '数量',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 80,
      align: 'center' as const,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => (
        <Badge status={statusColors[status as keyof typeof statusColors] as any} text={statusLabels[status as keyof typeof statusLabels]} />
      ),
    },
    {
      title: '优先级',
      dataIndex: 'priority',
      key: 'priority',
      width: 80,
      render: (priority: string) => (
        <Tag color={priorityColors[priority as keyof typeof priorityColors]}>
          {priorityLabels[priority as keyof typeof priorityLabels]}
        </Tag>
      ),
    },
    {
      title: '负责人',
      dataIndex: 'assignedTo',
      key: 'assignedTo',
      width: 100,
    },
    {
      title: '预计工时',
      dataIndex: 'estimatedHours',
      key: 'estimatedHours',
      width: 100,
      render: (hours: number) => `${hours}小时`,
    },
    {
      title: '开始时间',
      dataIndex: 'startDate',
      key: 'startDate',
      width: 120,
      render: (date: string) => date ? dayjs(date).format('MM-DD HH:mm') : '-',
    },
    {
      title: '结束时间',
      dataIndex: 'endDate',
      key: 'endDate',
      width: 120,
      render: (date: string) => date ? dayjs(date).format('MM-DD HH:mm') : '-',
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      render: (_: any, record: WorkOrder) => (
        <Space size="small">
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetails(record)}
          >
            查看
          </Button>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEditStatus(record)}
          >
            编辑
          </Button>
        </Space>
      ),
    },
  ]

  return (
    <div className="p-6">
      <Card>
        <div className="mb-4">
          <Row gutter={16} align="middle">
            <Col span={6}>
              <Input
                placeholder="搜索订单号、产品名称"
                prefix={<SearchOutlined />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                allowClear
              />
            </Col>
            <Col span={4}>
              <Select
                placeholder="状态筛选"
                style={{ width: '100%' }}
                value={statusFilter}
                onChange={setStatusFilter}
                allowClear
              >
                <Option value="">全部</Option>
                <Option value="pending">待处理</Option>
                <Option value="in_progress">进行中</Option>
                <Option value="completed">已完成</Option>
                <Option value="cancelled">已取消</Option>
              </Select>
            </Col>
            <Col span={4}>
              <Select
                placeholder="优先级筛选"
                style={{ width: '100%' }}
                value={priorityFilter}
                onChange={setPriorityFilter}
                allowClear
              >
                <Option value="">全部</Option>
                <Option value="low">低</Option>
                <Option value="medium">中</Option>
                <Option value="high">高</Option>
              </Select>
            </Col>
            <Col span={6}>
              <RangePicker
                style={{ width: '100%' }}
                value={dateRange}
                onChange={setDateRange}
              />
            </Col>
            <Col span={4}>
              <Button
                type="primary"
                icon={<ReloadOutlined />}
                onClick={fetchWorkOrders}
                loading={loading}
              >
                刷新
              </Button>
            </Col>
          </Row>
        </div>

        <Table
          columns={columns}
          dataSource={workOrders}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 条记录`,
          }}
        />
      </Card>

      <Modal
        title="更新工作订单状态"
        open={editModalVisible}
        onOk={form.submit}
        onCancel={() => setEditModalVisible(false)}
        okText="确认"
        cancelText="取消"
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleUpdateStatus}
        >
          <Form.Item
            label="状态"
            name="status"
            rules={[{ required: true, message: '请选择状态' }]}
          >
            <Select placeholder="选择状态">
              <Option value="pending">待处理</Option>
              <Option value="in_progress">进行中</Option>
              <Option value="completed">已完成</Option>
              <Option value="cancelled">已取消</Option>
            </Select>
          </Form.Item>
          <Form.Item
            label="备注"
            name="notes"
          >
            <Input.TextArea rows={3} placeholder="请输入备注信息" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default WorkOrderListPage