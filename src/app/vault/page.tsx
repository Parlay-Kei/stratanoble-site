'use client';
export const dynamic = "force-dynamic";
export const dynamicParams = true;

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';
import { Container } from '@/components/ui/container';

interface Resource {
  id: string;
  title: string;
  description: string;
  type: 'pdf' | 'video' | 'slide' | 'worksheet';
  filename: string;
  size: string;
  uploadedAt: string;
  category: string;
}

const mockResources: Resource[] = [
  {
    id: '1',
    title: 'Side Hustle Strategy Framework',
    description: 'Complete framework for identifying, validating, and launching your side hustle idea.',
    type: 'pdf',
    filename: 'side-hustle-strategy-framework.pdf',
    size: '2.4 MB',
    uploadedAt: '2024-01-15',
    category: 'Strategy'
  },
  {
    id: '2',
    title: 'Market Research Template',
    description: 'Step-by-step template for conducting market research and validating your business idea.',
    type: 'worksheet',
    filename: 'market-research-template.xlsx',
    size: '1.8 MB',
    uploadedAt: '2024-01-15',
    category: 'Research'
  },
  {
    id: '3',
    title: 'Financial Planning Spreadsheet',
    description: 'Comprehensive financial model for planning your side hustle finances and projections.',
    type: 'worksheet',
    filename: 'financial-planning-model.xlsx',
    size: '3.2 MB',
    uploadedAt: '2024-01-15',
    category: 'Finance'
  },
  {
    id: '4',
    title: 'Workshop Presentation Slides',
    description: 'Complete slide deck from the Side Hustle Workshop with key insights and strategies.',
    type: 'slide',
    filename: 'workshop-slides.pptx',
    size: '15.7 MB',
    uploadedAt: '2024-01-15',
    category: 'Presentation'
  },
  {
    id: '5',
    title: 'Customer Discovery Guide',
    description: 'Comprehensive guide for conducting customer interviews and gathering insights.',
    type: 'pdf',
    filename: 'customer-discovery-guide.pdf',
    size: '1.9 MB',
    uploadedAt: '2024-01-15',
    category: 'Research'
  },
  {
    id: '6',
    title: 'Workshop Recording',
    description: 'Full recording of the Side Hustle Workshop session with Q&A.',
    type: 'video',
    filename: 'workshop-recording.mp4',
    size: '245.3 MB',
    uploadedAt: '2024-01-15',
    category: 'Video'
  }
];

function VaultPageContent() {
  const searchParams = useSearchParams();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [userEmail, setUserEmail] = useState<string>('');
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    const email = searchParams.get('email');
    const token = searchParams.get('token');
    
    if (!email || !token) {
      setIsAuthorized(false);
      setLoading(false);
      return;
    }

    setUserEmail(email);
    verifyAccess(email, token);
  }, [searchParams]);

  const verifyAccess = async (email: string, token: string) => {
    try {
      const response = await fetch('/api/vault/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, token }),
      });

      if (response.ok) {
        setIsAuthorized(true);
        setResources(mockResources); // In production, fetch from Supabase
      } else {
        setIsAuthorized(false);
      }
    } catch (error) {
      // console.error('Error verifying access:', error);
      setIsAuthorized(false);
    } finally {
      setLoading(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'pdf': return '📄';
      case 'video': return '🎥';
      case 'slide': return '📊';
      case 'worksheet': return '📋';
      default: return '📁';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'pdf': return 'bg-red-100 text-red-800';
      case 'video': return 'bg-blue-100 text-blue-800';
      case 'slide': return 'bg-green-100 text-green-800';
      case 'worksheet': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredResources = selectedCategory === 'all' 
    ? resources 
    : resources.filter(resource => resource.category === selectedCategory);

  const categories = ['all', ...Array.from(new Set(resources.map(r => r.category)))];

  if (loading) {
    return (
      <main className="min-h-screen bg-white">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
            <p className="text-navy-600">Verifying access...</p>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  if (!isAuthorized) {
    return (
      <main className="min-h-screen bg-white">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center max-w-md mx-auto px-4">
            <div className="text-6xl mb-6">🔒</div>
            <h1 className="text-2xl font-bold text-navy-900 mb-4">Access Denied</h1>
            <p className="text-navy-600 mb-6">
              You need to purchase a workshop ticket to access the resource vault.
            </p>
            <a
              href="/workshops"
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              Get Workshop Access
            </a>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-navy-900 via-navy-800 to-emerald-900 text-white py-16">
        <Container>
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
              Workshop Resource Vault
            </h1>
            <p className="text-xl text-navy-100 mb-4">
              Welcome back, {userEmail}! Access all your workshop materials and resources.
            </p>
            <div className="text-sm text-navy-200">
              Last updated: {new Date().toLocaleDateString()}
            </div>
          </div>
        </Container>
      </section>

      {/* Resources Section */}
      <section className="py-12 bg-navy-50">
        <Container>
          <div className="mx-auto max-w-6xl">
            {/* Category Filter */}
            <div className="mb-8">
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      selectedCategory === category
                        ? 'bg-emerald-600 text-white'
                        : 'bg-white text-navy-700 hover:bg-navy-100'
                    }`}
                  >
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Resources Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredResources.map((resource) => (
                <div key={resource.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="text-3xl">{getTypeIcon(resource.type)}</div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(resource.type)}`}>
                        {resource.type.toUpperCase()}
                      </span>
                    </div>
                    
                    <h3 className="text-lg font-semibold text-navy-900 mb-2">
                      {resource.title}
                    </h3>
                    
                    <p className="text-navy-600 text-sm mb-4">
                      {resource.description}
                    </p>

                    <div className="flex items-center justify-between text-xs text-navy-500 mb-4">
                      <span>{resource.size}</span>
                      <span>{resource.uploadedAt}</span>
                    </div>

                    <button
                      onClick={() => {
                        // In production, this would trigger a download from Supabase storage
                        alert(`Downloading ${resource.filename}...`);
                      }}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors text-sm"
                    >
                      Download
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {filteredResources.length === 0 && (
              <div className="text-center py-12">
                <div className="text-4xl mb-4">📁</div>
                <p className="text-navy-600">No resources found in this category.</p>
              </div>
            )}
          </div>
        </Container>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-white">
        <Container>
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-navy-900 mb-4">
              Need Help with These Resources?
            </h2>
            <p className="text-navy-600 mb-8">
              Our team is here to help you make the most of these materials and accelerate your side hustle journey.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/contact"
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors"
              >
                Get Support
              </a>
              <a
                href="/workshops"
                className="bg-transparent border-2 border-emerald-600 text-emerald-600 hover:bg-emerald-600 hover:text-white font-semibold py-3 px-8 rounded-lg transition-colors"
              >
                Join Next Workshop
              </a>
            </div>
          </div>
        </Container>
      </section>

      <Footer />
    </main>
  );
}

export default function VaultPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-white">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
            <p className="text-navy-600">Loading...</p>
          </div>
        </div>
        <Footer />
      </main>
    }>
      <VaultPageContent />
    </Suspense>
  );
}
