import { useState, useEffect } from 'react'
import { Table, Button, Space, Input, Modal, Form, Select, Tag, message, DatePicker } from 'antd'
import { PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import { useEmployeeStore } from '../store/employeeStore'
import { Employee, EmployeeFormData } from '../types'
import { v4 as uuidv4 } from 'uuid'
import dayjs from 'dayjs'

const { Search } = Input
const { Option } = Select

export default function EmployeePage() {
  const { employees, loading, addEmployee, updateEmployee, deleteEmployee, setEmployees, setLoading } = useEmployeeStore()
  const [modalVisible, setModalVisible] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null)
  const [searchText, setSearchText] = useState('')
  const [form] = Form.useForm()

  // 模拟数据
  useEffect(() => {
    const mockEmployees: Employee[] = [
      {
        id: '1',
        name: '王经理',
        employeeCode: 'EMP001',
        department: '生产部',
        position: '生产经理',
        phone: '13800138001',
        email: 'wang@example.com',
        hireDate: '2020-01-15',
        status: 'active',
        salary: 15000,
        emergencyContact: '张紧急联系人',
        emergencyPhone: '13900139001',
        address: '北京市朝阳区',
        createdAt: '2020-01-15',
        updatedAt: '2024-01-01',
        notes: '工作认真负责'
      },
      {
        id: '2',
        name: '李操作员',
        employeeCode: 'EMP002',
        department: '印刷部',
        position: '印刷操作员',
        phone: '13800138002',
        email: 'li@example.com',
        hireDate: '2021-03-20',
        status: 'active',
        salary: 8000,
        emergencyContact: '赵紧急联系人',
        emergencyPhone: '13900139002',
        address: '上海市浦东新区',
        createdAt: '2021-03-20',
        updatedAt: '2024-01-01',
        notes: '技术熟练'
      }
    ]
    setEmployees(mockEmployees)
  }, [])

  const handleAdd = () => {
    setEditingEmployee(null)
    form.resetFields()
    setModalVisible(true)
  }

  const handleEdit = (employee: Employee) => {
    setEditingEmployee(employee)
    form.setFieldsValue({
      ...employee,
      hireDate: dayjs(employee.hireDate)
    })
    setModalVisible(true)
  }

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这个员工吗？',
      onOk: () => {
        deleteEmployee(id)
        message.success('员工删除成功')
      }
    })
  }

  const handleSubmit = async (values: any) => {
    try {
      setLoading(true)
      const formData: EmployeeFormData = {
        ...values,
        hireDate: values.hireDate.format('YYYY-MM-DD')
      }

      if (editingEmployee) {
        updateEmployee(editingEmployee.id, {
          ...formData,
          updatedAt: new Date().toISOString().split('T')[0]
        })
        message.success('员工更新成功')
      } else {
        const newEmployee: Employee = {
          ...formData,
          id: uuidv4(),
          createdAt: new Date().toISOString().split('T')[0],
          updatedAt: new Date().toISOString().split('T')[0]
        }
        addEmployee(newEmployee)
        message.success('员工添加成功')
      }
      setModalVisible(false)
      form.resetFields()
    } catch (error) {
      message.error('操作失败')
    } finally {
      setLoading(false)
    }
  }

  const filteredEmployees = employees.filter(employee =>
    employee.name.toLowerCase().includes(searchText.toLowerCase()) ||
    employee.employeeCode.toLowerCase().includes(searchText.toLowerCase()) ||
    employee.department.toLowerCase().includes(searchText.toLowerCase()) ||
    employee.position.toLowerCase().includes(searchText.toLowerCase())
  )

  const columns = [
    {
      title: '员工编号',
      dataIndex: 'employeeCode',
      key: 'employeeCode',
      width: 120
    },
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
      width: 100
    },
    {
      title: '部门',
      dataIndex: 'department',
      key: 'department',
      width: 120
    },
    {
      title: '职位',
      dataIndex: 'position',
      key: 'position',
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
      title: '入职日期',
      dataIndex: 'hireDate',
      key: 'hireDate',
      width: 120
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => {
        const statusMap = {
          active: { color: 'success', text: '在职' },
          inactive: { color: 'error', text: '离职' },
          on_leave: { color: 'warning', text: '休假' }
        }
        return <Tag color={statusMap[status as keyof typeof statusMap]?.color}>
          {statusMap[status as keyof typeof statusMap]?.text}
        </Tag>
      }
    },
    {
      title: '薪资',
      dataIndex: 'salary',
      key: 'salary',
      width: 100,
      render: (salary: number) => salary ? `¥${salary.toLocaleString()}` : '-'
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      fixed: 'right' as const,
      render: (_: any, record: Employee) => (
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
        <h1 className="text-2xl font-bold">员工管理</h1>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          添加员工
        </Button>
      </div>

      <div className="mb-4">
        <Search
          placeholder="搜索员工姓名、编号、部门或职位"
          allowClear
          enterButton={<SearchOutlined />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{ width: 300 }}
        />
      </div>

      <Table
        columns={columns}
        dataSource={filteredEmployees}
        rowKey="id"
        loading={loading}
        scroll={{ x: 1300 }}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `共 ${total} 条记录`
        }}
      />

      <Modal
        title={editingEmployee ? '编辑员工' : '添加员工'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{ status: 'active' }}
        >
          <div className="grid grid-cols-3 gap-4">
            <Form.Item
              label="员工编号"
              name="employeeCode"
              rules={[{ required: true, message: '请输入员工编号' }]}
            >
              <Input placeholder="请输入员工编号" />
            </Form.Item>

            <Form.Item
              label="姓名"
              name="name"
              rules={[{ required: true, message: '请输入姓名' }]}
            >
              <Input placeholder="请输入姓名" />
            </Form.Item>

            <Form.Item
              label="部门"
              name="department"
              rules={[{ required: true, message: '请选择部门' }]}
            >
              <Select placeholder="请选择部门">
                <Option value="生产部">生产部</Option>
                <Option value="印刷部">印刷部</Option>
                <Option value="设计部">设计部</Option>
                <Option value="销售部">销售部</Option>
                <Option value="行政部">行政部</Option>
                <Option value="财务部">财务部</Option>
              </Select>
            </Form.Item>

            <Form.Item
              label="职位"
              name="position"
              rules={[{ required: true, message: '请输入职位' }]}
            >
              <Input placeholder="请输入职位" />
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
              label="入职日期"
              name="hireDate"
              rules={[{ required: true, message: '请选择入职日期' }]}
            >
              <DatePicker style={{ width: '100%' }} placeholder="请选择入职日期" />
            </Form.Item>

            <Form.Item
              label="状态"
              name="status"
              rules={[{ required: true, message: '请选择状态' }]}
            >
              <Select placeholder="请选择状态">
                <Option value="active">在职</Option>
                <Option value="inactive">离职</Option>
                <Option value="on_leave">休假</Option>
              </Select>
            </Form.Item>

            <Form.Item
              label="薪资"
              name="salary"
            >
              <Input type="number" placeholder="请输入薪资" />
            </Form.Item>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              label="紧急联系人"
              name="emergencyContact"
            >
              <Input placeholder="请输入紧急联系人" />
            </Form.Item>

            <Form.Item
              label="紧急联系电话"
              name="emergencyPhone"
            >
              <Input placeholder="请输入紧急联系电话" />
            </Form.Item>
          </div>

          <Form.Item
            label="地址"
            name="address"
          >
            <Input.TextArea rows={2} placeholder="请输入地址" />
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
              {editingEmployee ? '更新' : '添加'}
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  )
}