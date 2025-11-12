import React, { useState, useEffect } from 'react'
import { Card, Descriptions, Button, Space, Tag, Badge, Timeline, Row, Col, Statistic, message } from 'antd'
import { ArrowLeftOutlined, PrinterOutlined, SettingOutlined, SyncOutlined } from '@ant-design/icons'
import { useNavigate, useParams } from 'react-router-dom'
import { getEquipmentById } from '@/services/api'

interface EquipmentDetail {
  id: string
  name: string
  type: string
  model: string
  serialNumber: string
  manufacturer: string
  purchaseDate: string
  warrantyExpiry: string
  status: 'running' | 'idle' | 'maintenance' | 'fault'
  location: string
  operator: string
  runtime: number
  efficiency: number
  dailyOutput: number
  maxCapacity: number
  currentJob?: string
  lastMaintenance: string
  nextMaintenance: string
  maintenanceHistory: MaintenanceRecord[]
  performance: PerformanceData
  specifications: Record<string, any>
}

interface MaintenanceRecord {
  id: string
  date: string
  type: 'preventive' | 'corrective' | 'emergency'
  description: string
  technician: string
  duration: number
  cost: number
  parts: string[]
}

interface PerformanceData {
  dailyEfficiency: number[]
  outputTrend: number[]
  downtimeHours: number[]
  qualityRate: number
  energyConsumption: number
}

const EquipmentDetailPage: React.FC = () => {
  const navigate = useNavigate()
  const { equipmentId } = useParams<{ equipmentId: string }>()
  const [equipment, setEquipment] = useState<EquipmentDetail | null>(null)
  const [loading, setLoading] = useState(true)

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

  const maintenanceTypeLabels = {
    preventive: '预防性维护',
    corrective: '纠正性维护',
    emergency: '紧急维护'
  }

  const fetchEquipmentDetail = async () => {
    if (!equipmentId) return
    
    setLoading(true)
    try {
      const response = await getEquipmentById(equipmentId)
      if (response.data) {
        setEquipment(response.data)
      }
    } catch (error) {
      message.error('获取设备详情失败')
      console.error('获取设备详情失败:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEquipmentDetail()
  }, [equipmentId])

  const handlePrint = () => {
    window.print()
  }

  const handleMaintenance = () => {
    message.info('安排设备维护')
  }

  const handleSync = () => {
    fetchEquipmentDetail()
    message.success('设备状态已同步')
  }

  // const handleStatusUpdate = async (newStatus: string) => {
  //   if (!equipment) return
  //   
  //   try {
  //     await updateEquipmentStatus(equipment.id, newStatus)
  //     setEquipment({ ...equipment, status: newStatus as any })
  //     message.success('设备状态已更新')
  //   } catch (error) {
  //     message.error('更新设备状态失败')
  //   }
  // }

  if (loading || !equipment) {
    return <div className="p-6">加载中...</div>
  }

  return (
    <div className="p-6">
      <Card>
        <div className="mb-6 flex justify-between items-center">
          <div className="flex items-center">
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate('/equipment')}
              className="mr-4"
            >
              返回
            </Button>
            <h1 className="text-2xl font-bold">{equipment.name} - 设备详情</h1>
          </div>
          <Space>
            <Button icon={<PrinterOutlined />} onClick={handlePrint}>
              打印
            </Button>
            <Button icon={<SyncOutlined />} onClick={handleSync}>
              同步
            </Button>
            <Button type="primary" icon={<SettingOutlined />} onClick={handleMaintenance}>
              维护
            </Button>
          </Space>
        </div>

        {/* 基本信息 */}
        <Descriptions title="基本信息" bordered className="mb-6">
          <Descriptions.Item label="设备名称">{equipment.name}</Descriptions.Item>
          <Descriptions.Item label="设备类型">{equipment.type}</Descriptions.Item>
          <Descriptions.Item label="型号">{equipment.model}</Descriptions.Item>
          <Descriptions.Item label="序列号">{equipment.serialNumber}</Descriptions.Item>
          <Descriptions.Item label="制造商">{equipment.manufacturer}</Descriptions.Item>
          <Descriptions.Item label="购买日期">{equipment.purchaseDate}</Descriptions.Item>
          <Descriptions.Item label="保修到期">{equipment.warrantyExpiry}</Descriptions.Item>
          <Descriptions.Item label="状态">
            <Badge status={statusColors[equipment.status] as any} text={statusLabels[equipment.status]} />
          </Descriptions.Item>
          <Descriptions.Item label="位置">{equipment.location}</Descriptions.Item>
          <Descriptions.Item label="操作员">{equipment.operator}</Descriptions.Item>
          <Descriptions.Item label="当前任务">
            {equipment.currentJob || <Tag color="default">无任务</Tag>}
          </Descriptions.Item>
        </Descriptions>

        {/* 性能指标 */}
        <Row gutter={16} className="mb-6">
          <Col span={6}>
            <Card>
              <Statistic
                title="运行时间"
                value={`${Math.floor(equipment.runtime / 60)}小时${equipment.runtime % 60}分`}
                valueStyle={{ color: '#3f8600' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="效率"
                value={Math.round(equipment.efficiency)}
                suffix="%"
                valueStyle={{ color: equipment.efficiency >= 90 ? '#52c41a' : equipment.efficiency >= 70 ? '#faad14' : '#ff4d4f' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="日产量"
                value={equipment.dailyOutput}
                suffix={`/ ${equipment.maxCapacity}`}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="质量率"
                value={Math.round(equipment.performance.qualityRate)}
                suffix="%"
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
        </Row>

        {/* 维护信息 */}
        <Row gutter={16} className="mb-6">
          <Col span={12}>
            <Card title="维护计划">
              <Descriptions column={1}>
                <Descriptions.Item label="上次维护">{equipment.lastMaintenance}</Descriptions.Item>
                <Descriptions.Item label="下次维护">
                  <Tag color="blue">{equipment.nextMaintenance}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="维护状态">
                  {new Date(equipment.nextMaintenance) < new Date() ? (
                    <Tag color="red">需要维护</Tag>
                  ) : (
                    <Tag color="green">正常</Tag>
                  )}
                </Descriptions.Item>
              </Descriptions>
            </Card>
          </Col>
          <Col span={12}>
            <Card title="能耗信息">
              <Descriptions column={1}>
                <Descriptions.Item label="能耗">
                  {equipment.performance.energyConsumption} kWh
                </Descriptions.Item>
                <Descriptions.Item label="能效等级">
                  <Tag color="green">A级</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="碳排放">
                  {(equipment.performance.energyConsumption * 0.5).toFixed(2)} kg CO₂
                </Descriptions.Item>
              </Descriptions>
            </Card>
          </Col>
        </Row>

        {/* 维护历史 */}
        <Card title="维护历史" className="mb-6">
          <Timeline>
            {equipment.maintenanceHistory.map((record) => (
              <Timeline.Item
                key={record.id}
                color={record.type === 'emergency' ? 'red' : record.type === 'corrective' ? 'orange' : 'green'}
              >
                <div className="mb-2">
                  <Tag color={record.type === 'emergency' ? 'red' : record.type === 'corrective' ? 'orange' : 'green'}>
                    {maintenanceTypeLabels[record.type]}
                  </Tag>
                  <span className="ml-2 font-medium">{record.date}</span>
                </div>
                <div className="mb-1">
                  <strong>描述：</strong>{record.description}
                </div>
                <div className="mb-1">
                  <strong>技术员：</strong>{record.technician} | 
                  <strong>持续时间：</strong>{record.duration}小时 | 
                  <strong>成本：</strong>¥{record.cost}
                </div>
                {record.parts.length > 0 && (
                  <div>
                    <strong>更换零件：</strong>
                    {record.parts.map((part, index) => (
                      <Tag key={index} className="ml-1">{part}</Tag>
                    ))}
                  </div>
                )}
              </Timeline.Item>
            ))}
          </Timeline>
        </Card>

        {/* 规格参数 */}
        <Card title="规格参数">
          <Descriptions bordered column={2}>
            {Object.entries(equipment.specifications).map(([key, value]) => (
              <Descriptions.Item key={key} label={key}>
                {typeof value === 'number' ? value.toLocaleString() : String(value)}
              </Descriptions.Item>
            ))}
          </Descriptions>
        </Card>
      </Card>
    </div>
  )
}

export default EquipmentDetailPage