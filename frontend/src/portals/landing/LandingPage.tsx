import React, { useState } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  Clock,
  Smartphone,
  MapPin,
  Search,
  ArrowRight,
  Lock,
  CreditCard,
  Building,
  ChevronDown,
  Sparkles,
  FileText,
  Hotel,
  Home,
  Compass,
  GraduationCap
} from 'lucide-react';
import { PortalType } from '../../router/SubdomainRouter';

interface LandingPageProps {
  onNavigate: (portal: PortalType) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  const [stayCategory, setStayCategory] = useState<'all' | 'short' | 'extended'>('all');
  const [selectedPropertyType, setSelectedPropertyType] = useState('All');
  const [selectedLocation, setSelectedLocation] = useState('All');
  const [faqOpen, setFaqOpen] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setFaqOpen(faqOpen === index ? null : index);
  };

  const propertyTypes = ['All', 'Hotels & Suites', 'Serviced Apartments', 'Guesthouses', 'Student Hostels'];
  const locations = ['All', 'Beach Road', 'Westline', 'Chapel Hill', 'Anaji', 'Effia'];

  const faqs = [
    {
      q: 'Does FindStay cater to both hotel guests and students?',
      a: 'Yes! FindStay is an integrated accommodation marketplace. We cater to short-stay visitors (corporate travellers, tourists, and weekend visitors booking hotels, guesthouses, and serviced apartments by the night) as well as long-stay residents and students (booking monthly apartments or semester-based hostels).',
    },
    {
      q: 'How does the 15-minute concurrency hold prevent double-booking?',
      a: 'When any guest initiates a reservation for a hotel room, serviced apartment, or hostel bed, our backend triggers a database row-level lock (SELECT ... FOR UPDATE) and starts a 15-minute reservation timer. During this window, no other guest across the globe can book that unit while you complete payment.',
    },
    {
      q: 'Are property owners, hoteliers, and hostel managers verified?',
      a: 'Yes. Every property host must undergo strict verification, including government-issued Ghana Card authentication (GHA-XXXXXXXXX-X), business operating permits, and physical property inspection by our compliance team.',
    },
    {
      q: 'Which payment methods are accepted?',
      a: 'FindStay supports instant Mobile Money (MTN MoMo, Telecel Cash, AT Money) via direct USSD STK prompt, as well as Visa and Mastercard through our secured Paystack payment gateway.',
    },
    {
      q: 'What is the Property Management System (PMS) for hosts?',
      a: 'For boutique hotel managers, serviced apartment operators, and hostel proprietors, FindStay provides a full management dashboard to track room occupancy, check-ins/check-outs, cleaning turnover, and direct Mobile Money revenue settlement.',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      {/* 1. TOP ANNOUNCEMENT BANNER */}
      <div className="bg-gradient-to-r from-slate-900 via-teal-900 to-slate-900 text-white text-xs py-2 px-4 text-center font-medium shadow-inner flex items-center justify-center gap-2">
        <span className="bg-teal-500/20 text-teal-300 px-2 py-0.5 rounded-full font-bold text-[10px] uppercase tracking-wider border border-teal-500/40">
          Ghana Pilot Live
        </span>
        <span>
          🇬🇭 Takoradi Commercial Hub: Verified Hotels, Guesthouses, Serviced Apartments & Student Residencies with zero middleman fraud.
        </span>
      </div>

      {/* 2. PUBLIC HEADER / NAVBAR */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => onNavigate('landing')}>
            <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-md shadow-teal-500/20">
              <Building className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xl font-black tracking-tight text-slate-900">
                Find<span className="text-teal-600">Stay</span>
              </span>
              <span className="block text-[10px] font-semibold tracking-wider text-slate-500 uppercase -mt-1">
                Hotels &bull; Apartments &bull; Residencies
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-slate-600">
            <a href="#stay-options" className="hover:text-teal-600 transition">Accommodation Types</a>
            <a href="#featured" className="hover:text-teal-600 transition">Featured Stays</a>
            <a href="#how-it-works" className="hover:text-teal-600 transition">How It Works</a>
            <a href="#pms" className="hover:text-teal-600 transition">For Property Hosts</a>
            <a href="#security" className="hover:text-teal-600 transition">Security & Trust</a>
            <a href="#faq" className="hover:text-teal-600 transition">FAQ</a>
          </nav>

          {/* Action CTAs */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => onNavigate('landlord')}
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-teal-700 bg-slate-100 hover:bg-slate-200/80 px-3.5 py-2 rounded-lg transition"
            >
              <Building className="w-3.5 h-3.5" />
              <span>Host / PMS Portal</span>
            </button>
            <button
              onClick={() => onNavigate('guest')}
              className="inline-flex items-center gap-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 px-4 py-2 rounded-lg shadow-sm hover:shadow transition transform active:scale-95"
            >
              <span>Browse All Stays</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* 3. HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-teal-50/60 via-white to-slate-50 pt-12 pb-20 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-100/80 border border-teal-200 text-teal-800 text-xs font-bold mb-5 shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-teal-600" />
              <span>Unified Accommodation Marketplace & Property Management Platform</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.15]">
              Stay Your Way in Takoradi.{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-emerald-600">
                Hotels, Apartments, Guesthouses & Residencies.
              </span>
            </h1>
            <p className="mt-5 text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
              From nightly business trips in the Western Region's energy hub to semester-long student accommodation — discover verified properties, lock rooms in real-time, and pay safely via Mobile Money or Card.
            </p>
          </div>

          {/* Quick Search Widget with Stay Mode Tabs */}
          <div className="max-w-4xl mx-auto bg-white p-5 rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-200">
            {/* Stay Mode Switcher Tabs */}
            <div className="flex border-b border-slate-200 pb-3 mb-4 gap-2">
              <button
                onClick={() => setStayCategory('all')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  stayCategory === 'all'
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Compass className="w-3.5 h-3.5" /> All Accommodations
              </button>
              <button
                onClick={() => setStayCategory('short')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  stayCategory === 'short'
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Hotel className="w-3.5 h-3.5" /> Short Stays &bull; Nightly (Hotels & Apts)
              </button>
              <button
                onClick={() => setStayCategory('extended')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  stayCategory === 'extended'
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5" /> Extended &bull; Monthly / Semester (Hostels & Flats)
              </button>
            </div>

            {/* Filter Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-teal-600" /> Neighborhood / Suburb
                </label>
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 font-medium text-sm rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                >
                  {locations.map((loc) => (
                    <option key={loc} value={loc}>{loc === 'All' ? 'All Takoradi Areas' : `${loc}, Takoradi`}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 flex items-center gap-1">
                  <Building className="w-3.5 h-3.5 text-teal-600" /> Property Type
                </label>
                <select
                  value={selectedPropertyType}
                  onChange={(e) => setSelectedPropertyType(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 font-medium text-sm rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                >
                  {propertyTypes.map((pt) => (
                    <option key={pt} value={pt}>{pt}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-end">
                <button
                  onClick={() => onNavigate('guest')}
                  className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 shadow-sm hover:shadow transition transform active:scale-95"
                >
                  <Search className="w-4 h-4" />
                  <span>Search Verified Stays</span>
                </button>
              </div>
            </div>

            {/* Metrics Ribbon */}
            <div className="mt-5 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-3">
              <span className="flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> 100% Verified Hosts & Managers
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <Clock className="w-4 h-4 text-teal-600" /> 15-Minute Concurrency Hold
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <Smartphone className="w-4 h-4 text-amber-600" /> MTN, Telecel MoMo & Cards
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <Lock className="w-4 h-4 text-purple-600" /> Ghana Act 843 Compliant
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 4. ACCOMMODATION CATEGORIES */}
      <section id="stay-options" className="py-16 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold text-teal-700 bg-teal-100 uppercase tracking-widest px-3 py-1 rounded-full">
              Full Spectrum
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-3">
              Accommodation Tailored to Every Need
            </h2>
            <p className="mt-2 text-sm sm:text-base text-slate-600">
              One platform powering short-term hospitality and long-term residential stays across Ghana.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Category 1: Hotels */}
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 hover:shadow-md transition">
              <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center mb-4">
                <Hotel className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-base mb-1">Hotels & Suites</h3>
              <p className="text-xs text-slate-500 mb-3">Nightly Stays &bull; Corporate & Tourism</p>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                Deluxe rooms with conference facilities, pools, and oceanfront views for business travelers and vacationers.
              </p>
              <span className="text-xs font-bold text-blue-700">Nightly from GHS 350 &rarr;</span>
            </div>

            {/* Category 2: Serviced Apartments */}
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 hover:shadow-md transition">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4">
                <Home className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-base mb-1">Serviced Apartments</h3>
              <p className="text-xs text-slate-500 mb-3">Nightly & Monthly &bull; Executive Stays</p>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                Fully furnished 1 to 3-bedroom suites with private kitchens, backup generators, and dedicated parking for families and professionals.
              </p>
              <span className="text-xs font-bold text-emerald-700">Nightly or Monthly &rarr;</span>
            </div>

            {/* Category 3: Guesthouses */}
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 hover:shadow-md transition">
              <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mb-4">
                <Compass className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-base mb-1">Boutique Guesthouses</h3>
              <p className="text-xs text-slate-500 mb-3">Short Stays &bull; Cozy & Affordable</p>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                Serene, personalized hospitality with complimentary breakfast and quiet garden settings near historical spots.
              </p>
              <span className="text-xs font-bold text-amber-700">Nightly from GHS 280 &rarr;</span>
            </div>

            {/* Category 4: Hostels */}
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 hover:shadow-md transition">
              <div className="w-12 h-12 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center mb-4">
                <GraduationCap className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-base mb-1">Student Hostels</h3>
              <p className="text-xs text-slate-500 mb-3">Semester & Academic Stays</p>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                Master self-contain and shared units with polytank reserves, study desks, and proximity to Takoradi Technical University.
              </p>
              <span className="text-xs font-bold text-teal-700">Per Semester &rarr;</span>
            </div>
          </div>
        </div>
      </section>

      {/* 5. FEATURED STAYS SHOWCASE */}
      <section id="featured" className="py-16 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
            <div>
              <span className="text-xs font-bold text-teal-700 bg-teal-100 uppercase tracking-widest px-3 py-1 rounded-full">
                Takoradi Prime Listings
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
                Featured Accommodations
              </h2>
              <p className="text-sm text-slate-600 mt-1">
                Hand-picked, verified stays spanning luxury suites, serviced apartments, and student residencies.
              </p>
            </div>
            <button
              onClick={() => onNavigate('guest')}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-700 hover:text-teal-800 bg-white border border-teal-200 hover:bg-teal-50 px-4 py-2 rounded-lg transition"
            >
              <span>Explore Marketplace Directory</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Listing 1: Hotel */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-lg transition group">
              <div className="relative h-48 overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80"
                  alt="Atlantic Haven Hotel"
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />
                <div className="absolute top-3 left-3 bg-blue-600 text-white text-[11px] font-bold px-2.5 py-1 rounded-md shadow-sm flex items-center gap-1">
                  <Hotel className="w-3 h-3" /> Hotel &bull; 4-Star
                </div>
                <div className="absolute bottom-3 right-3 bg-slate-900/80 backdrop-blur-xs text-white text-xs font-bold px-2 py-0.5 rounded">
                  Beach Road, Takoradi
                </div>
              </div>
              <div className="p-5">
                <h3 className="font-bold text-slate-900 text-base mb-1">Atlantic Haven Hotel & Suites</h3>
                <p className="text-xs text-slate-500 mb-3">Executive Ocean Deluxe &bull; King Bed &bull; Ocean Balcony</p>
                <div className="flex flex-wrap gap-1.5 mb-4 text-[11px] text-slate-600">
                  <span className="bg-slate-100 px-2 py-0.5 rounded">Pool & Gym</span>
                  <span className="bg-slate-100 px-2 py-0.5 rounded">Restaurant</span>
                  <span className="bg-slate-100 px-2 py-0.5 rounded">Wi-Fi</span>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  <div>
                    <span className="text-xs text-slate-400">Nightly rate</span>
                    <p className="text-base font-extrabold text-slate-900">GHS 480 <span className="text-xs font-normal text-slate-500">/night</span></p>
                  </div>
                  <button
                    onClick={() => onNavigate('guest')}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm transition"
                  >
                    Reserve Stay
                  </button>
                </div>
              </div>
            </div>

            {/* Listing 2: Serviced Apartment */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-lg transition group">
              <div className="relative h-48 overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80"
                  alt="Oil City Serviced Apartments"
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />
                <div className="absolute top-3 left-3 bg-emerald-600 text-white text-[11px] font-bold px-2.5 py-1 rounded-md shadow-sm flex items-center gap-1">
                  <Home className="w-3 h-3" /> Serviced Flat
                </div>
                <div className="absolute bottom-3 right-3 bg-slate-900/80 backdrop-blur-xs text-white text-xs font-bold px-2 py-0.5 rounded">
                  Westline, Takoradi
                </div>
              </div>
              <div className="p-5">
                <h3 className="font-bold text-slate-900 text-base mb-1">Oil City Executive Serviced Flats</h3>
                <p className="text-xs text-slate-500 mb-3">2-Bedroom Luxury Suite &bull; Fitted Kitchen & Washer</p>
                <div className="flex flex-wrap gap-1.5 mb-4 text-[11px] text-slate-600">
                  <span className="bg-slate-100 px-2 py-0.5 rounded">Backup Gen</span>
                  <span className="bg-slate-100 px-2 py-0.5 rounded">Free Parking</span>
                  <span className="bg-slate-100 px-2 py-0.5 rounded">Balcony</span>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  <div>
                    <span className="text-xs text-slate-400">Nightly or Monthly</span>
                    <p className="text-base font-extrabold text-slate-900">GHS 650 <span className="text-xs font-normal text-slate-500">/night</span></p>
                  </div>
                  <button
                    onClick={() => onNavigate('guest')}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm transition"
                  >
                    Reserve Stay
                  </button>
                </div>
              </div>
            </div>

            {/* Listing 3: Student Hostel */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-lg transition group">
              <div className="relative h-48 overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80"
                  alt="Anaji Royal Student Hostel"
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />
                <div className="absolute top-3 left-3 bg-teal-600 text-white text-[11px] font-bold px-2.5 py-1 rounded-md shadow-sm flex items-center gap-1">
                  <GraduationCap className="w-3 h-3" /> Student Hostel
                </div>
                <div className="absolute bottom-3 right-3 bg-slate-900/80 backdrop-blur-xs text-white text-xs font-bold px-2 py-0.5 rounded">
                  Anaji, Takoradi
                </div>
              </div>
              <div className="p-5">
                <h3 className="font-bold text-slate-900 text-base mb-1">Anaji Royal Student Residency</h3>
                <p className="text-xs text-slate-500 mb-3">Master Self-Contain &bull; Near TTU &bull; Private Bath</p>
                <div className="flex flex-wrap gap-1.5 mb-4 text-[11px] text-slate-600">
                  <span className="bg-slate-100 px-2 py-0.5 rounded">Polytank Tank</span>
                  <span className="bg-slate-100 px-2 py-0.5 rounded">Study Desk</span>
                  <span className="bg-slate-100 px-2 py-0.5 rounded">Security Guard</span>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  <div>
                    <span className="text-xs text-slate-400">Academic semester</span>
                    <p className="text-base font-extrabold text-slate-900">GHS 2,700 <span className="text-xs font-normal text-slate-500">/sem</span></p>
                  </div>
                  <button
                    onClick={() => onNavigate('guest')}
                    className="bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm transition"
                  >
                    Reserve Stay
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. HOW IT WORKS (FOR ALL GUESTS) */}
      <section id="how-it-works" className="py-16 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold text-teal-700 bg-teal-100 uppercase tracking-widest px-3 py-1 rounded-full">
              Zero Confusion
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-3">
              How FindStay Works for Guests & Travelers
            </h2>
            <p className="mt-2 text-sm sm:text-base text-slate-600">
              Guaranteed availability, instant Mobile Money / Card checkout, and verified receipts.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 shadow-sm relative">
              <div className="w-12 h-12 rounded-xl bg-teal-600 text-white flex items-center justify-center font-black text-xl mb-4">
                1
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Search & Compare</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Filter by neighborhood (Beach Road, Westline, Anaji), property category, pricing model (nightly vs semester), and amenities.
              </p>
            </div>

            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 shadow-sm relative">
              <div className="w-12 h-12 rounded-xl bg-teal-600 text-white flex items-center justify-center font-black text-xl mb-4">
                2
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">15-Minute Row Lock</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Click reserve. The unit is immediately locked with a database row lock (SELECT ... FOR UPDATE) so no one else can book it simultaneously.
              </p>
            </div>

            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 shadow-sm relative">
              <div className="w-12 h-12 rounded-xl bg-teal-600 text-white flex items-center justify-center font-black text-xl mb-4">
                3
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Pay & Check-In</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Confirm your Mobile Money PIN or Card prompt. Receive your instant digital voucher, receipt, and front desk check-in instructions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. PROPERTY MANAGEMENT SYSTEM (PMS) FOR HOSTS */}
      <section id="pms" className="py-16 bg-gradient-to-br from-slate-900 via-slate-800 to-teal-950 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-xs font-bold text-teal-400 bg-teal-950/80 border border-teal-800 px-3 py-1 rounded-full uppercase tracking-wider">
                For Hoteliers & Property Hosts
              </span>
              <h2 className="text-3xl sm:text-4xl font-black mt-4 leading-tight">
                Modern PMS to Automate Bookings, Turnover & MoMo Payouts
              </h2>
              <p className="mt-4 text-slate-300 text-sm sm:text-base leading-relaxed">
                Whether you manage a 20-room oceanfront boutique hotel, a cluster of serviced apartments, or student residencies, FindStay gives you the tools to eliminate overbooking and collect revenue digitally.
              </p>

              <div className="mt-8 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-white">Automated MoMo & Bank Settlements</h4>
                    <p className="text-xs text-slate-400">Direct disbursements to MTN, Telecel, or bank accounts with real-time transaction ledgers.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-white">Occupancy & Housekeeping Grid</h4>
                    <p className="text-xs text-slate-400">Track available, held, booked, and maintenance/cleaning units in real-time across your properties.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-white">Verified Host Credibility</h4>
                    <p className="text-xs text-slate-400">Ghana Card verification elevates your listing above unverified informal social media ads.</p>
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <button
                  onClick={() => onNavigate('landlord')}
                  className="bg-teal-500 hover:bg-teal-400 text-slate-950 font-black text-sm px-5 py-2.5 rounded-lg shadow-lg shadow-teal-500/20 transition transform active:scale-95 flex items-center gap-2"
                >
                  <Building className="w-4 h-4" />
                  <span>Launch Host / PMS Portal</span>
                </button>
              </div>
            </div>

            {/* PMS Snapshot Visual */}
            <div className="bg-slate-800/90 border border-slate-700 p-6 sm:p-8 rounded-2xl shadow-2xl">
              <div className="flex items-center justify-between pb-4 border-b border-slate-700 mb-6">
                <div>
                  <h3 className="font-bold text-base text-white">FindStay Host Dashboard</h3>
                  <span className="text-xs text-slate-400">Takoradi Portfolio Manager</span>
                </div>
                <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2.5 py-0.5 rounded-full font-mono font-bold">Live Status</span>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-700/60">
                  <span className="text-xs text-slate-400">Total Units Under Mgmt</span>
                  <p className="text-2xl font-black text-white mt-1">28 Units</p>
                  <span className="text-[10px] text-teal-400">Hotels, Apts & Hostels</span>
                </div>
                <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-700/60">
                  <span className="text-xs text-slate-400">Weekly Revenue Disbursed</span>
                  <p className="text-2xl font-black text-emerald-400 mt-1">GHS 18,450</p>
                  <span className="text-[10px] text-slate-400">Via MTN & Telecel MoMo</span>
                </div>
              </div>

              <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-700/80 font-mono text-xs text-slate-300 space-y-1.5">
                <div className="text-teal-400 text-[11px] font-bold"># Live Property Status Tracker</div>
                <div>[Atlantic Haven] Suite 201 &rarr; <span className="text-emerald-400">CHECKED_IN (3 nights)</span></div>
                <div>[Oil City Apts] Flat 3A &rarr; <span className="text-amber-400">HELD (15m MoMo checkout)</span></div>
                <div>[Anaji Royal] Room 101 &rarr; <span className="text-purple-400">BOOKED (Semester 1)</span></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. SECURITY & DATA PROTECTION (GHANA ACT 843) */}
      <section id="security" className="py-16 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold text-purple-700 bg-purple-100 uppercase tracking-widest px-3 py-1 rounded-full">
              Enterprise Trust
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-3">
              Protected by Ghana Data Protection Act (Act 843)
            </h2>
            <p className="mt-2 text-sm sm:text-base text-slate-600">
              Built on banking-grade architecture to secure guest personal details and financial records.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="p-5 rounded-xl border border-slate-200 bg-slate-50/50">
              <div className="w-10 h-10 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center mb-3">
                <Lock className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-900 text-sm mb-1">BCrypt Password Hashing</h4>
              <p className="text-xs text-slate-600">Cost factor 12 cryptographic hashing safeguards all guest and host credentials.</p>
            </div>

            <div className="p-5 rounded-xl border border-slate-200 bg-slate-50/50">
              <div className="w-10 h-10 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center mb-3">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-900 text-sm mb-1">HMAC-SHA512 Webhooks</h4>
              <p className="text-xs text-slate-600">Payment notification integrity verified with cryptographic signatures against fraud.</p>
            </div>

            <div className="p-5 rounded-xl border border-slate-200 bg-slate-50/50">
              <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center mb-3">
                <Clock className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-900 text-sm mb-1">Row-Level DB Locks</h4>
              <p className="text-xs text-slate-600">Pessimistic concurrency engine eliminates double-booking race conditions.</p>
            </div>

            <div className="p-5 rounded-xl border border-slate-200 bg-slate-50/50">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center mb-3">
                <FileText className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-900 text-sm mb-1">Immutable Audit Trail</h4>
              <p className="text-xs text-slate-600">All administrative operations, room approvals, and payout records are permanently logged.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 9. FREQUENTLY ASKED QUESTIONS */}
      <section id="faq" className="py-16 bg-slate-50 border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <span className="text-xs font-bold text-teal-700 bg-teal-100 uppercase tracking-widest px-3 py-1 rounded-full">
              Common Questions
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden transition"
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full px-5 py-4 text-left flex items-center justify-between font-bold text-slate-900 text-sm hover:text-teal-700 transition"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                      faqOpen === idx ? 'rotate-180 text-teal-600' : ''
                    }`}
                  />
                </button>
                {faqOpen === idx && (
                  <div className="px-5 pb-4 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 10. FINAL CALL TO ACTION */}
      <section className="py-16 bg-teal-700 text-white text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
            Ready to Find or Manage Accommodation in Ghana?
          </h2>
          <p className="mt-3 text-teal-100 text-sm sm:text-base max-w-xl mx-auto">
            Experience verified accommodation with guaranteed availability, zero street middleman fees, and instant Mobile Money confirmation.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => onNavigate('guest')}
              className="bg-white text-teal-800 hover:bg-teal-50 font-extrabold text-sm px-6 py-3 rounded-xl shadow-lg transition transform active:scale-95 flex items-center gap-2"
            >
              <span>Explore All Accommodations</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onNavigate('landlord')}
              className="bg-teal-900/80 hover:bg-teal-900 text-white border border-teal-500 font-bold text-sm px-6 py-3 rounded-xl transition"
            >
              <span>Open Host & PMS Portal</span>
            </button>
          </div>
        </div>
      </section>

      {/* 11. PUBLIC FOOTER */}
      <footer className="bg-slate-900 text-slate-400 text-xs py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 text-white font-black text-lg mb-2">
                <Building className="w-5 h-5 text-teal-400" />
                <span>Find<span className="text-teal-400">Stay</span></span>
              </div>
              <p className="text-slate-400 leading-relaxed">
                Ghana's integrated accommodation discovery marketplace and property management platform. Pilot launch in Sekondi-Takoradi Metropolitan Area.
              </p>
            </div>

            <div>
              <h4 className="text-white font-bold mb-3 uppercase tracking-wider text-[11px]">System Portals</h4>
              <ul className="space-y-2">
                <li>
                  <button onClick={() => onNavigate('guest')} className="hover:text-teal-400 flex items-center gap-1">
                    <span>Guest Marketplace (app.findstay.com)</span>
                  </button>
                </li>
                <li>
                  <button onClick={() => onNavigate('landlord')} className="hover:text-teal-400 flex items-center gap-1">
                    <span>Host / PMS Portal (host.findstay.com)</span>
                  </button>
                </li>
                <li>
                  <button onClick={() => onNavigate('admin')} className="hover:text-teal-400 flex items-center gap-1">
                    <span>Admin Governance (admin.findstay.com)</span>
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold mb-3 uppercase tracking-wider text-[11px]">Accommodation Types</h4>
              <ul className="space-y-2">
                <li><span className="hover:text-slate-300">Hotels & Luxury Suites</span></li>
                <li><span className="hover:text-slate-300">Serviced Executive Apartments</span></li>
                <li><span className="hover:text-slate-300">Heritage Boutique Guesthouses</span></li>
                <li><span className="hover:text-slate-300">Student Hostels & Residencies</span></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold mb-3 uppercase tracking-wider text-[11px]">Compliance & Governance</h4>
              <p className="text-slate-400 mb-2">
                Built for the Department of Information Technology initial defense presentation.
              </p>
              <span className="inline-block bg-slate-800 text-teal-400 border border-slate-700 text-[10px] font-mono px-2 py-1 rounded">
                Ghana Act 843 Compliant
              </span>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500">
            <p>&copy; 2026 FindStay Ghana. All rights reserved.</p>
            <p>Designed & Developed by the 11-Member FindStay Engineering Team.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
