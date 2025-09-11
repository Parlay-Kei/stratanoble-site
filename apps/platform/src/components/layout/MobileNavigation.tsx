'use client'

import { usePathname, useRouter } from 'next/navigation'
import { Button } from '@strata-noble/ui'
import { 
  Home, 
  PlusCircle, 
  BarChart3, 
  Map,
  Shield,
  FileText,
  User, 
  LogOut 
} from 'lucide-react'
import { useAuth } from '../../app/providers'

const navItems = [
  { href: '/dashboard', icon: Home, label: 'Dashboard' },
  { href: '/actions', icon: PlusCircle, label: 'Actions' },
  { href: '/roadmap', icon: Map, label: 'Roadmap' },
  { href: '/narratives', icon: FileText, label: 'Narratives' },
  { href: '/trust-ledger', icon: Shield, label: 'Trust' },
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
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-2 py-2">
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          
          return (
            <Button
              key={item.href}
              variant={isActive ? "primary" : "outline"}
              size="sm"
              onClick={() => router.push(item.href)}
              className={`flex flex-col items-center space-y-1 h-12 px-2 ${
                isActive 
                  ? 'text-white' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="text-xs font-medium">{item.label}</span>
            </Button>
          )
        })}
        
        {/* Sign out button */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleSignOut}
          className="flex flex-col items-center space-y-1 h-12 px-2 text-red-600 hover:text-red-700"
        >
          <LogOut className="w-4 h-4" />
          <span className="text-xs font-medium">Out</span>
        </Button>
      </div>
    </div>
  )
}
