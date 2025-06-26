import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'

export default function CaseStudiesPage() {
  return (
    <main className="min-h-screen">
      <Header />
      <div className="py-24 sm:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-navy-900 sm:text-6xl">
              Case Studies
            </h1>
            <p className="mt-6 text-lg leading-8 text-navy-600">
              Content coming soon...
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  )
} 