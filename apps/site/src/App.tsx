import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { AboutPage } from './pages/AboutPage';
import { HowItWorksPage } from './pages/HowItWorksPage';
import { BecomeHostPage } from './pages/BecomeHostPage';
import { PoliciesPage } from './pages/PoliciesPage';
import { ContactPage } from './pages/ContactPage';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('home');

  // Sync hash routing with activeTab
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (['home', 'about', 'how-it-works', 'become-host', 'policies', 'contact'].includes(hash)) {
        setActiveTab(hash);
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const changeTab = (tab: string) => {
    setActiveTab(tab);
    window.location.hash = tab;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getGuestUrl = () => {
    if (typeof window !== 'undefined' && window.location.hostname.includes('vercel.app')) {
      return 'https://app-findstay.vercel.app';
    }
    return 'http://localhost:3001';
  };

  const getOwnerUrl = () => {
    if (typeof window !== 'undefined' && window.location.hostname.includes('vercel.app')) {
      return 'https://host-findstay.vercel.app';
    }
    return 'http://localhost:3002';
  };

  const getAdminUrl = () => {
    if (typeof window !== 'undefined' && window.location.hostname.includes('vercel.app')) {
      return 'https://admin-findstay.vercel.app';
    }
    return 'http://localhost:3003';
  };

  const guestUrl = getGuestUrl();
  const ownerUrl = getOwnerUrl();
  const adminUrl = getAdminUrl();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans selection:bg-teal-500 selection:text-white">
      {/* Sticky Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={changeTab}
        guestUrl={guestUrl}
        ownerUrl={ownerUrl}
      />

      {/* Main Pages Content */}
      <main className="flex-1">
        {activeTab === 'home' && (
          <HomePage
            setActiveTab={changeTab}
            guestUrl={guestUrl}
            ownerUrl={ownerUrl}
          />
        )}

        {activeTab === 'about' && (
          <AboutPage
            setActiveTab={changeTab}
            guestUrl={guestUrl}
          />
        )}

        {activeTab === 'how-it-works' && (
          <HowItWorksPage
            setActiveTab={changeTab}
            guestUrl={guestUrl}
            ownerUrl={ownerUrl}
          />
        )}

        {activeTab === 'become-host' && (
          <BecomeHostPage ownerUrl={ownerUrl} />
        )}

        {activeTab === 'policies' && (
          <PoliciesPage />
        )}

        {activeTab === 'contact' && (
          <ContactPage />
        )}
      </main>

      {/* Global Footer */}
      <Footer
        setActiveTab={changeTab}
        guestUrl={guestUrl}
        ownerUrl={ownerUrl}
        adminUrl={adminUrl}
      />
    </div>
  );
};

export default App;
