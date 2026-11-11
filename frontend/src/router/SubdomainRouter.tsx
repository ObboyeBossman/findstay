import React, { useState, useEffect } from 'react';
import { GuestMarketplace } from '../portals/guest/GuestMarketplace';
import { LandlordPortal } from '../portals/landlord/LandlordPortal';
import { AdminPortal } from '../portals/admin/AdminPortal';
import { Globe, Building2, ShieldCheck } from 'lucide-react';

export type PortalType = 'guest' | 'landlord' | 'admin';

export const SubdomainRouter: React.FC = () => {
  const [activePortal, setActivePortal] = useState<PortalType>('guest');
  const [detectedSubdomain, setDetectedSubdomain] = useState<string>('app');

  useEffect(() => {
    const hostname = window.location.hostname.toLowerCase();

    if (hostname.startsWith('host.') || hostname.startsWith('landlord.')) {
      setActivePortal('landlord');
      setDetectedSubdomain('host');
    } else if (hostname.startsWith('admin.')) {
      setActivePortal('admin');
      setDetectedSubdomain('admin');
    } else if (hostname.startsWith('app.')) {
      setActivePortal('guest');
      setDetectedSubdomain('app');
    } else {
      // Local development or root domain fallback
      const urlParams = new URLSearchParams(window.location.search);
      const portalParam = urlParams.get('portal');
      if (portalParam === 'landlord' || portalParam === 'host') {
        setActivePortal('landlord');
      } else if (portalParam === 'admin') {
        setActivePortal('admin');
      } else {
        setActivePortal('guest');
      }
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Top Demo & Subdomain Switcher Navigation */}
      <header className="bg-slate-900 text-slate-200 text-xs px-4 py-2 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2 shadow-sm">
        <div className="flex items-center space-x-2">
          <span className="inline-flex items-center gap-1 font-semibold text-teal-400 bg-teal-950/60 border border-teal-800/80 px-2.5 py-0.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse"></span>
            SUBDOMAIN ROUTER
          </span>
          <span className="hidden sm:inline text-slate-400">
            Detected host: <code className="text-teal-300 font-mono">{detectedSubdomain}.findstay.com</code>
          </span>
        </div>

        {/* Portal Switcher Buttons for Demo / Defense */}
        <div className="flex items-center space-x-1.5 bg-slate-800/90 p-1 rounded-lg border border-slate-700">
          <button
            onClick={() => setActivePortal('guest')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md font-medium transition ${
              activePortal === 'guest'
                ? 'bg-teal-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Student Marketplace</span>
            <span className="text-[10px] text-teal-200 font-mono opacity-80">(app.)</span>
          </button>

          <button
            onClick={() => setActivePortal('landlord')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md font-medium transition ${
              activePortal === 'landlord'
                ? 'bg-teal-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Landlord Manager</span>
            <span className="text-[10px] text-teal-200 font-mono opacity-80">(host.)</span>
          </button>

          <button
            onClick={() => setActivePortal('admin')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md font-medium transition ${
              activePortal === 'admin'
                ? 'bg-teal-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Platform Admin</span>
            <span className="text-[10px] text-teal-200 font-mono opacity-80">(admin.)</span>
          </button>
        </div>
      </header>

      {/* Main Active Subdomain Content */}
      <main className="flex-1">
        {activePortal === 'guest' && <GuestMarketplace />}
        {activePortal === 'landlord' && <LandlordPortal />}
        {activePortal === 'admin' && <AdminPortal />}
      </main>

      {/* Global Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 text-xs py-4 px-6 text-center">
        <p>
          FindStay Platform &bull; Advanced Java Programming Capstone &bull; Pilot Context: Sekondi-Takoradi Metropolitan Area
        </p>
      </footer>
    </div>
  );
};
