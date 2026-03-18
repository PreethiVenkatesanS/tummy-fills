import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, 
  Trash2, 
  Edit, 
  ShoppingBag, 
  Save, 
  X,
  Loader2,
  Package,
  IndianRupee,
  FileText,
  MapPin,
  ImagePlus,
  CheckCircle2,
  CreditCard,
  Hash,
  Calendar
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '../lib/firebase';
import { 
  collection, 
  addDoc, 
  deleteDoc, 
  doc, 
  updateDoc, 
  onSnapshot, 
  query, 
  orderBy 
} from 'firebase/firestore';

interface Item {
  id: string;
  name: string;
  price: number;
  description: string;
  category: string;
  image: string;
}

interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  items: any[];
  totalPrice: number;
  status: string;
  createdAt: any;
  paymentMethod?: string;
  transactionId?: string;
}

const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&q=80&w=800';

const Admin: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'orders' | 'preorders' | 'items'>('orders');
  const [items, setItems] = useState<Item[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [preOrders, setPreOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [imagePreview, setImagePreview] = useState<string>(DEFAULT_IMAGE);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    category: 'sandwich',
    image: DEFAULT_IMAGE
  });

  useEffect(() => {
    const unsubItems = onSnapshot(query(collection(db, "items"), orderBy("name")), (snapshot) => {
      const itemsList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Item));
      setItems(itemsList);
    });

    const unsubOrders = onSnapshot(query(collection(db, "orders"), orderBy("createdAt", "desc")), (snapshot) => {
      const ordersList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
      setOrders(ordersList);
    });

    const unsubPreOrders = onSnapshot(query(collection(db, "preorders"), orderBy("createdAt", "desc")), (snapshot) => {
      const preOrdersList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPreOrders(preOrdersList);
    });

    return () => {
      unsubItems();
      unsubOrders();
      unsubPreOrders();
    };
  }, []);

  // ── ADDED: Mark as completed handler ────────────────────────────────────
  const handleMarkCompleted = async (docId: string, collectionName: string = "orders") => {
    setUpdatingOrderId(docId);
    try {
      await updateDoc(doc(db, collectionName, docId), { status: "completed" });
    } catch (error: any) {
      console.error("Error updating order:", error);
      alert(`Failed to update order: ${error?.message || error?.code}`);
    } finally {
      setUpdatingOrderId(null);
    }
  };

  // Convert uploaded file to base64
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file.');
      return;
    }

    if (file.size > 500 * 1024) {
      alert('Image must be smaller than 500KB. Please compress your image and try again.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setImagePreview(base64);
      setFormData(prev => ({ ...prev, image: base64 }));
    };
    reader.readAsDataURL(file);
  };

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const itemData = {
        ...formData,
        price: Number(formData.price)
      };

      if (editingItem) {
        await updateDoc(doc(db, "items", editingItem.id), itemData);
      } else {
        await addDoc(collection(db, "items"), itemData);
      }

      setIsModalOpen(false);
      setEditingItem(null);
      resetForm();
    } catch (error: any) {
      console.error("Error saving item:", error);
      alert(`Failed to save item.\n\nError: ${error?.message || error?.code || JSON.stringify(error)}`);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      price: '',
      description: '',
      category: 'sandwich',
      image: DEFAULT_IMAGE
    });
    setImagePreview(DEFAULT_IMAGE);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDeleteItem = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      try {
        await deleteDoc(doc(db, "items", id));
      } catch (error) {
        console.error("Error deleting item:", error);
      }
    }
  };

  const openEditModal = (item: Item) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      price: item.price.toString(),
      description: item.description,
      category: item.category,
      image: item.image
    });
    setImagePreview(item.image);
    setIsModalOpen(true);
  };

  const openAddModal = () => {
    setEditingItem(null);
    resetForm();
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-zinc-50/50 p-4 lg:p-8">
      {/* Admin Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-zinc-900 font-outfit">Kitchen <span className="text-orange-500">Dashboard</span></h1>
          <p className="text-zinc-500 text-sm">Manage your orders and menu items in real-time.</p>
        </div>
        
        <div className="flex gap-2 bg-white p-1 rounded-2xl border border-zinc-100 shadow-sm overflow-x-auto">
          <button 
            onClick={() => setActiveTab('orders')}
            className={`px-4 lg:px-6 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'orders' ? 'bg-orange-500 text-white shadow-lg shadow-orange-200' : 'text-zinc-500 hover:bg-zinc-50'}`}
          >
            Orders ({orders.length})
          </button>
          <button 
            onClick={() => setActiveTab('preorders')}
            className={`px-4 lg:px-6 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'preorders' ? 'bg-orange-500 text-white shadow-lg shadow-orange-200' : 'text-zinc-500 hover:bg-zinc-50'}`}
          >
            Pre-Orders ({preOrders.length})
          </button>
          <button 
            onClick={() => setActiveTab('items')}
            className={`px-4 lg:px-6 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'items' ? 'bg-orange-500 text-white shadow-lg shadow-orange-200' : 'text-zinc-500 hover:bg-zinc-50'}`}
          >
            Menu Items ({items.length})
          </button>
        </div>
      </div>

      {activeTab === 'orders' ? (
        <div className="grid grid-cols-1 gap-6">
          {orders.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-zinc-100 italic text-zinc-400">
              No orders yet.
            </div>
          ) : (
            orders.map((order) => (
              <motion.div 
                key={order.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-[2rem] p-6 lg:p-8 border border-zinc-100 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col lg:flex-row justify-between gap-6">
                  <div className="space-y-4 flex-1">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center text-orange-600">
                        <ShoppingBag className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-zinc-900">{order.customerName}</h3>
                        <p className="text-zinc-500 text-xs">{order.customerPhone}</p>
                      </div>
                      <span className="ml-auto lg:ml-4 px-3 py-1 bg-green-100 text-green-700 rounded-full text-[10px] font-black uppercase tracking-wider">
                        {order.status || 'New'}
                      </span>
                    </div>
                    
                    <div className="pl-12 space-y-2">
                      <p className="text-sm text-zinc-600 flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-zinc-400 mt-0.5 shrink-0" />
                        {order.customerAddress}
                      </p>
                    </div>

                    <div className="pl-12">
                      <div className="bg-zinc-50 rounded-2xl p-4 border border-zinc-100">
                        <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-3">Order Items</p>
                        <div className="space-y-2">
                          {order.items?.map((item, idx) => (
                            <div key={idx} className="flex justify-between text-sm">
                              <span className="text-zinc-700 font-medium">{item.name} <span className="text-zinc-400">x{item.quantity}</span></span>
                              <span className="font-bold text-zinc-900">₹{item.price * item.quantity}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* ── ADDED: Payment Details ── */}
                    <div className="pl-12">
                      <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100">
                        <p className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-3">Payment Details</p>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm">
                            <CreditCard className="w-4 h-4 text-blue-400 shrink-0" />
                            <span className="text-zinc-500 font-medium">Method:</span>
                            <span className="font-bold text-zinc-800 capitalize">{order.paymentMethod || '—'}</span>
                          </div>
                          <div className="flex items-start gap-2 text-sm">
                            <Hash className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                            <span className="text-zinc-500 font-medium">Transaction ID:</span>
                            <span className="font-mono font-bold text-zinc-800 break-all">{order.transactionId || '—'}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="lg:w-48 flex flex-col justify-between items-end border-t lg:border-t-0 lg:border-l border-zinc-100 pt-6 lg:pt-0 lg:pl-6">
                    <div className="text-right">
                      <p className="text-xs text-zinc-400 uppercase font-black mb-1">Total Amount</p>
                      <p className="text-2xl font-black text-orange-500">₹{order.totalPrice}</p>
                    </div>

                    {/* ── CHANGED: Button now works + shows completed state ── */}
                    {(order.status || '').toLowerCase() === 'completed' ? (
                      <div className="w-full mt-4 py-3 bg-green-50 text-green-600 rounded-xl text-sm font-bold flex items-center justify-center gap-2 border border-green-200">
                        <CheckCircle2 className="w-4 h-4" /> Completed
                      </div>
                    ) : (
                      <button
                        onClick={() => handleMarkCompleted(order.id)}
                        disabled={updatingOrderId === order.id}
                        className="w-full mt-4 py-3 bg-zinc-900 text-white rounded-xl text-sm font-bold hover:bg-zinc-800 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                      >
                        {updatingOrderId === order.id
                          ? <Loader2 className="w-4 h-4 animate-spin" />
                          : <><CheckCircle2 className="w-4 h-4" /> Mark as Completed</>
                        }
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      ) : activeTab === 'preorders' ? (
        <div className="grid grid-cols-1 gap-6">
          {preOrders.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-zinc-100 italic text-zinc-400">
              No pre-orders yet.
            </div>
          ) : (
            preOrders.map((order) => (
              <motion.div 
                key={order.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-[2rem] p-6 lg:p-8 border border-zinc-100 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col lg:flex-row justify-between gap-6">
                  <div className="space-y-4 flex-1">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center text-orange-600">
                        <ShoppingBag className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-zinc-900">{order.customerName}</h3>
                        <p className="text-zinc-500 text-xs">{order.customerPhone}</p>
                      </div>
                      <span className="ml-auto lg:ml-4 px-3 py-1 bg-green-100 text-green-700 rounded-full text-[10px] font-black uppercase tracking-wider">
                        {order.status || 'New'}
                      </span>
                    </div>
                    
                    <div className="pl-12 space-y-2">
                      <p className="text-sm text-zinc-600 flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-zinc-400 mt-0.5 shrink-0" />
                        {order.deliveryAddress}
                      </p>
                    </div>

                    <div className="pl-12">
                      <div className="bg-zinc-50 rounded-2xl p-4 border border-zinc-100 mb-4">
                        <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-3">Order Items</p>
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-zinc-700 font-medium">{order.item} <span className="text-zinc-500">({order.flavour})</span></span>
                              <span className="text-zinc-400 font-bold">{order.weight}</span>
                            </div>
                        </div>
                      </div>
                      
                      {order.customMessage && (
                        <div className="bg-orange-50 rounded-2xl p-4 border border-orange-100 mb-4">
                          <p className="text-xs font-bold text-orange-400 uppercase tracking-widest mb-1">Custom Message</p>
                          <p className="text-sm text-orange-900 font-medium italic">"{order.customMessage}"</p>
                        </div>
                      )}
                    </div>

                    <div className="pl-12">
                      <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100">
                        <p className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-3">Payment & Delivery</p>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="w-4 h-4 text-blue-400 shrink-0" />
                            <span className="text-zinc-500 font-medium">Delivery:</span>
                            <span className="font-bold text-zinc-800">{new Date(order.deliveryDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <CreditCard className="w-4 h-4 text-blue-400 shrink-0" />
                            <span className="text-zinc-500 font-medium">Method:</span>
                            <span className="font-bold text-zinc-800 capitalize">{order.paymentMethod || '—'}</span>
                          </div>
                          <div className="flex items-start gap-2 text-sm break-all">
                            <Hash className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                            <span className="text-zinc-500 font-medium">Txn ID:</span>
                            <span className="font-mono font-bold text-zinc-800">{order.transactionId || '—'}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="lg:w-48 flex flex-col justify-between items-end border-t lg:border-t-0 lg:border-l border-zinc-100 pt-6 lg:pt-0 lg:pl-6">
                    <div className="text-right">
                       <p className="text-xs text-zinc-400 uppercase font-black mb-1">Total Amount</p>
                       <p className="text-2xl font-black text-orange-500">₹{order.totalPrice}</p>
                    </div>

                    {(order.status || '').toLowerCase() === 'completed' ? (
                      <div className="w-full mt-4 py-3 bg-green-50 text-green-600 rounded-xl text-sm font-bold flex items-center justify-center gap-2 border border-green-200">
                        <CheckCircle2 className="w-4 h-4" /> Completed
                      </div>
                    ) : (
                      <button
                        onClick={() => handleMarkCompleted(order.id, 'preorders')}
                        disabled={updatingOrderId === order.id}
                        className="w-full mt-4 py-3 bg-zinc-900 text-white rounded-xl text-sm font-bold hover:bg-zinc-800 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                      >
                        {updatingOrderId === order.id
                          ? <Loader2 className="w-4 h-4 animate-spin" />
                          : <><CheckCircle2 className="w-4 h-4" /> Mark as Completed</>
                        }
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex justify-end">
            <button 
              onClick={openAddModal}
              className="flex items-center gap-2 bg-zinc-900 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-zinc-200 hover:scale-105 transition-all"
            >
              <Plus className="w-5 h-5" />
              Add New Item
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => (
              <motion.div 
                key={item.id}
                layout
                className="bg-white rounded-[2rem] p-6 border border-zinc-100 shadow-sm hover:shadow-md transition-shadow group"
              >
                <div className="relative aspect-[4/3] rounded-2xl overflow-hidden mb-4 bg-zinc-100">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  <div className="absolute top-2 right-2 flex gap-2">
                    <button 
                      onClick={() => openEditModal(item)}
                      className="p-2 bg-white/90 backdrop-blur-sm rounded-lg text-zinc-600 hover:text-orange-500 shadow-sm transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDeleteItem(item.id)}
                      className="p-2 bg-white/90 backdrop-blur-sm rounded-lg text-red-500 hover:bg-red-50 shadow-sm transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <h3 className="font-bold text-zinc-900 mb-1">{item.name}</h3>
                <p className="text-zinc-500 text-xs mb-3 line-clamp-2">{item.description}</p>
                <div className="flex justify-between items-center">
                  <span className="text-lg font-black text-orange-500">₹{item.price}</span>
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 bg-zinc-50 px-2 py-1 rounded-md">{item.category}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Add/Edit Modal — unchanged */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-xl bg-white rounded-[2.5rem] p-8 lg:p-10 shadow-2xl overflow-y-auto max-h-[90vh]"
            >
              <button 
                onClick={() => setIsModalOpen(false)}
                className="absolute top-6 right-6 p-2 rounded-full hover:bg-zinc-100 transition-colors"
              >
                <X className="w-5 h-5 text-zinc-400" />
              </button>

              <h2 className="text-2xl font-black text-zinc-900 mb-8 font-outfit">
                {editingItem ? 'Edit Menu Item' : 'Add New Item'}
              </h2>

              <form onSubmit={handleSaveItem} className="space-y-6">

                {/* Image Upload */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest pl-1">Item Photo</label>
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="relative w-full aspect-[16/9] rounded-2xl overflow-hidden bg-zinc-100 border-2 border-dashed border-zinc-200 cursor-pointer hover:border-orange-400 transition-colors group"
                  >
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <ImagePlus className="w-8 h-8 text-white mb-2" />
                      <p className="text-white text-sm font-bold">Click to change photo</p>
                    </div>
                    {formData.image !== DEFAULT_IMAGE && (
                      <div className="absolute bottom-2 right-2 flex items-center gap-1 bg-green-500 text-white text-[10px] font-black px-2 py-1 rounded-full">
                        <CheckCircle2 className="w-3 h-3" />
                        Custom photo
                      </div>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <p className="text-[11px] text-zinc-400 pl-1">
                    JPG, PNG, WebP · Max 500KB · Click the image above to upload
                  </p>
                </div>

                {/* Item Name */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest pl-1">Item Name</label>
                  <div className="relative">
                    <Package className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                    <input 
                      required
                      type="text"
                      placeholder="e.g. Masala Sandwich"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full bg-zinc-50 border border-zinc-100 rounded-xl py-3 pl-10 pr-4 text-sm focus:ring-2 focus:ring-orange-500/20 outline-none"
                    />
                  </div>
                </div>

                {/* Price & Category */}
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest pl-1">Price (₹)</label>
                    <div className="relative">
                      <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                      <input 
                        required
                        type="number"
                        placeholder="99"
                        value={formData.price}
                        onChange={(e) => setFormData({...formData, price: e.target.value})}
                        className="w-full bg-zinc-50 border border-zinc-100 rounded-xl py-3 pl-10 pr-4 text-sm focus:ring-2 focus:ring-orange-500/20 outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest pl-1">Category</label>
                    <select 
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      className="w-full bg-zinc-50 border border-zinc-100 rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-orange-500/20 outline-none appearance-none"
                    >
                      <option value="sandwich">Sandwich</option>
                      <option value="fries">Fries</option>
                      <option value="brownie">Brownie</option>
                      <option value="rolls">Rolls</option>
                    </select>
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest pl-1">Description</label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-3 w-4 h-4 text-zinc-400" />
                    <textarea 
                      required
                      placeholder="Describe this delicious treat..."
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      className="w-full bg-zinc-50 border border-zinc-100 rounded-xl py-3 pl-10 pr-4 text-sm focus:ring-2 focus:ring-orange-500/20 outline-none min-h-[100px] resize-none"
                    />
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-orange-500 text-white py-4 rounded-2xl font-bold hover:bg-orange-600 transition-all shadow-lg shadow-orange-100 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      {editingItem ? 'Update Item' : 'Save Item'}
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Admin;