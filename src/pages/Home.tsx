import React from 'react';
import { motion } from 'framer-motion';
import { db } from '../lib/firebase';
import { collection, onSnapshot, query, where, orderBy } from 'firebase/firestore';
import type { Snack } from '../data/snacks';

interface HomeProps {
  activeCategory: string;
  onAddToCart: (snack: Snack) => void;
}

const Home: React.FC<HomeProps> = ({ activeCategory }) => {
  const [, setItems] = React.useState<Snack[]>([]);

  React.useEffect(() => {
    const q = activeCategory === 'all' 
      ? query(collection(db, "items"), orderBy("name"))
      : query(collection(db, "items"), where("category", "==", activeCategory), orderBy("name"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const itemsList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Snack));
      setItems(itemsList);
     
    }, (error) => {
      console.error("Error fetching items:", error);
    });

    return () => unsubscribe();
  }, [activeCategory]);

  return (
    <div className="pb-12">
      {/* Premium Hero Section */}
      <section className="relative mb-10 rounded-[2.5rem] overflow-hidden bg-white border border-zinc-100 p-6 lg:p-10 min-h-[400px] flex items-center shadow-xl shadow-zinc-200/50">
        {/* Background Decorative Elements */}
        <div className="absolute top-0 right-0 w-1/3 h-full bg-orange-50/50 -z-0 rounded-l-[10rem]" />
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-24 -right-24 w-64 h-64 border-2 border-orange-100 rounded-full opacity-50"
        />
        <motion.div 
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-12 right-1/2 w-32 h-32 bg-orange-100/30 rounded-full blur-3xl"
        />

        <div className="relative z-10 w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="max-w-xl text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-100 text-orange-600 text-sm font-bold mb-6"
            >
              <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
              Now Delivering Freshness
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl lg:text-6xl font-black text-zinc-900 mb-4 leading-[1.1] font-outfit"
            >
              Taste the Craft of <span className="text-orange-500">Pure Love</span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-zinc-500 text-base lg:text-lg mb-8 font-poppins leading-relaxed"
            >
              From our cloud kitchen to your doorstep. Handcrafted treats made with organic ingredients and zero compromises.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            >
              <a 
              href='quick-snacks'
                className="btn-primary text-lg px-10 py-4 shadow-orange-200"
              >
                Explore Menu
              </a>
            </motion.div>
          </div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ type: "spring", damping: 15 }}
            className="relative lg:block hidden"
          >
            <div className="relative z-10 rounded-[3rem] overflow-hidden shadow-2xl shadow-orange-950/20 transform hover:scale-[1.02] transition-transform duration-500 border-8 border-white">
              <img 
                src="https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&q=80&w=800"
                alt="Gourmet Food Platter"
                className="w-full h-[500px] object-cover"
              />
            </div>
            {/* Floating Badge */}
            {/* <motion.div 
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="absolute -bottom-6 -left-6 bg-white p-6 rounded-3xl shadow-xl z-20 border border-zinc-100"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center text-green-600">
                  <span className="text-2xl font-bold">★</span>
                </div>
                <div>
                  <p className="text-sm font-bold text-zinc-900">Top Rated</p>
                  <p className="text-xs text-zinc-500">Cloud Kitchen in Town</p>
                </div>
              </div>
            </motion.div> */}
          </motion.div>
        </div>
      </section>

      {/* Menu Header */}
      {/* <div id="order-section" className="flex items-center justify-between mb-6 scroll-mt-24">
        <div>
          <h2 className="text-2xl font-bold text-zinc-900">
            {activeCategory === 'all' ? 'Popular Snacks' : activeCategory}
          </h2>
          <p className="text-zinc-500 text-sm">Discover our hand-picked selection</p>
        </div>
      </div> */}

      {/* Snack Grid */}
      {/* {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-12 h-12 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin" />
          <p className="text-zinc-500 font-medium font-poppins text-sm">Loading delicious treats...</p>
        </div>
      ) : (
        <motion.div 
          layout
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          <AnimatePresence mode='popLayout'>
            {filteredSnacks.map((snack) => (
              <SnackCard 
                key={snack.id} 
                snack={snack} 
                onAddToCart={onAddToCart} 
              />
            ))}
          </AnimatePresence>
        </motion.div>
      )} */}

      {/* {!loading && filteredSnacks.length === 0 && (
        <div className="text-center py-20">
          <p className="text-zinc-400 italic">No snacks found in this category yet. Stay tuned!</p>
        </div>
      )} */}
    </div>
  );
};

export default Home;
