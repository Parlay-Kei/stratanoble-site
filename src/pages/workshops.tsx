import { workshops } from '../data/workshops';

const WorkshopsPage = () => {
  const nextWorkshop = workshops[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-white py-20 px-4 flex flex-col items-center">
      <div className="max-w-2xl w-full mb-10">
        <div className="bg-accent/30 rounded-xl p-6 flex flex-col items-center text-center border border-accent/40 mb-8">
          <div className="text-primary/70 text-sm mb-2">Next Workshop</div>
          <div className="font-headings text-2xl font-bold text-primary mb-1">{nextWorkshop.title}</div>
          <div className="text-primary/80 mb-2">{new Date(nextWorkshop.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</div>
          <div className="text-primary/70 mb-4 text-sm">{nextWorkshop.description}</div>
          <a href={nextWorkshop.link} className="text-cta font-medium hover:underline hover:text-highlight transition-colors text-base">Register →</a>
        </div>
        <h1 className="font-headings text-3xl font-bold text-primary mb-6">All Upcoming Workshops</h1>
        <div className="flex flex-col gap-6">
          {workshops.map((workshop) => (
            <div key={workshop.title} className="bg-white rounded-lg shadow-card p-6 border border-accent/20 text-left">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-2">
                <div className="font-headings text-xl font-semibold text-primary mb-1 md:mb-0">{workshop.title}</div>
                <div className="text-primary/70 text-sm">{new Date(workshop.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</div>
              </div>
              <div className="text-primary/80 mb-2 text-sm">{workshop.description}</div>
              <a href={workshop.link} className="text-cta font-medium hover:underline hover:text-highlight transition-colors text-sm">Learn More →</a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WorkshopsPage; 