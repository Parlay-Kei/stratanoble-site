'use client'

import { usePathname, useRouter } from 'next/navigation'
import { Button } from '@strata-noble/ui'
import { 
  Home, 
  PlusCircle, 
  BarChart3, 
  User, 
  LogOut 
} from 'lucide-react'
import { useAuth } from '../../app/providers'

const navItems = [
  { href: '/dashboard', icon: Home, label: 'Dashboard' },
  { href: '/actions', icon: PlusCircle, label: 'Log Action' },
  { href: '/progress', icon: BarChart3, label: 'Progress' },
  { href: '/profile', icon: User, label: 'Profile' },
]

export function MobileNavigation() {
  const pathname = usePathname()
  const router = useRouter()
  const { signOut } = useAuth()

  const handleSignOut = async () => {
    try {
      await signOut()
      router.push('/auth')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          
          return (
            <Button
              key={item.href}
              variant={isActive ? "default" : "ghost"}
              size="sm"
              onClick={() => router.push(item.href)}
              className={`flex flex-col items-center space-y-1 h-12 px-3 ${
                isActive 
                  ? 'text-white' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs font-medium">{item.label}</span>
            </Button>
          )
        })}
        
        {/* Sign out button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleSignOut}
          className="flex flex-col items-center space-y-1 h-12 px-3 text-red-600 hover:text-red-700"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-xs font-medium">Sign Out</span>
        </Button>
      </div>
    </div>
  )
}