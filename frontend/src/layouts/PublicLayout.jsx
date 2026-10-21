import React from 'react';
import { Outlet } from 'react-router-dom';
import LandingNavbar from '../components/navigation/LandingNavbar';
import Footer from '../components/navigation/Footer';

/**
 * Public Layout for Landing Page, Auth Login Placeholder, and Information Pages
 */
export const PublicLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      <LandingNavbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default PublicLayout;
