'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useUserStore } from '@/lib/stores/userStore'
import { Button } from '@/components/ui/button'
import { ChefHat, Home, ShoppingBag, List, LogOut } from 'lucide-react'

export default function DashboardLayout({
  children
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const { user, isAuthenticated, fetchUser, logout } = useUserStore()

  useEffect(() => {
    if (!isAuthenticated) {
      fetchUser().catch(() => {
        router.push('/login')
      })
    }
  }, [isAuthenticated, fetchUser, router])

  const handleLogout = async () => {
    await logout()
    router.push('/')
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <ChefHat className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-primary">Recipe Optimizer</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{user.email}</span>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 flex gap-8">
        {/* Sidebar */}
        <aside className="w-64 flex-shrink-0">
          <nav className="space-y-2">
            <Link href="/dashboard">
              <Button variant="ghost" className="w-full justify-start">
                <Home className="h-4 w-4 mr-2" />
                Dashboard
              </Button>
            </Link>
            <Link href="/dashboard/recipes">
              <Button variant="ghost" className="w-full justify-start">
                <ChefHat className="h-4 w-4 mr-2" />
                My Recipes
              </Button>
            </Link>
            <Link href="/dashboard/grocery-lists">
              <Button variant="ghost" className="w-full justify-start">
                <List className="h-4 w-4 mr-2" />
                Grocery Lists
              </Button>
            </Link>
            <Link href="/dashboard/stores">
              <Button variant="ghost" className="w-full justify-start">
                <ShoppingBag className="h-4 w-4 mr-2" />
                Stores
              </Button>
            </Link>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1">{children}</main>
      </div>
    </div>
  )
}

