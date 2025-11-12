import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Card, Form, Input, Button, Typography, message, Row, Col } from 'antd'
import { UserOutlined, LockOutlined, MailOutlined, PhoneOutlined } from '@ant-design/icons'
import { register } from '@/services/api'
import { useAuthStore } from '@/store/authStore'

const { Title, Text } = Typography

const RegisterPage: React.FC = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const { setLoading: setAuthLoading } = useAuthStore()

  const handleSubmit = async (values: {
    username: string
    password: string
    confirmPassword: string
    email: string
    phone: string
    name: string
  }) => {
    try {
      setLoading(true)
      setAuthLoading(true)
      
      const { confirmPassword, ...registerData } = values
      await register(registerData)
      
      message.success('注册成功！请登录')
      navigate('/login')
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || '注册失败'
      message.error(errorMessage)
    } finally {
      setLoading(false)
      setAuthLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <Title level={2} className="text-gray-900">
            创建账户
          </Title>
          <Text type="secondary">
            加入我们，享受专业的数码打印服务
          </Text>
        </div>

        <Card className="shadow-lg">
          <div className="p-6">
            <Form
              name="register"
              onFinish={handleSubmit}
              layout="vertical"
              size="large"
            >
              <Form.Item
                name="name"
                label="姓名"
                rules={[
                  { required: true, message: '请输入姓名' },
                  { min: 2, message: '姓名至少2个字符' }
                ]}
              >
                <Input
                  prefix={<UserOutlined className="text-gray-400" />}
                  placeholder="请输入您的姓名"
                  className="rounded-lg"
                />
              </Form.Item>

              <Form.Item
                name="username"
                label="用户名"
                rules={[
                  { required: true, message: '请输入用户名' },
                  { min: 3, message: '用户名至少3个字符' },
                  { pattern: /^[a-zA-Z0-9_]+$/, message: '用户名只能包含字母、数字和下划线' }
                ]}
              >
                <Input
                  prefix={<UserOutlined className="text-gray-400" />}
                  placeholder="请输入用户名"
                  className="rounded-lg"
                />
              </Form.Item>

              <Form.Item
                name="email"
                label="邮箱"
                rules={[
                  { required: true, message: '请输入邮箱' },
                  { type: 'email', message: '请输入有效的邮箱地址' }
                ]}
              >
                <Input
                  prefix={<MailOutlined className="text-gray-400" />}
                  placeholder="请输入邮箱地址"
                  className="rounded-lg"
                />
              </Form.Item>

              <Form.Item
                name="phone"
                label="手机号"
                rules={[
                  { required: true, message: '请输入手机号' },
                  { pattern: /^1[3-9]\d{9}$/, message: '请输入有效的手机号' }
                ]}
              >
                <Input
                  prefix={<PhoneOutlined className="text-gray-400" />}
                  placeholder="请输入手机号"
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
                hasFeedback
              >
                <Input.Password
                  prefix={<LockOutlined className="text-gray-400" />}
                  placeholder="请输入密码"
                  className="rounded-lg"
                />
              </Form.Item>

              <Form.Item
                name="confirmPassword"
                label="确认密码"
                dependencies={['password']}
                hasFeedback
                rules={[
                  { required: true, message: '请确认密码' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('password') === value) {
                        return Promise.resolve()
                      }
                      return Promise.reject(new Error('两次输入的密码不一致'))
                    },
                  }),
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined className="text-gray-400" />}
                  placeholder="请再次输入密码"
                  className="rounded-lg"
                />
              </Form.Item>

              <Form.Item className="mb-4">
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  className="w-full rounded-lg h-12"
                  size="large"
                >
                  注册
                </Button>
              </Form.Item>

              <div className="text-center">
                <Text type="secondary">
                  已有账户？
                </Text>
                <Link to="/login" className="text-blue-600 hover:text-blue-500 ml-1">
                  立即登录
                </Link>
              </div>
            </Form>
          </div>
        </Card>

        {/* 其他注册方式 */}
        <div className="mt-6 text-center">
          <Text type="secondary" className="block mb-4">
            或使用以下方式注册
          </Text>
          <Row gutter={16} justify="center">
            <Col>
              <Button type="default" size="large" className="rounded-lg">
                微信注册
              </Button>
            </Col>
            <Col>
              <Button type="default" size="large" className="rounded-lg">
                支付宝注册
              </Button>
            </Col>
          </Row>
        </div>

        {/* 服务条款 */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <Text>
            注册即表示您同意我们的
          </Text>
          <Link to="/terms" className="text-blue-600 hover:text-blue-500 mx-1">
            服务条款
          </Link>
          <Text>和</Text>
          <Link to="/privacy" className="text-blue-600 hover:text-blue-500 mx-1">
            隐私政策
          </Link>
        </div>
      </div>
    </div>
  )
}

export default RegisterPage