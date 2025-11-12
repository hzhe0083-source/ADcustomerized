import React, { useState, useEffect } from 'react'
import { Card, Table, Button, Space, Tag, DatePicker, Select, Input, Row, Col, Modal, Form, Statistic, Descriptions, Badge } from 'antd'
import { PlusOutlined, SearchOutlined, DownloadOutlined, EyeOutlined, EditOutlined, DeleteOutlined, BarChartOutlined } from '@ant-design/icons'
import { useReportStore } from '../store/reportStore'
import { Report, ReportFormData, ReportFilter } from '../types/report'
import { v4 as uuidv4 } from 'uuid'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'

const { RangePicker } = DatePicker
const { Option } = Select
const { TextArea } = Input

const ReportPage: React.FC = () => {
  const { reports, loading, setReports, addReport, updateReport, deleteReport, setLoading } = useReportStore()
  const [modalVisible, setModalVisible] = useState(false)
  const [detailModalVisible, setDetailModalVisible] = useState(false)
  const [selectedReport, setSelectedReport] = useState<Report | null>(null)
  const [form] = Form.useForm()
  const [searchText, setSearchText] = useState('')
  const [filter, setFilter] = useState<ReportFilter>({})

  // 模拟数据
  const mockReports: Report[] = [
    {
      id: '1',
      reportNumber: 'REP-2024-001',
      title: '2024年1月生产报表',
      type: 'production',
      description: '1月份生产数据统计分析',
      startDate: '2024-01-01',
      endDate: '2024-01-31',
      data: {
        totalProduction: 1500,
        completedOrders: 45,
        failedOrders: 3,
        averageProductionTime: 2.5
      },
      summary: {
        totalRecords: 48,
        successRate: 93.75,
        failureRate: 6.25
      },
      status: 'published',
      generatedBy: '张三',
      approvedBy: '李四',
      generatedAt: '2024-02-01T10:00:00Z',
      approvedAt: '2024-02-02T14:30:00Z',
      createdAt: '2024-02-01T10:00:00Z',
      updatedAt: '2024-02-02T14:30:00Z'
    },
    {
      id: '2',
      reportNumber: 'REP-2024-002',
      title: '2024年1月质量检验报告',
      type: 'quality',
      description: '1月份产品质量检验统计分析',
      startDate: '2024-01-01',
      endDate: '2024-01-31',
      data: {
        totalInspections: 1500,
        passedInspections: 1425,
        failedInspections: 75,
        passRate: 95.0
      },
      summary: {
        totalRecords: 1500,
        successRate: 95.0,
        failureRate: 5.0
      },
      status: 'approved',
      generatedBy: '王五',
      approvedBy: '赵六',
      generatedAt: '2024-02-01T15:20:00Z',
      approvedAt: '2024-02-02T09:45:00Z',
      createdAt: '2024-02-01T15:20:00Z',
      updatedAt: '2024-02-02T09:45:00Z'
    },
    {
      id: '3',
      reportNumber: 'REP-2024-003',
      title: '2024年1月库存盘点报告',
      type: 'inventory',
      description: '1月份库存材料盘点统计',
      startDate: '2024-01-01',
      endDate: '2024-01-31',
      data: {
        totalMaterials: 156,
        lowStockItems: 12,
        totalValue: 125000,
        turnoverRate: 2.3
      },
      summary: {
        totalRecords: 156,
        totalAmount: 125000,
        averageValue: 801.28
      },
      status: 'generated',
      generatedBy: '孙七',
      generatedAt: '2024-02-01T16:00:00Z',
      createdAt: '2024-02-01T16:00:00Z',
      updatedAt: '2024-02-01T16:00:00Z'
    }
  ]

  useEffect(() => {
    setReports(mockReports)
  }, [])

  const handleSearch = () => {
    let filteredReports = reports.filter(report => 
      report.title.toLowerCase().includes(searchText.toLowerCase()) ||
      report.reportNumber.toLowerCase().includes(searchText.toLowerCase())
    )

    if (filter.type) {
      filteredReports = filteredReports.filter(report => report.type === filter.type)
    }

    if (filter.status) {
      filteredReports = filteredReports.filter(report => report.status === filter.status)
    }

    if (filter.startDate && filter.endDate) {
      filteredReports = filteredReports.filter(report => 
        report.startDate >= filter.startDate && report.endDate <= filter.endDate
      )
    }

    setReports(filteredReports)
  }

  const handleGenerateReport = async (values: ReportFormData) => {
    setLoading(true)
    try {
      const newReport: Report = {
        id: uuidv4(),
        reportNumber: `REP-${format(new Date(), 'yyyy-MM-dd')}-${Date.now().toString().slice(-4)}`,
        ...values,
        data: {},
        summary: { totalRecords: Math.floor(Math.random() * 1000) + 100 },
        status: 'generated',
        generatedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      addReport(newReport)
      setModalVisible(false)
      form.resetFields()
    } finally {
      setLoading(false)
    }
  }

  const handleViewReport = (report: Report) => {
    setSelectedReport(report)
    setDetailModalVisible(true)
  }

  const handleDeleteReport = (id: string) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这个报表吗？',
      onOk: () => deleteReport(id)
    })
  }

  const handleExportReport = (report: Report) => {
    // 模拟导出功能
    const dataStr = JSON.stringify(report, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${report.reportNumber}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  const getStatusColor = (status: Report['status']) => {
    const colors = {
      draft: 'default',
      generated: 'processing',
      approved: 'success',
      published: 'success'
    }
    return colors[status]
  }

  const getTypeColor = (type: Report['type']) => {
    const colors = {
      production: 'blue',
      quality: 'green',
      inventory: 'orange',
      sales: 'purple',
      financial: 'gold',
      employee: 'cyan',
      equipment: 'red'
    }
    return colors[type]
  }

  const columns = [
    {
      title: '报表编号',
      dataIndex: 'reportNumber',
      key: 'reportNumber',
      width: 140
    },
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 100,
      render: (type: string) => (
        <Tag color={getTypeColor(type as Report['type'])}>
          {{
            production: '生产报表',
            quality: '质量报表',
            inventory: '库存报表',
            sales: '销售报表',
            financial: '财务报表',
            employee: '员工报表',
            equipment: '设备报表'
          }[type]}
        </Tag>
      )
    },
    {
      title: '统计时间',
      key: 'dateRange',
      width: 180,
      render: (record: Report) => (
        <span>{record.startDate} 至 {record.endDate}</span>
      )
    },
    {
      title: '生成人',
      dataIndex: 'generatedBy',
      key: 'generatedBy',
      width: 100
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => (
        <Badge status={getStatusColor(status as Report['status'])} text={{
          draft: '草稿',
          generated: '已生成',
          approved: '已审批',
          published: '已发布'
        }[status]} />
      )
    },
    {
      title: '生成时间',
      dataIndex: 'generatedAt',
      key: 'generatedAt',
      width: 160,
      render: (date: string) => format(new Date(date), 'yyyy-MM-dd HH:mm', { locale: zhCN })
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      fixed: 'right' as const,
      render: (record: Report) => (
        <Space size="small">
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => handleViewReport(record)}
          >
            查看
          </Button>
          <Button
            type="text"
            icon={<DownloadOutlined />}
            onClick={() => handleExportReport(record)}
          >
            导出
          </Button>
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteReport(record.id)}
          >
            删除
          </Button>
        </Space>
      )
    }
  ]

  return (
    <div className="p-6">
      <Card>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">报表统计管理</h1>
          <p className="text-gray-600">管理和查看各类业务报表</p>
        </div>

        {/* 搜索和筛选 */}
        <Row gutter={16} className="mb-6">
          <Col span={6}>
            <Input
              placeholder="搜索报表标题或编号"
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
            />
          </Col>
          <Col span={4}>
            <Select
              placeholder="报表类型"
              style={{ width: '100%' }}
              allowClear
              onChange={(value) => setFilter({ ...filter, type: value })}
            >
              <Option value="production">生产报表</Option>
              <Option value="quality">质量报表</Option>
              <Option value="inventory">库存报表</Option>
              <Option value="sales">销售报表</Option>
              <Option value="financial">财务报表</Option>
              <Option value="employee">员工报表</Option>
              <Option value="equipment">设备报表</Option>
            </Select>
          </Col>
          <Col span={4}>
            <Select
              placeholder="状态"
              style={{ width: '100%' }}
              allowClear
              onChange={(value) => setFilter({ ...filter, status: value })}
            >
              <Option value="draft">草稿</Option>
              <Option value="generated">已生成</Option>
              <Option value="approved">已审批</Option>
              <Option value="published">已发布</Option>
            </Select>
          </Col>
          <Col span={6}>
            <RangePicker
              style={{ width: '100%' }}
              onChange={(dates) => {
                if (dates) {
                  setFilter({
                    ...filter,
                    startDate: dates[0]?.format('YYYY-MM-DD'),
                    endDate: dates[1]?.format('YYYY-MM-DD')
                  })
                } else {
                  setFilter({ ...filter, startDate: undefined, endDate: undefined })
                }
              }}
            />
          </Col>
          <Col span={4}>
            <Space>
              <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
                搜索
              </Button>
              <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalVisible(true)}>
                生成报表
              </Button>
            </Space>
          </Col>
        </Row>

        {/* 统计卡片 */}
        <Row gutter={16} className="mb-6">
          <Col span={6}>
            <Card>
              <Statistic
                title="总报表数"
                value={reports.length}
                prefix={<BarChartOutlined />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="已发布报表"
                value={reports.filter(r => r.status === 'published').length}
                valueStyle={{ color: '#3f8600' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="本月生成"
                value={reports.filter(r => 
                  new Date(r.generatedAt).getMonth() === new Date().getMonth()
                ).length}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="待审批"
                value={reports.filter(r => r.status === 'generated').length}
                valueStyle={{ color: '#faad14' }}
              />
            </Card>
          </Col>
        </Row>

        {/* 报表列表 */}
        <Table
          columns={columns}
          dataSource={reports}
          rowKey="id"
          loading={loading}
          scroll={{ x: 1200 }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`
          }}
        />
      </Card>

      {/* 生成报表模态框 */}
      <Modal
        title="生成新报表"
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleGenerateReport}
        >
          <Form.Item
            label="报表标题"
            name="title"
            rules={[{ required: true, message: '请输入报表标题' }]}
          >
            <Input placeholder="请输入报表标题" />
          </Form.Item>

          <Form.Item
            label="报表类型"
            name="type"
            rules={[{ required: true, message: '请选择报表类型' }]}
          >
            <Select placeholder="请选择报表类型">
              <Option value="production">生产报表</Option>
              <Option value="quality">质量报表</Option>
              <Option value="inventory">库存报表</Option>
              <Option value="sales">销售报表</Option>
              <Option value="financial">财务报表</Option>
              <Option value="employee">员工报表</Option>
              <Option value="equipment">设备报表</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="统计时间范围"
            required
          >
            <Input.Group compact>
              <Form.Item
                name="startDate"
                noStyle
                rules={[{ required: true, message: '请选择开始日期' }]}
              >
                <DatePicker placeholder="开始日期" style={{ width: '50%' }} />
              </Form.Item>
              <Form.Item
                name="endDate"
                noStyle
                rules={[{ required: true, message: '请选择结束日期' }]}
              >
                <DatePicker placeholder="结束日期" style={{ width: '50%' }} />
              </Form.Item>
            </Input.Group>
          </Form.Item>

          <Form.Item
            label="报表描述"
            name="description"
            rules={[{ required: true, message: '请输入报表描述' }]}
          >
            <TextArea rows={3} placeholder="请输入报表描述" />
          </Form.Item>

          <Form.Item
            label="生成人"
            name="generatedBy"
            rules={[{ required: true, message: '请输入生成人' }]}
          >
            <Input placeholder="请输入生成人姓名" />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                生成报表
              </Button>
              <Button onClick={() => setModalVisible(false)}>
                取消
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* 报表详情模态框 */}
      <Modal
        title="报表详情"
        visible={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={null}
        width={800}
      >
        {selectedReport && (
          <div>
            <Descriptions bordered column={2}>
              <Descriptions.Item label="报表编号">{selectedReport.reportNumber}</Descriptions.Item>
              <Descriptions.Item label="报表标题">{selectedReport.title}</Descriptions.Item>
              <Descriptions.Item label="报表类型">
                <Tag color={getTypeColor(selectedReport.type)}>
                  {{
                    production: '生产报表',
                    quality: '质量报表',
                    inventory: '库存报表',
                    sales: '销售报表',
                    financial: '财务报表',
                    employee: '员工报表',
                    equipment: '设备报表'
                  }[selectedReport.type]}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="状态">
                <Badge status={getStatusColor(selectedReport.status)} text={{
                  draft: '草稿',
                  generated: '已生成',
                  approved: '已审批',
                  published: '已发布'
                }[selectedReport.status]} />
              </Descriptions.Item>
              <Descriptions.Item label="统计时间" span={2}>
                {selectedReport.startDate} 至 {selectedReport.endDate}
              </Descriptions.Item>
              <Descriptions.Item label="生成人">{selectedReport.generatedBy}</Descriptions.Item>
              <Descriptions.Item label="生成时间">
                {format(new Date(selectedReport.generatedAt), 'yyyy-MM-dd HH:mm', { locale: zhCN })}
              </Descriptions.Item>
              {selectedReport.approvedBy && (
                <>
                  <Descriptions.Item label="审批人">{selectedReport.approvedBy}</Descriptions.Item>
                  <Descriptions.Item label="审批时间">
                    {selectedReport.approvedAt && format(new Date(selectedReport.approvedAt), 'yyyy-MM-dd HH:mm', { locale: zhCN })}
                  </Descriptions.Item>
                </>
              )}
              <Descriptions.Item label="描述" span={2}>{selectedReport.description}</Descriptions.Item>
            </Descriptions>

            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-4">统计摘要</h3>
              <Row gutter={16}>
                <Col span={8}>
                  <Card>
                    <Statistic
                      title="总记录数"
                      value={selectedReport.summary.totalRecords}
                    />
                  </Card>
                </Col>
                {selectedReport.summary.totalAmount && (
                  <Col span={8}>
                    <Card>
                      <Statistic
                        title="总金额"
                        value={selectedReport.summary.totalAmount}
                        precision={2}
                      />
                    </Card>
                  </Col>
                )}
                {selectedReport.summary.successRate && (
                  <Col span={8}>
                    <Card>
                      <Statistic
                        title="成功率"
                        value={selectedReport.summary.successRate}
                        suffix="%"
                        precision={2}
                        valueStyle={{ color: '#3f8600' }}
                      />
                    </Card>
                  </Col>
                )}
              </Row>
            </div>

            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-4">详细数据</h3>
              <pre className="bg-gray-50 p-4 rounded-lg overflow-auto max-h-64">
                {JSON.stringify(selectedReport.data, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default ReportPage