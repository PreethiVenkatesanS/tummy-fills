import React from 'react';
import { Plus, Minus } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Snack } from '../../data/snacks';

interface SnackCardProps {
  snack: Snack;
  onAddToCart: (snack: Snack) => void;
  onRemoveOne?: (id: string) => void;
  quantity?: number;
}

const SnackCard: React.FC<SnackCardProps> = ({ snack, onAddToCart, onRemoveOne, quantity = 0 }) => {
  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -8 }}
      className="bg-white rounded-3xl p-4 shadow-sm hover:shadow-xl transition-all duration-300 group flex flex-col h-full"
    >
      <div className="relative aspect-[4/3] mb-4 rounded-2xl overflow-hidden bg-zinc-100">
        <img 
          src={snack.image} 
          alt={snack.name} 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        {snack.isPopular && (
          <div className="absolute top-3 left-3 bg-orange-500 text-white text-[10px] font-extrabold px-2 py-1 rounded-full uppercase tracking-wider">
            Popular
          </div>
        )}
      </div>

      <div className="flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-1">
          <h3 className="font-bold text-zinc-900 group-hover:text-orange-600 transition-colors">{snack.name}</h3>
          <span className="font-bold text-orange-600">₹{snack.price}</span>
        </div>
        <p className="text-zinc-500 text-xs line-clamp-2 mb-4 leading-relaxed">
          {snack.description}
        </p>

        <div className="mt-auto flex items-center justify-between">
          <span className="text-[10px] font-bold text-zinc-400 bg-zinc-50 px-2 py-1 rounded-md uppercase tracking-tighter">
            {snack.category}
          </span>
          
          <div className="flex items-center gap-2">
            {quantity > 0 && (
              <>
                <button 
                  onClick={() => onRemoveOne?.(snack.id)}
                  className="w-8 h-8 bg-zinc-100 text-zinc-600 rounded-lg flex items-center justify-center hover:bg-zinc-200 transition-all active:scale-90"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="text-sm font-bold text-zinc-900 min-w-[20px] text-center">{quantity}</span>
              </>
            )}
            <button 
              onClick={() => onAddToCart(snack)}
              className="w-8 h-8 bg-zinc-900 text-white rounded-lg flex items-center justify-center hover:bg-orange-600 hover:shadow-lg transition-all active:scale-90"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default SnackCard;
