import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Card, Form, Input, Button, Typography, message, Row, Col } from 'antd'
import { UserOutlined, LockOutlined, LoginOutlined } from '@ant-design/icons'
import { login } from '@/services/api'
import { useAuthStore } from '@/store/authStore'

const { Title, Text } = Typography

const LoginPage: React.FC = () => {
  const navigate = useNavigate()
  const { login: setAuth } = useAuthStore()
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (values: { username: string; password: string }) => {
    try {
      setLoading(true)
      const response = await login({ username: values.username, password: values.password })
      
      // 使用Zustand保存用户信息
      setAuth(response.data.user, response.data.access)
      
      message.success('登录成功！')
      navigate('/')
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || '登录失败'
      message.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <Title level={2} className="text-gray-900">
            欢迎回来
          </Title>
          <Text type="secondary">
            请登录您的账户以继续
          </Text>
        </div>

        <Card className="shadow-lg">
          <div className="p-6">
            <Form
              name="login"
              onFinish={handleSubmit}
              layout="vertical"
              size="large"
            >
              <Form.Item
                name="username"
                label="用户名"
                rules={[
                  { required: true, message: '请输入用户名' },
                  { min: 3, message: '用户名至少3个字符' }
                ]}
              >
                <Input
                  prefix={<UserOutlined className="text-gray-400" />}
                  placeholder="请输入用户名"
                  className="rounded-lg"
                />
              </Form.Item>

              <Form.Item
                name="password"
                label="密码"
                rules={[
                  { required: true, message: '请输入密码' },
                  { min: 6, message: '密码至少6个字符' }
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined className="text-gray-400" />}
                  placeholder="请输入密码"
                  className="rounded-lg"
                />
              </Form.Item>

              <Form.Item className="mb-4">
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  icon={<LoginOutlined />}
                  className="w-full rounded-lg h-12"
                  size="large"
                >
                  登录
                </Button>
              </Form.Item>

              <div className="text-center">
                <Text type="secondary">
                  还没有账户？
                </Text>
                <Link to="/register" className="text-blue-600 hover:text-blue-500 ml-1">
                  立即注册
                </Link>
              </div>
            </Form>
          </div>
        </Card>

        {/* 其他登录方式 */}
        <div className="mt-6 text-center">
          <Text type="secondary" className="block mb-4">
            或使用以下方式登录
          </Text>
          <Row gutter={16} justify="center">
            <Col>
              <Button type="default" size="large" className="rounded-lg">
                微信登录
              </Button>
            </Col>
            <Col>
              <Button type="default" size="large" className="rounded-lg">
                支付宝登录
              </Button>
            </Col>
          </Row>
        </div>

        {/* 底部链接 */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <Link to="/forgot-password" className="hover:text-gray-700">
            忘记密码？
          </Link>
          <span className="mx-2">|</span>
          <Link to="/help" className="hover:text-gray-700">
            帮助中心
          </Link>
        </div>
      </div>
    </div>
  )
}

export default LoginPage