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
  Check,
  ChevronDown,
  Sparkles,
  FileText
} from 'lucide-react';
import { PortalType } from '../../router/SubdomainRouter';

interface LandingPageProps {
  onNavigate: (portal: PortalType) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  const [selectedNeighborhood, setSelectedNeighborhood] = useState('All');
  const [selectedRoomType, setSelectedRoomType] = useState('All');
  const [faqOpen, setFaqOpen] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setFaqOpen(faqOpen === index ? null : index);
  };

  const neighborhoods = ['All', 'Anaji', 'Effia', 'Westline', 'Beach Road', 'Chapel Hill'];
  const roomTypes = ['All', 'Self-Contain', '2-in-1 Shared', '4-in-1 Shared'];

  const faqs = [
    {
      q: 'How does FindStay prevent double-booking of rooms?',
      a: 'When a student clicks "Reserve Room", our backend engine triggers a database row-level lock (SELECT ... FOR UPDATE) and starts a strict 15-minute hold timer. During this window, no other student in Ghana can book that room while you complete your Mobile Money payment.',
    },
    {
      q: 'Are hostel landlords and caretakers verified?',
      a: 'Yes. Every property owner or manager must submit their government-issued Ghana Card (GHA-XXXXXXXXX-X) and proof of hostel ownership. Our compliance team manually inspects each property before any listing goes live.',
    },
    {
      q: 'Which Mobile Money networks are supported for payment?',
      a: 'FindStay integrates directly with MTN MoMo, Telecel Cash, and AT Money via Paystack. You receive an instant USSD prompt on your phone to approve the transaction with your MoMo PIN.',
    },
    {
      q: 'Do students pay middleman or agent inspection fees?',
      a: 'Zero. FindStay charges students GHS 0 in registration or agent fees. You view verified photos, room dimensions, water/electricity details, and book directly at the landlord\'s approved rates.',
    },
    {
      q: 'Is my student personal information safe under Ghana law?',
      a: '100%. FindStay strictly complies with the Ghana Data Protection Act 2012 (Act 843). Student phone numbers, Ghana Card details, and MoMo records are encrypted using AES-256 and BCrypt hashing.',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      {/* 1. TOP ANNOUNCEMENT BANNER */}
      <div className="bg-gradient-to-r from-teal-800 via-teal-700 to-emerald-800 text-white text-xs py-2 px-4 text-center font-medium shadow-inner flex items-center justify-center gap-2">
        <span className="bg-teal-900/60 text-teal-200 px-2 py-0.5 rounded-full font-bold text-[10px] uppercase tracking-wider border border-teal-600/50">
          Pilot Live
        </span>
        <span>
          🇬🇭 Takoradi Chapter: 450+ verified student rooms in Anaji, Effia, Westline & Beach Road with zero agent fraud.
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
                Student Living • Takoradi
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-slate-600">
            <a href="#how-it-works" className="hover:text-teal-600 transition">How It Works</a>
            <a href="#neighborhoods" className="hover:text-teal-600 transition">Neighborhoods</a>
            <a href="#landlords" className="hover:text-teal-600 transition">For Landlords</a>
            <a href="#security" className="hover:text-teal-600 transition">Trust & Security</a>
            <a href="#faq" className="hover:text-teal-600 transition">FAQ</a>
          </nav>

          {/* Action CTAs */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => onNavigate('landlord')}
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-teal-700 bg-slate-100 hover:bg-slate-200/80 px-3.5 py-2 rounded-lg transition"
            >
              <Building className="w-3.5 h-3.5" />
              <span>Host Portal</span>
            </button>
            <button
              onClick={() => onNavigate('guest')}
              className="inline-flex items-center gap-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 px-4 py-2 rounded-lg shadow-sm hover:shadow transition transform active:scale-95"
            >
              <span>Explore Hostels</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* 3. HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-teal-50/70 via-white to-slate-50 pt-12 pb-20 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-100/80 border border-teal-200 text-teal-800 text-xs font-bold mb-5 shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-teal-600" />
              <span>The Smart Accommodation Platform for Tertiary Students in Ghana</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.15]">
              Safe, Verified Student Living in Takoradi.{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-emerald-600">
                Direct From Landlords.
              </span>
            </h1>
            <p className="mt-5 text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
              Eliminate fake street agents, 20% extortion fees, and double-booked rooms. Browse verified hostels near campus, lock your room with a 15-minute safety hold, and pay securely via Mobile Money.
            </p>
          </div>

          {/* Quick Search Widget */}
          <div className="max-w-4xl mx-auto bg-white p-4 sm:p-5 rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-200">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-teal-600" /> Neighborhood
                </label>
                <select
                  value={selectedNeighborhood}
                  onChange={(e) => setSelectedNeighborhood(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 font-medium text-sm rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                >
                  {neighborhoods.map((n) => (
                    <option key={n} value={n}>{n === 'All' ? 'All Takoradi Areas' : `${n}, Takoradi`}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 flex items-center gap-1">
                  <Building className="w-3.5 h-3.5 text-teal-600" /> Room Layout
                </label>
                <select
                  value={selectedRoomType}
                  onChange={(e) => setSelectedRoomType(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 font-medium text-sm rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                >
                  {roomTypes.map((r) => (
                    <option key={r} value={r}>{r === 'All' ? 'All Room Types' : r}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-end">
                <button
                  onClick={() => onNavigate('guest')}
                  className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 shadow-sm hover:shadow transition transform active:scale-95"
                >
                  <Search className="w-4 h-4" />
                  <span>Search Verified Hostels</span>
                </button>
              </div>
            </div>

            {/* Quick Metrics Strip */}
            <div className="mt-5 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-3">
              <span className="flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> 100% Ghana Card Verified
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <Clock className="w-4 h-4 text-teal-600" /> 15-Minute Concurrency Hold
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <Smartphone className="w-4 h-4 text-amber-600" /> MTN & Telecel MoMo Prompt
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <Lock className="w-4 h-4 text-purple-600" /> Act 843 Data Protection
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 4. COMPARISON: OLD WAY VS FINDSTAY */}
      <section className="py-16 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Why Takoradi Students Choose FindStay
            </h2>
            <p className="mt-3 text-sm sm:text-base text-slate-600">
              The traditional hostel hunt in Ghana is broken. FindStay introduces transparency, concurrency protection, and direct digital booking.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* The Old Way */}
            <div className="bg-rose-50/60 rounded-2xl p-6 sm:p-8 border border-rose-200 shadow-sm relative">
              <span className="bg-rose-100 text-rose-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                The Traditional Hassle
              </span>
              <h3 className="text-xl font-bold text-slate-900 mt-4 mb-4">Unregulated Street Agents</h3>
              <ul className="space-y-3.5 text-sm text-slate-700">
                <li className="flex items-start gap-2.5">
                  <span className="text-rose-600 font-bold">✕</span>
                  <span><strong>15% to 20% Middleman Fees:</strong> Non-refundable registration fees paid at taxi ranks just to view a room.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-rose-600 font-bold">✕</span>
                  <span><strong>Rampant Double-Bookings:</strong> Multiple students pay cash for the same room; first to arrive takes the key.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-rose-600 font-bold">✕</span>
                  <span><strong>Cash Carrying Risk:</strong> Walking through market streets carrying GHS 2,500+ physical cash for hostel rent.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-rose-600 font-bold">✕</span>
                  <span><strong>No Legal Recourse:</strong> Ghost landlords vanish once cash is handed over; zero verifiable paper trail.</span>
                </li>
              </ul>
            </div>

            {/* The FindStay Way */}
            <div className="bg-emerald-50/70 rounded-2xl p-6 sm:p-8 border-2 border-emerald-400 shadow-md relative">
              <span className="bg-emerald-200 text-emerald-900 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                The FindStay Guarantee
              </span>
              <h3 className="text-xl font-bold text-slate-900 mt-4 mb-4">Direct Digital Accommodation</h3>
              <ul className="space-y-3.5 text-sm text-slate-800">
                <li className="flex items-start gap-2.5">
                  <Check className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                  <span><strong>0% Student Commission:</strong> Students pay zero agent markups. Book at verified landlord prices.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                  <span><strong>15-Minute Row Lock:</strong> PostgreSQL row-level pessimistic locking prevents anyone else from touching your room.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                  <span><strong>Instant Mobile Money STK Push:</strong> Approve payments securely via MTN MoMo or Telecel Cash with your secret PIN.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                  <span><strong>Ghana Card Verified Landlords:</strong> Identity verified against national registries with legal tenancy agreement.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 5. HOW IT WORKS */}
      <section id="how-it-works" className="py-16 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold text-teal-700 bg-teal-100 uppercase tracking-widest px-3 py-1 rounded-full">
              Seamless Process
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-3">
              How FindStay Works in 3 Simple Steps
            </h2>
            <p className="mt-2 text-sm sm:text-base text-slate-600">
              From discovering your hostel in Takoradi to receiving your digital move-in pass.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative hover:shadow-md transition">
              <div className="w-12 h-12 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center font-black text-xl mb-4">
                1
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Search & Filter</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Filter by neighborhood (Anaji, Effia, Westline), amenities (polytank, backup generator, Wi-Fi), and room layout (Self-Contain or Shared).
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative hover:shadow-md transition">
              <div className="w-12 h-12 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center font-black text-xl mb-4">
                2
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Lock Room for 15 Mins</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Click "Reserve Room". The system instantly locks the room in our database with a live 15-minute countdown, holding it exclusively for you.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative hover:shadow-md transition">
              <div className="w-12 h-12 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center font-black text-xl mb-4">
                3
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">MoMo PIN & Move-in Pass</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Enter your Mobile Money number, approve the USSD prompt on your phone, and receive an instant SMS booking confirmation and landlord move-in contact.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. FEATURED TAKORADI NEIGHBORHOODS & HOSTELS */}
      <section id="neighborhoods" className="py-16 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
            <div>
              <span className="text-xs font-bold text-teal-700 bg-teal-100 uppercase tracking-widest px-3 py-1 rounded-full">
                Takoradi Prime Zones
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
                Featured Student Accommodations
              </h2>
              <p className="text-sm text-slate-600 mt-1">
                Verified locations within short commuting distance of Takoradi Technical University (TTU).
              </p>
            </div>
            <button
              onClick={() => onNavigate('guest')}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-700 hover:text-teal-800 bg-teal-50 hover:bg-teal-100 px-4 py-2 rounded-lg transition"
            >
              <span>View All 450+ Rooms</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Hostel 1 */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-lg transition group">
              <div className="relative h-48 overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80"
                  alt="Anaji Royal Student Hostel"
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />
                <div className="absolute top-3 left-3 bg-teal-600 text-white text-[11px] font-bold px-2.5 py-1 rounded-md shadow-sm flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Ghana Card Verified
                </div>
                <div className="absolute bottom-3 right-3 bg-slate-900/80 backdrop-blur-xs text-white text-xs font-bold px-2 py-0.5 rounded">
                  Anaji, Takoradi
                </div>
              </div>
              <div className="p-5">
                <h3 className="font-bold text-slate-900 text-base mb-1">Anaji Royal Student Hostel</h3>
                <p className="text-xs text-slate-500 mb-3">Master Self-Contain • Private Washroom & Kitchenette</p>
                <div className="flex flex-wrap gap-1.5 mb-4 text-[11px] text-slate-600">
                  <span className="bg-slate-100 px-2 py-0.5 rounded">Polytank Reserve</span>
                  <span className="bg-slate-100 px-2 py-0.5 rounded">Backup Generator</span>
                  <span className="bg-slate-100 px-2 py-0.5 rounded">Wi-Fi</span>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  <div>
                    <span className="text-xs text-slate-400">Semester rate</span>
                    <p className="text-base font-extrabold text-slate-900">GHS 2,700 <span className="text-xs font-normal text-slate-500">/sem</span></p>
                  </div>
                  <button
                    onClick={() => onNavigate('guest')}
                    className="bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm transition"
                  >
                    Book Room
                  </button>
                </div>
              </div>
            </div>

            {/* Hostel 2 */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-lg transition group">
              <div className="relative h-48 overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80"
                  alt="Effia Heritage Lodge"
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />
                <div className="absolute top-3 left-3 bg-teal-600 text-white text-[11px] font-bold px-2.5 py-1 rounded-md shadow-sm flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Ghana Card Verified
                </div>
                <div className="absolute bottom-3 right-3 bg-slate-900/80 backdrop-blur-xs text-white text-xs font-bold px-2 py-0.5 rounded">
                  Effia, Takoradi
                </div>
              </div>
              <div className="p-5">
                <h3 className="font-bold text-slate-900 text-base mb-1">Effia Heritage Lodge</h3>
                <p className="text-xs text-slate-500 mb-3">Self-Contain Studio • 5 mins from TTU Main Gate</p>
                <div className="flex flex-wrap gap-1.5 mb-4 text-[11px] text-slate-600">
                  <span className="bg-slate-100 px-2 py-0.5 rounded">Prepaid Meter</span>
                  <span className="bg-slate-100 px-2 py-0.5 rounded">Borehole Water</span>
                  <span className="bg-slate-100 px-2 py-0.5 rounded">Security Gate</span>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  <div>
                    <span className="text-xs text-slate-400">Semester rate</span>
                    <p className="text-base font-extrabold text-slate-900">GHS 2,500 <span className="text-xs font-normal text-slate-500">/sem</span></p>
                  </div>
                  <button
                    onClick={() => onNavigate('guest')}
                    className="bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm transition"
                  >
                    Book Room
                  </button>
                </div>
              </div>
            </div>

            {/* Hostel 3 */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-lg transition group">
              <div className="relative h-48 overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80"
                  alt="Westline Palms Executive Lodge"
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />
                <div className="absolute top-3 left-3 bg-teal-600 text-white text-[11px] font-bold px-2.5 py-1 rounded-md shadow-sm flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Ghana Card Verified
                </div>
                <div className="absolute bottom-3 right-3 bg-slate-900/80 backdrop-blur-xs text-white text-xs font-bold px-2 py-0.5 rounded">
                  Westline, Takoradi
                </div>
              </div>
              <div className="p-5">
                <h3 className="font-bold text-slate-900 text-base mb-1">Westline Palms Executive Lodge</h3>
                <p className="text-xs text-slate-500 mb-3">Penthouse Unit • Quiet Study Environment</p>
                <div className="flex flex-wrap gap-1.5 mb-4 text-[11px] text-slate-600">
                  <span className="bg-slate-100 px-2 py-0.5 rounded">Air Condition</span>
                  <span className="bg-slate-100 px-2 py-0.5 rounded">Wi-Fi</span>
                  <span className="bg-slate-100 px-2 py-0.5 rounded">Car Parking</span>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  <div>
                    <span className="text-xs text-slate-400">Semester rate</span>
                    <p className="text-base font-extrabold text-slate-900">GHS 3,800 <span className="text-xs font-normal text-slate-500">/sem</span></p>
                  </div>
                  <button
                    onClick={() => onNavigate('guest')}
                    className="bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm transition"
                  >
                    Book Room
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. FOR LANDLORDS & HOSTEL OWNERS */}
      <section id="landlords" className="py-16 bg-gradient-to-br from-slate-900 via-slate-800 to-teal-950 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-xs font-bold text-teal-400 bg-teal-950/80 border border-teal-800 px-3 py-1 rounded-full uppercase tracking-wider">
                For Property Managers
              </span>
              <h2 className="text-3xl sm:text-4xl font-black mt-4 leading-tight">
                Fill Your Rooms Faster & Automate MoMo Rent Collection
              </h2>
              <p className="mt-4 text-slate-300 text-sm sm:text-base leading-relaxed">
                Join over 40+ verified private hostel owners in Sekondi-Takoradi who use FindStay to manage room occupancy, eradicate rent disputes, and receive automated MoMo payouts straight into their mobile wallet.
              </p>

              <div className="mt-8 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-white">Direct Mobile Money Settlement</h4>
                    <p className="text-xs text-slate-400">Rent is settled directly into your MTN or Telecel business wallet upon student confirmation.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-white">Zero Double Booking Conflicts</h4>
                    <p className="text-xs text-slate-400">Automatic 15-minute room locks ensure no two caretakers promise the same bed to different students.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-white">Ghana Card Verification Badge</h4>
                    <p className="text-xs text-slate-400">Verified badge attracts 3.4x more student bookings compared to unverified listings.</p>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex items-center gap-4">
                <button
                  onClick={() => onNavigate('landlord')}
                  className="bg-teal-500 hover:bg-teal-400 text-slate-950 font-black text-sm px-5 py-2.5 rounded-lg shadow-lg shadow-teal-500/20 transition transform active:scale-95 flex items-center gap-2"
                >
                  <Building className="w-4 h-4" />
                  <span>Open Landlord Portal</span>
                </button>
              </div>
            </div>

            {/* Landlord Metric Card */}
            <div className="bg-slate-800/90 border border-slate-700 p-6 sm:p-8 rounded-2xl shadow-2xl">
              <h3 className="font-bold text-lg text-slate-200 mb-6 flex items-center justify-between">
                <span>Landlord Performance Snapshot</span>
                <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded font-mono">Live Sync</span>
              </h3>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-slate-900/70 p-4 rounded-xl border border-slate-700/60">
                  <span className="text-xs text-slate-400">Average Fill Time</span>
                  <p className="text-2xl font-black text-white mt-1">4.2 Days</p>
                  <span className="text-[10px] text-teal-400">vs. 21 days with agents</span>
                </div>
                <div className="bg-slate-900/70 p-4 rounded-xl border border-slate-700/60">
                  <span className="text-xs text-slate-400">Payment Collection</span>
                  <p className="text-2xl font-black text-emerald-400 mt-1">100%</p>
                  <span className="text-[10px] text-slate-400">Automated MoMo settlement</span>
                </div>
              </div>
              <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-700/80 font-mono text-xs text-slate-300 space-y-1.5">
                <div className="text-teal-400 text-[11px] font-bold"># Recent Landlord Payout (Takoradi)</div>
                <div>[11:28 AM] Anaji Royal: Room 101 booked &bull; GHS 2,700</div>
                <div>[11:28 AM] Paystack Webhook &rarr; Payout GHS 2,565 to MTN 0244***877</div>
                <div className="text-emerald-400 text-[10px]">[STATUS] Settled in 4.3 seconds &bull; Ref: PSTK_98412</div>
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
              Enterprise Security
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-3">
              Compliant with Ghana Data Protection Act (Act 843)
            </h2>
            <p className="mt-2 text-sm sm:text-base text-slate-600">
              FindStay enforces banking-grade security architecture designed to safeguard student records and financial transactions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="p-5 rounded-xl border border-slate-200 bg-slate-50/50">
              <div className="w-10 h-10 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center mb-3">
                <Lock className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-900 text-sm mb-1">BCrypt Password Hashing</h4>
              <p className="text-xs text-slate-600">Cost factor 12 cryptographic hashing guarantees credentials cannot be reversed or leaked.</p>
            </div>

            <div className="p-5 rounded-xl border border-slate-200 bg-slate-50/50">
              <div className="w-10 h-10 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center mb-3">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-900 text-sm mb-1">HMAC-SHA512 Webhooks</h4>
              <p className="text-xs text-slate-600">Every Mobile Money callback is validated cryptographically to defeat replay and spoofing attacks.</p>
            </div>

            <div className="p-5 rounded-xl border border-slate-200 bg-slate-50/50">
              <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center mb-3">
                <Clock className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-900 text-sm mb-1">Pessimistic Locking</h4>
              <p className="text-xs text-slate-600">SELECT ... FOR UPDATE prevents race conditions during high-volume matriculation booking rush.</p>
            </div>

            <div className="p-5 rounded-xl border border-slate-200 bg-slate-50/50">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center mb-3">
                <FileText className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-900 text-sm mb-1">Immutable Audit Trail</h4>
              <p className="text-xs text-slate-600">Every admin action, landlord approval, and booking transition is recorded in append-only logs.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 9. FREQUENTLY ASKED QUESTIONS */}
      <section id="faq" className="py-16 bg-slate-50 border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <span className="text-xs font-bold text-teal-700 bg-teal-100 uppercase tracking-widest px-3 py-1 rounded-full">
              Got Questions?
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

      {/* 10. FINAL CALL TO ACTION (CTA) */}
      <section className="py-16 bg-teal-600 text-white text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
            Ready to Secure Your Takoradi Hostel Room?
          </h2>
          <p className="mt-3 text-teal-100 text-sm sm:text-base max-w-xl mx-auto">
            Experience student accommodation hunting with zero agent commissions, guaranteed room locks, and instant Mobile Money verification.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => onNavigate('guest')}
              className="bg-white text-teal-800 hover:bg-teal-50 font-extrabold text-sm px-6 py-3 rounded-xl shadow-lg transition transform active:scale-95 flex items-center gap-2"
            >
              <span>Explore Hostels Now</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onNavigate('landlord')}
              className="bg-teal-800/80 hover:bg-teal-800 text-white border border-teal-500 font-bold text-sm px-6 py-3 rounded-xl transition"
            >
              <span>Hostel Landlord Signup</span>
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
                The premier university student accommodation marketplace and property management platform in Ghana. Pilot launch in Takoradi.
              </p>
            </div>

            <div>
              <h4 className="text-white font-bold mb-3 uppercase tracking-wider text-[11px]">System Portals</h4>
              <ul className="space-y-2">
                <li>
                  <button onClick={() => onNavigate('guest')} className="hover:text-teal-400 flex items-center gap-1">
                    <span>Student Marketplace (app.findstay.com)</span>
                  </button>
                </li>
                <li>
                  <button onClick={() => onNavigate('landlord')} className="hover:text-teal-400 flex items-center gap-1">
                    <span>Landlord Portal (host.findstay.com)</span>
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
              <h4 className="text-white font-bold mb-3 uppercase tracking-wider text-[11px]">Takoradi Hotspots</h4>
              <ul className="space-y-2">
                <li><span className="hover:text-slate-300">Anaji Student Hostels</span></li>
                <li><span className="hover:text-slate-300">Effia Campus Enclave</span></li>
                <li><span className="hover:text-slate-300">Westline Residential</span></li>
                <li><span className="hover:text-slate-300">Beach Road Heights</span></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold mb-3 uppercase tracking-wider text-[11px]">Compliance & Defense</h4>
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
