import { DollarSign, Users, BookOpen, Package } from 'lucide-react';

export const RevenueModelSection = () => {
  const revenueStreams = [
    {
      icon: <DollarSign className="w-6 h-6" />,
      title: 'Consulting Fees',
      percentage: '45%',
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: 'Consulting-for-Equity',
      percentage: '25%',
    },
    {
      icon: <BookOpen className="w-6 h-6" />,
      title: 'Workshops & Cohorts',
      percentage: '20%',
    },
    {
      icon: <Package className="w-6 h-6" />,
      title: 'Digital Products',
      percentage: '10%',
    },
  ];
  return (
    <section className="py-16 bg-[#003366] text-white">
      <div className="container mx-auto px-6">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">Revenue Model</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {revenueStreams.map((stream, index) => (
            <div key={index} className="flex flex-col items-center text-center">
              <div className="bg-white bg-opacity-10 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                {stream.icon}
              </div>
              <h3 className="text-xl font-medium mb-2">{stream.title}</h3>
              <div className="w-20 h-20 rounded-full border-4 border-[#50C878] flex items-center justify-center mt-2">
                <span className="text-xl font-bold">{stream.percentage}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
