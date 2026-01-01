/**
 * Direct Cuts Design System
 * Extracted from reference PDF and brand guidelines
 */

import { DesignSystem } from './types.js';

export const directCutsDesignSystem: DesignSystem = {
  colors: [
    // Brand Colors
    { name: 'brand-red', value: '#E63946', usage: 'Primary CTAs, headers, accents, active states', tailwind: 'brand-red' },
    { name: 'brand-red-dark', value: '#C62828', usage: 'Hover states, pressed states', tailwind: 'brand-red-dark' },
    { name: 'brand-red-light', value: '#FF6B6B', usage: 'Highlights, notifications', tailwind: 'brand-red-light' },
    
    // Surface Colors (Dark Theme)
    { name: 'surface-base', value: '#121212', usage: 'App background', tailwind: 'surface-base' },
    { name: 'surface-primary', value: '#1A1A1A', usage: 'Primary background, navigation', tailwind: 'surface-primary' },
    { name: 'surface-secondary', value: '#2D2D2D', usage: 'Cards, elevated surfaces', tailwind: 'surface-secondary' },
    { name: 'surface-elevated', value: '#3D3D3D', usage: 'Inputs, hover states', tailwind: 'surface-elevated' },
    { name: 'surface-overlay', value: '#4D4D4D', usage: 'Borders, dividers', tailwind: 'surface-overlay' },
    
    // Text Colors
    { name: 'text-primary', value: '#FFFFFF', usage: 'Primary text, headings', tailwind: 'white' },
    { name: 'text-secondary', value: '#9CA3AF', usage: 'Secondary text, captions', tailwind: 'gray-400' },
    { name: 'text-muted', value: '#6B7280', usage: 'Disabled text, placeholders', tailwind: 'gray-500' },
    
    // Accent Colors
    { name: 'accent-gold', value: '#FFD700', usage: 'Ratings, stars, premium', tailwind: 'gold' },
    { name: 'accent-silver', value: '#C0C0C0', usage: 'Metallic accents, logo', tailwind: 'silver' },
    
    // Semantic Colors
    { name: 'success', value: '#22C55E', usage: 'Success states, confirmations', tailwind: 'green-500' },
    { name: 'warning', value: '#F59E0B', usage: 'Warnings, pending states', tailwind: 'amber-500' },
    { name: 'error', value: '#EF4444', usage: 'Errors, destructive actions', tailwind: 'red-500' },
    { name: 'info', value: '#3B82F6', usage: 'Information, links', tailwind: 'blue-500' },
  ],

  typography: [
    // Headings
    { name: 'heading-xl', fontSize: '2.25rem', fontWeight: '700', lineHeight: '2.5rem', tailwind: 'text-4xl font-bold' },
    { name: 'heading-lg', fontSize: '1.875rem', fontWeight: '700', lineHeight: '2.25rem', tailwind: 'text-3xl font-bold' },
    { name: 'heading-md', fontSize: '1.5rem', fontWeight: '600', lineHeight: '2rem', tailwind: 'text-2xl font-semibold' },
    { name: 'heading-sm', fontSize: '1.25rem', fontWeight: '600', lineHeight: '1.75rem', tailwind: 'text-xl font-semibold' },
    
    // Body
    { name: 'body-lg', fontSize: '1.125rem', fontWeight: '400', lineHeight: '1.75rem', tailwind: 'text-lg' },
    { name: 'body-base', fontSize: '1rem', fontWeight: '400', lineHeight: '1.5rem', tailwind: 'text-base' },
    { name: 'body-sm', fontSize: '0.875rem', fontWeight: '400', lineHeight: '1.25rem', tailwind: 'text-sm' },
    { name: 'body-xs', fontSize: '0.75rem', fontWeight: '400', lineHeight: '1rem', tailwind: 'text-xs' },
    
    // Special
    { name: 'label', fontSize: '0.75rem', fontWeight: '500', lineHeight: '1rem', tailwind: 'text-xs font-medium uppercase tracking-wide' },
    { name: 'button', fontSize: '0.875rem', fontWeight: '600', lineHeight: '1.25rem', tailwind: 'text-sm font-semibold' },
    { name: 'price', fontSize: '1.25rem', fontWeight: '700', lineHeight: '1.75rem', tailwind: 'text-xl font-bold' },
  ],

  spacing: [
    { name: 'spacing-0', value: '0', tailwind: '0' },
    { name: 'spacing-1', value: '0.25rem', tailwind: '1' },
    { name: 'spacing-2', value: '0.5rem', tailwind: '2' },
    { name: 'spacing-3', value: '0.75rem', tailwind: '3' },
    { name: 'spacing-4', value: '1rem', tailwind: '4' },
    { name: 'spacing-5', value: '1.25rem', tailwind: '5' },
    { name: 'spacing-6', value: '1.5rem', tailwind: '6' },
    { name: 'spacing-8', value: '2rem', tailwind: '8' },
    { name: 'spacing-10', value: '2.5rem', tailwind: '10' },
    { name: 'spacing-12', value: '3rem', tailwind: '12' },
    { name: 'spacing-16', value: '4rem', tailwind: '16' },
  ],

  borderRadius: [
    { name: 'rounded-none', value: '0', tailwind: 'rounded-none' },
    { name: 'rounded-sm', value: '0.25rem', tailwind: 'rounded-sm' },
    { name: 'rounded-md', value: '0.5rem', tailwind: 'rounded-md' },
    { name: 'rounded-lg', value: '0.75rem', tailwind: 'rounded-lg' },
    { name: 'rounded-xl', value: '1rem', tailwind: 'rounded-xl' },
    { name: 'rounded-2xl', value: '1.5rem', tailwind: 'rounded-2xl' },
    { name: 'rounded-full', value: '9999px', tailwind: 'rounded-full' },
  ],

  shadows: [
    { name: 'shadow-sm', value: '0 1px 2px rgba(0,0,0,0.3)', tailwind: 'shadow-sm' },
    { name: 'shadow-md', value: '0 4px 6px rgba(0,0,0,0.4)', tailwind: 'shadow-md' },
    { name: 'shadow-lg', value: '0 10px 15px rgba(0,0,0,0.5)', tailwind: 'shadow-lg' },
    { name: 'shadow-xl', value: '0 20px 25px rgba(0,0,0,0.6)', tailwind: 'shadow-xl' },
    { name: 'shadow-glow', value: '0 0 20px rgba(230,57,70,0.3)', tailwind: 'shadow-[0_0_20px_rgba(230,57,70,0.3)]' },
  ],

  components: [
    {
      name: 'Button Primary',
      description: 'Main call-to-action button',
      baseClasses: 'bg-brand-red text-white font-semibold rounded-lg px-6 py-3 transition-all duration-200 hover:bg-brand-red-dark active:scale-95',
      variants: {
        small: 'px-4 py-2 text-sm',
        large: 'px-8 py-4 text-lg',
        icon: 'p-3',
      },
    },
    {
      name: 'Button Secondary',
      description: 'Secondary action button',
      baseClasses: 'bg-transparent border-2 border-brand-red text-brand-red font-semibold rounded-lg px-6 py-3 transition-all duration-200 hover:bg-brand-red hover:text-white',
      variants: {},
    },
    {
      name: 'Card',
      description: 'Content container card',
      baseClasses: 'bg-surface-secondary rounded-2xl p-4 shadow-lg',
      variants: {
        interactive: 'hover:bg-surface-elevated transition-colors cursor-pointer',
        elevated: 'shadow-xl',
      },
    },
    {
      name: 'Input',
      description: 'Text input field',
      baseClasses: 'bg-surface-elevated border border-surface-overlay rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-red focus:border-transparent transition-all',
      variants: {
        error: 'border-red-500 focus:ring-red-500',
      },
    },
    {
      name: 'Badge',
      description: 'Status or category badge',
      baseClasses: 'inline-flex items-center px-3 py-1 rounded-full text-xs font-medium',
      variants: {
        primary: 'bg-brand-red text-white',
        secondary: 'bg-surface-elevated text-gray-300',
        success: 'bg-green-500/20 text-green-400',
        warning: 'bg-amber-500/20 text-amber-400',
      },
    },
    {
      name: 'Avatar',
      description: 'User or barber profile image',
      baseClasses: 'rounded-full object-cover border-2 border-surface-overlay',
      variants: {
        sm: 'w-8 h-8',
        md: 'w-12 h-12',
        lg: 'w-16 h-16',
        xl: 'w-24 h-24',
      },
    },
    {
      name: 'Rating',
      description: 'Star rating display',
      baseClasses: 'flex items-center gap-1',
      variants: {},
    },
    {
      name: 'Navigation Bottom',
      description: 'Bottom tab navigation',
      baseClasses: 'fixed bottom-0 left-0 right-0 bg-surface-primary border-t border-surface-overlay flex justify-around items-center py-2 px-4',
      variants: {},
    },
    {
      name: 'Header',
      description: 'Screen header with title',
      baseClasses: 'bg-brand-red px-4 py-6 rounded-b-3xl',
      variants: {
        flat: 'rounded-none',
      },
    },
    {
      name: 'Search Bar',
      description: 'Search input with icon',
      baseClasses: 'flex items-center gap-3 bg-surface-elevated rounded-xl px-4 py-3',
      variants: {},
    },
    {
      name: 'Service Card',
      description: 'Barber service listing card',
      baseClasses: 'flex items-center justify-between p-4 border-b border-surface-overlay',
      variants: {},
    },
    {
      name: 'Barber Card',
      description: 'Barber profile preview card',
      baseClasses: 'bg-surface-secondary rounded-2xl overflow-hidden shadow-lg',
      variants: {
        horizontal: 'flex flex-row',
        featured: 'ring-2 ring-brand-red',
      },
    },
  ],
};

export default directCutsDesignSystem;
