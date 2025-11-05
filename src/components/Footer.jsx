import React from 'react';

/**
 * Footer Component
 */
const Footer = () => (
  <footer className="bg-gray-800 text-gray-300 py-12">
    <div className="container mx-auto px-4 text-center">
      <a href="#" className="text-2xl font-bold text-green-500 mb-4 inline-block">
        ♻️ Waste Not Creations
      </a>
      <p className="mb-4">
        Creative recycling projects and DIY ideas to help you reduce waste and save money.
      </p>
      <p className="text-sm">
        &copy; {new Date().getFullYear()} WasteNot Creations. All rights reserved.
      </p>
    </div>
  </footer>
);

export default Footer;
