import React, { useState, useEffect } from 'react';
import { ShoppingCart, Menu } from 'lucide-react';

interface NavbarProps {
  onMenuClick: () => void;
  onCartClick: () => void;
  cartCount: number;
}

const quotes = [
  "Good food is the foundation of genuine happiness.",
  "First we eat, then we do everything else.",
  "People who love to eat are always the best people.",
  "To eat is a necessity, but to eat intelligently is an art.",
  "Life is uncertain. Eat dessert first."
];

const Navbar: React.FC<NavbarProps> = ({ onMenuClick, onCartClick, cartCount }) => {
  const [quoteIndex, setQuoteIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % quotes.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <nav className="sticky top-0 z-50 flex h-16 w-full items-center justify-between bg-gray-200 px-4 backdrop-blur-md border-b border-zinc-100">
      {/* Left: Logo and Mobile Menu */}
      <div className="flex items-center gap-4">
        <button 
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg hover:bg-zinc-100 transition-colors"
        >
          <Menu className="w-6 h-6 text-zinc-600" />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center text-white font-bold text-xl">
            S
          </div>
          <span className="text-xl font-bold tracking-tight text-zinc-900 hidden sm:block">
            Snack<span className="text-orange-500">Box</span>
          </span>
        </div>
      </div>

      {/* Center: Quotes */}
      <div className="flex-1 flex justify-center px-4 overflow-hidden">
        <p className="text-sm md:text-base font-medium text-zinc-500 italic text-center animate-fade-in truncate max-w-lg">
          "{quotes[quoteIndex]}"
        </p>
      </div>

      {/* Right: Cart */}
      <div className="flex items-center gap-2">
        <button 
          onClick={onCartClick}
          className="relative p-2 rounded-full hover:bg-zinc-100 transition-all active:scale-90"
        >
          <ShoppingCart className="w-6 h-6 text-zinc-700" />
          {cartCount > 0 && (
            <span className="absolute top-0 right-0 w-5 h-5 bg-orange-600 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white">
              {cartCount}
            </span>
          )}
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
