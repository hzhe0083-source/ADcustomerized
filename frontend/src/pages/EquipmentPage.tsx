import React, { useState, useEffect } from 'react'
import { Card, Table, Button, Space, Tag, Badge, Progress, Statistic, Row, Col, message } from 'antd'
import { ReloadOutlined, SettingOutlined, EyeOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { getEquipment, getEquipmentStatus } from '@/services/api'

interface Equipment {
  id: string
  name: string
  type: string
  model: string
  status: 'running' | 'idle' | 'maintenance' | 'fault'
  location: string
  operator: string
  lastMaintenance: string
  nextMaintenance: string
  runtime: number
  efficiency: number
  dailyOutput: number
  maxCapacity: number
  currentJob?: string
}

interface EquipmentStatus {
  total: number
  running: number
  idle: number
  maintenance: number
  fault: number
  overallEfficiency: number
  totalRuntime: number
}

const EquipmentPage: React.FC = () => {
  const navigate = useNavigate()
  const [equipment, setEquipment] = useState<Equipment[]>([])
  const [equipmentStatus, setEquipmentStatus] = useState<EquipmentStatus | null>(null)
  const [loading, setLoading] = useState(false)

  const statusColors = {
    running: 'green',
    idle: 'blue',
    maintenance: 'orange',
    fault: 'red'
  }

  const statusLabels = {
    running: '运行中',
    idle: '空闲',
    maintenance: '维护中',
    fault: '故障'
  }

  const typeLabels = {
    printer: '打印机',
    cutter: '切割机',
    laminator: '覆膜机',
    welder: '焊接机',
    other: '其他'
  }

  const fetchEquipment = async () => {
    setLoading(true)
    try {
      const [equipmentResponse, statusResponse] = await Promise.all([
        getEquipment(),
        getEquipmentStatus()
      ])
      if (equipmentResponse.data) {
        setEquipment(equipmentResponse.data)
      }
      if (statusResponse.data) {
        setEquipmentStatus(statusResponse.data)
      }
    } catch (error) {
      message.error('获取设备信息失败')
      console.error('获取设备信息失败:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEquipment()
  }, [])

  const handleViewDetails = (equipment: Equipment) => {
    navigate(`/equipment/detail/${equipment.id}`)
  }

  const handleMaintenance = (equipment: Equipment) => {
    message.info(`安排设备 ${equipment.name} 的维护`)
  }

  const columns = [
    {
      title: '设备名称',
      dataIndex: 'name',
      key: 'name',
      fixed: 'left' as const,
      width: 150,
    },
    {
      title: '设备类型',
      dataIndex: 'type',
      key: 'type',
      width: 100,
      render: (type: string) => typeLabels[type as keyof typeof typeLabels] || type,
    },
    {
      title: '型号',
      dataIndex: 'model',
      key: 'model',
      width: 120,
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
      title: '位置',
      dataIndex: 'location',
      key: 'location',
      width: 120,
    },
    {
      title: '操作员',
      dataIndex: 'operator',
      key: 'operator',
      width: 100,
    },
    {
      title: '运行时间',
      dataIndex: 'runtime',
      key: 'runtime',
      width: 120,
      render: (runtime: number) => `${Math.floor(runtime / 60)}小时${runtime % 60}分`,
    },
    {
      title: '效率',
      dataIndex: 'efficiency',
      key: 'efficiency',
      width: 100,
      render: (efficiency: number) => (
        <Progress
          percent={Math.round(efficiency)}
          size="small"
          strokeColor={efficiency >= 90 ? '#52c41a' : efficiency >= 70 ? '#faad14' : '#ff4d4f'}
        />
      ),
    },
    {
      title: '日产量',
      dataIndex: 'dailyOutput',
      key: 'dailyOutput',
      width: 100,
      render: (output: number, record: Equipment) => (
        <div>
          <div>{output}</div>
          <div className="text-xs text-gray-500">/ {record.maxCapacity}</div>
        </div>
      ),
    },
    {
      title: '当前任务',
      dataIndex: 'currentJob',
      key: 'currentJob',
      width: 120,
      render: (job: string) => job || <Tag color="default">无任务</Tag>,
    },
    {
      title: '下次维护',
      dataIndex: 'nextMaintenance',
      key: 'nextMaintenance',
      width: 120,
      render: (date: string) => {
        const daysUntil = Math.ceil((new Date(date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
        const color = daysUntil <= 3 ? 'red' : daysUntil <= 7 ? 'orange' : 'green'
        return <Tag color={color}>{date}</Tag>
      },
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      fixed: 'right' as const,
      render: (_: any, record: Equipment) => (
        <Space size="small">
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetails(record)}
          >
            详情
          </Button>
          <Button
            type="text"
            icon={<SettingOutlined />}
            onClick={() => handleMaintenance(record)}
          >
            维护
          </Button>
        </Space>
      ),
    },
  ]

  return (
    <div className="p-6">
      {/* 统计卡片 */}
      {equipmentStatus && (
        <Row gutter={16} className="mb-6">
          <Col span={6}>
            <Card>
              <Statistic
                title="设备总数"
                value={equipmentStatus.total}
                valueStyle={{ color: '#3f8600' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="运行中"
                value={equipmentStatus.running}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="空闲"
                value={equipmentStatus.idle}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="故障"
                value={equipmentStatus.fault}
                valueStyle={{ color: '#ff4d4f' }}
              />
            </Card>
          </Col>
        </Row>
      )}

      {/* 设备列表 */}
      <Card>
        <div className="mb-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold">设备管理</h2>
          <Button
            type="primary"
            icon={<ReloadOutlined />}
            onClick={fetchEquipment}
            loading={loading}
          >
            刷新
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={equipment}
          rowKey="id"
          loading={loading}
          scroll={{ x: 1300 }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 台设备`,
          }}
        />
      </Card>
    </div>
  )
}

export default EquipmentPage