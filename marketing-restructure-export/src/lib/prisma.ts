// Prisma removed in favor of Supabase. This module intentionally throws if used.
export const prisma: any = new Proxy({}, {
  get() {
    throw new Error('Prisma has been removed. Use Supabase helpers from lib/supabase instead.')
  }
})