import React, { useState } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import Footer from './Footer';

interface LayoutProps {
  children: React.ReactNode;
  activeCategory: string;
  onSelectCategory: (category: string) => void;
  cartCount: number;
  onCartClick: () => void;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  activeCategory, 
  onSelectCategory, 
  cartCount,
  onCartClick 
}) => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col">
      <Navbar 
        onMenuClick={() => setSidebarOpen(!isSidebarOpen)} 
        onCartClick={onCartClick}
        cartCount={cartCount} 
      />
      
      <div className="flex-1 flex">
        {/* Mobile Overlay */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        
        <Sidebar 
          activeCategory={activeCategory} 
          onSelectCategory={(cat) => {
            onSelectCategory(cat);
            setSidebarOpen(false);
          }} 
          isOpen={isSidebarOpen}
        />
        
        <main className="flex-1 p-4 lg:p-6">
          <div className="max-w-7xl mx-auto min-h-full flex flex-col">
            <div className="flex-1">
              {children}
            </div>
            <Footer />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
