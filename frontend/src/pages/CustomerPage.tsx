import { useState, useEffect } from 'react'
import { Table, Button, Space, Input, Modal, Form, Select, Tag, message } from 'antd'
import { PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import { useCustomerStore } from '../store/customerStore'
import { Customer, CustomerFormData } from '../types'
import { v4 as uuidv4 } from 'uuid'

const { Search } = Input
const { Option } = Select

export default function CustomerPage() {
  const { customers, loading, addCustomer, updateCustomer, deleteCustomer, setCustomers, setLoading } = useCustomerStore()
  const [modalVisible, setModalVisible] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null)
  const [searchText, setSearchText] = useState('')
  const [form] = Form.useForm()

  // 模拟数据
  useEffect(() => {
    const mockCustomers: Customer[] = [
      {
        id: '1',
        name: '张三',
        company: '张三广告公司',
        phone: '13800138000',
        email: 'zhangsan@example.com',
        address: '北京市朝阳区',
        type: 'company',
        status: 'active',
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
        creditLimit: 50000,
        paymentTerms: '30天账期'
      },
      {
        id: '2',
        name: '李四',
        company: '李四设计工作室',
        phone: '13900139000',
        email: 'lisi@example.com',
        address: '上海市浦东新区',
        type: 'individual',
        status: 'active',
        createdAt: '2024-01-15',
        updatedAt: '2024-01-15',
        creditLimit: 20000,
        paymentTerms: '现金支付'
      }
    ]
    setCustomers(mockCustomers)
  }, [])

  const handleAdd = () => {
    setEditingCustomer(null)
    form.resetFields()
    setModalVisible(true)
  }

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer)
    form.setFieldsValue(customer)
    setModalVisible(true)
  }

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这个客户吗？',
      onOk: () => {
        deleteCustomer(id)
        message.success('客户删除成功')
      }
    })
  }

  const handleSubmit = async (values: CustomerFormData) => {
    try {
      setLoading(true)
      if (editingCustomer) {
        updateCustomer(editingCustomer.id, {
          ...values,
          updatedAt: new Date().toISOString().split('T')[0]
        })
        message.success('客户更新成功')
      } else {
        const newCustomer: Customer = {
          ...values,
          id: uuidv4(),
          status: 'active',
          createdAt: new Date().toISOString().split('T')[0],
          updatedAt: new Date().toISOString().split('T')[0]
        }
        addCustomer(newCustomer)
        message.success('客户添加成功')
      }
      setModalVisible(false)
      form.resetFields()
    } catch (error) {
      message.error('操作失败')
    } finally {
      setLoading(false)
    }
  }

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchText.toLowerCase()) ||
    customer.company.toLowerCase().includes(searchText.toLowerCase()) ||
    customer.phone.includes(searchText)
  )

  const columns = [
    {
      title: '客户名称',
      dataIndex: 'name',
      key: 'name',
      width: 120
    },
    {
      title: '公司名称',
      dataIndex: 'company',
      key: 'company',
      width: 200
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
      title: '客户类型',
      dataIndex: 'type',
      key: 'type',
      width: 100,
      render: (type: string) => (
        <Tag color={type === 'company' ? 'blue' : 'green'}>
          {type === 'company' ? '公司' : '个人'}
        </Tag>
      )
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
      title: '信用额度',
      dataIndex: 'creditLimit',
      key: 'creditLimit',
      width: 100,
      render: (creditLimit: number) => creditLimit ? `¥${creditLimit.toLocaleString()}` : '-'
    },
    {
      title: '付款条件',
      dataIndex: 'paymentTerms',
      key: 'paymentTerms',
      width: 100
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
      render: (_: any, record: Customer) => (
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
        <h1 className="text-2xl font-bold">客户管理</h1>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          添加客户
        </Button>
      </div>

      <div className="mb-4">
        <Search
          placeholder="搜索客户名称、公司或电话"
          allowClear
          enterButton={<SearchOutlined />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{ width: 300 }}
        />
      </div>

      <Table
        columns={columns}
        dataSource={filteredCustomers}
        rowKey="id"
        loading={loading}
        scroll={{ x: 1200 }}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `共 ${total} 条记录`
        }}
      />

      <Modal
        title={editingCustomer ? '编辑客户' : '添加客户'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{ type: 'company', status: 'active' }}
        >
          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              label="客户名称"
              name="name"
              rules={[{ required: true, message: '请输入客户名称' }]}
            >
              <Input placeholder="请输入客户名称" />
            </Form.Item>

            <Form.Item
              label="公司名称"
              name="company"
              rules={[{ required: true, message: '请输入公司名称' }]}
            >
              <Input placeholder="请输入公司名称" />
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
              label="客户类型"
              name="type"
              rules={[{ required: true, message: '请选择客户类型' }]}
            >
              <Select placeholder="请选择客户类型">
                <Option value="company">公司</Option>
                <Option value="individual">个人</Option>
              </Select>
            </Form.Item>

            <Form.Item
              label="信用额度"
              name="creditLimit"
            >
              <Input type="number" placeholder="请输入信用额度" />
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
              {editingCustomer ? '更新' : '添加'}
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  )
}