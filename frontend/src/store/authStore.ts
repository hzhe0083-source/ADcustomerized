import { create } from 'zustand'
import { User, Role, Permission } from '../types/auth'

interface AuthState {
  user: User | null
  token: string | null
  permissions: string[]
  isAuthenticated: boolean
  loading: boolean
  
  // 用户管理
  users: User[]
  
  // 角色管理
  roles: Role[]
  
  // 权限管理
  allPermissions: Permission[]
  
  // Actions
  login: (user: User, token: string, permissions: string[]) => void
  logout: () => void
  setUser: (user: User | null) => void
  setToken: (token: string | null) => void
  setPermissions: (permissions: string[]) => void
  setLoading: (loading: boolean) => void
  
  // 用户管理
  setUsers: (users: User[]) => void
  addUser: (user: User) => void
  updateUser: (id: string, user: Partial<User>) => void
  deleteUser: (id: string) => void
  
  // 角色管理
  setRoles: (roles: Role[]) => void
  addRole: (role: Role) => void
  updateRole: (id: string, role: Partial<Role>) => void
  deleteRole: (id: string) => void
  
  // 权限管理
  setAllPermissions: (permissions: Permission[]) => void
  addPermission: (permission: Permission) => void
  updatePermission: (id: string, permission: Partial<Permission>) => void
  deletePermission: (id: string) => void
  
  // 权限检查
  hasPermission: (permissionCode: string) => boolean
  hasAnyPermission: (permissionCodes: string[]) => boolean
  hasAllPermissions: (permissionCodes: string[]) => boolean
  hasRole: (roleName: string) => boolean
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  permissions: [],
  isAuthenticated: false,
  loading: false,
  users: [],
  roles: [],
  allPermissions: [],
  
  login: (user, token, permissions) => set({
    user,
    token,
    permissions,
    isAuthenticated: true,
    loading: false
  }),
  
  logout: () => set({
    user: null,
    token: null,
    permissions: [],
    isAuthenticated: false,
    loading: false
  }),
  
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  setToken: (token) => set({ token }),
  setPermissions: (permissions) => set({ permissions }),
  setLoading: (loading) => set({ loading }),
  
  // 用户管理
  setUsers: (users) => set({ users }),
  addUser: (user) => set((state) => ({ users: [...state.users, user] })),
  updateUser: (id, user) => set((state) => ({
    users: state.users.map((u) => u.id === id ? { ...u, ...user } : u)
  })),
  deleteUser: (id) => set((state) => ({
    users: state.users.filter((user) => user.id !== id)
  })),
  
  // 角色管理
  setRoles: (roles) => set({ roles }),
  addRole: (role) => set((state) => ({ roles: [...state.roles, role] })),
  updateRole: (id, role) => set((state) => ({
    roles: state.roles.map((r) => r.id === id ? { ...r, ...role } : r)
  })),
  deleteRole: (id) => set((state) => ({
    roles: state.roles.filter((role) => role.id !== id)
  })),
  
  // 权限管理
  setAllPermissions: (permissions) => set({ allPermissions: permissions }),
  addPermission: (permission) => set((state) => ({ 
    allPermissions: [...state.allPermissions, permission] 
  })),
  updatePermission: (id, permission) => set((state) => ({
    allPermissions: state.allPermissions.map((p) => 
      p.id === id ? { ...p, ...permission } : p
    )
  })),
  deletePermission: (id) => set((state) => ({
    allPermissions: state.allPermissions.filter((permission) => permission.id !== id)
  })),
  
  // 权限检查
  hasPermission: (permissionCode) => {
    const { permissions } = get()
    return permissions.includes(permissionCode)
  },
  
  hasAnyPermission: (permissionCodes) => {
    const { permissions } = get()
    return permissionCodes.some(code => permissions.includes(code))
  },
  
  hasAllPermissions: (permissionCodes) => {
    const { permissions } = get()
    return permissionCodes.every(code => permissions.includes(code))
  },
  
  hasRole: (roleName) => {
    const { user } = get()
    if (!user) return false
    const role = get().roles.find(r => r.id === user.roleId)
    return role?.name === roleName
  }
}))
