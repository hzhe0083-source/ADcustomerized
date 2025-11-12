import React from 'react'
import { Layout, Menu, Button, Badge, Dropdown, Space } from 'antd'
import { ShoppingCartOutlined, UserOutlined, LoginOutlined, LogoutOutlined, UserAddOutlined, FileTextOutlined, MenuOutlined, ToolOutlined, SettingOutlined } from '@ant-design/icons'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { useCartStore } from '@/store/cartStore'

const { Header: AntHeader } = Layout
// const { Text } = Typography

const Header: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuthStore()
  const { items } = useCartStore()

  const cartItemCount = items.reduce((sum, item) => sum + item.quantity, 0)

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const menuItems = [
    { key: '/', label: '首页' },
    { key: '/customers', label: '客户管理' },
    { key: '/employees', label: '员工管理' },
    { key: '/suppliers', label: '供应商管理' },
    { key: '/materials', label: '材料库存' },
    { key: '/production-plans', label: '生产计划' },
    { key: '/quality-control', label: '质量控制' },
      { key: '/reports', label: '报表统计' },
      { key: '/products', label: '产品中心' },
    { key: '/about', label: '关于我们' },
    { key: '/contact', label: '联系我们' },
  ]

  const userMenuItems = [
    {
      key: 'orders',
      icon: <FileTextOutlined />,
      label: '我的订单',
      onClick: () => navigate('/order/list'),
    },
    {
      key: 'work-orders',
      icon: <ToolOutlined />,
      label: '工作订单',
      onClick: () => navigate('/work-orders'),
    },
    {
      key: 'equipment',
      icon: <SettingOutlined />,
      label: '设备管理',
      onClick: () => navigate('/equipment'),
    },
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '个人资料',
      onClick: () => navigate('/profile'),
    },
    {
      type: 'divider' as const,
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: handleLogout,
    },
  ]

  return (
    <AntHeader className="bg-white shadow-md px-4 fixed top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <div
          className="text-2xl font-bold text-blue-600 cursor-pointer"
          onClick={() => navigate('/')}
        >
          ADPrinting
        </div>

        {/* 导航菜单 */}
        <Menu
          mode="horizontal"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
          className="flex-1 border-none min-w-0 hidden md:flex"
        />

        {/* 右侧操作区 */}
        <div className="flex items-center space-x-4">
          {/* 购物车 */}
          <Badge count={cartItemCount} showZero overflowCount={99}>
            <Button
              type="text"
              icon={<ShoppingCartOutlined />}
              onClick={() => navigate('/cart')}
              className="flex items-center"
            />
          </Badge>

          {/* 用户菜单 */}
          {user ? (
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <Button type="text" icon={<UserOutlined />}>
                {user.name}
              </Button>
            </Dropdown>
          ) : (
            <Space>
              <Button
                type="primary"
                ghost
                icon={<UserAddOutlined />}
                onClick={() => navigate('/register')}
              >
                注册
              </Button>
              <Button
                type="primary"
                icon={<LoginOutlined />}
                onClick={() => navigate('/login')}
              >
                登录
              </Button>
            </Space>
          )}

          {/* Mobile Menu */}
          <div className="md:hidden">
            <Button
              type="text"
              icon={<MenuOutlined />}
              onClick={() => {
                // 处理移动端菜单显示
              }}
            />
          </div>
        </div>
      </div>
    </AntHeader>
  )
}

export default Header
