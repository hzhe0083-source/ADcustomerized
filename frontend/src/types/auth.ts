export interface User {
  id: string
  username: string
  email: string
  phone?: string
  avatar?: string
  status: 'active' | 'inactive' | 'suspended'
  roleId: string
  department?: string
  position?: string
  lastLoginAt?: string
  createdAt: string
  updatedAt: string
}

export interface Role {
  id: string
  name: string
  description: string
  permissions: Permission[]
  status: 'active' | 'inactive'
  createdAt: string
  updatedAt: string
}

export interface Permission {
  id: string
  name: string
  code: string
  description: string
  module: string
  action: 'view' | 'create' | 'update' | 'delete' | 'approve' | 'export'
  status: 'active' | 'inactive'
  createdAt: string
  updatedAt: string
}

export interface PermissionGroup {
  module: string
  permissions: Permission[]
}

export interface UserFormData {
  username: string
  email: string
  phone?: string
  password?: string
  roleId: string
  department?: string
  position?: string
  status: User['status']
}

export interface RoleFormData {
  name: string
  description: string
  permissionIds: string[]
  status: Role['status']
}

export interface LoginCredentials {
  username: string
  password: string
  rememberMe?: boolean
}

export interface AuthResponse {
  user: User
  token: string
  refreshToken: string
  permissions: string[]
  expiresIn: number
}