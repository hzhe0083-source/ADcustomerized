import React from 'react'
import { Layout, Row, Col, Typography, Space } from 'antd'

const { Footer: AntFooter } = Layout
const { Title, Text, Link } = Typography

const Footer: React.FC = () => {
  return (
    <AntFooter className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Row gutter={[48, 24]}>
          <Col xs={24} md={8}>
            <Title level={4} className="text-white mb-4">
              ADPrinting
            </Title>
            <Text className="text-gray-300 block mb-4">
              专业的数码广告打印服务提供商，致力于为客户提供高品质的打印解决方案。
            </Text>
            <Space direction="vertical" size="small">
              <Text className="text-gray-300">📧 contact@adprinting.com</Text>
              <Text className="text-gray-300">📞 400-123-4567</Text>
              <Text className="text-gray-300">📍 上海市浦东新区张江高科技园区</Text>
            </Space>
          </Col>
          
          <Col xs={24} md={8}>
            <Title level={5} className="text-white mb-4">
              产品服务
            </Title>
            <Space direction="vertical" size="small">
              <Link href="#" className="text-gray-300 hover:text-white">UV卷材打印</Link>
              <Link href="#" className="text-gray-300 hover:text-white">喷绘布制作</Link>
              <Link href="#" className="text-gray-300 hover:text-white">车贴定制</Link>
              <Link href="#" className="text-gray-300 hover:text-white">灯箱片打印</Link>
              <Link href="#" className="text-gray-300 hover:text-white">KT板制作</Link>
            </Space>
          </Col>
          
          <Col xs={24} md={8}>
            <Title level={5} className="text-white mb-4">
              帮助中心
            </Title>
            <Space direction="vertical" size="small">
              <Link href="#" className="text-gray-300 hover:text-white">如何下单</Link>
              <Link href="#" className="text-gray-300 hover:text-white">价格说明</Link>
              <Link href="#" className="text-gray-300 hover:text-white">配送方式</Link>
              <Link href="#" className="text-gray-300 hover:text-white">售后服务</Link>
              <Link href="#" className="text-gray-300 hover:text-white">常见问题</Link>
            </Space>
          </Col>
        </Row>
        
        <div className="border-t border-gray-700 mt-12 pt-8 text-center">
          <Text className="text-gray-400">
            © 2024 ADPrinting. 保留所有权利。
          </Text>
        </div>
      </div>
    </AntFooter>
  )
}

export default Footer