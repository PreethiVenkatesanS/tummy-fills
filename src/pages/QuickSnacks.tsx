import React, { useState, useEffect } from 'react';
import SnackCard from '../components/ui/SnackCard';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '../lib/firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import type { Snack } from '../data/snacks';

interface QuickSnacksProps {
  onAddToCart: (snack: Snack) => void;
  onRemoveOne: (id: string) => void;
  cartItems: { id: string; quantity: number }[];
}

const tabs = ['All Snacks', 'Sandwich', 'Fries', 'Brownie', 'Rolls'] as const;
type Tab = typeof tabs[number];

const QuickSnacks: React.FC<QuickSnacksProps> = ({ onAddToCart, onRemoveOne, cartItems }) => {
  const [activeTab, setActiveTab] = useState<Tab>('All Snacks');
  const [items, setItems] = useState<Snack[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const q = query(collection(db, "items"), orderBy("name"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const itemsList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Snack));
      setItems(itemsList);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching items:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Case-insensitive comparison so "sandwich" matches "Sandwich"
  const filteredSnacks = items.filter(snack => {
    if (activeTab === 'All Snacks') return true;
    return snack.category.toLowerCase() === activeTab.toLowerCase();
  });

  const getQuantity = (id: string) =>
    cartItems.find(item => item.id === id)?.quantity || 0;

  // Count per tab for badges
  const getCount = (tab: Tab) => {
    if (tab === 'All Snacks') return items.length;
    return items.filter(s => s.category.toLowerCase() === tab.toLowerCase()).length;
  };

  return (
    <div id='order-section' className="space-y-8 animate-fade-in">
      <div className="flex flex-col gap-4">
        <h1 className="text-3xl font-bold text-zinc-900">Quick Snacks</h1>
        <p className="text-zinc-500">Delicious bites ready in minutes.</p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-zinc-100 pb-4">
        {tabs.map((tab) => {
          const count = getCount(tab);
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                activeTab === tab
                  ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20'
                  : 'bg-white text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900 border border-zinc-100'
              }`}
            >
              {tab}
              {count > 0 && (
                <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${
                  activeTab === tab ? 'bg-white/20 text-white' : 'bg-zinc-100 text-zinc-400'
                }`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-12 h-12 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin" />
          <p className="text-zinc-500 font-medium font-poppins text-sm">Loading snacks...</p>
        </div>
      ) : (
        <>
          {/* Category heading (hidden on All Snacks) */}
          {activeTab !== 'All Snacks' && (
            <motion.p
              key={activeTab}
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xs font-black uppercase tracking-widest text-orange-500"
            >
              {activeTab} · {filteredSnacks.length} item{filteredSnacks.length !== 1 ? 's' : ''}
            </motion.p>
          )}

          <motion.div
            layout
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
          >
            <AnimatePresence mode="popLayout">
              {filteredSnacks.map((snack) => (
                <SnackCard
                  key={snack.id}
                  snack={snack}
                  onAddToCart={onAddToCart}
                  onRemoveOne={onRemoveOne}
                  quantity={getQuantity(snack.id)}
                />
              ))}
            </AnimatePresence>
          </motion.div>

          {filteredSnacks.length === 0 && (
            <div className="text-center py-20">
              <p className="text-zinc-400">No snacks found in this category.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default QuickSnacks;