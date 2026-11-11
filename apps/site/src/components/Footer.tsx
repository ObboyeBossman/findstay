import React from 'react';
import { Building2, ShieldCheck, Mail, PhoneCall, MapPin, Heart, ExternalLink, Lock } from 'lucide-react';

interface FooterProps {
  setActiveTab: (tab: string) => void;
  guestUrl: string;
  ownerUrl: string;
  adminUrl: string;
}

export const Footer: React.FC<FooterProps> = ({
  setActiveTab,
  guestUrl,
  ownerUrl,
  adminUrl
}) => {
  const handleNavClick = (tab: string) => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-slate-950 text-slate-400 text-xs pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center space-x-3 text-white">
              <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-lg shadow-teal-500/20">
                <Building2 className="w-6 h-6" />
              </div>
              <span className="text-2xl font-black tracking-tight">
                Find<span className="text-teal-400">Stay</span>
              </span>
            </div>
            <p className="text-slate-400 leading-relaxed text-sm max-w-sm">
              Takoradi’s premier accommodation marketplace and property management platform. Connecting short-stay travelers, expatriates, and university students directly with verified hosts, hotels, and residencies across Western Region, Ghana.
            </p>
            <div className="pt-2 flex flex-wrap gap-2 text-[11px]">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-teal-400 font-medium">
                <ShieldCheck className="w-3.5 h-3.5" /> Ghana Data Protection Act 843
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-300 font-medium">
                <Lock className="w-3.5 h-3.5 text-amber-400" /> 15-Min Concurrency Lock
              </span>
            </div>
          </div>

          {/* Stays & Navigation */}
          <div>
            <h4 className="text-white font-bold mb-4 uppercase tracking-wider text-xs">
              Explore Stays
            </h4>
            <ul className="space-y-2.5">
              <li>
                <button onClick={() => handleNavClick('home')} className="hover:text-teal-400 transition">
                  Hotels &amp; Luxury Suites
                </button>
              </li>
              <li>
                <button onClick={() => handleNavClick('home')} className="hover:text-teal-400 transition">
                  Executive Serviced Flats
                </button>
              </li>
              <li>
                <button onClick={() => handleNavClick('home')} className="hover:text-teal-400 transition">
                  Heritage Guesthouses
                </button>
              </li>
              <li>
                <button onClick={() => handleNavClick('home')} className="hover:text-teal-400 transition">
                  TTU Student Hostels
                </button>
              </li>
              <li>
                <button onClick={() => handleNavClick('become-host')} className="hover:text-teal-400 transition font-semibold text-teal-400">
                  List Your Property &rarr;
                </button>
              </li>
            </ul>
          </div>

          {/* Legal & Trust */}
          <div>
            <h4 className="text-white font-bold mb-4 uppercase tracking-wider text-xs">
              Trust &amp; Policies
            </h4>
            <ul className="space-y-2.5">
              <li>
                <button onClick={() => handleNavClick('policies')} className="hover:text-teal-400 transition">
                  Terms of Service
                </button>
              </li>
              <li>
                <button onClick={() => handleNavClick('policies')} className="hover:text-teal-400 transition">
                  Privacy Policy (Act 843)
                </button>
              </li>
              <li>
                <button onClick={() => handleNavClick('policies')} className="hover:text-teal-400 transition">
                  Cancellation &amp; Refunds
                </button>
              </li>
              <li>
                <button onClick={() => handleNavClick('policies')} className="hover:text-teal-400 transition">
                  Ghana Card KYC Policy
                </button>
              </li>
              <li>
                <button onClick={() => handleNavClick('how-it-works')} className="hover:text-teal-400 transition">
                  Pessimistic Locking Engine
                </button>
              </li>
            </ul>
          </div>

          {/* Regional Office */}
          <div>
            <h4 className="text-white font-bold mb-4 uppercase tracking-wider text-xs">
              Takoradi Office
            </h4>
            <ul className="space-y-2.5 text-slate-400">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                <span>Harbour Commercial Corridor, Beach Road, Takoradi, Ghana</span>
              </li>
              <li className="flex items-center gap-2">
                <PhoneCall className="w-4 h-4 text-teal-400 shrink-0" />
                <a href="tel:+233244123456" className="hover:text-white transition">
                  +233 (0) 244 123 456
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-teal-400 shrink-0" />
                <a href="mailto:support@findstay.com" className="hover:text-white transition">
                  support@findstay.com
                </a>
              </li>
              <li className="pt-2">
                <span className="block text-[11px] text-slate-500 font-medium">
                  Support Hours: Mon – Sat (8:00 AM – 8:00 PM GMT)
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* System Portals Switcher */}
        <div className="py-6 px-6 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4 mb-10">
          <div>
            <span className="text-white font-bold text-sm block">
              FindStay Ecosystem Portals
            </span>
            <span className="text-xs text-slate-400">
              Multi-portal accommodation architecture for Guests, Hoteliers, and Administrators.
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <a
              href={guestUrl}
              target="_blank"
              rel="noreferrer"
              className="px-3.5 py-1.5 rounded-lg bg-teal-600/20 text-teal-300 border border-teal-500/30 hover:bg-teal-600/30 font-semibold text-xs flex items-center gap-1.5 transition"
            >
              <span>Guest Booking App</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <a
              href={ownerUrl}
              target="_blank"
              rel="noreferrer"
              className="px-3.5 py-1.5 rounded-lg bg-blue-600/20 text-blue-300 border border-blue-500/30 hover:bg-blue-600/30 font-semibold text-xs flex items-center gap-1.5 transition"
            >
              <span>Host / PMS Operations</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <a
              href={adminUrl}
              target="_blank"
              rel="noreferrer"
              className="px-3.5 py-1.5 rounded-lg bg-purple-600/20 text-purple-300 border border-purple-500/30 hover:bg-purple-600/30 font-semibold text-xs flex items-center gap-1.5 transition"
            >
              <span>Admin Governance</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Bottom Credits & Academic Foundation */}
        <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500 text-[11px]">
          <div className="flex items-center gap-2">
            <span>&copy; {new Date().getFullYear()} FindStay Ghana Ltd. All rights reserved.</span>
          </div>
          <div className="text-center sm:text-right">
            <span>
              Takoradi Technical University &bull; Faculty of Applied Sciences &amp; Computing &bull; Department of Information Technology
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
