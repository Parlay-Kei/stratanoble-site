import { Helmet } from 'react-helmet';
import { HeroSection } from '../components/HeroSection';
import ServiceCardGrid from '../components/ServiceCardGrid';
import HowWeWork from '../components/HowWeWork';
import FAQCardGrid from '../components/FAQCardGrid';
import AIBreadcrumbGrid from '../components/AIBreadcrumbGrid';
import ContactCTA from '../components/ContactCTA';
import StickyCTA from '../components/StickyCTA';
import NewsletterSignup from '../components/NewsletterSignup';

const HomePage = () => (
  <div className="bg-[#F9F9F9] min-h-screen">
    <Helmet>
      <title>Strata Noble – AI-Driven Strategy for Founders</title>
      <meta name="description" content="Work smarter, not harder. Strata Noble helps early-stage founders build scalable businesses with AI and strategy consulting." />
      <meta property="og:title" content="Strata Noble" />
      <meta property="og:description" content="Build smart. Operate lean. Grow with confidence." />
      <meta property="og:image" content="/og-image.png" />
      {/* Plausible Analytics */}
      <script async defer data-domain="stratanoble.com" src="https://plausible.io/js/plausible.js"></script>
      {/* Crisp Chat Widget */}
      <script type="text/javascript">
        {`
          window.$crisp=[];window.CRISP_WEBSITE_ID="YOUR_CRISP_WEBSITE_ID";
          (function(){
            var d=document,s=d.createElement("script");
            s.src="https://client.crisp.chat/l.js";s.async=1;
            d.getElementsByTagName("head")[0].appendChild(s);
          })();
        `}
      </script>
    </Helmet>
    {/* 1. Hero Section */}
    <HeroSection />
    {/* 2. Service Card Grid */}
    <ServiceCardGrid />
    {/* 3. How We Work */}
    <HowWeWork />
    {/* 4. FAQ Card Grid */}
    <FAQCardGrid />
    {/* 5. AI Breadcrumb Grid */}
    <AIBreadcrumbGrid />
    {/* 6. Contact CTA */}
    <ContactCTA />
    {/* Newsletter Signup */}
    <NewsletterSignup />
    {/* Persistent CTA Strip */}
    <StickyCTA />
  </div>
);

export default HomePage; 