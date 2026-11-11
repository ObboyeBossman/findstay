import React from 'react';
import { TEAM_MEMBERS } from '../data/team';
import {
  Building2,
  ShieldCheck,
  CheckCircle2,
  GraduationCap,
  Award,
  Users,
  Lock,
  ArrowRight,
  MapPin,
  FileCheck2
} from 'lucide-react';

interface AboutPageProps {
  setActiveTab: (tab: string) => void;
  guestUrl: string;
}

export const AboutPage: React.FC<AboutPageProps> = ({ setActiveTab, guestUrl }) => {
  return (
    <div className="bg-slate-50 min-h-screen">
      {/* 1. HERO BANNER */}
      <section className="relative bg-slate-950 text-white py-20 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1600&q=80"
            alt="Engineering collaboration"
            className="w-full h-full object-cover opacity-20 filter"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-teal-500/20 text-teal-300 border border-teal-500/40 mb-4">
            <GraduationCap className="w-4 h-4" /> Academic Engineering Capstone
          </span>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            Transforming Ghana’s Accommodation Ecosystem Through Software Engineering
          </h1>
          <p className="mt-5 text-base sm:text-lg text-slate-300 max-w-3xl mx-auto leading-relaxed">
            FindStay is engineered by an 11-member student software engineering team at Takoradi Technical University to eliminate middleman exploitation, prevent double-bookings, and bring digital transparency to Ghana’s Western Region.
          </p>
        </div>
      </section>

      {/* 2. BACKGROUND & PROBLEM CONTEXT */}
      <section className="py-16 bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-xs font-bold text-teal-700 bg-teal-100 uppercase tracking-widest px-3 py-1 rounded-full">
                The Ground Reality
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-3 tracking-tight">
                Why We Built FindStay
              </h2>
              <div className="mt-4 text-sm text-slate-600 space-y-3 leading-relaxed">
                <p>
                  Takoradi is the administrative capital of Ghana’s Western Region and an active commercial corridor for oil, gas, maritime logistics, and higher education. Thousands of business executives, technicians, and students arrive in the city every month requiring short and long-term accommodation.
                </p>
                <p>
                  Yet, accommodation discovery in the region has remained trapped in informal workflows. Accommodation seekers routinely encounter unauthorized street agents demanding <strong>15% to 20% non-refundable viewing fees</strong> for uninspected properties.
                </p>
                <p>
                  Meanwhile, small-to-medium hotels, guesthouses, and student hostels manage bookings using paper notebooks and disconnected WhatsApp messages—frequently causing devastating <strong>double-booking incidents</strong> during peak business conferences and campus reopening weeks.
                </p>
              </div>
            </div>

            <div className="bg-slate-50 p-8 rounded-3xl border border-slate-200 space-y-5">
              <h3 className="text-base font-bold text-slate-900 border-b border-slate-200 pb-3 flex items-center gap-2">
                <Award className="w-5 h-5 text-teal-600" />
                <span>Empirical Findings (Ghana Tourism &amp; GSS)</span>
              </h3>
              <div className="space-y-4 text-xs text-slate-600">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-800 font-bold flex items-center justify-center shrink-0">
                    29%
                  </div>
                  <div>
                    <strong className="text-slate-900 block">The Digital Gap</strong>
                    According to Cenfri &amp; Mastercard Foundation (2023), only 29% of Ghanaian accommodation providers maintain a website.
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-800 font-bold flex items-center justify-center shrink-0">
                    97%
                  </div>
                  <div>
                    <strong className="text-slate-900 block">Self-Arranged Stays</strong>
                    Ghana Statistical Service (2025) reported that 97% of domestic overnight trips in Ghana are self-arranged through informal channels.
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-800 font-bold flex items-center justify-center shrink-0">
                    99%
                  </div>
                  <div>
                    <strong className="text-slate-900 block">Hostel Demand</strong>
                    Hostels in regional educational hubs operate at 91%–99% room occupancy, illustrating the acute need for transparent reservation systems.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. OUR THREE CORE PILLARS */}
      <section className="py-16 bg-slate-50 border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold text-teal-700 bg-teal-100 uppercase tracking-widest px-3 py-1 rounded-full">
              System Architecture
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
              The Three Pillars of FindStay
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center mb-4">
                <Building2 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">1. Direct Host Access</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                We eliminate middleman exploitation by connecting guests directly to authenticated property owners and hotel front desks with zero unauthorized viewing fees.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center mb-4">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">2. Concurrency Guarantee</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Our backend uses pessimistic database row locking (SELECT ... FOR UPDATE) to hold reserved units exclusively for 15 minutes, preventing double-bookings.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center mb-4">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">3. Ghana Act 843 Compliance</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                National identity verification using Ghana Card records, BCrypt-12 encrypted credentials, and bank-grade Paystack Mobile Money integration.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. MEET THE 11 STUDENT SOFTWARE ENGINEERS */}
      <section className="py-20 bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold text-teal-700 bg-teal-100 uppercase tracking-widest px-3 py-1 rounded-full">
              Engineering Defense Team
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mt-3 tracking-tight">
              Meet the Student Engineering Team
            </h2>
            <p className="mt-2 text-sm sm:text-base text-slate-600">
              Department of Information Technology &bull; Faculty of Applied Sciences &amp; Computing &bull; Takoradi Technical University
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {TEAM_MEMBERS.map((m, idx) => (
              <div
                key={idx}
                className="bg-slate-50 rounded-2xl p-6 border border-slate-200 flex flex-col justify-between hover:border-teal-500 hover:shadow-md transition"
              >
                <div>
                  <div className="flex items-center gap-4 mb-4">
                    <img
                      src={m.avatar}
                      alt={m.name}
                      className="w-14 h-14 rounded-full object-cover border-2 border-teal-500 shadow-sm"
                    />
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">{m.name}</h3>
                      <span className="text-xs font-mono font-semibold text-teal-700 bg-teal-100/80 px-2 py-0.5 rounded inline-block mt-0.5">
                        {m.indexNumber}
                      </span>
                    </div>
                  </div>

                  <div className="mb-2">
                    <span className="text-xs font-bold text-slate-900 block">{m.role}</span>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      {m.focus}
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200/80 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Takoradi Technical University</span>
                  <span className="font-semibold text-teal-600">Member #{idx + 1}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. BOTTOM CTA */}
      <section className="py-16 bg-slate-900 text-white text-center">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-2xl sm:text-3xl font-black">
            Experience the FindStay Accommodation Platform
          </h2>
          <p className="mt-3 text-sm text-slate-400">
            Browse live verified properties across Takoradi or inspect how our concurrency locking engine works.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button
              onClick={() => setActiveTab('home')}
              className="px-6 py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center gap-2"
            >
              <span>Explore Verified Stays</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => setActiveTab('how-it-works')}
              className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs"
            >
              How It Works &rarr;
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
