import React, { useState, useEffect } from 'react'
import { Table, Button, Input, Space, Modal, Form, InputNumber, Select, Tag, message, Popconfirm, Card, DatePicker, Progress } from 'antd'
import { PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined, PlayCircleOutlined, PauseCircleOutlined, CheckCircleOutlined } from '@ant-design/icons'
import { useProductionPlanStore } from '../store/productionPlanStore'
import { ProductionPlan, ProductionPlanFormData, PlanMaterial } from '../types'
import { v4 as uuidv4 } from 'uuid'
import dayjs from 'dayjs'

const { Search } = Input
const { Option } = Select
const { TextArea } = Input
const { RangePicker } = DatePicker

const ProductionPlanPage: React.FC = () => {
  const { 
    productionPlans, 
    loading, 
    setProductionPlans, 
    addProductionPlan, 
    updateProductionPlan, 
    deleteProductionPlan, 
    setLoading 
  } = useProductionPlanStore()
  
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingPlan, setEditingPlan] = useState<ProductionPlan | null>(null)
  const [searchText, setSearchText] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [priorityFilter, setPriorityFilter] = useState<string>('')
  const [form] = Form.useForm()

  // 模拟数据
  const mockProductionPlans: ProductionPlan[] = [
    {
      id: '1',
      planNumber: 'PP-2024-001',
      productName: '户外广告牌',
      productCode: 'AD-001',
      quantity: 50,
      priority: 'high',
      status: 'in_progress',
      startDate: '2024-02-01',
      endDate: '2024-02-15',
      actualStartDate: '2024-02-01',
      productionLine: '生产线A',
      responsiblePerson: '张三',
      estimatedHours: 120,
      actualHours: 80,
      materials: [
        {
          materialId: '1',
          materialName: '背胶PP合成纸',
          requiredQuantity: 200,
          availableQuantity: 500,
          unit: '平方米',
          status: 'sufficient'
        }
      ],
      workOrders: ['WO-001', 'WO-002'],
      notes: '客户要求高质量输出',
      createdAt: '2024-01-25',
      updatedAt: '2024-02-05'
    },
    {
      id: '2',
      planNumber: 'PP-2024-002',
      productName: '室内展板',
      productCode: 'BD-002',
      quantity: 100,
      priority: 'medium',
      status: 'scheduled',
      startDate: '2024-02-20',
      endDate: '2024-02-28',
      productionLine: '生产线B',
      responsiblePerson: '李四',
      estimatedHours: 80,
      materials: [
        {
          materialId: '3',
          materialName: 'KT板',
          requiredQuantity: 100,
          availableQuantity: 150,
          unit: '张',
          status: 'sufficient'
        }
      ],
      workOrders: ['WO-003'],
      notes: '标准制作流程',
      createdAt: '2024-01-28',
      updatedAt: '2024-01-28'
    },
    {
      id: '3',
      planNumber: 'PP-2024-003',
      productName: '车贴',
      productCode: 'CT-003',
      quantity: 200,
      priority: 'urgent',
      status: 'draft',
      startDate: '2024-02-10',
      endDate: '2024-02-12',
      productionLine: '生产线C',
      responsiblePerson: '王五',
      estimatedHours: 60,
      materials: [
        {
          materialId: '2',
          materialName: '灯片',
          requiredQuantity: 50,
          availableQuantity: 200,
          unit: '平方米',
          status: 'sufficient'
        }
      ],
      workOrders: [],
      notes: '紧急订单',
      createdAt: '2024-02-05',
      updatedAt: '2024-02-05'
    }
  ]

  useEffect(() => {
    setProductionPlans(mockProductionPlans)
  }, [])

  const handleAdd = () => {
    setEditingPlan(null)
    form.resetFields()
    setIsModalOpen(true)
  }

  const handleEdit = (plan: ProductionPlan) => {
    setEditingPlan(plan)
    form.setFieldsValue({
      ...plan,
      dateRange: [dayjs(plan.startDate), dayjs(plan.endDate)]
    })
    setIsModalOpen(true)
  }

  const handleDelete = (id: string) => {
    deleteProductionPlan(id)
    message.success('生产计划删除成功')
  }

  const handleStatusChange = (id: string, newStatus: string) => {
    const now = new Date().toISOString().split('T')[0]
    const updates: any = { status: newStatus, updatedAt: now }
    
    if (newStatus === 'in_progress') {
      updates.actualStartDate = now
    } else if (newStatus === 'completed') {
      updates.actualEndDate = now
    }
    
    updateProductionPlan(id, updates)
    message.success('状态更新成功')
  }

  const handleOk = async () => {
    try {
      const values = await form.validateFields()
      setLoading(true)
      
      const now = new Date().toISOString().split('T')[0]
      const [startDate, endDate] = values.dateRange
      
      const planData = {
        ...values,
        startDate: startDate.format('YYYY-MM-DD'),
        endDate: endDate.format('YYYY-MM-DD'),
        planNumber: editingPlan ? editingPlan.planNumber : `PP-${new Date().getFullYear()}-${String(productionPlans.length + 1).padStart(3, '0')}`
      }
      
      if (editingPlan) {
        updateProductionPlan(editingPlan.id, {
          ...planData,
          updatedAt: now
        })
        message.success('生产计划更新成功')
      } else {
        const newPlan: ProductionPlan = {
          id: uuidv4(),
          ...planData,
          actualHours: 0,
          workOrders: [],
          materials: [],
          createdAt: now,
          updatedAt: now
        }
        addProductionPlan(newPlan)
        message.success('生产计划创建成功')
      }
      
      setIsModalOpen(false)
      form.resetFields()
    } catch (error) {
      console.error('表单验证失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setIsModalOpen(false)
    form.resetFields()
  }

  const handleSearch = (value: string) => {
    setSearchText(value)
  }

  const filteredPlans = productionPlans.filter(plan =>
    (plan.productName.toLowerCase().includes(searchText.toLowerCase()) ||
     plan.productCode.toLowerCase().includes(searchText.toLowerCase()) ||
     plan.productionLine.toLowerCase().includes(searchText.toLowerCase()) ||
     plan.responsiblePerson.toLowerCase().includes(searchText.toLowerCase())) &&
    (!statusFilter || plan.status === statusFilter) &&
    (!priorityFilter || plan.priority === priorityFilter)
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'default'
      case 'scheduled': return 'blue'
      case 'in_progress': return 'orange'
      case 'completed': return 'green'
      case 'cancelled': return 'red'
      default: return 'default'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'draft': return '草稿'
      case 'scheduled': return '已安排'
      case 'in_progress': return '进行中'
      case 'completed': return '已完成'
      case 'cancelled': return '已取消'
      default: return status
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'green'
      case 'medium': return 'blue'
      case 'high': return 'orange'
      case 'urgent': return 'red'
      default: return 'default'
    }
  }

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'low': return '低'
      case 'medium': return '中'
      case 'high': return '高'
      case 'urgent': return '紧急'
      default: return priority
    }
  }

  const getProgress = (plan: ProductionPlan) => {
    if (plan.status === 'completed') return 100
    if (plan.status === 'draft' || plan.status === 'scheduled') return 0
    
    const start = dayjs(plan.startDate)
    const end = dayjs(plan.endDate)
    const now = dayjs()
    
    if (now.isBefore(start)) return 0
    if (now.isAfter(end)) return 100
    
    const total = end.diff(start, 'day')
    const current = now.diff(start, 'day')
    return Math.round((current / total) * 100)
  }

  const columns = [
    {
      title: '计划编号',
      dataIndex: 'planNumber',
      key: 'planNumber',
      width: 120,
      fixed: 'left' as const
    },
    {
      title: '产品名称',
      dataIndex: 'productName',
      key: 'productName',
      width: 150
    },
    {
      title: '产品编码',
      dataIndex: 'productCode',
      key: 'productCode',
      width: 100
    },
    {
      title: '数量',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 80
    },
    {
      title: '优先级',
      dataIndex: 'priority',
      key: 'priority',
      width: 80,
      render: (priority: string) => (
        <Tag color={getPriorityColor(priority)}>
          {getPriorityText(priority)}
        </Tag>
      )
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string, record: ProductionPlan) => (
        <div>
          <Tag color={getStatusColor(status)}>
            {getStatusText(status)}
          </Tag>
          {record.status === 'in_progress' && (
            <Progress
              percent={getProgress(record)}
              size="small"
              style={{ marginTop: 4 }}
            />
          )}
        </div>
      )
    },
    {
      title: '生产线',
      dataIndex: 'productionLine',
      key: 'productionLine',
      width: 100
    },
    {
      title: '负责人',
      dataIndex: 'responsiblePerson',
      key: 'responsiblePerson',
      width: 100
    },
    {
      title: '开始日期',
      dataIndex: 'startDate',
      key: 'startDate',
      width: 100
    },
    {
      title: '结束日期',
      dataIndex: 'endDate',
      key: 'endDate',
      width: 100
    },
    {
      title: '预计工时',
      dataIndex: 'estimatedHours',
      key: 'estimatedHours',
      width: 80,
      render: (hours: number) => `${hours}h`
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      fixed: 'right' as const,
      render: (_: any, record: ProductionPlan) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          
          {record.status === 'draft' && (
            <Button
              type="link"
              size="small"
              icon={<PlayCircleOutlined />}
              onClick={() => handleStatusChange(record.id, 'scheduled')}
            >
              安排
            </Button>
          )}
          
          {record.status === 'scheduled' && (
            <Button
              type="link"
              size="small"
              icon={<PlayCircleOutlined />}
              onClick={() => handleStatusChange(record.id, 'in_progress')}
            >
              开始
            </Button>
          )}
          
          {record.status === 'in_progress' && (
            <Button
              type="link"
              size="small"
              icon={<CheckCircleOutlined />}
              onClick={() => handleStatusChange(record.id, 'completed')}
            >
              完成
            </Button>
          )}
          
          {(record.status === 'draft' || record.status === 'scheduled') && (
            <Popconfirm
              title="确定要取消这个生产计划吗？"
              onConfirm={() => handleStatusChange(record.id, 'cancelled')}
              okText="确定"
              cancelText="取消"
            >
              <Button
                type="link"
                danger
                size="small"
                icon={<PauseCircleOutlined />}
              >
                取消
              </Button>
            </Popconfirm>
          )}
          
          <Popconfirm
            title="确定要删除这个生产计划吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button
              type="link"
              danger
              size="small"
              icon={<DeleteOutlined />}
            >
              删除
            </Button>
          </Popconfirm>
        </Space>
      )
    }
  ]

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ margin: 0 }}>生产计划管理</h1>
          <Space>
            <Search
              placeholder="搜索产品名称、编码、生产线或负责人"
              allowClear
              onSearch={handleSearch}
              style={{ width: 300 }}
            />
            <Select
              placeholder="状态筛选"
              allowClear
              style={{ width: 120 }}
              value={statusFilter}
              onChange={setStatusFilter}
            >
              <Option value="draft">草稿</Option>
              <Option value="scheduled">已安排</Option>
              <Option value="in_progress">进行中</Option>
              <Option value="completed">已完成</Option>
              <Option value="cancelled">已取消</Option>
            </Select>
            <Select
              placeholder="优先级筛选"
              allowClear
              style={{ width: 120 }}
              value={priorityFilter}
              onChange={setPriorityFilter}
            >
              <Option value="low">低</Option>
              <Option value="medium">中</Option>
              <Option value="high">高</Option>
              <Option value="urgent">紧急</Option>
            </Select>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAdd}
            >
              创建计划
            </Button>
          </Space>
        </div>

        <Table
          columns={columns}
          dataSource={filteredPlans}
          rowKey="id"
          loading={loading}
          scroll={{ x: 1400 }}
          pagination={{
            total: filteredPlans.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`
          }}
        />
      </Card>

      <Modal
        title={editingPlan ? '编辑生产计划' : '创建生产计划'}
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        width={800}
        confirmLoading={loading}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{ 
            priority: 'medium',
            status: 'draft',
            quantity: 1,
            estimatedHours: 8
          }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Form.Item
              name="productName"
              label="产品名称"
              rules={[{ required: true, message: '请输入产品名称' }]}
            >
              <Input placeholder="请输入产品名称" />
            </Form.Item>

            <Form.Item
              name="productCode"
              label="产品编码"
              rules={[{ required: true, message: '请输入产品编码' }]}
            >
              <Input placeholder="请输入产品编码" />
            </Form.Item>

            <Form.Item
              name="quantity"
              label="生产数量"
              rules={[{ required: true, message: '请输入生产数量' }]}
            >
              <InputNumber
                min={1}
                placeholder="请输入生产数量"
                style={{ width: '100%' }}
              />
            </Form.Item>

            <Form.Item
              name="priority"
              label="优先级"
              rules={[{ required: true, message: '请选择优先级' }]}
            >
              <Select placeholder="请选择优先级">
                <Option value="low">低</Option>
                <Option value="medium">中</Option>
                <Option value="high">高</Option>
                <Option value="urgent">紧急</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="dateRange"
              label="生产日期"
              rules={[{ required: true, message: '请选择生产日期范围' }]}
            >
              <RangePicker
                style={{ width: '100%' }}
                placeholder={['开始日期', '结束日期']}
              />
            </Form.Item>

            <Form.Item
              name="productionLine"
              label="生产线"
              rules={[{ required: true, message: '请输入生产线' }]}
            >
              <Input placeholder="如：生产线A、生产线B" />
            </Form.Item>

            <Form.Item
              name="responsiblePerson"
              label="负责人"
              rules={[{ required: true, message: '请输入负责人' }]}
            >
              <Input placeholder="请输入负责人姓名" />
            </Form.Item>

            <Form.Item
              name="estimatedHours"
              label="预计工时(小时)"
              rules={[{ required: true, message: '请输入预计工时' }]}
            >
              <InputNumber
                min={1}
                placeholder="请输入预计工时"
                style={{ width: '100%' }}
              />
            </Form.Item>
          </div>

          <Form.Item
            name="notes"
            label="备注"
          >
            <TextArea
              rows={3}
              placeholder="请输入备注信息"
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default ProductionPlanPage