import { useState, useEffect } from 'react'
import { Table, Button, Space, Input, Modal, Form, Select, Tag, message, Rate } from 'antd'
import { PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import { useSupplierStore } from '../store/supplierStore'
import { Supplier, SupplierFormData } from '../types'
import { v4 as uuidv4 } from 'uuid'

const { Search } = Input
const { Option } = Select

export default function SupplierPage() {
  const { suppliers, loading, addSupplier, updateSupplier, deleteSupplier, setSuppliers, setLoading } = useSupplierStore()
  const [modalVisible, setModalVisible] = useState(false)
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null)
  const [searchText, setSearchText] = useState('')
  const [form] = Form.useForm()

  // 模拟数据
  useEffect(() => {
    const mockSuppliers: Supplier[] = [
      {
        id: '1',
        name: '北京纸张供应商有限公司',
        contactPerson: '张经理',
        phone: '13800138001',
        email: 'zhang@paper-supplier.com',
        address: '北京市朝阳区',
        website: 'www.paper-supplier.com',
        taxNumber: '91110000123456789A',
        bankAccount: '1234567890123456789',
        bankName: '中国银行北京分行',
        type: 'material',
        status: 'active',
        rating: 5,
        createdAt: '2023-01-01',
        updatedAt: '2024-01-01',
        paymentTerms: '30天账期',
        deliveryTime: 7,
        notes: '优质供应商，交货及时'
      },
      {
        id: '2',
        name: '上海墨水科技有限公司',
        contactPerson: '李工程师',
        phone: '13900139002',
        email: 'li@ink-tech.com',
        address: '上海市浦东新区',
        website: 'www.ink-tech.com',
        taxNumber: '91310000987654321B',
        bankAccount: '9876543210987654321',
        bankName: '工商银行上海分行',
        type: 'material',
        status: 'active',
        rating: 4,
        createdAt: '2023-03-15',
        updatedAt: '2024-01-01',
        paymentTerms: '现金支付',
        deliveryTime: 3,
        notes: '专业的墨水供应商'
      }
    ]
    setSuppliers(mockSuppliers)
  }, [])

  const handleAdd = () => {
    setEditingSupplier(null)
    form.resetFields()
    setModalVisible(true)
  }

  const handleEdit = (supplier: Supplier) => {
    setEditingSupplier(supplier)
    form.setFieldsValue(supplier)
    setModalVisible(true)
  }

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这个供应商吗？',
      onOk: () => {
        deleteSupplier(id)
        message.success('供应商删除成功')
      }
    })
  }

  const handleSubmit = async (values: SupplierFormData) => {
    try {
      setLoading(true)
      if (editingSupplier) {
        updateSupplier(editingSupplier.id, {
          ...values,
          updatedAt: new Date().toISOString().split('T')[0]
        })
        message.success('供应商更新成功')
      } else {
        const newSupplier: Supplier = {
          ...values,
          id: uuidv4(),
          status: 'active',
          rating: 3,
          createdAt: new Date().toISOString().split('T')[0],
          updatedAt: new Date().toISOString().split('T')[0]
        }
        addSupplier(newSupplier)
        message.success('供应商添加成功')
      }
      setModalVisible(false)
      form.resetFields()
    } catch (error) {
      message.error('操作失败')
    } finally {
      setLoading(false)
    }
  }

  const filteredSuppliers = suppliers.filter(supplier =>
    supplier.name.toLowerCase().includes(searchText.toLowerCase()) ||
    supplier.contactPerson.toLowerCase().includes(searchText.toLowerCase()) ||
    supplier.phone.includes(searchText)
  )

  const columns = [
    {
      title: '供应商名称',
      dataIndex: 'name',
      key: 'name',
      width: 200
    },
    {
      title: '联系人',
      dataIndex: 'contactPerson',
      key: 'contactPerson',
      width: 120
    },
    {
      title: '联系电话',
      dataIndex: 'phone',
      key: 'phone',
      width: 120
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
      width: 180
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 100,
      render: (type: string) => {
        const typeMap = {
          material: { color: 'blue', text: '材料' },
          equipment: { color: 'green', text: '设备' },
          service: { color: 'orange', text: '服务' }
        }
        return <Tag color={typeMap[type as keyof typeof typeMap]?.color}>
          {typeMap[type as keyof typeof typeMap]?.text}
        </Tag>
      }
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: (status: string) => (
        <Tag color={status === 'active' ? 'success' : 'error'}>
          {status === 'active' ? '活跃' : '停用'}
        </Tag>
      )
    },
    {
      title: '评级',
      dataIndex: 'rating',
      key: 'rating',
      width: 100,
      render: (rating: number) => <Rate disabled defaultValue={rating} />
    },
    {
      title: '交货周期',
      dataIndex: 'deliveryTime',
      key: 'deliveryTime',
      width: 100,
      render: (deliveryTime: number) => deliveryTime ? `${deliveryTime}天` : '-'
    },
    {
      title: '付款条件',
      dataIndex: 'paymentTerms',
      key: 'paymentTerms',
      width: 120
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 120
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      fixed: 'right' as const,
      render: (_: any, record: Supplier) => (
        <Space size="small">
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
          >
            删除
          </Button>
        </Space>
      )
    }
  ]

  return (
    <div className="p-6">
      <div className="mb-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">供应商管理</h1>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          添加供应商
        </Button>
      </div>

      <div className="mb-4">
        <Search
          placeholder="搜索供应商名称、联系人或电话"
          allowClear
          enterButton={<SearchOutlined />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{ width: 300 }}
        />
      </div>

      <Table
        columns={columns}
        dataSource={filteredSuppliers}
        rowKey="id"
        loading={loading}
        scroll={{ x: 1400 }}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `共 ${total} 条记录`
        }}
      />

      <Modal
        title={editingSupplier ? '编辑供应商' : '添加供应商'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{ status: 'active', rating: 3 }}
        >
          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              label="供应商名称"
              name="name"
              rules={[{ required: true, message: '请输入供应商名称' }]}
            >
              <Input placeholder="请输入供应商名称" />
            </Form.Item>

            <Form.Item
              label="联系人"
              name="contactPerson"
              rules={[{ required: true, message: '请输入联系人' }]}
            >
              <Input placeholder="请输入联系人" />
            </Form.Item>

            <Form.Item
              label="联系电话"
              name="phone"
              rules={[{ required: true, message: '请输入联系电话' }]}
            >
              <Input placeholder="请输入联系电话" />
            </Form.Item>

            <Form.Item
              label="邮箱"
              name="email"
              rules={[{ type: 'email', message: '请输入有效的邮箱地址' }]}
            >
              <Input placeholder="请输入邮箱" />
            </Form.Item>

            <Form.Item
              label="供应商类型"
              name="type"
              rules={[{ required: true, message: '请选择供应商类型' }]}
            >
              <Select placeholder="请选择供应商类型">
                <Option value="material">材料供应商</Option>
                <Option value="equipment">设备供应商</Option>
                <Option value="service">服务供应商</Option>
              </Select>
            </Form.Item>

            <Form.Item
              label="交货周期（天）"
              name="deliveryTime"
            >
              <Input type="number" placeholder="请输入交货周期" />
            </Form.Item>

            <Form.Item
              label="税号"
              name="taxNumber"
            >
              <Input placeholder="请输入税号" />
            </Form.Item>

            <Form.Item
              label="银行账号"
              name="bankAccount"
            >
              <Input placeholder="请输入银行账号" />
            </Form.Item>
          </div>

          <Form.Item
            label="地址"
            name="address"
            rules={[{ required: true, message: '请输入地址' }]}
          >
            <Input.TextArea rows={2} placeholder="请输入地址" />
          </Form.Item>

          <Form.Item
            label="网站"
            name="website"
          >
            <Input placeholder="请输入网站地址" />
          </Form.Item>

          <Form.Item
            label="开户银行"
            name="bankName"
          >
            <Input placeholder="请输入开户银行" />
          </Form.Item>

          <Form.Item
            label="付款条件"
            name="paymentTerms"
          >
            <Input placeholder="请输入付款条件，如：30天账期、现金支付等" />
          </Form.Item>

          <Form.Item
            label="备注"
            name="notes"
          >
            <Input.TextArea rows={3} placeholder="请输入备注信息" />
          </Form.Item>

          <div className="flex justify-end space-x-2">
            <Button onClick={() => setModalVisible(false)}>取消</Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              {editingSupplier ? '更新' : '添加'}
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  )
}