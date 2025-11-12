import React, { useState, useEffect } from 'react'
import { Button, Card, Descriptions, message, Progress, Select, Space, Table, Tag, Timeline, Row, Col } from 'antd'
import { ArrowLeftOutlined, PrinterOutlined, EditOutlined } from '@ant-design/icons'
import { useNavigate, useParams } from 'react-router-dom'
import { getWorkOrderById, updateWorkOrderStatus } from '@/services/api'
import dayjs from 'dayjs'

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
  specifications: Record<string, any>
  materials: Array<{
    name: string
    quantity: number
    unit: string
    cost: number
  }>
  progress: number
  timeline: Array<{
    time: string
    content: string
    status: 'success' | 'processing' | 'waiting'
  }>
  createdAt: string
  updatedAt: string
}

const WorkOrderDetailPage: React.FC = () => {
  const navigate = useNavigate()
  const { workOrderId } = useParams<{ workOrderId: string }>()
  const [workOrder, setWorkOrder] = useState<WorkOrder | null>(null)
  const [loading, setLoading] = useState(true)
  const [editMode, setEditMode] = useState(false)

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

  useEffect(() => {
    if (workOrderId) {
      fetchWorkOrderDetail()
    }
  }, [workOrderId])

  const fetchWorkOrderDetail = async () => {
    try {
      const response = await getWorkOrderById(workOrderId!)
      setWorkOrder(response.data)
    } catch (error) {
      message.error('获取工作订单详情失败')
      console.error('获取工作订单详情失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (newStatus: string) => {
    if (!workOrder) return
    
    try {
      await updateWorkOrderStatus(workOrder.id, newStatus)
      message.success('状态更新成功')
      fetchWorkOrderDetail()
      setEditMode(false)
    } catch (error) {
      message.error('状态更新失败')
      console.error('状态更新失败:', error)
    }
  }

  const materialColumns = [
    {
      title: '材料名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '数量',
      dataIndex: 'quantity',
      key: 'quantity',
      align: 'center' as const,
    },
    {
      title: '单位',
      dataIndex: 'unit',
      key: 'unit',
      align: 'center' as const,
    },
    {
      title: '成本',
      dataIndex: 'cost',
      key: 'cost',
      align: 'right' as const,
      render: (cost: number) => `¥${cost.toFixed(2)}`,
    },
  ]

  if (loading) {
    return <div className="p-6">加载中...</div>
  }

  if (!workOrder) {
    return <div className="p-6">工作订单不存在</div>
  }

  return (
    <div className="p-6">
      <Card>
        <div className="mb-4">
          <Space>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate('/work-orders')}
            >
              返回列表
            </Button>
            <Button
              icon={<PrinterOutlined />}
              onClick={() => window.print()}
            >
              打印
            </Button>
            <Button
              icon={<EditOutlined />}
              onClick={() => setEditMode(!editMode)}
            >
              {editMode ? '取消编辑' : '编辑'}
            </Button>
          </Space>
        </div>

        <Descriptions
          title={`工作订单详情 - ${workOrder.id}`}
          bordered
          column={2}
          extra={
            <Space>
              <Tag color={priorityColors[workOrder.priority]}>
                {priorityLabels[workOrder.priority]}优先级
              </Tag>
              {editMode ? (
                <Select
                  value={workOrder.status}
                  onChange={handleStatusUpdate}
                  style={{ width: 120 }}
                >
                  <Select.Option value="pending">待处理</Select.Option>
                  <Select.Option value="in_progress">进行中</Select.Option>
                  <Select.Option value="completed">已完成</Select.Option>
                  <Select.Option value="cancelled">已取消</Select.Option>
                </Select>
              ) : (
                <Tag color={statusColors[workOrder.status]}>
                  {statusLabels[workOrder.status]}
                </Tag>
              )}
            </Space>
          }
        >
          <Descriptions.Item label="关联订单">{workOrder.orderId}</Descriptions.Item>
          <Descriptions.Item label="产品名称">{workOrder.productName}</Descriptions.Item>
          <Descriptions.Item label="数量">{workOrder.quantity}</Descriptions.Item>
          <Descriptions.Item label="负责人">{workOrder.assignedTo}</Descriptions.Item>
          <Descriptions.Item label="预计工时">{workOrder.estimatedHours}小时</Descriptions.Item>
          <Descriptions.Item label="实际工时">{workOrder.actualHours || 0}小时</Descriptions.Item>
          <Descriptions.Item label="开始时间">
            {workOrder.startDate ? dayjs(workOrder.startDate).format('YYYY-MM-DD HH:mm') : '-'}
          </Descriptions.Item>
          <Descriptions.Item label="结束时间">
            {workOrder.endDate ? dayjs(workOrder.endDate).format('YYYY-MM-DD HH:mm') : '-'}
          </Descriptions.Item>
        </Descriptions>

        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-4">工作进度</h3>
          <Progress
            percent={workOrder.progress}
            status={workOrder.status === 'completed' ? 'success' : 'active' as any}
            strokeColor={workOrder.status === 'cancelled' ? '#ff4d4f' : undefined}
          />
        </div>

        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-4">生产规格</h3>
          <Row gutter={16}>
            {Object.entries(workOrder.specifications || {}).map(([key, value]) => (
              <Col span={8} key={key}>
                <Card size="small">
                  <div className="text-sm text-gray-600">{key}</div>
                  <div className="font-medium">{value}</div>
                </Card>
              </Col>
            ))}
          </Row>
        </div>

        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-4">材料清单</h3>
          <Table
            columns={materialColumns}
            dataSource={workOrder.materials || []}
            rowKey="name"
            pagination={false}
            size="small"
          />
        </div>

        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-4">时间线</h3>
          <Timeline>
            {workOrder.timeline?.map((item, index) => (
              <Timeline.Item
                key={index}
                color={
                  item.status === 'success' ? 'green' :
                  item.status === 'processing' ? 'blue' : 'gray'
                }
              >
                <div className="text-sm text-gray-600">
                  {dayjs(item.time).format('YYYY-MM-DD HH:mm')}
                </div>
                <div>{item.content}</div>
              </Timeline.Item>
            ))}
          </Timeline>
        </div>

        {workOrder.notes && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-4">备注</h3>
            <Card size="small">
              <div className="whitespace-pre-wrap">{workOrder.notes}</div>
            </Card>
          </div>
        )}
      </Card>
    </div>
  )
}

export default WorkOrderDetailPage