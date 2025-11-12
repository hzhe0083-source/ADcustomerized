import React, { useState, useEffect } from 'react'
import { Table, Button, Input, Space, Modal, Form, Select, Tag, message, Popconfirm, Card, DatePicker, Descriptions, Divider, Radio } from 'antd'
import { PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined, EyeOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons'
import { useQualityControlStore } from '../store/qualityControlStore'
import { QualityControl, QualityControlFormData, QualityCriteria, InspectionResult } from '../types'
import { v4 as uuidv4 } from 'uuid'
import dayjs from 'dayjs'

const { Search } = Input
const { Option } = Select
const { TextArea } = Input

const QualityControlPage: React.FC = () => {
  const { 
    qualityControls, 
    loading, 
    setQualityControls, 
    addQualityControl, 
    updateQualityControl, 
    deleteQualityControl, 
    setLoading 
  } = useQualityControlStore()
  
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [editingControl, setEditingControl] = useState<QualityControl | null>(null)
  const [selectedControl, setSelectedControl] = useState<QualityControl | null>(null)
  const [searchText, setSearchText] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [typeFilter, setTypeFilter] = useState<string>('')
  const [form] = Form.useForm()
  const [criteriaForm] = Form.useForm()

  // 模拟数据
  const mockQualityControls: QualityControl[] = [
    {
      id: '1',
      controlNumber: 'QC-2024-001',
      productName: '户外广告牌',
      productCode: 'AD-001',
      batchNumber: 'BATCH-001',
      productionDate: '2024-02-01',
      inspector: '质量管理员A',
      inspectionDate: '2024-02-02',
      inspectionType: 'final',
      status: 'passed',
      criteria: [
        {
          id: '1',
          item: '印刷质量',
          standard: '色彩饱和度≥90%',
          method: '目测对比',
          weight: 30,
          isCritical: true
        },
        {
          id: '2',
          item: '尺寸精度',
          standard: '±2mm',
          method: '卡尺测量',
          tolerance: '±2mm',
          weight: 25,
          isCritical: true
        },
        {
          id: '3',
          item: '材料厚度',
          standard: '0.5±0.05mm',
          method: '厚度计',
          tolerance: '±0.05mm',
          weight: 20,
          isCritical: false
        }
      ],
      results: [
        {
          criteriaId: '1',
          criteriaName: '印刷质量',
          result: 'pass',
          measuredValue: '95%',
          comments: '色彩鲜艳，符合标准'
        },
        {
          criteriaId: '2',
          criteriaName: '尺寸精度',
          result: 'pass',
          measuredValue: '±1mm',
          comments: '尺寸精确'
        },
        {
          criteriaId: '3',
          criteriaName: '材料厚度',
          result: 'pass',
          measuredValue: '0.48mm',
          comments: '厚度合格'
        }
      ],
      overallResult: 'pass',
      notes: '整体质量良好，符合客户要求',
      createdAt: '2024-02-02',
      updatedAt: '2024-02-02'
    },
    {
      id: '2',
      controlNumber: 'QC-2024-002',
      productName: '室内展板',
      productCode: 'BD-002',
      batchNumber: 'BATCH-002',
      productionDate: '2024-02-03',
      inspector: '质量管理员B',
      inspectionDate: '2024-02-04',
      inspectionType: 'in_process',
      status: 'failed',
      criteria: [
        {
          id: '4',
          item: '表面平整度',
          standard: '无明显凹凸',
          method: '目测检查',
          weight: 40,
          isCritical: true
        },
        {
          id: '5',
          item: '边缘处理',
          standard: '光滑无毛刺',
          method: '手触检查',
          weight: 35,
          isCritical: true
        }
      ],
      results: [
        {
          criteriaId: '4',
          criteriaName: '表面平整度',
          result: 'fail',
          measuredValue: '有凹凸',
          comments: '发现轻微凹凸'
        },
        {
          id: '5',
          criteriaName: '边缘处理',
          result: 'pass',
          measuredValue: '光滑',
          comments: '边缘处理良好'
        }
      ],
      overallResult: 'fail',
      notes: '表面平整度不达标，需要返工',
      correctiveActions: ['重新压平处理', '加强质量检查'],
      createdAt: '2024-02-04',
      updatedAt: '2024-02-04'
    },
    {
      id: '3',
      controlNumber: 'QC-2024-003',
      productName: '车贴',
      productCode: 'CT-003',
      batchNumber: 'BATCH-003',
      productionDate: '2024-02-05',
      inspector: '质量管理员C',
      inspectionDate: '2024-02-05',
      inspectionType: 'random',
      status: 'pending',
      criteria: [
        {
          id: '6',
          item: '粘性测试',
          standard: '≥2N/cm',
          method: '拉力测试',
          weight: 50,
          isCritical: true
        },
        {
          id: '7',
          item: '耐候性',
          standard: '72小时无脱落',
          method: '环境测试',
          weight: 30,
          isCritical: false
        }
      ],
      results: [],
      overallResult: 'conditional',
      notes: '待完成测试',
      createdAt: '2024-02-05',
      updatedAt: '2024-02-05'
    }
  ]

  useEffect(() => {
    setQualityControls(mockQualityControls)
  }, [])

  const handleAdd = () => {
    setEditingControl(null)
    form.resetFields()
    setIsModalOpen(true)
  }

  const handleEdit = (control: QualityControl) => {
    setEditingControl(control)
    form.setFieldsValue({
      ...control,
      productionDate: dayjs(control.productionDate),
      inspectionDate: dayjs(control.inspectionDate)
    })
    setIsModalOpen(true)
  }

  const handleView = (control: QualityControl) => {
    setSelectedControl(control)
    setIsDetailModalOpen(true)
  }

  const handleDelete = (id: string) => {
    deleteQualityControl(id)
    message.success('质量控制记录删除成功')
  }

  const handleStatusChange = (id: string, newStatus: string) => {
    const now = new Date().toISOString().split('T')[0]
    updateQualityControl(id, {
      status: newStatus as any,
      updatedAt: now
    })
    message.success('状态更新成功')
  }

  const handleOk = async () => {
    try {
      const values = await form.validateFields()
      setLoading(true)
      
      const now = new Date().toISOString().split('T')[0]
      const controlData = {
        ...values,
        productionDate: values.productionDate.format('YYYY-MM-DD'),
        inspectionDate: values.inspectionDate.format('YYYY-MM-DD'),
        controlNumber: editingControl ? editingControl.controlNumber : `QC-${new Date().getFullYear()}-${String(qualityControls.length + 1).padStart(3, '0')}`
      }
      
      if (editingControl) {
        updateQualityControl(editingControl.id, {
          ...controlData,
          updatedAt: now
        })
        message.success('质量控制记录更新成功')
      } else {
        const newControl: QualityControl = {
          id: uuidv4(),
          ...controlData,
          criteria: [],
          results: [],
          overallResult: 'conditional',
          createdAt: now,
          updatedAt: now
        }
        addQualityControl(newControl)
        message.success('质量控制记录创建成功')
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

  const handleDetailCancel = () => {
    setIsDetailModalOpen(false)
    setSelectedControl(null)
  }

  const handleSearch = (value: string) => {
    setSearchText(value)
  }

  const filteredControls = qualityControls.filter(control =>
    (control.productName.toLowerCase().includes(searchText.toLowerCase()) ||
     control.productCode.toLowerCase().includes(searchText.toLowerCase()) ||
     control.inspector.toLowerCase().includes(searchText.toLowerCase()) ||
     control.batchNumber.toLowerCase().includes(searchText.toLowerCase())) &&
    (!statusFilter || control.status === statusFilter) &&
    (!typeFilter || control.inspectionType === typeFilter)
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'passed': return 'green'
      case 'failed': return 'red'
      case 'pending': return 'orange'
      case 'rework': return 'blue'
      default: return 'default'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'passed': return '通过'
      case 'failed': return '不合格'
      case 'pending': return '待检'
      case 'rework': return '返工'
      default: return status
    }
  }

  const getTypeText = (type: string) => {
    switch (type) {
      case 'incoming': return '来料检验'
      case 'in_process': return '过程检验'
      case 'final': return '最终检验'
      case 'random': return '抽检'
      default: return type
    }
  }

  const getResultColor = (result: string) => {
    switch (result) {
      case 'pass': return 'green'
      case 'fail': return 'red'
      case 'conditional': return 'orange'
      default: return 'default'
    }
  }

  const getResultText = (result: string) => {
    switch (result) {
      case 'pass': return '合格'
      case 'fail': return '不合格'
      case 'conditional': return '有条件'
      default: return result
    }
  }

  const columns = [
    {
      title: '检验编号',
      dataIndex: 'controlNumber',
      key: 'controlNumber',
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
      title: '批次号',
      dataIndex: 'batchNumber',
      key: 'batchNumber',
      width: 100
    },
    {
      title: '检验类型',
      dataIndex: 'inspectionType',
      key: 'inspectionType',
      width: 100,
      render: (type: string) => getTypeText(type)
    },
    {
      title: '检验员',
      dataIndex: 'inspector',
      key: 'inspector',
      width: 120
    },
    {
      title: '检验日期',
      dataIndex: 'inspectionDate',
      key: 'inspectionDate',
      width: 100
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
      title: '总体结果',
      dataIndex: 'overallResult',
      key: 'overallResult',
      width: 100,
      render: (result: string) => (
        <Tag color={getResultColor(result)}>
          {getResultText(result)}
        </Tag>
      )
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      fixed: 'right' as const,
      render: (_: any, record: QualityControl) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleView(record)}
          >
            查看
          </Button>
          
          {record.status === 'pending' && (
            <Button
              type="link"
              size="small"
              icon={<CheckCircleOutlined />}
              onClick={() => handleStatusChange(record.id, 'passed')}
            >
              通过
            </Button>
          )}
          
          {record.status === 'pending' && (
            <Button
              type="link"
              size="small"
              danger
              icon={<CloseCircleOutlined />}
              onClick={() => handleStatusChange(record.id, 'failed')}
            >
              不合格
            </Button>
          )}
          
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          
          <Popconfirm
            title="确定要删除这个质量控制记录吗？"
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
          <h1 style={{ margin: 0 }}>质量控制管理</h1>
          <Space>
            <Search
              placeholder="搜索产品名称、编码、批次号或检验员"
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
              <Option value="pending">待检</Option>
              <Option value="passed">通过</Option>
              <Option value="failed">不合格</Option>
              <Option value="rework">返工</Option>
            </Select>
            <Select
              placeholder="检验类型"
              allowClear
              style={{ width: 120 }}
              value={typeFilter}
              onChange={setTypeFilter}
            >
              <Option value="incoming">来料检验</Option>
              <Option value="in_process">过程检验</Option>
              <Option value="final">最终检验</Option>
              <Option value="random">抽检</Option>
            </Select>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAdd}
            >
              创建检验
            </Button>
          </Space>
        </div>

        <Table
          columns={columns}
          dataSource={filteredControls}
          rowKey="id"
          loading={loading}
          scroll={{ x: 1200 }}
          pagination={{
            total: filteredControls.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`
          }}
        />
      </Card>

      <Modal
        title={editingControl ? '编辑质量控制' : '创建质量控制'}
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
            inspectionType: 'final',
            status: 'pending',
            overallResult: 'conditional'
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
              name="batchNumber"
              label="批次号"
              rules={[{ required: true, message: '请输入批次号' }]}
            >
              <Input placeholder="请输入批次号" />
            </Form.Item>

            <Form.Item
              name="inspectionType"
              label="检验类型"
              rules={[{ required: true, message: '请选择检验类型' }]}
            >
              <Select placeholder="请选择检验类型">
                <Option value="incoming">来料检验</Option>
                <Option value="in_process">过程检验</Option>
                <Option value="final">最终检验</Option>
                <Option value="random">抽检</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="inspector"
              label="检验员"
              rules={[{ required: true, message: '请输入检验员' }]}
            >
              <Input placeholder="请输入检验员姓名" />
            </Form.Item>

            <Form.Item
              name="productionDate"
              label="生产日期"
              rules={[{ required: true, message: '请选择生产日期' }]}
            >
              <DatePicker
                style={{ width: '100%' }}
                placeholder="请选择生产日期"
              />
            </Form.Item>

            <Form.Item
              name="inspectionDate"
              label="检验日期"
              rules={[{ required: true, message: '请选择检验日期' }]}
            >
              <DatePicker
                style={{ width: '100%' }}
                placeholder="请选择检验日期"
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

      <Modal
        title="质量控制详情"
        open={isDetailModalOpen}
        onCancel={handleDetailCancel}
        width={1000}
        footer={[
          <Button key="close" onClick={handleDetailCancel}>
            关闭
          </Button>
        ]}
      >
        {selectedControl && (
          <div>
            <Descriptions bordered column={2}>
              <Descriptions.Item label="检验编号">{selectedControl.controlNumber}</Descriptions.Item>
              <Descriptions.Item label="产品名称">{selectedControl.productName}</Descriptions.Item>
              <Descriptions.Item label="产品编码">{selectedControl.productCode}</Descriptions.Item>
              <Descriptions.Item label="批次号">{selectedControl.batchNumber}</Descriptions.Item>
              <Descriptions.Item label="检验类型">{getTypeText(selectedControl.inspectionType)}</Descriptions.Item>
              <Descriptions.Item label="检验员">{selectedControl.inspector}</Descriptions.Item>
              <Descriptions.Item label="生产日期">{selectedControl.productionDate}</Descriptions.Item>
              <Descriptions.Item label="检验日期">{selectedControl.inspectionDate}</Descriptions.Item>
              <Descriptions.Item label="状态">
                <Tag color={getStatusColor(selectedControl.status)}>
                  {getStatusText(selectedControl.status)}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="总体结果">
                <Tag color={getResultColor(selectedControl.overallResult)}>
                  {getResultText(selectedControl.overallResult)}
                </Tag>
              </Descriptions.Item>
            </Descriptions>

            <Divider orientation="left">检验标准</Divider>
            <Table
              columns={[
                { title: '检验项目', dataIndex: 'item', key: 'item' },
                { title: '标准', dataIndex: 'standard', key: 'standard' },
                { title: '方法', dataIndex: 'method', key: 'method' },
                { title: '权重', dataIndex: 'weight', key: 'weight', render: (weight: number) => `${weight}%` },
                { title: '关键项', dataIndex: 'isCritical', key: 'isCritical', render: (isCritical: boolean) => isCritical ? '是' : '否' }
              ]}
              dataSource={selectedControl.criteria}
              rowKey="id"
              pagination={false}
              size="small"
            />

            {selectedControl.results.length > 0 && (
              <>
                <Divider orientation="left">检验结果</Divider>
                <Table
                  columns={[
                    { title: '检验项目', dataIndex: 'criteriaName', key: 'criteriaName' },
                    { title: '结果', dataIndex: 'result', key: 'result', render: (result: string) => (
                      <Tag color={getResultColor(result)}>
                        {getResultText(result)}
                      </Tag>
                    )},
                    { title: '测量值', dataIndex: 'measuredValue', key: 'measuredValue' },
                    { title: '备注', dataIndex: 'comments', key: 'comments' }
                  ]}
                  dataSource={selectedControl.results}
                  rowKey="criteriaId"
                  pagination={false}
                  size="small"
                />
              </>
            )}

            {selectedControl.notes && (
              <>
                <Divider orientation="left">备注</Divider>
                <p>{selectedControl.notes}</p>
              </>
            )}

            {selectedControl.correctiveActions && selectedControl.correctiveActions.length > 0 && (
              <>
                <Divider orientation="left">纠正措施</Divider>
                <ul>
                  {selectedControl.correctiveActions.map((action, index) => (
                    <li key={index}>{action}</li>
                  ))}
                </ul>
              </>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}

export default QualityControlPage