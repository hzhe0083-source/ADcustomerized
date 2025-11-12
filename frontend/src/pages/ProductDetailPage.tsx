import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, Row, Col, Typography, Button, InputNumber, message, Select, Divider } from 'antd'
import { ShoppingCartOutlined, ArrowLeftOutlined } from '@ant-design/icons'
import { getProductById } from '@/services/api'
import { useCartStore } from '@/store/cartStore'
import { useProductStore } from '@/store/productStore'

const { Title, Text, Paragraph } = Typography
const { Option } = Select

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const addItem = useCartStore((state) => state.addItem)
  const selectProduct = useProductStore((state) => state.selectProduct)
  const selectedProduct = useProductStore((state) => state.selectedProduct)
  const [loading, setLoading] = useState(true)
  const [selectedConfigs, setSelectedConfigs] = useState<Record<string, any>>({})
  const [quantity, setQuantity] = useState(1)
  const [calculatedPrice, setCalculatedPrice] = useState(0)

  useEffect(() => {
    const fetchProduct = async () => {
      if (id) {
        try {
          setLoading(true)
          const response = await getProductById(id)
          console.log('Product fetched:', response)
          selectProduct(response.data)
          setCalculatedPrice(response.data?.basePrice || 0)
        } catch (error) {
          console.error('Error fetching product:', error)
          message.error('获取产品信息失败')
          navigate('/')
        } finally {
          setLoading(false)
        }
      }
    }
    
    fetchProduct()
  }, [id, navigate, selectProduct])

  useEffect(() => {
    console.log('Price calculation triggered:', { selectedProduct, selectedConfigs, quantity })
    if (selectedProduct) {
      const basePrice = selectedProduct.basePrice || 0
      let configPrice = 0
      
      // 只计算有效的配置价格
      Object.values(selectedConfigs).forEach((value: any) => {
        if (value && value.price && typeof value.price === 'number') {
          configPrice += value.price
          console.log('Adding config price:', value.price)
        }
      })
      
      const newPrice = (basePrice + configPrice) * quantity
      console.log('New calculated price:', newPrice)
      setCalculatedPrice(newPrice)
    } else {
      console.log('No product found, skipping price calculation')
    }
  }, [selectedProduct, selectedConfigs, quantity])

  const handleConfigChange = (configId: string, option: any) => {
    console.log('Config changed:', configId, option)
    if (option && option.id) {
      setSelectedConfigs(prev => ({
        ...prev,
        [configId]: option
      }))
    } else {
      // 如果option为null或undefined，移除该配置
      setSelectedConfigs(prev => {
        const newConfigs = { ...prev }
        delete newConfigs[configId]
        return newConfigs
      })
    }
  }
  
  // 处理数量变化
  const handleQuantityChange = (value: number | null) => {
    if (value && value > 0) {
      setQuantity(value)
    } else if (value === null) {
      setQuantity(1)
    }
  }
  
  // 获取配置的总价格
  const getConfigTotalPrice = () => {
    let configPrice = 0
    Object.values(selectedConfigs).forEach((value: any) => {
      if (value && value.price && typeof value.price === 'number') {
        configPrice += value.price
      }
    })
    return configPrice
  }
  
  // 检查是否可以添加到购物车
  const canAddToCart = () => {
    if (!selectedProduct) return false
    
    const requiredConfigs = selectedProduct.configs?.filter((config: any) => config.required) || []
    const hasAllRequiredConfigs = requiredConfigs.every((config: any) => selectedConfigs[config.id])
    
    return hasAllRequiredConfigs && quantity > 0 && quantity <= (selectedProduct.stock || 999) && (selectedProduct.stock || 0) > 0
  }
  
  // 获取库存状态信息
  const getStockStatus = () => {
    if (!selectedProduct || selectedProduct.stock === undefined || selectedProduct.stock === null) return { text: '缺货', color: 'text-red-500' }
    if (selectedProduct.stock === 0) return { text: '缺货', color: 'text-red-500' }
    if (selectedProduct.stock < 10) return { text: '库存紧张', color: 'text-orange-500' }
    return { text: '有货', color: 'text-green-500' }
  }
  
  // 获取产品特色列表
  const getProductFeatures = () => {
    if (!selectedProduct || !selectedProduct.features) {
      return ['高品质打印效果', '耐候性强', '色彩鲜艳持久', '环保材料']
    }
    return selectedProduct.features
  }
  
  // 格式化价格显示
  const formatPrice = (price: number) => {
    return `¥${price.toFixed(2)}`
  }
  
  // 处理图片预览
  const handleImagePreview = (imageUrl: string) => {
    if (!imageUrl) return
    
    const modal = document.createElement('div')
    modal.className = 'fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50'
    modal.innerHTML = `
      <div class="relative max-w-4xl max-h-full p-4">
        <img src="${imageUrl}" alt="产品图片" class="max-w-full max-h-full object-contain" />
        <button class="absolute top-4 right-4 text-white text-2xl font-bold bg-black bg-opacity-50 rounded-full w-10 h-10 flex items-center justify-center hover:bg-opacity-75">
          ×
        </button>
      </div>
    `
    
    document.body.appendChild(modal)
    
    const closeModal = () => {
      document.body.removeChild(modal)
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = ''
    }
    
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeModal()
      }
    }
    
    modal.addEventListener('click', (e) => {
      if (e.target === modal || (e.target as HTMLElement).textContent === '×') {
        closeModal()
      }
    })
    
    document.addEventListener('keydown', handleEscape)
    
    // 防止背景滚动
    document.body.style.overflow = 'hidden'
  }
  
  // 添加到购物车
  const handleAddToCart = () => {
    if (!canAddToCart()) {
      message.warning('请选择所有必填配置')
      return
    }
    
    const cartItem = {
      id: selectedProduct?.id || '',
      productId: selectedProduct?.id || '',
      productName: selectedProduct?.name || '',
      price: calculatedPrice,
      quantity: quantity,
      configData: selectedConfigs,
      image: selectedProduct?.images?.[0] || '',
    }
    
    addItem(cartItem)
    message.success('已添加到购物车')
  }
  
  // 立即购买
  const handleBuyNow = () => {
    if (!canAddToCart()) {
      message.warning('请选择所有必填配置')
      return
    }
    
    const cartItem = {
      id: selectedProduct?.id || '',
      productId: selectedProduct?.id || '',
      productName: selectedProduct?.name || '',
      price: calculatedPrice,
      quantity: quantity,
      configData: selectedConfigs,
      image: selectedProduct?.images?.[0] || '',
    }
    
    addItem(cartItem)
    navigate('/cart')
  }
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="text-lg text-gray-500">加载中...</div>
      </div>
    )
  }
  
  if (!selectedProduct) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="text-lg text-red-500">产品不存在</div>
      </div>
    )
  }
  
  const stockStatus = getStockStatus()
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* 返回按钮 */}
        <div className="mb-6">
          <Button 
            type="text" 
            icon={<ArrowLeftOutlined />} 
            onClick={() => navigate(-1)}
            className="text-gray-600 hover:text-gray-800"
          >
            返回
          </Button>
        </div>
        
        {/* 产品详情主体 */}
        <Card className="shadow-lg">
          <Row gutter={[32, 32]}>
            {/* 产品图片 */}
            <Col xs={24} lg={12}>
              <div className="space-y-4">
                {/* 主图片 */}
                <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={selectedProduct.images?.[0] || 'https://via.placeholder.com/600x600?text=产品图片'}
                    alt={selectedProduct.name}
                    className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform duration-300"
                    onClick={() => handleImagePreview(selectedProduct.images?.[0] || '')}
                  />
                </div>
                
                {/* 缩略图 */}
                {selectedProduct.images && selectedProduct.images.length > 1 && (
                  <div className="flex space-x-2 overflow-x-auto">
                    {selectedProduct.images.slice(1).map((image: string, index: number) => (
                      <div key={index} className="w-16 h-16 bg-gray-100 rounded cursor-pointer flex-shrink-0">
                        <img
                          src={image}
                          alt={`${selectedProduct.name} ${index + 2}`}
                          className="w-full h-full object-cover rounded"
                          onClick={() => handleImagePreview(image)}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Col>
            
            {/* 产品信息 */}
            <Col xs={24} lg={12}>
              <div className="space-y-6">
                {/* 基本信息 */}
                <div>
                  <Title level={2} className="!mb-2">{selectedProduct.name}</Title>
                  <Paragraph className="text-gray-600 !mb-4">{selectedProduct.description}</Paragraph>
                  
                  <div className="flex items-center space-x-4 mb-4">
                    <Text className={`text-lg font-semibold ${stockStatus.color}`}>
                      {stockStatus.text}
                    </Text>
                    {selectedProduct.stock !== undefined && selectedProduct.stock !== null && (
                      <Text className="text-gray-500">库存: {selectedProduct.stock}</Text>
                    )}
                  </div>
                </div>
                
                {/* 价格显示 */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-baseline space-x-2 mb-2">
                    <Text className="text-2xl font-bold text-red-600">
                      {formatPrice(calculatedPrice)}
                    </Text>
                    {calculatedPrice !== (selectedProduct.basePrice || 0) && (
                      <Text className="text-gray-500 line-through">
                        {formatPrice((selectedProduct.basePrice || 0) * quantity)}
                      </Text>
                    )}
                  </div>
                  
                  <div className="text-sm text-gray-600 space-y-1">
                    <div>基础价格: {formatPrice(selectedProduct.basePrice || 0)}</div>
                    {getConfigTotalPrice() > 0 && (
                      <div>配置加价: +{formatPrice(getConfigTotalPrice())}</div>
                    )}
                    <div>数量: {quantity}</div>
                  </div>
                </div>
                
                {/* 产品配置 */}
                {selectedProduct.configs && selectedProduct.configs.length > 0 && (
                  <div className="space-y-4">
                    <Title level={4}>产品配置</Title>
                    {selectedProduct.configs.map((config: any) => (
                      <div key={config.id} className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Text className="font-medium">{config.name}</Text>
                          {config.required && <Text className="text-red-500 text-sm">*</Text>}
                        </div>
                        
                        <Select
                          style={{ width: '100%' }}
                          placeholder={`请选择${config.name}`}
                          onChange={(value) => {
                            const option = config.options.find((opt: any) => opt.id === value)
                            handleConfigChange(config.id, option)
                          }}
                          allowClear={!config.required}
                        >
                          {config.options.map((option: any) => (
                            <Option key={option.id} value={option.id}>
                              <div className="flex justify-between items-center">
                                <span>{option.name}</span>
                                <span className="text-gray-500">
                                  {option.price > 0 ? `+¥${option.price.toFixed(2)}` : '免费'}
                                </span>
                              </div>
                            </Option>
                          ))}
                        </Select>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* 数量选择 */}
                <div className="space-y-2">
                  <Text className="font-medium">数量</Text>
                  <InputNumber
                    min={1}
                    max={selectedProduct.stock || 999}
                    value={quantity}
                    onChange={handleQuantityChange}
                    className="w-32"
                  />
                </div>
                
                {/* 产品特色 */}
                <div className="space-y-2">
                  <Title level={4}>产品特色</Title>
                  <div className="grid grid-cols-2 gap-2">
                    {getProductFeatures().map((feature: string, index: number) => (
                      <div key={index} className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <Text className="text-sm">{feature}</Text>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* 操作按钮 */}
                <div className="space-y-3">
                  <Button
                    type="primary"
                    size="large"
                    block
                    icon={<ShoppingCartOutlined />}
                    onClick={handleAddToCart}
                    disabled={!canAddToCart()}
                    className="bg-blue-600 hover:bg-blue-700 border-blue-600"
                  >
                    加入购物车
                  </Button>
                  
                  <Button
                    type="default"
                    size="large"
                    block
                    onClick={handleBuyNow}
                    disabled={!canAddToCart()}
                    className="border-blue-600 text-blue-600 hover:bg-blue-50"
                  >
                    立即购买
                  </Button>
                </div>
              </div>
            </Col>
          </Row>
        </Card>
        
        {/* 产品详情描述 */}
        {selectedProduct.details && (
          <Card className="mt-8 shadow-lg">
            <Title level={3}>产品详情</Title>
            <Divider />
            <div className="prose max-w-none">
              <Paragraph>
                {selectedProduct.details}
              </Paragraph>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}

export default ProductDetailPage