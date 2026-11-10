import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { AiConciergeWidget } from '../chatbot/AiConciergeWidget';
import { useAuthStore } from '../../store/authStore';

export const PublicLayout: React.FC = () => {
  const { checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAFD] text-slate-800 relative selection:bg-indigo-600 selection:text-white">
      {/* Luminous Top Radial Glow */}
      <div className="fixed inset-x-0 top-0 h-[600px] pointer-events-none bg-radial-luminous z-0"></div>

      <Navbar />

      <main className="flex-1 relative z-10">
        <Outlet />
      </main>

      <Footer />

      {/* Floating CineCore AI Concierge */}
      <AiConciergeWidget />
    </div>
  );
};
