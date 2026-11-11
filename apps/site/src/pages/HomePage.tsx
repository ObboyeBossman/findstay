import React, { useState } from 'react';
import { Property, PROPERTIES } from '../data/properties';
import { NEIGHBORHOODS } from '../data/neighborhoods';
import { TESTIMONIALS } from '../data/testimonials';
import { FAQS } from '../data/faqs';
import { PropertyModal } from '../components/PropertyModal';
import { HostCalculator } from '../components/HostCalculator';
import {
  MapPin,
  Building2,
  Calendar,
  Users,
  Search,
  Star,
  ShieldCheck,
  Clock,
  Smartphone,
  CheckCircle2,
  Lock,
  ArrowRight,
  ChevronDown,
  Bed,
  Hotel,
  GraduationCap,
  Sparkle
} from 'lucide-react';

interface HomePageProps {
  setActiveTab: (tab: string) => void;
  guestUrl: string;
  ownerUrl: string;
}

export const HomePage: React.FC<HomePageProps> = ({
  setActiveTab,
  guestUrl,
  ownerUrl
}) => {
  const [selectedNeighborhood, setSelectedNeighborhood] = useState('All');
  const [selectedType, setSelectedType] = useState('All');
  const [selectedDuration, setSelectedDuration] = useState<'All' | 'Nightly' | 'Semester'>('All');
  const [modalProperty, setModalProperty] = useState<Property | null>(null);
  const [faqOpen, setFaqOpen] = useState<number | null>(0);

  // Filter properties
  const filteredProperties = PROPERTIES.filter((p) => {
    const matchNeighborhood = selectedNeighborhood === 'All' || p.neighborhood === selectedNeighborhood;
    const matchType = selectedType === 'All' || p.type.toLowerCase() === selectedType.toLowerCase();
    const matchDuration =
      selectedDuration === 'All'
        ? true
        : selectedDuration === 'Nightly'
        ? p.pricePeriod === 'night'
        : p.pricePeriod === 'semester';
    return matchNeighborhood && matchType && matchDuration;
  });

  const categories = [
    {
      type: 'Hotel',
      title: 'Hotels & Luxury Suites',
      image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
      tagline: 'Beachfront & Executive Retreats',
      rate: 'From GH₵ 350 / night'
    },
    {
      type: 'Apartment',
      title: 'Serviced Apartments',
      image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80',
      tagline: 'Furnished Living for Expatriates',
      rate: 'From GH₵ 420 / night'
    },
    {
      type: 'Guesthouse',
      title: 'Heritage Guesthouses',
      image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80',
      tagline: 'Scenic Stays & Daily Breakfast',
      rate: 'From GH₵ 280 / night'
    },
    {
      type: 'Hostel',
      title: 'Student Residencies & Hostels',
      image: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80',
      tagline: 'Verified TTU Campus Living',
      rate: 'From GH₵ 1,800 / semester'
    }
  ];

  return (
    <div>
      {/* 1. HERO SECTION WITH RICH BACKDROP & FLOATING SEARCH */}
      <section className="relative min-h-[620px] lg:min-h-[680px] flex items-center justify-center bg-slate-950 overflow-hidden">
        {/* Background Photo with Gradient Overlays */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1920&q=80"
            alt="Takoradi hospitality"
            className="w-full h-full object-cover object-center opacity-40 filter scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-slate-950/40" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-900/60 to-transparent" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center lg:text-left">
          <div className="max-w-3xl">
            {/* Pill Tag */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/40 text-xs font-bold mb-6 backdrop-blur-md">
              <ShieldCheck className="w-4 h-4 text-teal-400" />
              <span>Takoradi’s Direct Accommodation Marketplace</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.12]">
              Stay Your Way in Takoradi.{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-emerald-300 to-teal-200">
                Hotels, Apartments &amp; Residencies.
              </span>
            </h1>

            {/* Subtitle */}
            <p className="mt-5 text-base sm:text-lg text-slate-200 leading-relaxed max-w-2xl font-normal">
              Book verified accommodations in Ghana’s Western Region with guaranteed 15-minute concurrency holds, zero middleman agent fees, and instant Mobile Money checkouts.
            </p>
          </div>

          {/* Floating Search Widget */}
          <div className="mt-10 max-w-5xl bg-white p-4 sm:p-6 rounded-3xl shadow-2xl border border-slate-100 text-slate-800">
            {/* Stay Duration Toggle */}
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mr-2">
                Stay Type:
              </span>
              <button
                onClick={() => setSelectedDuration('All')}
                className={`px-3 py-1 rounded-full text-xs font-bold transition ${
                  selectedDuration === 'All'
                    ? 'bg-teal-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                All Options
              </button>
              <button
                onClick={() => setSelectedDuration('Nightly')}
                className={`px-3 py-1 rounded-full text-xs font-bold transition ${
                  selectedDuration === 'Nightly'
                    ? 'bg-teal-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Nightly Stays (Hotels &amp; Flats)
              </button>
              <button
                onClick={() => setSelectedDuration('Semester')}
                className={`px-3 py-1 rounded-full text-xs font-bold transition ${
                  selectedDuration === 'Semester'
                    ? 'bg-teal-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Semester / Long-Term (Hostels)
              </button>
            </div>

            {/* Form Fields Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Neighborhood */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-teal-600" /> Neighborhood
                </label>
                <select
                  value={selectedNeighborhood}
                  onChange={(e) => setSelectedNeighborhood(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 font-medium text-sm rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                >
                  <option value="All">All Takoradi Areas</option>
                  <option value="Beach Road">Beach Road (Waterfront)</option>
                  <option value="Westline">Westline (Commercial)</option>
                  <option value="Chapel Hill">Chapel Hill (Heritage)</option>
                  <option value="Anaji">Anaji (Hostels &amp; Suburb)</option>
                  <option value="Effia">Effia (Campus Corridor)</option>
                </select>
              </div>

              {/* Property Category */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-teal-600" /> Accommodation Type
                </label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 font-medium text-sm rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                >
                  <option value="All">All Property Types</option>
                  <option value="Hotel">Hotels &amp; Luxury Suites</option>
                  <option value="Apartment">Serviced Apartments</option>
                  <option value="Guesthouse">Heritage Guesthouses</option>
                  <option value="Hostel">Student Residencies</option>
                </select>
              </div>

              {/* Guest / Occupancy */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-teal-600" /> Guests / Occupancy
                </label>
                <select
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 font-medium text-sm rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                >
                  <option>1 Guest / 1 Room</option>
                  <option>2 Guests / Executive Suite</option>
                  <option>Family / 2-Bedroom Flat</option>
                  <option>Student / 1-in-a-Room</option>
                  <option>Student / 2-in-a-Room Bed</option>
                </select>
              </div>

              {/* CTA Action */}
              <div className="flex items-end">
                <a
                  href="#stays-catalog"
                  className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-teal-600/30 transition transform active:scale-95"
                >
                  <Search className="w-4 h-4" />
                  <span>Find Available Stays</span>
                </a>
              </div>
            </div>

            {/* Bottom Trust Indicators */}
            <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-3">
              <span className="flex items-center gap-1.5 font-medium text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> 100% Ghana Card KYC Verified
              </span>
              <span className="flex items-center gap-1.5 font-medium text-slate-700">
                <Clock className="w-4 h-4 text-teal-600" /> 15-Minute Concurrency Hold
              </span>
              <span className="flex items-center gap-1.5 font-medium text-slate-700">
                <Smartphone className="w-4 h-4 text-amber-600" /> MTN, Telecel MoMo &amp; Cards
              </span>
              <span className="flex items-center gap-1.5 font-medium text-slate-700">
                <Lock className="w-4 h-4 text-purple-600" /> Ghana Act 843 Compliant
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. ACCOMMODATION CATEGORIES SHOWCASE */}
      <section className="py-16 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold text-teal-700 bg-teal-100 uppercase tracking-widest px-3 py-1 rounded-full">
              Diverse Stays in Takoradi
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mt-3 tracking-tight">
              Tailored for Every Type of Stay
            </h2>
            <p className="mt-3 text-slate-600 text-sm sm:text-base">
              Whether you are an offshore engineer in town for three nights or a TTU freshman settling in for the academic year, FindStay has verified rooms for you.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((cat, idx) => (
              <div
                key={idx}
                onClick={() => {
                  setSelectedType(cat.type);
                  const el = document.getElementById('stays-catalog');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="group relative h-80 rounded-2xl overflow-hidden cursor-pointer shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                <img
                  src={cat.image}
                  alt={cat.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-900/40 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <span className="text-xs font-bold text-teal-300 block mb-0.5">{cat.rate}</span>
                  <h3 className="text-lg font-bold leading-tight group-hover:text-teal-200 transition-colors">
                    {cat.title}
                  </h3>
                  <p className="text-xs text-slate-300 mt-1">{cat.tagline}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. FEATURED & LIVE STAYS CATALOG */}
      <section id="stays-catalog" className="py-20 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
            <div>
              <span className="text-xs font-bold text-teal-700 bg-teal-100 uppercase tracking-widest px-3 py-1 rounded-full">
                Live Inventory
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mt-2">
                Available Accommodations
              </h2>
              <p className="text-slate-600 text-sm mt-1">
                Showing {filteredProperties.length} verified properties matching your filters in Takoradi.
              </p>
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-2">
              {['All', 'Hotel', 'Apartment', 'Guesthouse', 'Hostel'].map((t) => (
                <button
                  key={t}
                  onClick={() => setSelectedType(t)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition ${
                    selectedType.toLowerCase() === t.toLowerCase()
                      ? 'bg-teal-600 text-white shadow-sm'
                      : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {t === 'All' ? 'All Types' : t}
                </button>
              ))}
            </div>
          </div>

          {/* Properties Grid */}
          {filteredProperties.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 max-w-md mx-auto">
              <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-slate-800">No properties found</h3>
              <p className="text-xs text-slate-500 mt-1 mb-4">
                Try resetting your filters or selecting a different neighborhood.
              </p>
              <button
                onClick={() => {
                  setSelectedNeighborhood('All');
                  setSelectedType('All');
                  setSelectedDuration('All');
                }}
                className="px-4 py-2 bg-teal-600 text-white text-xs font-bold rounded-xl"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProperties.map((p) => (
                <div
                  key={p.id}
                  className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group"
                >
                  {/* Property Image Header */}
                  <div className="relative h-60 w-full bg-slate-900 overflow-hidden">
                    <img
                      src={p.primaryImage}
                      alt={p.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent" />

                    {/* Type & Neighborhood Badges */}
                    <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-teal-600 text-white shadow-sm">
                        {p.type}
                      </span>
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-white/95 backdrop-blur-md text-slate-900 flex items-center gap-1 shadow-sm">
                        <MapPin className="w-3 h-3 text-teal-600" />
                        {p.neighborhood}
                      </span>
                    </div>

                    {/* Rating Badge */}
                    <div className="absolute top-3 right-3 px-2 py-1 rounded-full bg-slate-950/80 backdrop-blur-md text-white text-xs font-bold flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                      <span>{p.rating}</span>
                    </div>

                    {/* Price Tag Overlay */}
                    <div className="absolute bottom-3 left-3 right-3 flex items-baseline justify-between text-white">
                      <div>
                        <span className="text-xl font-black drop-shadow-md">{p.priceDisplay}</span>
                        <span className="text-xs text-slate-200 ml-1">/ {p.pricePeriod}</span>
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-500/80 text-white px-2 py-0.5 rounded backdrop-blur-sm">
                        Available
                      </span>
                    </div>
                  </div>

                  {/* Card Content Body */}
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-base font-bold text-slate-900 group-hover:text-teal-600 transition-colors line-clamp-1">
                        {p.title}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                        {p.description}
                      </p>

                      {/* Amenities Pills */}
                      <div className="mt-4 flex flex-wrap gap-1.5">
                        {p.amenities.slice(0, 3).map((a, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded-md bg-slate-100 text-[11px] font-medium text-slate-600"
                          >
                            {a}
                          </span>
                        ))}
                        {p.amenities.length > 3 && (
                          <span className="px-2 py-0.5 rounded-md bg-slate-50 text-[11px] font-semibold text-slate-400">
                            +{p.amenities.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Card Actions */}
                    <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                      <button
                        onClick={() => setModalProperty(p)}
                        className="text-xs font-bold text-slate-700 hover:text-teal-700 px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 transition"
                      >
                        Quick View
                      </button>

                      <a
                        href={guestUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex-1 text-center py-2 px-3.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-lg shadow-sm hover:shadow transition flex items-center justify-center gap-1.5"
                      >
                        <span>Reserve Unit</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 4. WHY CHOOSE FINDSTAY (THE 4 PILLARS) */}
      <section className="py-20 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold text-teal-700 bg-teal-100 uppercase tracking-widest px-3 py-1 rounded-full">
              Trust &amp; Innovation
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mt-3 tracking-tight">
              Solving Ghana’s Chronic Accommodation Friction
            </h2>
            <p className="mt-3 text-slate-600 text-sm sm:text-base leading-relaxed">
              FindStay was engineered to eradicate informal middleman abuse, double-booking disasters, and unverified properties with modern software guarantees.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Pillar 1 */}
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 hover:border-teal-300 transition shadow-xs">
              <div className="w-12 h-12 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center mb-5 font-black text-xl">
                0%
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Zero Middleman Fees</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                No more paying 15% to 20% upfront non-refundable viewing fees to unregulated street agents. Connect directly with certified property owners and front desks.
              </p>
            </div>

            {/* Pillar 2 */}
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 hover:border-teal-300 transition shadow-xs">
              <div className="w-12 h-12 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center mb-5">
                <Clock className="w-6 h-6 text-teal-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">15-Min Concurrency Lock</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                When you initiate a booking, a database row-level lock (SELECT ... FOR UPDATE) gives you exclusive right to the room for 15 minutes while you authorize payment.
              </p>
            </div>

            {/* Pillar 3 */}
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 hover:border-teal-300 transition shadow-xs">
              <div className="w-12 h-12 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center mb-5">
                <ShieldCheck className="w-6 h-6 text-teal-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">100% Ghana Card KYC</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Every landlord, lodge manager, and student hostel operator is manually verified using national Ghana Card ID records to guarantee legitimacy.
              </p>
            </div>

            {/* Pillar 4 */}
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 hover:border-teal-300 transition shadow-xs">
              <div className="w-12 h-12 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center mb-5">
                <Smartphone className="w-6 h-6 text-teal-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Mobile Money Native</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Instant USSD STK prompt authorization on MTN MoMo, Telecel Cash, and AT Money, backed by Visa and Mastercard processing via Paystack.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. TAKORADI NEIGHBORHOOD EXPLORER */}
      <section className="py-20 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold text-teal-700 bg-teal-100 uppercase tracking-widest px-3 py-1 rounded-full">
              Western Region Hub
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mt-3 tracking-tight">
              Explore Takoradi Neighborhoods
            </h2>
            <p className="mt-3 text-slate-600 text-sm sm:text-base">
              From waterfront executive suites to TTU student corridors, discover the unique character of Takoradi’s key districts.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {NEIGHBORHOODS.map((nh, idx) => (
              <div
                key={idx}
                onClick={() => {
                  setSelectedNeighborhood(nh.name);
                  const el = document.getElementById('stays-catalog');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer group"
              >
                <div className="relative h-44 w-full bg-slate-900 overflow-hidden">
                  <img
                    src={nh.image}
                    alt={nh.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                  <div className="absolute bottom-3 left-3 text-white">
                    <span className="text-sm font-bold block">{nh.name}</span>
                    <span className="text-[10px] text-teal-300 font-medium">Click to filter</span>
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {nh.description}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-1">
                    {nh.popularFor.slice(0, 2).map((tag, i) => (
                      <span key={i} className="text-[10px] font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. HOST EARNINGS CALCULATOR TEASER */}
      <section className="py-20 bg-slate-900 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <HostCalculator onJoinClick={() => setActiveTab('become-host')} />
        </div>
      </section>

      {/* 7. CUSTOMER & STUDENT TESTIMONIALS */}
      <section className="py-20 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold text-teal-700 bg-teal-100 uppercase tracking-widest px-3 py-1 rounded-full">
              Real Experiences
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mt-3 tracking-tight">
              Trusted by Guests, Students &amp; Hosts
            </h2>
            <p className="mt-3 text-slate-600 text-sm sm:text-base">
              See what travelers and accommodation managers in Takoradi say about FindStay.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {TESTIMONIALS.map((t, idx) => (
              <div
                key={idx}
                className="bg-slate-50 rounded-2xl p-6 border border-slate-200 flex flex-col justify-between shadow-xs hover:shadow-md transition"
              >
                <div>
                  <div className="flex items-center text-amber-400 mb-4">
                    {[...Array(t.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400" />
                    ))}
                  </div>
                  <p className="text-xs sm:text-sm text-slate-700 italic leading-relaxed mb-6">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-200/80 flex items-center gap-3">
                  <img
                    src={t.avatar}
                    alt={t.name}
                    className="w-11 h-11 rounded-full object-cover border-2 border-teal-500"
                  />
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{t.name}</h4>
                    <span className="text-[11px] text-teal-700 font-medium block">{t.role}</span>
                    <span className="text-[10px] text-slate-400">{t.location}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. FREQUENTLY ASKED QUESTIONS */}
      <section className="py-20 bg-slate-50 border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-xs font-bold text-teal-700 bg-teal-100 uppercase tracking-widest px-3 py-1 rounded-full">
              Got Questions?
            </span>
            <h2 className="text-3xl font-black text-slate-900 mt-2">
              Frequently Asked Questions
            </h2>
            <p className="text-slate-600 text-sm mt-1">
              Everything you need to know about booking, concurrency holds, and listing on FindStay.
            </p>
          </div>

          <div className="space-y-3">
            {FAQS.map((faq, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs"
              >
                <button
                  onClick={() => setFaqOpen(faqOpen === idx ? null : idx)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between font-bold text-slate-900 text-sm hover:text-teal-700 transition"
                >
                  <span className="pr-4">{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 ${
                      faqOpen === idx ? 'rotate-180 text-teal-600' : ''
                    }`}
                  />
                </button>
                {faqOpen === idx && (
                  <div className="px-6 pb-5 pt-1 text-xs sm:text-sm text-slate-600 border-t border-slate-100 leading-relaxed">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 9. BOTTOM DUAL CTA BANNER */}
      <section className="py-20 bg-gradient-to-r from-teal-700 via-teal-800 to-slate-900 text-white text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
            Ready to Secure Your Stay in Takoradi?
          </h2>
          <p className="mt-4 text-teal-100 text-sm sm:text-base max-w-2xl mx-auto">
            Experience frictionless accommodation booking with instant Mobile Money verification, or list your property and keep over 93% of your revenue.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href={guestUrl}
              target="_blank"
              rel="noreferrer"
              className="w-full sm:w-auto px-8 py-3.5 bg-white text-teal-900 font-bold text-sm rounded-xl shadow-lg hover:bg-teal-50 transition transform active:scale-95 flex items-center justify-center gap-2"
            >
              <span>Launch Booking App</span>
              <ArrowRight className="w-4 h-4" />
            </a>

            <button
              onClick={() => setActiveTab('become-host')}
              className="w-full sm:w-auto px-8 py-3.5 bg-teal-600/40 hover:bg-teal-600/60 border border-teal-400/40 text-white font-bold text-sm rounded-xl transition flex items-center justify-center gap-2"
            >
              <Bed className="w-4 h-4" />
              <span>List Your Property</span>
            </button>
          </div>
        </div>
      </section>

      {/* QUICK VIEW PROPERTY MODAL */}
      <PropertyModal
        property={modalProperty}
        onClose={() => setModalProperty(null)}
        guestUrl={guestUrl}
      />
    </div>
  );
};
