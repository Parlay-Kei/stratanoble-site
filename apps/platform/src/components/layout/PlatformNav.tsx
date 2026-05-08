'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '../../app/providers'

interface PlatformNavProps {
  actor?: 'operator' | 'client'
}

export function PlatformNav({ actor }: PlatformNavProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { signOut } = useAuth()

  const handleSignOut = async () => {
    try {
      await signOut()
      router.push('/auth')
    } catch {
      router.push('/auth')
    }
  }

  const links = actor === 'client'
    ? [
        { href: '/platform/client', label: 'My Portal' },
        { href: '/platform/actions', label: 'Log action' },
      ]
    : [
        { href: '/dashboard', label: 'Dashboard' },
        { href: '/platform/actions', label: 'Log action' },
        { href: '/platform/systems', label: 'Systems' },
        { href: '/platform/proof', label: 'Proof ledger' },
      ]

  return (
    <nav className="border-b border-gray-200 bg-white px-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between h-12">
        <div className="flex items-center gap-6">
          {links.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-medium transition-colors ${
                pathname === link.href || pathname.startsWith(link.href + '/')
                  ? 'text-gray-900'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
        <button
          onClick={handleSignOut}
          className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
        >
          Sign out
        </button>
      </div>
    </nav>
  )
}
