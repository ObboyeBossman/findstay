import React, { useState } from 'react';
import {
  Building,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Smartphone,
  MapPin,
  Search,
  ArrowRight,
  Lock,
  CreditCard,
  ChevronDown,
  Sparkles,
  FileText,
  Hotel,
  Home,
  Compass,
  GraduationCap,
  ExternalLink,
  Shield,
  HelpCircle,
  FileCheck2,
  PhoneCall,
  Mail,
  UserCheck
} from 'lucide-react';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'home' | 'about' | 'terms' | 'privacy' | 'refunds'>('home');
  const [selectedNeighborhood, setSelectedNeighborhood] = useState('All');
  const [selectedPropertyType, setSelectedPropertyType] = useState('All');
  const [faqOpen, setFaqOpen] = useState<number | null>(null);

  const toggleFaq = (idx: number) => {
    setFaqOpen(faqOpen === idx ? null : idx);
  };

  const getGuestUrl = () => {
    if (window.location.hostname.includes('vercel.app')) {
      return 'https://app-findstay.vercel.app';
    }
    return 'http://localhost:3001';
  };

  const getOwnerUrl = () => {
    if (window.location.hostname.includes('vercel.app')) {
      return 'https://host-findstay.vercel.app';
    }
    return 'http://localhost:3002';
  };

  const getAdminUrl = () => {
    if (window.location.hostname.includes('vercel.app')) {
      return 'https://admin-findstay.vercel.app';
    }
    return 'http://localhost:3003';
  };

  const faqs = [
    {
      q: 'Does FindStay cater to both hotel guests and students?',
      a: 'Yes. FindStay is an integrated accommodation marketplace serving short-stay travelers (nightly bookings for hotels, guesthouses, and serviced apartments) as well as students and young professionals (monthly and semester-long residential stays).'
    },
    {
      q: 'How does the 15-minute concurrency hold prevent double-booking?',
      a: 'When any guest initiates a reservation, our backend triggers a database row-level lock (SELECT ... FOR UPDATE) and starts a 15-minute countdown. During this window, no other guest worldwide can book that room while you complete payment.'
    },
    {
      q: 'Are property owners and managers verified?',
      a: 'Yes. Every host must submit their government-issued Ghana Card (GHA-XXXXXXXXX-X) and proof of property ownership, which is manually verified by our compliance team before any listing is published.'
    },
    {
      q: 'Which payment methods are supported?',
      a: 'FindStay supports instant Mobile Money (MTN MoMo, Telecel Cash, AT Money) via direct USSD STK prompt, as well as Visa and Mastercard through our secured Paystack payment gateway.'
    },
    {
      q: 'What is the refund and cancellation policy?',
      a: 'Cancellations made 48+ hours before the scheduled check-in receive a 100% refund. For semester hostel bookings, deposits are fully refundable within 72 hours of reservation if the student is unable to secure admission.'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-teal-900 to-slate-900 text-white text-xs py-2 px-4 text-center font-medium shadow-inner flex items-center justify-center gap-2">
        <span className="bg-teal-500/20 text-teal-300 px-2 py-0.5 rounded-full font-bold text-[10px] uppercase tracking-wider border border-teal-500/40">
          Ghana Pilot Live
        </span>
        <span>
          🇬🇭 Takoradi Commercial Hub: Verified Hotels, Guesthouses, Serviced Apartments &amp; Student Residencies.
        </span>
      </div>

      {/* Main Navbar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('home')}>
            <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-md shadow-teal-500/20">
              <Building className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xl font-black tracking-tight text-slate-900">
                Find<span className="text-teal-600">Stay</span>
              </span>
              <span className="block text-[10px] font-semibold tracking-wider text-slate-500 uppercase -mt-1">
                Official Website &bull; findstay.com
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium text-slate-600">
            <button
              onClick={() => setActiveTab('home')}
              className={`hover:text-teal-600 transition ${activeTab === 'home' ? 'text-teal-600 font-bold' : ''}`}
            >
              Home
            </button>
            <button
              onClick={() => setActiveTab('about')}
              className={`hover:text-teal-600 transition ${activeTab === 'about' ? 'text-teal-600 font-bold' : ''}`}
            >
              About FindStay
            </button>
            <a href="#how-it-works" onClick={() => setActiveTab('home')} className="hover:text-teal-600 transition">
              How It Works
            </a>
            <button
              onClick={() => setActiveTab('terms')}
              className={`hover:text-teal-600 transition ${activeTab === 'terms' ? 'text-teal-600 font-bold' : ''}`}
            >
              Terms &amp; Policies
            </button>
          </nav>

          <div className="flex items-center space-x-3">
            <a
              href={getOwnerUrl()}
              target="_blank"
              rel="noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-teal-700 bg-slate-100 hover:bg-slate-200/80 px-3.5 py-2 rounded-lg transition"
            >
              <Building className="w-3.5 h-3.5" />
              <span>Host / PMS (PWA)</span>
              <ExternalLink className="w-3 h-3 opacity-60" />
            </a>
            <a
              href={getGuestUrl()}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 px-4 py-2 rounded-lg shadow-sm hover:shadow transition transform active:scale-95"
            >
              <span>Launch Booking App</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </header>

      {/* BODY CONTENT BASED ON ACTIVE TAB */}
      <main className="flex-1">
        {activeTab === 'home' && (
          <div>
            {/* HERO */}
            <section className="relative overflow-hidden bg-gradient-to-b from-teal-50/60 via-white to-slate-50 pt-12 pb-20 border-b border-slate-200">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-3xl mx-auto mb-10">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-100/80 border border-teal-200 text-teal-800 text-xs font-bold mb-5 shadow-xs">
                    <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                    <span>Independent Public Portal &bull; Monorepo Architecture</span>
                  </div>
                  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.15]">
                    Stay Your Way in Takoradi.{' '}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-emerald-600">
                      Hotels, Apartments &amp; Residencies.
                    </span>
                  </h1>
                  <p className="mt-5 text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
                    Takoradi's two-sided accommodation marketplace. Browse verified properties, reserve with 15-minute database row locks, and pay safely via Mobile Money or Card.
                  </p>
                </div>

                {/* Quick Launch Card */}
                <div className="max-w-4xl mx-auto bg-white p-5 rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-200">
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
                        {['All', 'Beach Road', 'Westline', 'Chapel Hill', 'Anaji', 'Effia'].map((n) => (
                          <option key={n} value={n}>{n === 'All' ? 'All Takoradi Areas' : `${n}, Takoradi`}</option>
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
                        {['All', 'Hotels & Suites', 'Serviced Apartments', 'Guesthouses', 'Student Hostels'].map((t) => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </div>

                    <div className="flex items-end">
                      <a
                        href={getGuestUrl()}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 shadow-sm transition"
                      >
                        <Search className="w-4 h-4" />
                        <span>Search in Guest App</span>
                      </a>
                    </div>
                  </div>

                  <div className="mt-5 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-3">
                    <span className="flex items-center gap-1.5 font-medium">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" /> 100% Ghana Card Verified
                    </span>
                    <span className="flex items-center gap-1.5 font-medium">
                      <Clock className="w-4 h-4 text-teal-600" /> 15-Minute Concurrency Hold
                    </span>
                    <span className="flex items-center gap-1.5 font-medium">
                      <Smartphone className="w-4 h-4 text-amber-600" /> MTN, Telecel MoMo &amp; Cards
                    </span>
                    <span className="flex items-center gap-1.5 font-medium">
                      <Lock className="w-4 h-4 text-purple-600" /> Ghana Act 843 Compliant
                    </span>
                  </div>
                </div>
              </div>
            </section>

            {/* 4 ECOSYSTEM APPS SHOWCASE */}
            <section className="py-16 bg-white border-b border-slate-200">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-2xl mx-auto mb-12">
                  <span className="text-xs font-bold text-teal-700 bg-teal-100 uppercase tracking-widest px-3 py-1 rounded-full">
                    Modular Monorepo
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-3">
                    The 4 Portals of the FindStay Ecosystem
                  </h2>
                  <p className="mt-2 text-sm sm:text-base text-slate-600">
                    Each application runs independently while sharing core domain models and backend security controls.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Card 1: Guest PWA */}
                  <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 flex flex-col justify-between hover:shadow-md transition">
                    <div>
                      <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center mb-4">
                        <GraduationCap className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-mono font-bold text-teal-700 bg-teal-100 px-2 py-0.5 rounded uppercase">
                        app.findstay.com &bull; PWA
                      </span>
                      <h3 className="text-lg font-bold text-slate-900 mt-2 mb-1">Student &amp; Guest Booking App</h3>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        Progressive Web App installable on mobile devices. Features 15-minute row-level reservation holds, real-time availability, and Mobile Money STK push checkout.
                      </p>
                    </div>
                    <div className="mt-6 pt-4 border-t border-slate-200 flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-500">Port 3001</span>
                      <a
                        href={getGuestUrl()}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs font-bold text-teal-700 hover:text-teal-900 flex items-center gap-1"
                      >
                        Launch App &rarr;
                      </a>
                    </div>
                  </div>

                  {/* Card 2: Owner PWA */}
                  <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 flex flex-col justify-between hover:shadow-md transition">
                    <div>
                      <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center mb-4">
                        <Hotel className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-mono font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded uppercase">
                        host.findstay.com &bull; PWA
                      </span>
                      <h3 className="text-lg font-bold text-slate-900 mt-2 mb-1">Host PMS &amp; Operations Suite</h3>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        Property Management System for hoteliers, landlords, and caretakers. Real-time room grid, occupancy analytics, check-in status, and automated MoMo disbursements.
                      </p>
                    </div>
                    <div className="mt-6 pt-4 border-t border-slate-200 flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-500">Port 3002</span>
                      <a
                        href={getOwnerUrl()}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs font-bold text-blue-700 hover:text-blue-900 flex items-center gap-1"
                      >
                        Launch Host PMS &rarr;
                      </a>
                    </div>
                  </div>

                  {/* Card 3: Admin Portal */}
                  <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 flex flex-col justify-between hover:shadow-md transition">
                    <div>
                      <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center mb-4">
                        <ShieldCheck className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-mono font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded uppercase">
                        admin.findstay.com
                      </span>
                      <h3 className="text-lg font-bold text-slate-900 mt-2 mb-1">Governance &amp; Audit Console</h3>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        Dedicated compliance console for Ghana Card KYC verification, unit economics break-even tracking, and immutable Ghana Act 843 security audit logs.
                      </p>
                    </div>
                    <div className="mt-6 pt-4 border-t border-slate-200 flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-500">Port 3003</span>
                      <a
                        href={getAdminUrl()}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs font-bold text-purple-700 hover:text-purple-900 flex items-center gap-1"
                      >
                        Launch Admin &rarr;
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* HOW IT WORKS */}
            <section id="how-it-works" className="py-16 bg-slate-50 border-b border-slate-200">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-2xl mx-auto mb-12">
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                    How FindStay Works in 3 Steps
                  </h2>
                  <p className="mt-2 text-sm text-slate-600">
                    From search to verified move-in or hotel check-in.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="w-12 h-12 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center font-black text-xl mb-4">
                      1
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">Search &amp; Filter</h3>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      Filter by neighborhood (Beach Road, Westline, Anaji), property category, pricing model (nightly vs semester), and amenities.
                    </p>
                  </div>

                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="w-12 h-12 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center font-black text-xl mb-4">
                      2
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">15-Minute Row Lock</h3>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      Click reserve. The unit is immediately locked with a database row lock (SELECT ... FOR UPDATE) so no one else can book it simultaneously.
                    </p>
                  </div>

                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="w-12 h-12 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center font-black text-xl mb-4">
                      3
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">Pay &amp; Check-In</h3>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      Confirm your Mobile Money PIN or Card prompt. Receive your instant digital voucher, receipt, and front desk check-in instructions.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* FAQ */}
            <section className="py-16 bg-white border-b border-slate-200">
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
                    <div key={idx} className="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden">
                      <button
                        onClick={() => toggleFaq(idx)}
                        className="w-full px-5 py-4 text-left flex items-center justify-between font-bold text-slate-900 text-sm hover:text-teal-700 transition"
                      >
                        <span>{faq.q}</span>
                        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${faqOpen === idx ? 'rotate-180 text-teal-600' : ''}`} />
                      </button>
                      {faqOpen === idx && (
                        <div className="px-5 pb-4 text-xs sm:text-sm text-slate-600 border-t border-slate-200/60 pt-3">
                          {faq.a}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>
        )}

        {/* ABOUT PAGE */}
        {activeTab === 'about' && (
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-700 bg-teal-100 px-3 py-1 rounded-full">
              About FindStay
            </span>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 mt-3 mb-6">
              Empowering Transparent Accommodation Discovery in Ghana
            </h1>
            <div className="prose prose-slate max-w-none text-sm text-slate-600 space-y-4 leading-relaxed">
              <p>
                FindStay was conceived as an advanced software engineering project within the Department of Information Technology to address the chronic friction in Ghana's rental and hospitality sector.
              </p>
              <p>
                In urban centers like Takoradi—home to Takoradi Technical University, regional hospital nursing colleges, and Ghana's booming western oil and gas corridor—visitors and students routinely encounter predatory middleman agents demanding 15% to 20% non-refundable viewing fees, uninspected properties, and devastating double-booking incidents.
              </p>
              <h3 className="text-lg font-bold text-slate-900 pt-4">Our Three Guiding Pillars:</h3>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong>Zero Middleman Markups:</strong> Connect guests directly with verified property owners and certified managers.</li>
                <li><strong>Pessimistic Concurrency Guarantee:</strong> Database row-level locks guarantee that when you start reserving a unit, no other user in Ghana can book it out from under you.</li>
                <li><strong>Ghana Act 843 Compliance:</strong> National identity verification and bank-grade cryptographic protections for all transactions.</li>
              </ul>
            </div>
          </div>
        )}

        {/* TERMS & POLICIES */}
        {activeTab === 'terms' && (
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <h1 className="text-3xl font-black text-slate-900 mb-6">Terms of Service &amp; User Agreement</h1>
            <div className="bg-white p-8 rounded-2xl border border-slate-200 text-xs sm:text-sm text-slate-600 space-y-4 leading-relaxed">
              <p><strong>1. Introduction:</strong> By accessing FindStay (via web or PWA), users agree to comply with our platform terms and conditions.</p>
              <p><strong>2. Guest Obligations:</strong> Guests must provide accurate Mobile Money details and legitimate national identification when required.</p>
              <p><strong>3. Landlord &amp; Host Obligations:</strong> Hosts must accurately represent their properties, maintain active amenities (water, electricity), and honor confirmed reservations.</p>
              <p><strong>4. Concurrency Holds:</strong> A 15-minute hold guarantees unit exclusivity. If payment is not completed within 900 seconds, the hold expires automatically.</p>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 text-xs py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 text-white font-black text-lg mb-2">
                <Building className="w-5 h-5 text-teal-400" />
                <span>Find<span className="text-teal-400">Stay</span></span>
              </div>
              <p className="text-slate-400 leading-relaxed">
                Ghana's integrated accommodation marketplace and Property Management System (PMS).
              </p>
            </div>

            <div>
              <h4 className="text-white font-bold mb-3 uppercase tracking-wider text-[11px]">System Portals</h4>
              <ul className="space-y-2">
                <li><a href={getGuestUrl()} target="_blank" rel="noreferrer" className="hover:text-teal-400">Guest Booking App (app.findstay.com)</a></li>
                <li><a href={getOwnerUrl()} target="_blank" rel="noreferrer" className="hover:text-teal-400">Host / PMS Portal (host.findstay.com)</a></li>
                <li><a href={getAdminUrl()} target="_blank" rel="noreferrer" className="hover:text-teal-400">Admin Console (admin.findstay.com)</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold mb-3 uppercase tracking-wider text-[11px]">Legal &amp; Trust</h4>
              <ul className="space-y-2">
                <li><button onClick={() => setActiveTab('terms')} className="hover:text-slate-300">Terms of Service</button></li>
                <li><button onClick={() => setActiveTab('about')} className="hover:text-slate-300">About the Project</button></li>
                <li><span className="text-teal-400 font-mono text-[10px]">Ghana Act 843 Compliant</span></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold mb-3 uppercase tracking-wider text-[11px]">Defense Team</h4>
              <p className="text-slate-400 mb-2">Takoradi Technical University Capstone</p>
              <p className="text-slate-500 text-[11px]">11-Member Software Engineering Team</p>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500">
            <p>&copy; 2026 FindStay Ghana. All rights reserved.</p>
            <p>Monorepo Workspace Edition &bull; Turborepo / npm workspaces ready</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
