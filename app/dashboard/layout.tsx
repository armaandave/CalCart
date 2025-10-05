'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useUserStore } from '@/lib/stores/userStore'
import { Button } from '@/components/ui/button'
import { ChefHat, Home, ShoppingBag, List, LogOut, User, Settings } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuItem
} from '@/components/ui/dropdown-menu'

export default function DashboardLayout({
  children
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const { user, isAuthenticated, fetchUser, logout } = useUserStore()

  useEffect(() => {
    if (!isAuthenticated) {
      fetchUser().catch((error) => {
        console.error('Failed to fetch user:', error)
        // Only redirect to login if we're sure there's no auth
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
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-center items-center relative">
            {/* Centered Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/dashboard" className="flex items-center gap-1.5 text-gray-600 hover:text-primary transition-colors">
                <Home className="h-4 w-4" />
                <span className="text-sm font-medium">Dashboard</span>
              </Link>
              <Link href="/dashboard/recipes" className="flex items-center gap-1.5 text-gray-600 hover:text-primary transition-colors">
                <ChefHat className="h-4 w-4" />
                <span className="text-sm font-medium">Recipes</span>
              </Link>
              <Link href="/dashboard/grocery-lists" className="flex items-center gap-1.5 text-gray-600 hover:text-primary transition-colors">
                <ShoppingBag className="h-4 w-4" />
                <span className="text-sm font-medium">Grocery List</span>
              </Link>
            </nav>

            {/* Profile dropdown - absolute positioned to the right */}
            <div className="absolute right-0">
              <DropdownMenu>
                <DropdownMenuTrigger>
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors">
                    <User className="h-5 w-5" />
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuLabel>
                    <div className="font-normal">
                      <div className="text-xs text-gray-500">Signed in as</div>
                      <div className="font-medium text-gray-900 truncate">{user.email}</div>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuItem onClick={() => router.push('/dashboard/profile')}>
                    <Settings className="h-4 w-4 mr-2" />
                    Profile Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {children}
      </main>
    </div>
  )
}

