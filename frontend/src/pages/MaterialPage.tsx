import React, { useState, useEffect } from 'react'
import { Table, Button, Input, Space, Modal, Form, InputNumber, Select, Tag, message, Popconfirm, Card } from 'antd'
import { PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined, ExportOutlined } from '@ant-design/icons'
import { useMaterialStore } from '../store/materialStore'
import { Material, MaterialFormData } from '../types'
import { v4 as uuidv4 } from 'uuid'

const { Search } = Input
const { Option } = Select

const MaterialPage: React.FC = () => {
  const { materials, loading, setMaterials, addMaterial, updateMaterial, deleteMaterial, setLoading } = useMaterialStore()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null)
  const [searchText, setSearchText] = useState('')
  const [form] = Form.useForm()

  // 模拟数据
  const mockMaterials: Material[] = [
    {
      id: '1',
      name: '背胶PP合成纸',
      code: 'PP-001',
      category: '打印材料',
      unit: '平方米',
      quantity: 500,
      minQuantity: 100,
      maxQuantity: 1000,
      unitPrice: 8.5,
      totalValue: 4250,
      supplier: '上海广告材料有限公司',
      location: 'A区-01-01',
      shelfLife: 365,
      expirationDate: '2025-12-31',
      specifications: '120g/㎡',
      description: '高质量背胶PP合成纸，适用于户内写真',
      status: 'active',
      createdAt: '2024-01-15',
      updatedAt: '2024-01-15'
    },
    {
      id: '2',
      name: '灯片',
      code: 'DP-002',
      category: '打印材料',
      unit: '平方米',
      quantity: 200,
      minQuantity: 50,
      maxQuantity: 500,
      unitPrice: 15.0,
      totalValue: 3000,
      supplier: '北京广告材料供应商',
      location: 'A区-01-02',
      shelfLife: 730,
      expirationDate: '2026-06-30',
      specifications: '180g/㎡',
      description: '高透光性灯片，适用于灯箱广告',
      status: 'active',
      createdAt: '2024-01-20',
      updatedAt: '2024-01-20'
    },
    {
      id: '3',
      name: 'KT板',
      code: 'KT-003',
      category: '展示材料',
      unit: '张',
      quantity: 150,
      minQuantity: 30,
      maxQuantity: 300,
      unitPrice: 25.0,
      totalValue: 3750,
      supplier: '广州展示材料公司',
      location: 'B区-02-01',
      specifications: '5mm厚度',
      description: '轻质KT板，适用于展板制作',
      status: 'active',
      createdAt: '2024-02-01',
      updatedAt: '2024-02-01'
    }
  ]

  useEffect(() => {
    setMaterials(mockMaterials)
  }, [])

  const handleAdd = () => {
    setEditingMaterial(null)
    form.resetFields()
    setIsModalOpen(true)
  }

  const handleEdit = (material: Material) => {
    setEditingMaterial(material)
    form.setFieldsValue(material)
    setIsModalOpen(true)
  }

  const handleDelete = (id: string) => {
    deleteMaterial(id)
    message.success('材料删除成功')
  }

  const handleOk = async () => {
    try {
      const values: MaterialFormData = await form.validateFields()
      setLoading(true)
      
      const now = new Date().toISOString().split('T')[0]
      const totalValue = values.quantity * values.unitPrice
      
      if (editingMaterial) {
        updateMaterial(editingMaterial.id, {
          ...values,
          totalValue,
          updatedAt: now
        })
        message.success('材料更新成功')
      } else {
        const newMaterial: Material = {
          id: uuidv4(),
          ...values,
          totalValue,
          createdAt: now,
          updatedAt: now
        }
        addMaterial(newMaterial)
        message.success('材料添加成功')
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

  const filteredMaterials = materials.filter(material =>
    material.name.toLowerCase().includes(searchText.toLowerCase()) ||
    material.code.toLowerCase().includes(searchText.toLowerCase()) ||
    material.category.toLowerCase().includes(searchText.toLowerCase()) ||
    material.supplier.toLowerCase().includes(searchText.toLowerCase())
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'green'
      case 'inactive': return 'orange'
      case 'discontinued': return 'red'
      default: return 'default'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return '启用'
      case 'inactive': return '停用'
      case 'discontinued': return '停产'
      default: return status
    }
  }

  const columns = [
    {
      title: '材料名称',
      dataIndex: 'name',
      key: 'name',
      width: 150,
      fixed: 'left' as const
    },
    {
      title: '材料编码',
      dataIndex: 'code',
      key: 'code',
      width: 120
    },
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category',
      width: 100
    },
    {
      title: '单位',
      dataIndex: 'unit',
      key: 'unit',
      width: 80
    },
    {
      title: '库存数量',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 100,
      render: (quantity: number, record: Material) => (
        <span style={{ 
          color: quantity <= record.minQuantity ? 'red' : quantity >= record.maxQuantity ? 'orange' : 'inherit',
          fontWeight: quantity <= record.minQuantity ? 'bold' : 'normal'
        }}>
          {quantity}
        </span>
      )
    },
    {
      title: '单价(元)',
      dataIndex: 'unitPrice',
      key: 'unitPrice',
      width: 100,
      render: (price: number) => `¥${price.toFixed(2)}`
    },
    {
      title: '总价值(元)',
      dataIndex: 'totalValue',
      key: 'totalValue',
      width: 120,
      render: (value: number) => `¥${value.toFixed(2)}`
    },
    {
      title: '供应商',
      dataIndex: 'supplier',
      key: 'supplier',
      width: 150
    },
    {
      title: '存放位置',
      dataIndex: 'location',
      key: 'location',
      width: 120
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>
          {getStatusText(status)}
        </Tag>
      )
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      fixed: 'right' as const,
      render: (_: any, record: Material) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个材料吗？"
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
          <h1 style={{ margin: 0 }}>材料库存管理</h1>
          <Space>
            <Search
              placeholder="搜索材料名称、编码、分类或供应商"
              allowClear
              onSearch={handleSearch}
              style={{ width: 300 }}
            />
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAdd}
            >
              添加材料
            </Button>
            <Button
              icon={<ExportOutlined />}
            >
              导出
            </Button>
          </Space>
        </div>

        <Table
          columns={columns}
          dataSource={filteredMaterials}
          rowKey="id"
          loading={loading}
          scroll={{ x: 1500 }}
          pagination={{
            total: filteredMaterials.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`
          }}
        />
      </Card>

      <Modal
        title={editingMaterial ? '编辑材料' : '添加材料'}
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        width={800}
        confirmLoading={loading}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{ status: 'active' }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Form.Item
              name="name"
              label="材料名称"
              rules={[{ required: true, message: '请输入材料名称' }]}
            >
              <Input placeholder="请输入材料名称" />
            </Form.Item>

            <Form.Item
              name="code"
              label="材料编码"
              rules={[{ required: true, message: '请输入材料编码' }]}
            >
              <Input placeholder="请输入材料编码" />
            </Form.Item>

            <Form.Item
              name="category"
              label="分类"
              rules={[{ required: true, message: '请选择分类' }]}
            >
              <Select placeholder="请选择分类">
                <Option value="打印材料">打印材料</Option>
                <Option value="展示材料">展示材料</Option>
                <Option value="装饰材料">装饰材料</Option>
                <Option value="工具耗材">工具耗材</Option>
                <Option value="其他">其他</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="unit"
              label="单位"
              rules={[{ required: true, message: '请输入单位' }]}
            >
              <Input placeholder="如：平方米、张、卷、个" />
            </Form.Item>

            <Form.Item
              name="quantity"
              label="库存数量"
              rules={[{ required: true, message: '请输入库存数量' }]}
            >
              <InputNumber
                min={0}
                placeholder="请输入库存数量"
                style={{ width: '100%' }}
              />
            </Form.Item>

            <Form.Item
              name="unitPrice"
              label="单价(元)"
              rules={[{ required: true, message: '请输入单价' }]}
            >
              <InputNumber
                min={0}
                step={0.01}
                placeholder="请输入单价"
                style={{ width: '100%' }}
              />
            </Form.Item>

            <Form.Item
              name="minQuantity"
              label="最小库存"
              rules={[{ required: true, message: '请输入最小库存' }]}
            >
              <InputNumber
                min={0}
                placeholder="请输入最小库存"
                style={{ width: '100%' }}
              />
            </Form.Item>

            <Form.Item
              name="maxQuantity"
              label="最大库存"
              rules={[{ required: true, message: '请输入最大库存' }]}
            >
              <InputNumber
                min={0}
                placeholder="请输入最大库存"
                style={{ width: '100%' }}
              />
            </Form.Item>

            <Form.Item
              name="supplier"
              label="供应商"
              rules={[{ required: true, message: '请输入供应商' }]}
            >
              <Input placeholder="请输入供应商名称" />
            </Form.Item>

            <Form.Item
              name="location"
              label="存放位置"
              rules={[{ required: true, message: '请输入存放位置' }]}
            >
              <Input placeholder="如：A区-01-01" />
            </Form.Item>

            <Form.Item
              name="status"
              label="状态"
              rules={[{ required: true, message: '请选择状态' }]}
            >
              <Select placeholder="请选择状态">
                <Option value="active">启用</Option>
                <Option value="inactive">停用</Option>
                <Option value="discontinued">停产</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="shelfLife"
              label="保质期(天)"
            >
              <InputNumber
                min={1}
                placeholder="请输入保质期天数"
                style={{ width: '100%' }}
              />
            </Form.Item>
          </div>

          <Form.Item
            name="specifications"
            label="规格"
          >
            <Input placeholder="请输入材料规格" />
          </Form.Item>

          <Form.Item
            name="description"
            label="描述"
          >
            <Input.TextArea
              rows={3}
              placeholder="请输入材料描述"
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default MaterialPage