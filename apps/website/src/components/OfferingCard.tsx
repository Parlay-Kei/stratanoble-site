import Link from 'next/link';
import { CONSULTING_SERVICES } from '@/data/offerings';

interface OfferingCardProps {
  offeringId: (typeof CONSULTING_SERVICES)[number]['id'];
  isPopular?: boolean;
}

export default function OfferingCard({ offeringId, isPopular = false }: OfferingCardProps) {
  const offering = CONSULTING_SERVICES.find((tier) => tier.id === offeringId);
  if (!offering) return null;

  return (
    <div
      className={`relative rounded-2xl border-2 p-6 flex flex-col h-full ${
        isPopular ? 'border-emerald-500 bg-emerald-50/50' : 'border-gray-200 bg-white'
      }`}
    >
      {isPopular && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full">
          POPULAR
        </span>
      )}
      <h3 className="text-xl font-bold text-gray-900">{offering.name}</h3>
      <p className="text-gray-600 text-sm mt-2 flex-grow">{offering.description}</p>
      <p className="text-2xl font-bold text-emerald-600 mt-4">
        {offering.priceLabel}
        {offering.period && offering.period !== 'one-time' && (
          <span className="text-sm text-gray-500 font-normal">{offering.period}</span>
        )}
      </p>
      <Link
        href={offering.ctaLink}
        className="mt-6 block text-center rounded-xl bg-emerald-600 text-white font-semibold py-3 hover:bg-emerald-700 transition-colors"
      >
        {offering.cta}
      </Link>
    </div>
  );
}
