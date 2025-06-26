import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { HeroSection } from '@/components/HeroSection'
import { MissionSection } from '@/components/MissionSection'
import { ServicesSection } from '@/components/ServicesSection'
import { CtaSection } from '@/components/CtaSection'

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <Header />
      <HeroSection />
      <MissionSection />
      <ServicesSection />
      <CtaSection />
      <Footer />
    </main>
  )
} 