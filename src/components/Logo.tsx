import { cn } from '@/lib/utils'

interface LogoProps {
  className?: string
}

export function Logo({ className }: LogoProps) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className="flex items-center">
        <span className="text-2xl font-bold text-navy">
          Strata
        </span>
        <span className="text-2xl font-bold text-emerald">
          Noble
        </span>
      </div>
    </div>
  )
} 