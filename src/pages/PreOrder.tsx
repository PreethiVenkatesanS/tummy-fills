import React, { useState, useEffect } from 'react';
import { Calendar, Package, Droplets, MapPin, User, Phone, CheckCircle2, X, Loader2, Hash, CreditCard } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
// import {Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import * as yup from 'yup';

// Fix Leaflet marker icon issue in React
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const pricingConfig = {
  Cake: {
    base: 450,
    flavours: { 'Vanilla': 0, 'Butterscotch': 50, 'Rasamalai': 150, 'Chocolate': 80 }
  },
  Cookie: {
    base: 180,
    flavours: { 'Choco Chip': 0, 'Double Chocolate': 40 }
  },
  Brownie: {
    base: 220,
    flavours: { 'Chocolate': 0, 'Fudge': 50 }
  }
} as const;

const weightMultipliers: Record<string, number> = {
  '500g': 1, '1kg': 1.8, '1.5kg': 2.6, '2kg': 3.4,
};

const itemFlavours = {
  Cake: ['Vanilla', 'Butterscotch', 'Rasamalai', 'Chocolate'],
  Cookie: ['Choco Chip', 'Double Chocolate'],
  Brownie: ['Chocolate', 'Fudge'],
} as const;

type ItemType = keyof typeof itemFlavours;

// const LocationMarker = ({ position, setPosition }: { position: L.LatLng | null, setPosition: (pos: L.LatLng) => void }) => {
//   useMapEvents({
//     click(e) { setPosition(e.latlng); },
//   });
//   return position === null ? null : <Marker position={position} />;
// };

const EMPTY_FORM = {
  date: '',
  item: 'Cake' as ItemType,
  weight: '500g',
  flavour: 'Vanilla' as string,
  customMessage: '',
  location: '',
  name: '',
  mobile: '',
  coordinates: null as L.LatLng | null,
};

const preOrderSchema = yup.object().shape({
  date: yup.string().required('Delivery Date is required.'),
  item: yup.string().required('Item is required.'),
  weight: yup.string().required('Weight is required.'),
  flavour: yup.string().required('Flavour is required.'),
  location: yup.string().required('Delivery address details are required.'),
  name: yup.string().required('Full Name is required.'),
  mobile: yup.string().matches(/^[6-9]\d{9}$/, 'Enter a valid 10-digit mobile number.').required('Mobile number is required.'),
});

const PreOrder: React.FC = () => {
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [totalPrice, setTotalPrice] = useState(0);

  // Payment modal state
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [transactionId, setTransactionId] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 2);
  const minDateString = minDate.toISOString().split('T')[0];

  useEffect(() => {
    const config = pricingConfig[formData.item];
    const flavourExtra = (config.flavours as Record<string, number>)[formData.flavour] || 0;
    const multiplier = weightMultipliers[formData.weight] || 1;
    setTotalPrice(Math.round((config.base + flavourExtra) * multiplier));
  }, [formData.item, formData.flavour, formData.weight]);

  // Step 1: validate form → open payment modal
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await preOrderSchema.validate(formData, { abortEarly: false });
      setFormErrors({});
      setShowPaymentModal(true);
    } catch (err: any) {
      if (err instanceof yup.ValidationError) {
        const errors: Record<string, string> = {};
        err.inner.forEach(error => {
          if (error.path) errors[error.path] = error.message;
        });
        setFormErrors(errors);
      }
    }
  };

  // Step 2: save to Firebase after customer enters transaction ID
  const handleConfirmPayment = async () => {
    if (!transactionId.trim()) {
      alert('Please enter your Transaction ID / UTR number.');
      return;
    }

    setIsSaving(true);
    try {
      await addDoc(collection(db, 'preorders'), {
        // Order details
        item: formData.item,
        weight: formData.weight,
        flavour: formData.flavour,
        customMessage: formData.customMessage || '',
        deliveryDate: formData.date,

        // Location
        deliveryAddress: formData.location,
        coordinates: formData.coordinates
          ? { lat: formData.coordinates.lat, lng: formData.coordinates.lng }
          : null,

        // Customer
        customerName: formData.name,
        customerPhone: formData.mobile,

        // Pricing
        basePrice: pricingConfig[formData.item].base,
        flavourExtra: (pricingConfig[formData.item].flavours as Record<string, number>)[formData.flavour] || 0,
        weightMultiplier: weightMultipliers[formData.weight],
        totalPrice,

        // Payment
        paymentMethod: 'UPI',
        transactionId: transactionId.trim(),
        paymentStatus: 'paid',

        // Meta
        status: 'pending',
        createdAt: serverTimestamp(),
      });

      setIsSuccess(true);
      setShowPaymentModal(false);
      setTransactionId('');
      setFormData(EMPTY_FORM);
      setTimeout(() => setIsSuccess(false), 5000);
    } catch (error: any) {
      console.error("Error saving pre-order:", error);
      alert(`Failed to place order.\n\nError: ${error?.message || error?.code}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <div className="flex flex-col gap-4 mb-8">
        <h1 className="text-3xl font-bold text-zinc-900">Premium Pre-Order</h1>
        <p className="text-zinc-500">Customized treats, baked with love for your special moments.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <form onSubmit={handleSubmit} noValidate className="lg:col-span-2 space-y-6">

          {/* Section 1 — Customize */}
          <div className="bg-white p-6 rounded-3xl shadow-sm space-y-6 border border-zinc-100">
            <h2 className="text-xl font-bold text-zinc-900 flex items-center gap-2">
              <Package className="w-5 h-5 text-orange-500" /> 1. Customize Your Order
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-zinc-700">Delivery Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <input 
                    type="date" min={minDateString} required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full bg-zinc-50 border border-zinc-100 rounded-xl py-3 pl-10 pr-4 text-sm focus:ring-2 focus:ring-orange-500/20 outline-none transition-all"
                  />
                </div>
                {formErrors.date && <p className="text-red-500 text-xs mt-1 pl-1">{formErrors.date}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-zinc-700">Select Item</label>
                <select 
                  value={formData.item}
                  onChange={(e) => {
                    const newItem = e.target.value as ItemType;
                    setFormData({ ...formData, item: newItem, flavour: itemFlavours[newItem][0] });
                  }}
                  className="w-full bg-zinc-50 border border-zinc-100 rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-orange-500/20 outline-none appearance-none"
                >
                  <option value="Cake">Cake (Base ₹450)</option>
                  <option value="Cookie">Cookie (Base ₹180)</option>
                  <option value="Brownie">Brownie (Base ₹220)</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-zinc-700">Weight / Quantity</label>
                <select 
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                  className="w-full bg-zinc-50 border border-zinc-100 rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-orange-500/20 outline-none"
                >
                  <option value="500g">500g (1x)</option>
                  <option value="1kg">1kg (1.8x)</option>
                  <option value="1.5kg">1.5kg (2.6x)</option>
                  <option value="2kg">2kg (3.4x)</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-zinc-700">Select Flavour</label>
                <div className="relative">
                  <Droplets className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <select 
                    value={formData.flavour}
                    onChange={(e) => setFormData({ ...formData, flavour: e.target.value })}
                    className="w-full bg-zinc-50 border border-zinc-100 rounded-xl py-3 pl-10 pr-4 text-sm focus:ring-2 focus:ring-orange-500/20 outline-none appearance-none"
                  >
                    {itemFlavours[formData.item].map((f: string) => {
                      const extra = (pricingConfig[formData.item].flavours as Record<string, number>)[f] || 0;
                      return <option key={f} value={f}>{f} {extra > 0 ? `(+₹${extra})` : ''}</option>;
                    })}
                  </select>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-zinc-700">Custom Message on Treat</label>
              <textarea 
                placeholder="E.g. Happy 25th Anniversary Mom & Dad!"
                value={formData.customMessage}
                onChange={(e) => setFormData({ ...formData, customMessage: e.target.value })}
                className="w-full bg-zinc-50 border border-zinc-100 rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-orange-500/20 outline-none min-h-[100px] transition-all resize-none"
              />
            </div>
          </div>

          {/* Section 2 — Location */}
          <div className="bg-white p-6 rounded-3xl shadow-sm space-y-6 border border-zinc-100">
            <h2 className="text-xl font-bold text-zinc-900 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-orange-500" /> 2. Delivery Location
            </h2>
            <div className="space-y-4">
              {/* <div className="h-[300px] w-full rounded-2xl overflow-hidden border border-zinc-100 z-0">
                <MapContainer center={[13.0827, 80.2707]} zoom={13} style={{ height: '100%', width: '100%' }}>
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />
                  <LocationMarker 
                    position={formData.coordinates} 
                    setPosition={(pos) => setFormData({ ...formData, coordinates: pos })} 
                  />
                </MapContainer>
              </div> */}
              {/* {formData.coordinates && (
                <p className="text-xs text-green-600 font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Location pinned: {formData.coordinates.lat.toFixed(5)}, {formData.coordinates.lng.toFixed(5)}
                </p>
              )} */}
              {/* <p className="text-xs text-zinc-400 italic font-medium">Click on the map to pin your exact delivery location.</p> */}
              <div className="relative">
                <MapPin className="absolute left-3 top-3 w-4 h-4 text-zinc-400" />
                <textarea 
                  required
                  placeholder="Additional address details (House No, Building, Landmark)"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full bg-zinc-50 border border-zinc-100 rounded-xl py-3 pl-10 pr-4 text-sm focus:ring-2 focus:ring-orange-500/20 outline-none min-h-[80px] transition-all resize-none"
                />
              </div>
              {formErrors.location && <p className="text-red-500 text-xs mt-1 pl-1">{formErrors.location}</p>}
            </div>
          </div>

          {/* Section 3 — Contact */}
          <div className="bg-white p-6 rounded-3xl shadow-sm space-y-6 border border-zinc-100">
            <h2 className="text-xl font-bold text-zinc-900 flex items-center gap-2">
              <User className="w-5 h-5 text-orange-500" /> 3. Contact Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-zinc-700">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <input 
                    type="text" required placeholder="Your Name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-zinc-50 border border-zinc-100 rounded-xl py-3 pl-10 pr-4 text-sm focus:ring-2 focus:ring-orange-500/20 outline-none transition-all"
                  />
                </div>
                {formErrors.name && <p className="text-red-500 text-xs mt-1 pl-1">{formErrors.name}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-zinc-700">Mobile Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <input 
                    type="tel" required placeholder="Your Number"
                    value={formData.mobile}
                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                    className="w-full bg-zinc-50 border border-zinc-100 rounded-xl py-3 pl-10 pr-4 text-sm focus:ring-2 focus:ring-orange-500/20 outline-none transition-all"
                  />
                </div>
                {formErrors.mobile && <p className="text-red-500 text-xs mt-1 pl-1">{formErrors.mobile}</p>}
              </div>
            </div>
          </div>
        </form>

        {/* Order Summary Sidebar */}
        <div className="space-y-6">
          <div className="sticky top-24 space-y-6">
            <div className="bg-zinc-900 rounded-3xl p-8 text-white shadow-xl shadow-zinc-200">
              <h3 className="text-xl font-bold mb-6">Order Summary</h3>
              <div className="space-y-4 mb-8">
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-400">{formData.item} Base</span>
                  <span>₹{pricingConfig[formData.item].base}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-400">{formData.flavour} Flavour</span>
                  <span>+₹{(pricingConfig[formData.item].flavours as Record<string, number>)[formData.flavour] || 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-400">Weight Multiplier</span>
                  <span>{weightMultipliers[formData.weight]}x</span>
                </div>
                {formData.date && (
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-400">Delivery Date</span>
                    <span>{new Date(formData.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  </div>
                )}
                <div className="pt-4 border-t border-zinc-800 flex justify-between items-center">
                  <span className="font-bold">Total Price</span>
                  <span className="text-2xl font-black text-orange-500">₹{totalPrice}</span>
                </div>
              </div>
              
              <button 
                onClick={handleSubmit}
                className="w-full bg-orange-500 text-white py-4 rounded-2xl font-bold hover:bg-orange-600 transition-all active:scale-95 disabled:opacity-50"
              >
                Place Pre-Order Now
              </button>
            </div>

            {/* Success toast */}
            <AnimatePresence>
              {isSuccess && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="bg-green-500 text-white p-6 rounded-3xl flex items-center gap-4 shadow-lg shadow-green-200"
                >
                  <CheckCircle2 className="w-10 h-10 shrink-0" />
                  <div>
                    <h4 className="font-bold">Pre-Order Placed!</h4>
                    <p className="text-xs opacity-90">Our chef will call you shortly for confirmation.</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* ── Payment Modal ── */}
      <AnimatePresence>
        {showPaymentModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => !isSaving && setShowPaymentModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-[2.5rem] p-8 shadow-2xl overflow-y-auto max-h-[90vh]"
            >
              {!isSaving && (
                <button onClick={() => setShowPaymentModal(false)} className="absolute top-6 right-6 p-2 rounded-full hover:bg-zinc-100 transition-colors">
                  <X className="w-5 h-5 text-zinc-400" />
                </button>
              )}

              <div className="text-center">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4 text-orange-500">
                  <CreditCard className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-bold text-zinc-900 mb-1 font-outfit">Complete Payment</h2>
                <p className="text-zinc-500 text-sm mb-6">
                  Scan & pay <span className="font-black text-orange-500">₹{totalPrice}</span> to confirm your pre-order.
                </p>

                {/* Order recap */}
                <div className="bg-zinc-50 rounded-2xl p-4 border border-zinc-100 text-left mb-6 space-y-1">
                  <p className="text-xs font-black text-zinc-400 uppercase tracking-widest mb-2">Order Summary</p>
                  <div className="flex justify-between text-sm"><span className="text-zinc-500">{formData.item} · {formData.flavour}</span><span className="font-bold">₹{pricingConfig[formData.item].base}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-zinc-500">Weight</span><span className="font-bold">{formData.weight}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-zinc-500">Delivery</span><span className="font-bold">{formData.date ? new Date(formData.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '—'}</span></div>
                  <div className="flex justify-between text-sm pt-2 border-t border-zinc-200"><span className="font-bold">Total</span><span className="font-black text-orange-500">₹{totalPrice}</span></div>
                </div>

                {/* QR Code */}
                <div className="bg-zinc-50 p-5 rounded-3xl mb-4 border border-zinc-100 inline-block">
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=tummyfills@upi%26pn=TummyFills%26am=${totalPrice}%26tn=PreOrder`}
                    alt="Payment QR Code"
                    className="w-44 h-44 rounded-xl mix-blend-multiply"
                  />
                </div>

                {/* UPI ID */}
                <div className="bg-orange-50 p-4 rounded-2xl border border-orange-100 mb-2">
                  <p className="text-xs font-bold text-orange-400 uppercase tracking-wider mb-1">UPI ID</p>
                  <p className="font-bold text-orange-600 select-all">tummyfills@upi</p>
                </div>
                <p className="text-[10px] text-zinc-400 uppercase font-black tracking-widest mb-6">Scan to Pay ₹{totalPrice}</p>

                {/* Transaction ID input */}
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
                    Enter the UTR / reference number shown in your UPI app after payment.
                  </p>
                </div>

                <button
                  onClick={handleConfirmPayment}
                  disabled={isSaving || !transactionId.trim()}
                  className="w-full bg-zinc-900 text-white py-4 rounded-2xl font-bold hover:bg-zinc-800 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:scale-100"
                >
                  {isSaving ? (
                    <><Loader2 className="w-5 h-5 animate-spin" /> Placing Pre-Order...</>
                  ) : (
                    <><CheckCircle2 className="w-5 h-5" /> I've Paid — Confirm Pre-Order</>
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

export default PreOrder;