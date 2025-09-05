import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  variant?: 'full' | 'icon';
  theme?: 'default' | 'white';
}

export function Logo({ className, variant = 'icon', theme = 'default' }: LogoProps) {
  // For the white theme in footer, apply CSS filter to make the logo white
  const logoClasses = cn(
    'w-auto h-full',
    theme === 'white' && 'brightness-0 invert'
  );

  if (variant === 'icon') {
    // For cases where we need just the icon part without text - using branding logo file
    return (
      <div className={cn('flex items-center')}>
        <img
          src="/stratanoble_logoICON.svg"
          alt="Strata Noble Logo"
          className={cn('w-16 h-16', theme === 'white' && 'brightness-0 invert', className)}
        />
      </div>
    );
  }

  if (variant === 'full') {
    // For cases where we need the full logo with text - using full branding logo file
    return (
      <div className={cn('flex items-center')}>
        <img
          src="/strata_noble_logo.svg"
          alt="Strata Noble Logo"
          className={cn('w-20 h-20', theme === 'white' && 'brightness-0 invert', className)}
        />
      </div>
    );
  }

  // Default theme - using icon logo file for header/footer
  return (
    <div className={cn('flex items-center')}>
      <img
        src="/stratanoble_logoICON.svg"
        alt="Strata Noble Logo"
        className={cn('w-20 h-20', theme === 'white' && 'brightness-0 invert', className)}
      />
    </div>
  );
}
