import React, { useState } from 'react';
import {
  Search,
  ShieldCheck,
  Clock,
  Smartphone,
  Bed,
  CheckCircle2,
  Lock,
  ArrowRight,
  Database,
  Layers,
  FileCheck2,
  Building2,
  Key,
  BadgePercent
} from 'lucide-react';

interface HowItWorksPageProps {
  setActiveTab: (tab: string) => void;
  guestUrl: string;
  ownerUrl: string;
}

export const HowItWorksPage: React.FC<HowItWorksPageProps> = ({
  setActiveTab,
  guestUrl,
  ownerUrl
}) => {
  const [perspective, setPerspective] = useState<'guest' | 'host'>('guest');

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* 1. HERO */}
      <section className="bg-slate-950 text-white py-16 text-center">
        <div className="max-w-4xl mx-auto px-4">
          <span className="text-xs font-bold text-teal-400 bg-teal-950/80 border border-teal-800/80 uppercase tracking-widest px-3 py-1 rounded-full">
            The FindStay Engine
          </span>
          <h1 className="text-3xl sm:text-5xl font-black mt-3 tracking-tight">
            How FindStay Works
          </h1>
          <p className="mt-4 text-sm sm:text-base text-slate-300 max-w-2xl mx-auto">
            From search to verified move-in, and from room inventory to instant Mobile Money disbursements.
          </p>

          {/* Perspective Switcher Buttons */}
          <div className="mt-8 inline-flex p-1.5 rounded-2xl bg-slate-900 border border-slate-800">
            <button
              onClick={() => setPerspective('guest')}
              className={`px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition ${
                perspective === 'guest'
                  ? 'bg-teal-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              For Guests &amp; Students
            </button>
            <button
              onClick={() => setPerspective('host')}
              className={`px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition ${
                perspective === 'host'
                  ? 'bg-teal-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              For Property Owners &amp; Hoteliers
            </button>
          </div>
        </div>
      </section>

      {/* 2. DUAL PERSPECTIVE WORKFLOW */}
      <section className="py-20 bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {perspective === 'guest' ? (
            <div>
              <div className="text-center max-w-2xl mx-auto mb-16">
                <span className="text-xs font-bold text-teal-700 bg-teal-100 uppercase tracking-widest px-3 py-1 rounded-full">
                  Guest Journey
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
                  4 Steps to a Frictionless Stay
                </h2>
                <p className="text-sm text-slate-600 mt-1">
                  How travelers, corporate guests, and TTU students reserve rooms with 100% peace of mind.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Step 1 */}
                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 flex gap-4">
                  <div className="w-12 h-12 rounded-xl bg-teal-600 text-white font-black text-lg flex items-center justify-center shrink-0 shadow-md shadow-teal-600/20">
                    1
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 mb-1 flex items-center gap-2">
                      <Search className="w-4 h-4 text-teal-600" />
                      Search &amp; Filter
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Filter by neighborhood (Beach Road, Westline, Anaji, Effia), property type (Hotels, Serviced Apartments, Guesthouses, Hostels), and pricing structure (nightly vs. academic semester).
                    </p>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 flex gap-4">
                  <div className="w-12 h-12 rounded-xl bg-teal-600 text-white font-black text-lg flex items-center justify-center shrink-0 shadow-md shadow-teal-600/20">
                    2
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 mb-1 flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-teal-600" />
                      Inspect &amp; Verify
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      View high-resolution photography, detailed amenities (water tanks, standby generator, Wi-Fi), and the host’s verified Ghana Card credentials before committing.
                    </p>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 flex gap-4">
                  <div className="w-12 h-12 rounded-xl bg-teal-600 text-white font-black text-lg flex items-center justify-center shrink-0 shadow-md shadow-teal-600/20">
                    3
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 mb-1 flex items-center gap-2">
                      <Lock className="w-4 h-4 text-teal-600" />
                      15-Minute Concurrency Lock
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Click Reserve. The database executes an exclusive row-level lock (SELECT ... FOR UPDATE). A 15-minute countdown holds the room exclusively for you while you complete payment.
                    </p>
                  </div>
                </div>

                {/* Step 4 */}
                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 flex gap-4">
                  <div className="w-12 h-12 rounded-xl bg-teal-600 text-white font-black text-lg flex items-center justify-center shrink-0 shadow-md shadow-teal-600/20">
                    4
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 mb-1 flex items-center gap-2">
                      <Key className="w-4 h-4 text-teal-600" />
                      Pay via MoMo &amp; Check-In
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Approve the MTN MoMo or Telecel Cash USSD STK prompt on your phone. You instantly receive a confirmed digital stay voucher and front desk check-in code.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div>
              <div className="text-center max-w-2xl mx-auto mb-16">
                <span className="text-xs font-bold text-teal-700 bg-teal-100 uppercase tracking-widest px-3 py-1 rounded-full">
                  Host &amp; Hotelier Journey
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
                  4 Steps to Streamlined Property Operations
                </h2>
                <p className="text-sm text-slate-600 mt-1">
                  How landlords, guesthouse owners, and hotel front desks manage inventory and boost earnings.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Host Step 1 */}
                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 flex gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-600 text-white font-black text-lg flex items-center justify-center shrink-0 shadow-md shadow-blue-600/20">
                    1
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 mb-1 flex items-center gap-2">
                      <FileCheck2 className="w-4 h-4 text-blue-600" />
                      Register &amp; Submit Ghana Card KYC
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Create an owner account, upload your Ghana Card (GHA-XXXXXXXXX-X), and provide proof of property authority. Our admin team verifies your listing within 24 hours.
                    </p>
                  </div>
                </div>

                {/* Host Step 2 */}
                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 flex gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-600 text-white font-black text-lg flex items-center justify-center shrink-0 shadow-md shadow-blue-600/20">
                    2
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 mb-1 flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-blue-600" />
                      Configure Rooms &amp; Rates
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Upload high-res photography, configure room types (Suites, Flats, Self-Contains, Shared Beds), and set custom rates per night, per month, or per semester.
                    </p>
                  </div>
                </div>

                {/* Host Step 3 */}
                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 flex gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-600 text-white font-black text-lg flex items-center justify-center shrink-0 shadow-md shadow-blue-600/20">
                    3
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 mb-1 flex items-center gap-2">
                      <Layers className="w-4 h-4 text-blue-600" />
                      Manage Real-Time Room Grid
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Access the FindStay Host PMS room occupancy grid. View live statuses (Available, Booked, Held, Cleaning/Turn) and accept walk-in or digital bookings seamlessly.
                    </p>
                  </div>
                </div>

                {/* Host Step 4 */}
                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 flex gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-600 text-white font-black text-lg flex items-center justify-center shrink-0 shadow-md shadow-blue-600/20">
                    4
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 mb-1 flex items-center gap-2">
                      <BadgePercent className="w-4 h-4 text-blue-600" />
                      Automated Mobile Money Payouts
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Receive rental payments directly into your Mobile Money merchant wallet or Ghanaian bank account with only a 5% to 7% platform fee, retaining over 93% of revenue.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 3. TECHNICAL DEEP DIVE: THE 15-MINUTE CONCURRENCY ENGINE */}
      <section className="py-20 bg-slate-900 text-white border-b border-slate-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold text-teal-400 bg-teal-950/80 border border-teal-800 uppercase tracking-widest px-3 py-1 rounded-full">
              Pessimistic Concurrency Engine
            </span>
            <h2 className="text-2xl sm:text-3xl font-black mt-2">
              Why Double-Booking is Impossible on FindStay
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-2">
              How our relational database locking guarantees zero race conditions during peak demand.
            </p>
          </div>

          <div className="bg-slate-950 rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-2xl">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              {/* Node 1 */}
              <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 flex flex-col items-center">
                <div className="w-12 h-12 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center mb-3">
                  <Database className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-slate-100">1. Row Lock Acquisition</h4>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed font-mono">
                  SELECT * FROM units_rooms WHERE id = :id FOR UPDATE
                </p>
                <span className="text-[11px] text-teal-400 mt-2">Database lock holds immediately</span>
              </div>

              {/* Node 2 */}
              <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 flex flex-col items-center">
                <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-3">
                  <Clock className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-slate-100">2. 900-Second Exclusive Hold</h4>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  Status changes to <strong className="text-amber-400">HELD</strong>. Concurrent guests attempting to reserve this unit receive an immediate conflict response.
                </p>
                <span className="text-[11px] text-amber-400 mt-2">Protected payment countdown</span>
              </div>

              {/* Node 3 */}
              <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 flex flex-col items-center">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-3">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-slate-100">3. Confirmation or Release</h4>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  Upon MoMo payment confirmation, status transitions to <strong className="text-emerald-400">CONFIRMED</strong>. If timer expires without payment, lock safely releases back to AVAILABLE.
                </p>
                <span className="text-[11px] text-emerald-400 mt-2">Zero phantom reservations</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. BOTTOM ACTION CTA */}
      <section className="py-16 bg-white text-center">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-2xl font-black text-slate-900">
            Ready to Try It Out?
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Launch the live booking app to see the concurrency lock in action, or list your property with our Host PMS.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-4">
            <a
              href={guestUrl}
              target="_blank"
              rel="noreferrer"
              className="px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-md"
            >
              <span>Launch Guest App</span>
              <ArrowRight className="w-4 h-4" />
            </a>
            <button
              onClick={() => setActiveTab('become-host')}
              className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl"
            >
              Join as a Host &rarr;
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
