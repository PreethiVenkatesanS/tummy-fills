import React, { useState } from 'react';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import Cart from './pages/Cart';
import QuickSnacks from './pages/QuickSnacks';
import PreOrder from './pages/PreOrder';
import Gallery from './pages/Gallery';
import type { Snack } from './data/snacks';
import Admin from './pages/Admin';

type CartItem = Snack & { quantity: number };

const App: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [currentView, setCurrentView] = useState<'home' | 'cart' | 'quick-snacks' | 'pre-order' | 'gallery' | 'admin'>('home');
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  const handleAddToCart = (snack: Snack) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.id === snack.id);
      if (existing) {
        return prev.map(item => 
          item.id === snack.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...snack, quantity: 1 }];
    });
  };

  const handleRemoveOne = (id: string) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.id === id);
      if (existing && existing.quantity > 1) {
        return prev.map(item => 
          item.id === id ? { ...item, quantity: item.quantity - 1 } : item
        );
      }
      return prev.filter(item => item.id !== id);
    });
  };

  const handleRemoveFromCart = (id: string) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <Layout 
      activeCategory={activeCategory} 
      onSelectCategory={(cat) => {
        setActiveCategory(cat);
        if (cat === 'quick-snacks') {
          setCurrentView('quick-snacks');
        } else if (cat === 'pre-order') {
          setCurrentView('pre-order');
        } else if (cat === 'gallery') {
          setCurrentView('gallery');
        } else if (cat === 'admin') {
          setCurrentView('admin');
        } else {
          setCurrentView('home');
        }
      }} 
      cartCount={cartCount}
      onCartClick={() => setCurrentView('cart')}
    >
      {currentView === 'home' ? (
        <>
          <div className="flex justify-end mb-4 sm:hidden">
            <button 
              onClick={() => setCurrentView('cart')}
              className="bg-orange-500 text-white px-4 py-2 rounded-full text-xs font-bold shadow-lg"
            >
              View Cart ({cartCount})
            </button>
          </div>
          <Home 
            activeCategory={activeCategory} 
            onAddToCart={handleAddToCart} 
          />
        </>
      ) : currentView === 'quick-snacks' ? (
        <QuickSnacks 
          onAddToCart={handleAddToCart}
          onRemoveOne={handleRemoveOne}
          cartItems={cartItems}
        />
      ) : currentView === 'pre-order' ? (
        <PreOrder />
      ) : currentView === 'gallery' ? (
        <Gallery />
      ) : currentView === 'admin' ? (
        <Admin />
      ) : (
        <Cart 
          cartItems={cartItems} 
          onRemove={handleRemoveFromCart} 
          onBack={() => setCurrentView('home')} 
          onClear={handleClearCart}
        />
      )}
    </Layout>
  );
};

export default App;
