import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Row, Col, Card, Typography, Button, Space, Spin, Carousel } from 'antd'
import { ShoppingCartOutlined, EyeOutlined, SettingOutlined, ToolOutlined, ShoppingOutlined } from '@ant-design/icons'
import { useProductStore } from '@/store/productStore'
import { getProducts } from '@/services/api'

const bannerImages = [
  'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=Modern%20digital%20printing%20factory%20with%20large%20format%20printers%2C%20bright%20workspace%2C%20professional%20equipment&image_size=landscape_16_9',
  'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=UV%20printing%20machine%20working%20on%20colorful%20advertising%20materials%2C%20high-tech%20manufacturing%20environment&image_size=landscape_16_9',
  'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=Advertising%20products%20display%2C%20banners%2C%20posters%2C%20signs%20in%20modern%20showroom&image_size=landscape_16_9'
]

const { Title, Paragraph } = Typography
const { Meta } = Card

const HomePage: React.FC = () => {
  const navigate = useNavigate()
  const { products, loading, setProducts, setCategories, setLoading, setError } = useProductStore()

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    try {
      setLoading(true)
      const response = await getProducts()
      const data = response.data?.results || response.data || []
      setProducts(data)
      
      // 提取分类
      const uniqueCategories = [...new Set(data.map((p: any) => p.category))] as string[]
      setCategories(uniqueCategories)
    } catch (error) {
      console.error('Failed to fetch products:', error)
      setError('加载产品失败')
    } finally {
      setLoading(false)
    }
  }

  const handleViewProduct = (productId: string) => {
    navigate(`/product/${productId}`)
  }

  // const productCategories = categories.map(category => ({
  //   id: category,
  //   name: category,
  //   image: `https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=${encodeURIComponent(`${category} advertising print product`)}&image_size=square`
  // }))

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <Title level={1} className="text-white !mb-6">
              专业数码广告打印服务
            </Title>
            <Paragraph className="text-xl text-blue-100 !mb-8">
              高品质数码打印解决方案，满足您的所有广告需求
            </Paragraph>
            <Space size="large">
              <Button type="primary" size="large" onClick={() => navigate('/products')}>
                浏览产品
              </Button>
              <Button size="large" ghost onClick={() => navigate('/register')}>
                立即注册
              </Button>
            </Space>
          </div>
          <div className="mt-12">
            <Carousel autoplay className="rounded-lg overflow-hidden">
              {bannerImages.map((image, index) => (
                <div key={index} className="h-64 bg-gray-200">
                  <img
                    src={image}
                    alt={`Banner ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </Carousel>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Row gutter={[24, 24]}>
          <Col xs={24} sm={8}>
            <Card hoverable className="text-center h-full">
              <div className="mb-4">
                <ShoppingOutlined className="text-4xl text-blue-500" />
              </div>
              <Title level={4} className="!mb-2">产品展示</Title>
              <Paragraph className="!mb-4">浏览我们的数码广告产品系列</Paragraph>
              <Button type="primary" onClick={() => navigate('/products')}>
                立即浏览
              </Button>
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card hoverable className="text-center h-full">
              <div className="mb-4">
                <ToolOutlined className="text-4xl text-green-500" />
              </div>
              <Title level={4} className="!mb-2">工作订单</Title>
              <Paragraph className="!mb-4">管理和跟踪您的工作订单进度</Paragraph>
              <Button type="primary" onClick={() => navigate('/work-orders')}>
                查看订单
              </Button>
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card hoverable className="text-center h-full">
              <div className="mb-4">
                <SettingOutlined className="text-4xl text-purple-500" />
              </div>
              <Title level={4} className="!mb-2">设备管理</Title>
              <Paragraph className="!mb-4">监控设备状态和生产效率</Paragraph>
              <Button type="primary" onClick={() => navigate('/equipment')}>
                设备监控
              </Button>
            </Card>
          </Col>
        </Row>
      </div>

      {/* Products Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <Title level={2} className="!text-center !mb-12">
          热门产品
        </Title>
        {loading ? (
          <div className="text-center py-12">
            <Spin size="large" />
          </div>
        ) : (
          <Row gutter={[24, 24]}>
            {products.slice(0, 6).map((product) => (
              <Col xs={24} sm={12} lg={8} key={product.id}>
                <Card
                  hoverable
                  cover={
                    <img
                      alt={product.name}
                      src={product.images?.[0] || 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=Default%20product%20image&image_size=square'}
                      className="h-48 object-cover"
                    />
                  }
                  actions={[
                    <Button
                      type="text"
                      icon={<EyeOutlined />}
                      onClick={() => navigate(`/product/${product.id}`)}
                    >
                      查看详情
                    </Button>,
                    <Button
                      type="primary"
                      icon={<ShoppingCartOutlined />}
                      onClick={() => handleViewProduct(product.id)}
                    >
                      立即下单
                    </Button>,
                  ]}
                >
                  <Meta
                    title={product.name}
                    description={`¥${product.basePrice?.toFixed(2) || '0.00'}`}
                  />
                  <Paragraph className="!mt-2 !mb-0" type="secondary">
                    {product.description}
                  </Paragraph>
                </Card>
              </Col>
            ))}
          </Row>
        )}

        <div className="text-center mt-12">
          <Button type="primary" size="large" onClick={() => navigate('/products')}>
            查看更多产品
          </Button>
        </div>
      </div>
    </div>
  )
}

export default HomePage