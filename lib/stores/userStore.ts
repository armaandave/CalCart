import { create } from 'zustand'
import { User, UserProfile } from '@prisma/client'

interface UserStore {
  user: (User & { profile: UserProfile | null }) | null
  isAuthenticated: boolean
  isLoading: boolean
  
  setUser: (user: User & { profile: UserProfile | null }) => void
  clearUser: () => void
  login: (email: string, password: string) => Promise<void>
  signup: (email: string, password: string, profile?: Partial<UserProfile>) => Promise<void>
  logout: () => Promise<void>
  fetchUser: () => Promise<void>
  updateProfile: (profile: Partial<UserProfile>) => Promise<void>
}

export const useUserStore = create<UserStore>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,

  setUser: (user) => set({ user, isAuthenticated: true }),
  
  clearUser: () => set({ user: null, isAuthenticated: false }),

  login: async (email, password) => {
    set({ isLoading: true })
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Login failed')
      }

      const data = await response.json()
      set({ user: data.user, isAuthenticated: true })
    } catch (error) {
      console.error('Login error:', error)
      throw error
    } finally {
      set({ isLoading: false })
    }
  },

  signup: async (email, password, profile) => {
    set({ isLoading: true })
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, profile })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Signup failed')
      }

      const data = await response.json()
      set({ user: data.user, isAuthenticated: true })
    } catch (error) {
      console.error('Signup error:', error)
      throw error
    } finally {
      set({ isLoading: false })
    }
  },

  logout: async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      set({ user: null, isAuthenticated: false })
    } catch (error) {
      console.error('Logout error:', error)
      throw error
    }
  },

  fetchUser: async () => {
    set({ isLoading: true })
    try {
      const response = await fetch('/api/auth/me')
      
      if (response.ok) {
        const data = await response.json()
        set({ user: data.user, isAuthenticated: true })
      } else {
        set({ user: null, isAuthenticated: false })
      }
    } catch (error) {
      console.error('Fetch user error:', error)
      set({ user: null, isAuthenticated: false })
    } finally {
      set({ isLoading: false })
    }
  },

  updateProfile: async (profileData) => {
    const { user } = get()
    if (!user || !user.profile) return

    try {
      const response = await fetch('/api/auth/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData)
      })

      if (!response.ok) {
        throw new Error('Failed to update profile')
      }

      const data = await response.json()
      set({ user: { ...user, profile: data.profile } })
    } catch (error) {
      console.error('Update profile error:', error)
      throw error
    }
  }
}))

