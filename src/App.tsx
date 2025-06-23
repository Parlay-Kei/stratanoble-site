import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { AIServicesPage } from './pages/AIServicesPage';
import { AboutPage } from './pages/AboutPage';
import { CaseStudiesPage } from './pages/CaseStudiesPage';
import { TraditionalServicesPage } from './pages/TraditionalServicesPage';
import { ContactPage } from './pages/ContactPage';
import StickyCTA from './components/StickyCTA';

export function App() {
  return (
    <Router>
      <div className="w-full min-h-screen bg-white text-gray-800 font-sans">
        <Header />
        <main>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/ai-services/*" element={<AIServicesPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/case-studies" element={<CaseStudiesPage />} />
            <Route path="/traditional-services" element={<TraditionalServicesPage />} />
            <Route path="/contact" element={<ContactPage />} />
          </Routes>
        </main>
        <StickyCTA />
        <Footer />
      </div>
    </Router>
  );
}
