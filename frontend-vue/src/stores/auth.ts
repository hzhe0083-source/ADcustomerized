import { defineStore } from 'pinia'

interface User { id: string; username: string; email?: string }

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: (localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user') as string) : null) as User | null,
    token: localStorage.getItem('token') as string | null,
  }),
  getters: {
    isAuthenticated: (s) => !!s.token,
  },
  actions: {
    setAuth(user: User, token: string){
      this.user = user
      this.token = token
      localStorage.setItem('user', JSON.stringify(user))
      localStorage.setItem('token', token)
    },
    logout(){
      this.user = null
      this.token = null
      localStorage.removeItem('user')
      localStorage.removeItem('token')
    }
  }
})

