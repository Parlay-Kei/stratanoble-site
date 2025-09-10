import { Metadata } from 'next'
import { WeeklyNarrativesList } from '../../components/features/weekly-narratives/WeeklyNarrativesList'

export const metadata: Metadata = {
  title: 'Weekly Narratives - ACHIEVERY',
  description: 'View your automated weekly progress summaries and insights',
}

export default function NarrativesPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <WeeklyNarrativesList />
    </div>
  )
}