import React, { useState, useEffect } from 'react';
import { Search, MapPin, Star, Clock, Calendar, User, Home, Heart, MessageCircle, Share2, ChevronLeft, Filter, X, Check, Phone, Mail } from 'lucide-react';

const DirectCutsLogo = ({ size = 48, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" className={className}>
    <circle cx="50" cy="50" r="45" fill="#E63946" />
    <circle cx="50" cy="50" r="32" fill="none" stroke="white" strokeWidth="6" />
    <circle cx="50" cy="50" r="18" fill="none" stroke="white" strokeWidth="6" />
    <circle cx="50" cy="50" r="6" fill="white" />
  </svg>
);

const barbers = [
  { id: 1, name: "Russell Fleming", specialty: "Barber Cut", rating: 4.9, reviews: 135, price: 40, distance: "1.2 mi", address: "123 Way Las Vegas, NV 89019", bio: "Hello, my name is Russell. Barbering is my life.", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face", featured: true },
  { id: 2, name: "Earl Bowman", specialty: "Facial Trim", rating: 4.5, reviews: 89, price: 25, distance: "2.1 mi", address: "456 Strip Blvd, Las Vegas, NV", bio: "Specializing in precision beard work and fades.", image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=face", featured: false },
  { id: 3, name: "Emile Sandel", specialty: "Color Services", rating: 4.8, reviews: 203, price: 75, distance: "0.8 mi", address: "789 Fremont St, Las Vegas, NV", bio: "Master colorist with 15 years experience.", image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face", featured: true },
  { id: 4, name: "Salomon Oyama", specialty: "All Scissor Short Cut", rating: 4.7, reviews: 156, price: 45, distance: "3.3 mi", address: "321 Paradise Rd, Las Vegas, NV", bio: "Traditional techniques meet modern style.", image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&h=200&fit=crop&crop=face", featured: false },
  { id: 5, name: "Dominic Olson", specialty: "Beard Trim", rating: 4.2, reviews: 67, price: 10, distance: "1.8 mi", address: "555 Convention Way, Las Vegas, NV", bio: "Quick, quality cuts at affordable prices.", image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&h=200&fit=crop&crop=face", featured: false },
  { id: 6, name: "Armin Rybicki", specialty: "Barber Cut W Beard Trim", rating: 4.6, reviews: 112, price: 55, distance: "2.5 mi", address: "888 Sahara Ave, Las Vegas, NV", bio: "Full service grooming professional.", image: "https://images.unsplash.com/photo-1463453091185-61582044d556?w=200&h=200&fit=crop&crop=face", featured: true },
];

const services = [
  { name: "Men's Haircut with Beard", price: 45, duration: "45 min" },
  { name: "Loc Retwist / Men's Cut", price: 65, duration: "90 min" },
  { name: "Men's Haircut", price: 35, duration: "30 min" },
  { name: "Beard Trim & Shape", price: 20, duration: "20 min" },
  { name: "Hot Towel Shave", price: 30, duration: "30 min" },
];

const appointments = [
  { id: 1, barber: barbers[0], service: "Barber Cut", date: "Tue, Oct 8", time: "11 AM", status: "upcoming" },
  { id: 2, barber: barbers[4], service: "Beard Trim", date: "Tue, Oct 8", time: "12 PM", status: "upcoming" },
];

const categories = ["Haircuts", "Fades", "Beard Trims", "Color", "Kids"];

const SplashScreen = ({ onComplete }) => {
  useEffect(() => {
    const timer = setTimeout(onComplete, 2500);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-black flex flex-col items-center justify-center overflow-hidden">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>
      <div className="relative z-10 flex flex-col items-center">
        <DirectCutsLogo size={120} className="mb-6 drop-shadow-2xl animate-pulse" />
        <h1 className="text-4xl font-bold tracking-wider">
          <span className="text-white">DIRECT</span>
          <span className="text-gray-400">CUTS</span>
        </h1>
        <p className="text-gray-400 mt-4 text-lg tracking-wide">Personal Grooming On Demand</p>
      </div>
      <div className="absolute bottom-20 flex space-x-2">
        {[0, 1, 2].map((i) => (
          <div key={i} className="w-2 h-2 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
        ))}
      </div>
    </div>
  );
};

const BottomNav = ({ active, onNavigate }) => {
  const items = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'nearby', icon: MapPin, label: 'Nearby' },
    { id: 'appointments', icon: Calendar, label: 'Appointments' },
    { id: 'profile', icon: User, label: 'Profile' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 z-50">
      <div className="flex justify-around items-center max-w-md mx-auto">
        {items.map(({ id, icon: Icon, label }) => (
          <button key={id} onClick={() => onNavigate(id)} className={`flex flex-col items-center py-2 px-4 rounded-xl transition-all duration-200 ${active === id ? 'text-red-500' : 'text-gray-400 hover:text-gray-600'}`}>
            <Icon size={22} strokeWidth={active === id ? 2.5 : 2} />
            <span className={`text-xs mt-1 ${active === id ? 'font-semibold' : ''}`}>{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

const HomeScreen = ({ onSelectBarber }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const trending = barbers.filter(b => b.featured);
  const popular = barbers.slice(0, 4);

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="bg-gradient-to-br from-red-500 to-red-600 px-5 pt-12 pb-8 rounded-b-3xl shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <DirectCutsLogo size={40} />
          <button className="bg-white/20 p-2 rounded-full"><Filter size={20} className="text-white" /></button>
        </div>
        <h1 className="text-white text-2xl font-bold mb-4">Find & Book</h1>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input type="text" placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-12 pr-4 py-3.5 bg-white rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/50 shadow-lg" />
        </div>
      </div>

      <div className="px-5 py-4 overflow-x-auto">
        <div className="flex space-x-3">
          {categories.map((cat, i) => (
            <button key={cat} className={`px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${i === 0 ? 'bg-red-500 text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200 hover:border-red-300'}`}>{cat}</button>
          ))}
        </div>
      </div>

      <div className="px-5 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-gray-800">Trending Barbers</h2>
          <button className="text-red-500 text-sm font-medium">View all »</button>
        </div>
        <div className="flex space-x-4 overflow-x-auto pb-2 -mx-5 px-5">
          {trending.map((barber) => (
            <div key={barber.id} onClick={() => onSelectBarber(barber)} className="shrink-0 w-44 bg-white rounded-2xl shadow-md overflow-hidden cursor-pointer transform hover:scale-105 transition-all duration-200">
              <div className="relative">
                <img src={barber.image} alt={barber.name} className="w-full h-32 object-cover" />
                <div className="absolute top-2 right-2 bg-red-500 p-1 rounded-full"><Star size={12} className="text-white fill-white" /></div>
              </div>
              <div className="p-3">
                <h3 className="font-semibold text-gray-800 text-sm">{barber.name}</h3>
                <p className="text-xs text-gray-500">{barber.specialty}</p>
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center">{[...Array(5)].map((_, i) => (<Star key={i} size={10} className={i < Math.floor(barber.rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'} />))}</div>
                  <span className="text-red-500 font-bold text-sm">${barber.price}.00</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="px-5">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-gray-800">Most Popular</h2>
          <button className="text-red-500 text-sm font-medium">{barbers.length} Popular Barbers »</button>
        </div>
        <div className="space-y-3">
          {popular.map((barber) => (
            <div key={barber.id} onClick={() => onSelectBarber(barber)} className="bg-white rounded-2xl p-4 shadow-sm flex items-center cursor-pointer hover:shadow-md transition-all">
              <img src={barber.image} alt={barber.name} className="w-16 h-16 rounded-xl object-cover" />
              <div className="ml-4 flex-1">
                <h3 className="font-semibold text-gray-800">{barber.name}</h3>
                <p className="text-sm text-gray-500">{barber.specialty}</p>
                <div className="flex items-center mt-1">{[...Array(5)].map((_, i) => (<Star key={i} size={12} className={i < Math.floor(barber.rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'} />))}<span className="text-xs text-gray-400 ml-1">({barber.reviews})</span></div>
              </div>
              <div className="text-right">
                <span className="text-red-500 font-bold">${barber.price}.00</span>
                <p className="text-xs text-gray-400 mt-1">{barber.distance}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const NearbyScreen = ({ onSelectBarber }) => {
  const [selectedCategory, setSelectedCategory] = useState(0);

  return (
    <div className="min-h-screen bg-gray-100 pb-24">
      <div className="bg-red-500 px-5 pt-12 pb-4">
        <div className="flex items-center bg-white/20 rounded-xl px-4 py-3 mb-4">
          <MapPin size={18} className="text-white mr-2" />
          <input type="text" placeholder="3690 Las Vegas Blvd., Apt 124" className="flex-1 bg-transparent text-white placeholder-white/70 text-sm focus:outline-none" />
          <X size={18} className="text-white/70" />
        </div>
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {categories.map((cat, i) => (
            <button key={cat} onClick={() => setSelectedCategory(i)} className={`px-4 py-1.5 rounded-full text-sm whitespace-nowrap transition-all ${selectedCategory === i ? 'bg-white text-red-500 font-medium' : 'bg-transparent text-white border border-white/50'}`}>{cat}</button>
          ))}
        </div>
      </div>

      <div className="relative h-72 bg-gray-200">
        <div className="absolute inset-0 bg-gradient-to-b from-gray-300 to-gray-200">
          <svg className="w-full h-full opacity-30" viewBox="0 0 400 300">
            <line x1="0" y1="50" x2="400" y2="50" stroke="#999" strokeWidth="2" />
            <line x1="0" y1="150" x2="400" y2="150" stroke="#999" strokeWidth="2" />
            <line x1="0" y1="250" x2="400" y2="250" stroke="#999" strokeWidth="2" />
            <line x1="100" y1="0" x2="100" y2="300" stroke="#999" strokeWidth="2" />
            <line x1="200" y1="0" x2="200" y2="300" stroke="#999" strokeWidth="2" />
            <line x1="300" y1="0" x2="300" y2="300" stroke="#999" strokeWidth="2" />
          </svg>
        </div>
        {barbers.slice(0, 4).map((barber, i) => (
          <div key={barber.id} className="absolute cursor-pointer transform hover:scale-110 transition-transform" style={{ left: `${20 + (i * 20)}%`, top: `${30 + (i % 2) * 30}%` }} onClick={() => onSelectBarber(barber)}>
            <div className="bg-red-500 rounded-full p-2 shadow-lg"><DirectCutsLogo size={24} /></div>
          </div>
        ))}
      </div>

      <div className="px-5 -mt-16 relative z-10">
        <div onClick={() => onSelectBarber(barbers[0])} className="bg-white rounded-2xl p-4 shadow-xl flex items-center cursor-pointer">
          <img src={barbers[0].image} alt={barbers[0].name} className="w-20 h-20 rounded-xl object-cover" />
          <div className="ml-4 flex-1">
            <h3 className="font-bold text-gray-800">{barbers[0].name}</h3>
            <p className="text-sm text-gray-500">{barbers[0].address}</p>
            <div className="flex items-center mt-1">{[...Array(5)].map((_, i) => (<Star key={i} size={12} className={i < Math.floor(barbers[0].rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'} />))}<span className="text-xs text-gray-400 ml-1">({barbers[0].reviews} reviews)</span></div>
          </div>
        </div>
      </div>

      <div className="px-5 mt-6">
        <h2 className="text-lg font-bold text-gray-800 mb-4">Nearby Barbers</h2>
        <div className="space-y-3">
          {barbers.slice(1, 4).map((barber) => (
            <div key={barber.id} onClick={() => onSelectBarber(barber)} className="bg-white rounded-xl p-3 shadow-sm flex items-center cursor-pointer hover:shadow-md transition-all">
              <img src={barber.image} alt={barber.name} className="w-14 h-14 rounded-lg object-cover" />
              <div className="ml-3 flex-1">
                <h3 className="font-semibold text-gray-800 text-sm">{barber.name}</h3>
                <div className="flex items-center text-xs text-gray-500"><MapPin size={10} className="mr-1" />{barber.distance}</div>
              </div>
              <div className="text-red-500 font-bold text-sm">${barber.price}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const BarberProfile = ({ barber, onBack, onBook }) => (
  <div className="min-h-screen bg-white pb-24">
    <div className="bg-gradient-to-br from-gray-100 to-gray-50 px-5 pt-12 pb-6">
      <div className="flex items-center justify-between mb-6">
        <button onClick={onBack} className="flex items-center text-red-500 font-medium"><ChevronLeft size={20} /><span>Back</span></button>
        <DirectCutsLogo size={32} />
      </div>
      <div className="flex items-start">
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-800">{barber.name}</h1>
          <p className="text-gray-500 text-sm mt-1">{barber.address}</p>
          <div className="flex items-center mt-2">{[...Array(5)].map((_, i) => (<Star key={i} size={14} className={i < Math.floor(barber.rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'} />))}<span className="text-sm text-gray-500 ml-2">({barber.reviews} reviews)</span></div>
        </div>
        <img src={barber.image} alt={barber.name} className="w-24 h-24 rounded-2xl object-cover shadow-lg" />
      </div>
      <div className="mt-4 p-4 bg-white rounded-xl shadow-sm">
        <h3 className="text-sm font-semibold text-gray-600 mb-1">Bio</h3>
        <p className="text-gray-700 text-sm">{barber.bio}</p>
      </div>
      <div className="flex space-x-4 mt-4">
        {[Share2, Heart, MapPin, MessageCircle].map((Icon, i) => (
          <button key={i} className="flex-1 bg-white p-3 rounded-xl shadow-sm flex items-center justify-center hover:bg-gray-50 transition-colors"><Icon size={18} className="text-gray-600" /></button>
        ))}
        <button onClick={onBook} className="flex-1 bg-red-500 text-white px-6 py-3 rounded-xl font-semibold shadow-lg flex items-center justify-center hover:bg-red-600 transition-colors"><Calendar size={16} className="mr-2" />Book</button>
      </div>
    </div>

    <div className="px-5 py-6">
      <h2 className="text-lg font-bold text-gray-800 mb-4">Featured Services</h2>
      <div className="flex space-x-4 overflow-x-auto pb-2 -mx-5 px-5">
        {services.slice(0, 2).map((service, i) => (
          <div key={i} className="shrink-0 w-40 bg-gray-100 rounded-xl overflow-hidden">
            <div className="h-24 bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center"><img src={barber.image} alt={service.name} className="w-full h-full object-cover opacity-80" /></div>
            <div className="p-3">
              <p className="text-sm font-medium text-gray-800">{service.name.split(' ').slice(0, 2).join(' ')}</p>
              <p className="text-red-500 font-bold text-sm">${service.price}.00</p>
            </div>
          </div>
        ))}
      </div>
    </div>

    <div className="px-5">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold text-gray-800">Services</h2>
        <button className="text-red-500 text-sm font-medium">View all »</button>
      </div>
      <div className="space-y-3">
        {services.map((service, i) => (
          <div key={i} className="bg-gray-50 rounded-xl p-4 flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-800">{service.name}</h3>
              <div className="flex items-center text-sm text-gray-500 mt-1"><Clock size={12} className="mr-1" />{service.duration}</div>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-gray-800 font-bold">${service.price}</span>
              <button className="bg-white text-red-500 border border-red-500 px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors">Book</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const AppointmentsScreen = ({ onSelectBarber }) => (
  <div className="min-h-screen bg-gray-50 pb-24">
    <div className="bg-white px-5 pt-12 pb-6 shadow-sm">
      <div className="flex items-center justify-between mb-2"><DirectCutsLogo size={36} /></div>
      <h1 className="text-2xl font-bold text-gray-800">Upcoming Appointments</h1>
    </div>
    <div className="px-5 py-6 space-y-4">
      {appointments.map((apt) => (
        <div key={apt.id} onClick={() => onSelectBarber(apt.barber)} className="bg-white rounded-2xl p-4 shadow-md cursor-pointer hover:shadow-lg transition-all">
          <div className="flex items-center">
            <img src={apt.barber.image} alt={apt.barber.name} className="w-20 h-24 rounded-xl object-cover" />
            <div className="ml-4 flex-1">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-gray-800">{apt.barber.name}</h3>
                <span className="bg-red-100 text-red-500 text-xs px-2 py-1 rounded-full font-medium">{apt.time}</span>
              </div>
              <p className="text-gray-500 text-sm">{apt.service}</p>
              <div className="flex items-center mt-2 text-sm text-gray-400"><Calendar size={14} className="mr-1" />{apt.date}</div>
              <div className="flex space-x-2 mt-3">
                <button className="bg-red-500 text-white px-4 py-1.5 rounded-lg text-sm font-medium">Reschedule</button>
                <button className="bg-gray-100 text-gray-600 px-4 py-1.5 rounded-lg text-sm font-medium">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      ))}
      <div className="mt-8">
        <h2 className="text-lg font-bold text-gray-800 mb-4">Past Appointments</h2>
        <div className="bg-white rounded-xl p-4 shadow-sm opacity-60">
          <div className="flex items-center">
            <img src={barbers[2].image} alt={barbers[2].name} className="w-14 h-14 rounded-lg object-cover" />
            <div className="ml-3 flex-1">
              <h3 className="font-semibold text-gray-800">{barbers[2].name}</h3>
              <p className="text-sm text-gray-500">Color Services</p>
              <p className="text-xs text-gray-400">Sep 25, 2024</p>
            </div>
            <button className="text-red-500 text-sm font-medium">Book Again</button>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const ProfileScreen = () => {
  const user = { name: "Mark Jones", email: "mark.jones@email.com", phone: "+1 (702) 555-0123", memberSince: "October 2024", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face" };
  const menuItems = [{ icon: User, label: "Edit Profile" }, { icon: MapPin, label: "Saved Addresses" }, { icon: Calendar, label: "Booking History" }, { icon: Heart, label: "Favorite Barbers" }, { icon: MessageCircle, label: "Messages" }];

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="bg-gradient-to-br from-red-500 to-red-600 px-5 pt-12 pb-20 rounded-b-3xl">
        <div className="flex items-center justify-between mb-6"><DirectCutsLogo size={36} /></div>
      </div>
      <div className="px-5 -mt-16 relative z-10">
        <div className="bg-white rounded-2xl p-6 shadow-xl text-center">
          <img src={user.image} alt={user.name} className="w-24 h-24 rounded-full mx-auto border-4 border-white shadow-lg -mt-18 relative -top-12" />
          <div className="-mt-8">
            <h1 className="text-xl font-bold text-gray-800">{user.name}</h1>
            <p className="text-gray-500 text-sm">Member since {user.memberSince}</p>
          </div>
          <div className="flex justify-center space-x-6 mt-4 pt-4 border-t border-gray-100">
            <div className="text-center"><p className="text-2xl font-bold text-red-500">12</p><p className="text-xs text-gray-500">Bookings</p></div>
            <div className="text-center"><p className="text-2xl font-bold text-red-500">4</p><p className="text-xs text-gray-500">Favorites</p></div>
            <div className="text-center"><p className="text-2xl font-bold text-red-500">5.0</p><p className="text-xs text-gray-500">Rating</p></div>
          </div>
        </div>
      </div>
      <div className="px-5 mt-6">
        <div className="bg-white rounded-xl p-4 shadow-sm space-y-3">
          <div className="flex items-center"><Mail size={18} className="text-gray-400 mr-3" /><span className="text-gray-700">{user.email}</span></div>
          <div className="flex items-center"><Phone size={18} className="text-gray-400 mr-3" /><span className="text-gray-700">{user.phone}</span></div>
        </div>
      </div>
      <div className="px-5 mt-6">
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {menuItems.map(({ icon: Icon, label }, i) => (
            <button key={i} className="w-full flex items-center px-4 py-4 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0">
              <Icon size={20} className="text-red-500 mr-4" /><span className="text-gray-700 flex-1 text-left">{label}</span><ChevronLeft size={18} className="text-gray-400 rotate-180" />
            </button>
          ))}
        </div>
      </div>
      <div className="px-5 mt-6"><button className="w-full bg-gray-100 text-gray-600 py-3 rounded-xl font-medium hover:bg-gray-200 transition-colors">Sign Out</button></div>
    </div>
  );
};

const BookingModal = ({ barber, onClose, onConfirm }) => {
  const [selectedService, setSelectedService] = useState(0);
  const [selectedDate, setSelectedDate] = useState('Oct 15');
  const [selectedTime, setSelectedTime] = useState('10:00 AM');
  const times = ['9:00 AM', '10:00 AM', '11:00 AM', '2:00 PM', '3:00 PM', '4:00 PM'];
  const dates = ['Oct 14', 'Oct 15', 'Oct 16', 'Oct 17', 'Oct 18'];

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center">
      <div className="bg-white w-full max-w-md rounded-t-3xl p-6" style={{ animation: 'slideUp 0.3s ease-out' }}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800">Book Appointment</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
        </div>
        <div className="flex items-center mb-6 p-3 bg-gray-50 rounded-xl">
          <img src={barber.image} alt={barber.name} className="w-14 h-14 rounded-xl object-cover" />
          <div className="ml-3"><h3 className="font-semibold text-gray-800">{barber.name}</h3><p className="text-sm text-gray-500">{barber.specialty}</p></div>
        </div>
        <div className="mb-6">
          <h3 className="font-semibold text-gray-800 mb-3">Select Service</h3>
          <div className="space-y-2">
            {services.slice(0, 3).map((service, i) => (
              <button key={i} onClick={() => setSelectedService(i)} className={`w-full flex items-center justify-between p-3 rounded-xl border-2 transition-all ${selectedService === i ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-gray-300'}`}>
                <div className="flex items-center">{selectedService === i && <Check size={18} className="text-red-500 mr-2" />}<span className="text-gray-800">{service.name}</span></div>
                <span className="font-bold text-gray-800">${service.price}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="mb-6">
          <h3 className="font-semibold text-gray-800 mb-3">Select Date</h3>
          <div className="flex space-x-2 overflow-x-auto pb-2">
            {dates.map((date) => (<button key={date} onClick={() => setSelectedDate(date)} className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${selectedDate === date ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{date}</button>))}
          </div>
        </div>
        <div className="mb-6">
          <h3 className="font-semibold text-gray-800 mb-3">Select Time</h3>
          <div className="grid grid-cols-3 gap-2">
            {times.map((time) => (<button key={time} onClick={() => setSelectedTime(time)} className={`py-2 rounded-xl text-sm font-medium transition-all ${selectedTime === time ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{time}</button>))}
          </div>
        </div>
        <button onClick={onConfirm} className="w-full bg-red-500 text-white py-4 rounded-xl font-bold text-lg hover:bg-red-600 transition-colors shadow-lg">Confirm Booking - ${services[selectedService].price}</button>
      </div>
    </div>
  );
};

const SuccessModal = ({ onClose }) => (
  <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-5">
    <div className="bg-white w-full max-w-sm rounded-2xl p-8 text-center">
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"><Check size={40} className="text-green-500" /></div>
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Booking Confirmed!</h2>
      <p className="text-gray-500 mb-6">Your appointment has been successfully booked.</p>
      <button onClick={onClose} className="w-full bg-red-500 text-white py-3 rounded-xl font-semibold hover:bg-red-600 transition-colors">View Appointments</button>
    </div>
  </div>
);

export default function DirectCutsApp() {
  const [showSplash, setShowSplash] = useState(true);
  const [currentScreen, setCurrentScreen] = useState('home');
  const [selectedBarber, setSelectedBarber] = useState(null);
  const [showBooking, setShowBooking] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSelectBarber = (barber) => { setSelectedBarber(barber); setCurrentScreen('barberProfile'); };
  const handleBook = () => setShowBooking(true);
  const handleConfirmBooking = () => { setShowBooking(false); setShowSuccess(true); };
  const handleSuccessClose = () => { setShowSuccess(false); setCurrentScreen('appointments'); };

  if (showSplash) return <SplashScreen onComplete={() => setShowSplash(false)} />;

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen relative shadow-2xl">
      <style>{`@keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }`}</style>
      {currentScreen === 'home' && <HomeScreen onSelectBarber={handleSelectBarber} />}
      {currentScreen === 'nearby' && <NearbyScreen onSelectBarber={handleSelectBarber} />}
      {currentScreen === 'appointments' && <AppointmentsScreen onSelectBarber={handleSelectBarber} />}
      {currentScreen === 'profile' && <ProfileScreen />}
      {currentScreen === 'barberProfile' && selectedBarber && <BarberProfile barber={selectedBarber} onBack={() => setCurrentScreen('home')} onBook={handleBook} />}
      {showBooking && selectedBarber && <BookingModal barber={selectedBarber} onClose={() => setShowBooking(false)} onConfirm={handleConfirmBooking} />}
      {showSuccess && <SuccessModal onClose={handleSuccessClose} />}
      {currentScreen !== 'barberProfile' && <BottomNav active={currentScreen} onNavigate={setCurrentScreen} />}
    </div>
  );
}
