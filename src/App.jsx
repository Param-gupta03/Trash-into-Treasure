import React, { useEffect } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import ImageSearch from './components/ImageSearch';
import Footer from './components/Footer';

/**
 * The main application component.
 * It now serves as a layout container for the other components.
 */
export default function App() {
  // Set the document title on component mount
  useEffect(() => {
    document.title = "WasteNot Creations - Turn Trash to Treasure";
  }, []);

  // --- Render the App ---
  return (
    <div className="bg-gray-50 text-gray-800" style={{ fontFamily: "'Inter', sans-serif" }}>
      
      <Header />

      {/* === Main Content === */}
      <main className="container mx-auto px-4 py-12">
        <Hero />
        <ImageSearch />
      </main>

      <Footer />
      
    </div>
  );
}