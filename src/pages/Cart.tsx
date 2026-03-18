import React, { useState } from 'react';
import { Trash2, ArrowLeft, MapPin, Phone, User, X, CheckCircle2, Loader2, Hash } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import type { Snack } from '../data/snacks';

interface CartProps {
  cartItems: (Snack & { quantity: number })[];
  onRemove: (id: string) => void;
  onBack: () => void;
  onClear: () => void;
}

const Cart: React.FC<CartProps> = ({ cartItems, onRemove, onBack, onClear }) => {
  const [formData, setFormData] = useState({ name: '', phone: '', address: '' });
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [transactionId, setTransactionId] = useState('');  // ← ADDED
  const [isSaving, setIsSaving] = useState(false);
  
  const total = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const handleSaveOrder = async () => {
    if (cartItems.length === 0) return;

    // ── ADDED: require transaction ID before saving ──
    if (!transactionId.trim()) {
      alert('Please enter the Transaction ID / UTR number after completing payment.');
      return;
    }
    
    setIsSaving(true);
    try {
      await addDoc(collection(db, "orders"), {
        customerName: formData.name,
        customerPhone: formData.phone,
        customerAddress: formData.address,
        items: cartItems.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity
        })),
        totalPrice: total,
        status: 'pending',
        paymentMethod: 'UPI',           // ← ADDED
        transactionId: transactionId.trim(), // ← ADDED
        createdAt: serverTimestamp()
      });
      
      onClear();
      setShowPaymentModal(false);
      setTransactionId('');
      onBack();
      alert("Order placed successfully! We'll contact you soon.");
    } catch (error) {
      console.error("Error saving order: ", error);
      alert("Something went wrong. Please try again or contact support.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto pb-20">
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-zinc-500 hover:text-zinc-900 mb-8 transition-colors group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Back to Menu
      </button>

      <h1 className="text-3xl font-bold mb-8">Your Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3 space-y-4">
          {cartItems.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-3xl border border-zinc-100 italic text-zinc-400">
              Your cart is empty. Go grab some snacks!
            </div>
          ) : (
            cartItems.map((item) => (
              <motion.div 
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-zinc-50"
              >
                <img src={item.image} alt={item.name} className="w-16 h-16 rounded-xl object-cover" />
                <div className="flex-1">
                  <h4 className="font-bold text-zinc-900">{item.name}</h4>
                  <p className="text-zinc-500 text-sm">Qty: {item.quantity}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-zinc-900">₹{item.price * item.quantity}</p>
                  <button 
                    onClick={() => onRemove(item.id)}
                    className="text-red-500 hover:text-red-600 p-2 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-zinc-100">
            <h3 className="font-bold text-lg mb-4">Checkout Details</h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-zinc-400 uppercase mb-2 block">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <input 
                    type="text" 
                    placeholder="Enter your name" 
                    className="w-full bg-zinc-50 border-none rounded-xl py-3 pl-10 pr-4 text-sm focus:ring-2 focus:ring-orange-500/20"
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-zinc-400 uppercase mb-2 block">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <input 
                    type="tel" 
                    placeholder="Enter your mobile" 
                    className="w-full bg-zinc-50 border-none rounded-xl py-3 pl-10 pr-4 text-sm focus:ring-2 focus:ring-orange-500/20"
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-zinc-400 uppercase mb-2 block">Delivery Address</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-4 w-4 h-4 text-zinc-400" />
                  <textarea 
                    placeholder="Where should we deliver?" 
                    className="w-full bg-zinc-50 border-none rounded-xl py-3 pl-10 pr-4 text-sm focus:ring-2 focus:ring-orange-500/20 min-h-[100px]"
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                  />
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-zinc-100 flex justify-between items-center mb-6">
              <span className="text-zinc-500 font-medium">Total Amount</span>
              <span className="text-2xl font-bold text-orange-600">₹{total}</span>
            </div>

            <button 
              onClick={() => setShowPaymentModal(true)}
              disabled={cartItems.length === 0 || !formData.phone || !formData.address || !formData.name}
              className="w-full btn-primary disabled:opacity-50 disabled:grayscale disabled:scale-100"
            >
              Confirm Order
            </button>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      <AnimatePresence>
        {showPaymentModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPaymentModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-[2.5rem] p-8 shadow-2xl overflow-y-auto max-h-[90vh]"
            >
              <button 
                onClick={() => setShowPaymentModal(false)}
                className="absolute top-6 right-6 p-2 rounded-full hover:bg-zinc-100 transition-colors"
              >
                <X className="w-5 h-5 text-zinc-400" />
              </button>

              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-bold text-zinc-900 mb-2 font-outfit">Complete Payment</h2>
                <p className="text-zinc-500 text-sm mb-6 font-poppins">
                  Scan the QR code and pay <span className="font-black text-orange-500">₹{total}</span>, then enter your transaction ID below.
                </p>

                {/* QR Code */}
                <div className="bg-zinc-50 p-6 rounded-3xl mb-6 border border-zinc-100 inline-block mx-auto">
                  <img 
                    src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=tummyfills@upi%26pn=Tummy%20Fills" 
                    alt="Payment QR Code"
                    className="w-48 h-48 rounded-xl shadow-inner mix-blend-multiply"
                  />
                </div>

                {/* UPI ID */}
                <div className="bg-orange-50 p-4 rounded-2xl border border-orange-100 mb-2">
                  <p className="text-xs font-bold text-orange-400 uppercase tracking-wider mb-1">UPI ID</p>
                  <p className="font-bold text-orange-600 select-all">tummyfills@upi</p>
                </div>

                <p className="text-[10px] text-zinc-400 uppercase font-black tracking-widest mb-6">
                  Scan to Pay ₹{total}
                </p>

                {/* ── ADDED: Transaction ID input ── */}
                <div className="text-left space-y-2 mb-6">
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest pl-1">
                    Transaction ID / UTR Number <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                    <input
                      type="text"
                      placeholder="e.g. 123456789012"
                      value={transactionId}
                      onChange={(e) => setTransactionId(e.target.value)}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-3 pl-10 pr-4 text-sm focus:ring-2 focus:ring-orange-500/20 outline-none font-mono"
                    />
                  </div>
                  <p className="text-[11px] text-zinc-400 pl-1">
                    Enter the 12-digit UTR / reference number shown in your UPI app after payment.
                  </p>
                </div>

                <button 
                  onClick={handleSaveOrder}
                  disabled={isSaving || !transactionId.trim()}
                  className="w-full bg-zinc-900 text-white py-4 rounded-2xl font-bold hover:bg-zinc-800 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:scale-100"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Placing Order...
                    </>
                  ) : (
                    <><CheckCircle2 className="w-5 h-5" /> I've Paid — Place Order</>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Cart;