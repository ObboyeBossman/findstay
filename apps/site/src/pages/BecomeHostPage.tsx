import React, { useState } from 'react';
import { HostCalculator } from '../components/HostCalculator';
import {
  Building2,
  CheckCircle2,
  ShieldCheck,
  Smartphone,
  Layers,
  ArrowRight,
  BadgePercent,
  Check,
  X,
  FileCheck2,
  Clock,
  Sparkle
} from 'lucide-react';

interface BecomeHostPageProps {
  ownerUrl: string;
}

export const BecomeHostPage: React.FC<BecomeHostPageProps> = ({ ownerUrl }) => {
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    propertyName: '',
    propertyType: 'Hotel',
    neighborhood: 'Beach Road',
    totalUnits: '5',
    ownerName: '',
    ghanaCard: '',
    phone: '',
    email: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitted(true);
  };

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* 1. HERO BANNER */}
      <section className="relative bg-slate-950 text-white py-20 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80"
            alt="Modern accommodation management"
            className="w-full h-full object-cover opacity-25 filter"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-teal-500/20 text-teal-300 border border-teal-500/40 mb-4">
            <Building2 className="w-4 h-4" /> Partner Onboarding Portal
          </span>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            Maximize Your Property Revenue &amp; Eliminate Double-Bookings
          </h1>
          <p className="mt-4 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Join Takoradi’s fastest-growing accommodation network. List your hotel, executive apartment, guesthouse or student residency with only 6% fair commission.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <a
              href="#onboard-form"
              className="px-8 py-3.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-teal-600/30 transition transform active:scale-95 flex items-center gap-2"
            >
              <span>Apply to List Your Property</span>
              <ArrowRight className="w-4 h-4" />
            </a>
            <a
              href={ownerUrl}
              target="_blank"
              rel="noreferrer"
              className="px-6 py-3.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm rounded-xl transition"
            >
              Existing Host? Launch PMS &rarr;
            </a>
          </div>
        </div>
      </section>

      {/* 2. CORE ADVANTAGES */}
      <section className="py-16 bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold text-teal-700 bg-teal-100 uppercase tracking-widest px-3 py-1 rounded-full">
              Why Host With FindStay
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
              Built for Takoradi Hoteliers &amp; Landlords
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
              <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-800 font-black text-lg flex items-center justify-center mb-4">
                93%+
              </div>
              <h3 className="text-sm font-bold text-slate-900 mb-1">Keep 93%+ Revenue</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                We only charge 5% to 7% commission on completed stays—leaving you with significantly higher profits than 15-20% third-party agents.
              </p>
            </div>

            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
              <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center mb-4">
                <Layers className="w-5 h-5 text-teal-700" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 mb-1">Free Host PMS Included</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Enjoy real-time room occupancy grids, check-in tracking, and expense ledgers without paying expensive monthly SaaS subscription fees.
              </p>
            </div>

            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
              <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center mb-4">
                <Smartphone className="w-5 h-5 text-teal-700" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 mb-1">Instant MoMo Payouts</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Disbursements are sent automatically to your MTN Mobile Money, Telecel Cash merchant wallet, or Ghanaian bank account upon guest check-in.
              </p>
            </div>

            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
              <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center mb-4">
                <ShieldCheck className="w-5 h-5 text-teal-700" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 mb-1">Verified Guests Only</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Guests provide verified Mobile Money numbers and national identity info, protecting your property against damage, fraud, and default.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. CALCULATOR SECTION */}
      <section className="py-20 bg-slate-900">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <HostCalculator />
        </div>
      </section>

      {/* 4. COMPARISON TABLE */}
      <section className="py-20 bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold text-teal-700 bg-teal-100 uppercase tracking-widest px-3 py-1 rounded-full">
              Transparent Comparison
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
              FindStay vs. The Alternatives
            </h2>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-sm">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-100 text-slate-700 uppercase font-bold text-[11px] border-b border-slate-200">
                <tr>
                  <th className="py-4 px-6">Feature / Capability</th>
                  <th className="py-4 px-6 text-slate-500">Traditional Agents</th>
                  <th className="py-4 px-6 text-slate-500">Global OTAs (Airbnb/Booking)</th>
                  <th className="py-4 px-6 text-teal-800 bg-teal-50/80 font-black">FindStay Platform</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-600">
                <tr>
                  <td className="py-3.5 px-6 font-bold text-slate-900">Commission Rate</td>
                  <td className="py-3.5 px-6 text-rose-600 font-bold">15% – 20%</td>
                  <td className="py-3.5 px-6 text-rose-600 font-bold">15% – 18% + FX fees</td>
                  <td className="py-3.5 px-6 text-emerald-700 font-bold bg-teal-50/40">Only 5% – 7%</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-6 font-bold text-slate-900">Concurrency Double-Booking Lock</td>
                  <td className="py-3.5 px-6 text-slate-400">None (Paper logbook)</td>
                  <td className="py-3.5 px-6 text-slate-500">Calendar delay sync</td>
                  <td className="py-3.5 px-6 text-emerald-700 font-bold bg-teal-50/40">15-Min Guaranteed Row Lock</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-6 font-bold text-slate-900">Direct MoMo Disbursements (MTN/Telecel)</td>
                  <td className="py-3.5 px-6 text-slate-400">Cash on site / Informal</td>
                  <td className="py-3.5 px-6 text-slate-400">International wire delay</td>
                  <td className="py-3.5 px-6 text-emerald-700 font-bold bg-teal-50/40">Instant Mobile Money STK</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-6 font-bold text-slate-900">Free Property Management System (PMS)</td>
                  <td className="py-3.5 px-6 text-slate-400">No</td>
                  <td className="py-3.5 px-6 text-slate-400">Requires expensive third-party PMS</td>
                  <td className="py-3.5 px-6 text-emerald-700 font-bold bg-teal-50/40">Included Free (Grid &amp; Ledger)</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-6 font-bold text-slate-900">Takoradi Local Support Office</td>
                  <td className="py-3.5 px-6 text-slate-400">None</td>
                  <td className="py-3.5 px-6 text-slate-400">Automated bot / US call center</td>
                  <td className="py-3.5 px-6 text-emerald-700 font-bold bg-teal-50/40">Local Office on Beach Road</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* 5. ONBOARDING APPLICATION FORM */}
      <section id="onboard-form" className="py-20 bg-slate-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-xl">
            {formSubmitted ? (
              <div className="text-center py-10 space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-black text-slate-900">
                  Application Received Successfully!
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                  Thank you, <strong>{formData.ownerName || 'Partner'}</strong>. Our Takoradi verification team has received your onboarding submission for <strong>{formData.propertyName || 'your property'}</strong>. We will review your Ghana Card credentials and call you within 24 hours.
                </p>
                <div className="pt-4">
                  <button
                    onClick={() => setFormSubmitted(false)}
                    className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl"
                  >
                    Submit Another Property
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <span className="text-xs font-bold text-teal-700 bg-teal-100 uppercase tracking-widest px-3 py-1 rounded-full">
                    Partner Registration
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
                    Apply to List Your Accommodation
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1">
                    Complete this quick form. Our compliance desk will reach out for physical verification and free photo onboarding.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                      Property Name *
                    </label>
                    <input
                      required
                      type="text"
                      placeholder="e.g. Takoradi Haven Lodge"
                      value={formData.propertyName}
                      onChange={(e) => setFormData({ ...formData, propertyName: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs sm:text-sm rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                      Property Type *
                    </label>
                    <select
                      value={formData.propertyType}
                      onChange={(e) => setFormData({ ...formData, propertyType: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs sm:text-sm rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    >
                      <option value="Hotel">Hotel &amp; Suites</option>
                      <option value="Apartment">Serviced Apartment</option>
                      <option value="Guesthouse">Heritage Guesthouse</option>
                      <option value="Hostel">Student Hostel / Residency</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                      Neighborhood in Takoradi *
                    </label>
                    <select
                      value={formData.neighborhood}
                      onChange={(e) => setFormData({ ...formData, neighborhood: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs sm:text-sm rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    >
                      <option value="Beach Road">Beach Road</option>
                      <option value="Westline">Westline</option>
                      <option value="Chapel Hill">Chapel Hill</option>
                      <option value="Anaji">Anaji</option>
                      <option value="Effia">Effia (Near TTU)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                      Total Units / Rooms *
                    </label>
                    <input
                      required
                      type="number"
                      min="1"
                      placeholder="e.g. 10"
                      value={formData.totalUnits}
                      onChange={(e) => setFormData({ ...formData, totalUnits: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs sm:text-sm rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                      Owner / Manager Full Name *
                    </label>
                    <input
                      required
                      type="text"
                      placeholder="e.g. Kwabena Darko"
                      value={formData.ownerName}
                      onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs sm:text-sm rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                      Ghana Card Number (KYC) *
                    </label>
                    <input
                      required
                      type="text"
                      placeholder="GHA-XXXXXXXXX-X"
                      value={formData.ghanaCard}
                      onChange={(e) => setFormData({ ...formData, ghanaCard: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs sm:text-sm rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-teal-500 focus:outline-none font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                      Mobile Money Phone Number *
                    </label>
                    <input
                      required
                      type="tel"
                      placeholder="024XXXXXXX"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs sm:text-sm rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                      Official Contact Email
                    </label>
                    <input
                      type="email"
                      placeholder="owner@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs sm:text-sm rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">
                    Compliant with Ghana Data Protection Act (Act 843).
                  </span>
                  <button
                    type="submit"
                    className="px-8 py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-teal-600/30 transition transform active:scale-95 flex items-center gap-2"
                  >
                    <span>Submit Partner Application</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};
