import React, { useState } from 'react';
import { Building2, Menu, X, ArrowRight, ShieldCheck, ExternalLink, Bed, PhoneCall } from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  guestUrl: string;
  ownerUrl: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  guestUrl,
  ownerUrl
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (tab: string) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navLinks = [
    { id: 'home', label: 'Explore Stays' },
    { id: 'about', label: 'What We Do' },
    { id: 'how-it-works', label: 'How It Works' },
    { id: 'become-host', label: 'Become a Host' },
    { id: 'policies', label: 'Policies & Trust' },
    { id: 'contact', label: 'Contact' }
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 transition-all">
      {/* Top Bar Announcement */}
      <div className="bg-slate-900 text-slate-200 text-xs py-1.5 px-4 text-center font-medium border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 mx-auto sm:mx-0">
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-500/20 text-teal-300 border border-teal-500/40">
              🇬🇭 Takoradi Pilot Live
            </span>
            <span className="hidden sm:inline text-slate-300">
              Verified Hotels, Executive Apartments, Guesthouses &amp; Student Hostels.
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-4 text-[11px] text-slate-400">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
              Ghana Act 843 Compliant
            </span>
            <a href="tel:+233244123456" className="flex items-center gap-1 hover:text-white transition">
              <PhoneCall className="w-3 h-3 text-teal-400" />
              +233 (0) 244 123 456
            </a>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <div
          onClick={() => handleNavClick('home')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-teal-700 to-emerald-500 text-white flex items-center justify-center shadow-lg shadow-teal-700/25 group-hover:scale-105 transition-transform">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1">
              <span className="text-2xl font-black tracking-tight text-slate-900">
                Find<span className="text-teal-600">Stay</span>
              </span>
              <span className="text-[10px] font-bold text-teal-700 bg-teal-50 border border-teal-200 px-1.5 py-0.2 rounded uppercase ml-1">
                GH
              </span>
            </div>
            <span className="block text-[10px] font-semibold tracking-wider text-slate-500 uppercase -mt-0.5">
              Takoradi Accommodation Portal
            </span>
          </div>
        </div>

        {/* Desktop Nav Items */}
        <nav className="hidden lg:flex items-center space-x-7 text-sm font-semibold text-slate-600">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => handleNavClick(link.id)}
              className={`hover:text-teal-600 transition-colors py-2 relative ${
                activeTab === link.id
                  ? 'text-teal-600 font-bold'
                  : ''
              }`}
            >
              {link.label}
              {activeTab === link.id && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-teal-600 rounded-full animate-in fade-in duration-300" />
              )}
            </button>
          ))}
        </nav>

        {/* Action CTAs */}
        <div className="hidden sm:flex items-center space-x-3">
          <a
            href={ownerUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-teal-700 bg-slate-100 hover:bg-slate-200 px-4 py-2.5 rounded-xl transition"
          >
            <Bed className="w-3.5 h-3.5 text-teal-600" />
            <span>Host Portal</span>
            <ExternalLink className="w-3 h-3 opacity-50" />
          </a>

          <a
            href={guestUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 px-5 py-2.5 rounded-xl shadow-md shadow-teal-600/20 hover:shadow-lg hover:shadow-teal-600/30 transition transform active:scale-95"
          >
            <span>Launch Booking App</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Mobile Hamburger Button */}
        <div className="lg:hidden flex items-center gap-2">
          <a
            href={guestUrl}
            target="_blank"
            rel="noreferrer"
            className="text-xs font-bold text-white bg-teal-600 px-3.5 py-2 rounded-lg"
          >
            Book Now
          </a>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 focus:outline-none"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-slate-200 px-4 pt-3 pb-6 space-y-2 shadow-xl animate-in slide-in-from-top-4 duration-200">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => handleNavClick(link.id)}
              className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-semibold transition ${
                activeTab === link.id
                  ? 'bg-teal-50 text-teal-700 font-bold'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              {link.label}
            </button>
          ))}
          <div className="pt-4 border-t border-slate-100 flex flex-col gap-2.5">
            <a
              href={ownerUrl}
              target="_blank"
              rel="noreferrer"
              className="w-full text-center py-2.5 px-4 rounded-xl text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 flex items-center justify-center gap-2"
            >
              <Bed className="w-4 h-4 text-teal-600" />
              <span>Host / Landlord PMS</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-60" />
            </a>
            <a
              href={guestUrl}
              target="_blank"
              rel="noreferrer"
              className="w-full text-center py-2.5 px-4 rounded-xl text-xs font-bold bg-teal-600 text-white hover:bg-teal-700 flex items-center justify-center gap-2 shadow-sm"
            >
              <span>Launch Guest App</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
