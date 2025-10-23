import React from 'react';
import Header from './Header.jsx';
import Footer from './Footer.jsx';

export default function Layout({ children }) {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-950"> {/* Adjusted background */}
      <Header />
      <main className="flex-1 container mx-auto p-4 lg:p-10">
        {children}
      </main>
      <Footer />
    </div>
  );
}