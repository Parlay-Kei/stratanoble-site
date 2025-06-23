import { useParams, Link } from 'react-router-dom';
import { aiBreadcrumbs } from '../../data/aiBreadcrumbs';
import { workshops } from '../../data/workshops';

const KnowledgePage = () => {
  const { slug } = useParams();
  if (typeof slug !== 'string') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center">
        <h1 className="font-headings text-3xl font-bold mb-4 text-primary">Not Found</h1>
        <p className="text-primary/70 mb-6">Sorry, we couldn't find that knowledge base article.</p>
        <Link to="/knowledge" className="text-cta font-medium hover:underline">Back to Knowledge Base</Link>
      </div>
    );
  }
  const concept = aiBreadcrumbs.find(item => item.link.endsWith(slug));
  const nextWorkshop = workshops[0];

  if (!concept) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center">
        <h1 className="font-headings text-3xl font-bold mb-4 text-primary">Not Found</h1>
        <p className="text-primary/70 mb-6">Sorry, we couldn't find that knowledge base article.</p>
        <Link to="/knowledge" className="text-cta font-medium hover:underline">Back to Knowledge Base</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-white py-20 px-4 flex flex-col items-center">
      <nav className="mb-6 w-full max-w-2xl text-sm text-primary/60">
        <Link to="/" className="hover:underline">Home</Link> / <Link to="/knowledge" className="hover:underline">Knowledge Base</Link> / <span className="text-primary">{concept.title}</span>
      </nav>
      <div className="bg-white rounded-xl shadow-card p-10 max-w-2xl w-full text-center border border-accent/40">
        <h1 className="font-headings text-2xl md:text-3xl font-bold text-primary mb-4">{concept.title}</h1>
        <p className="text-primary/80 mb-8 text-lg">{concept.insight}</p>
        <div className="mt-8">
          <h3 className="font-headings text-lg font-semibold text-primary mb-2">Next Workshop</h3>
          <div className="bg-accent/20 rounded-lg p-4 mb-4">
            <div className="text-sm text-primary/70 mb-1">{new Date(nextWorkshop.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</div>
            <div className="font-headings text-base font-bold text-primary mb-1">{nextWorkshop.title}</div>
            <div className="text-primary/80 mb-2 text-sm">{nextWorkshop.description}</div>
            <a href={nextWorkshop.link} className="text-cta font-medium hover:underline hover:text-highlight transition-colors text-sm">Join Workshop →</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KnowledgePage; 