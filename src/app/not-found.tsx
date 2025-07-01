import { ArrowLeftIcon,HomeIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-50 to-silver-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* 404 Number */}
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-navy-900/20">404</h1>
        </div>

        {/* Error Message */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-navy-900 mb-4">Page Not Found</h2>
          <p className="text-navy-600 leading-relaxed">
            The page you&apos;re looking for doesn&apos;t exist or has been moved. Let&apos;s get
            you back on track to transforming your passion into profit.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="btn-primary btn-lg inline-flex items-center justify-center group"
          >
            <HomeIcon className="mr-2 h-5 w-5" />
            Return Home
          </Link>
          <Link
            href="/contact"
            className="btn-outline btn-lg inline-flex items-center justify-center group"
          >
            <ArrowLeftIcon className="mr-2 h-5 w-5" />
            Contact Us
          </Link>
        </div>

        {/* Helpful Links */}
        <div className="mt-12 pt-8 border-t border-silver-200">
          <p className="text-sm text-navy-500 mb-4">Or explore our services:</p>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <Link
              href="/services"
              className="text-emerald-600 hover:text-emerald-700 transition-colors"
            >
              Services
            </Link>
            <Link
              href="/about"
              className="text-emerald-600 hover:text-emerald-700 transition-colors"
            >
              About
            </Link>
            <Link
              href="/case-studies"
              className="text-emerald-600 hover:text-emerald-700 transition-colors"
            >
              Case Studies
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
