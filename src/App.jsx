import React, { useState, useEffect, useMemo, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import Auth from './pages/Auth';
import AdminPanel from './pages/AdminPanel';
import Dashboard from './pages/Dashboard';
import Checkout from './pages/Checkout';
import {
  ShoppingBag, Search, Menu, X, Star, ShieldCheck, Truck, Clock, Filter,
  ShoppingCart, Plus, Minus, Trash2, ArrowRight, User, Mail, Smartphone,
  MapPin, Car, CreditCard, ChevronLeft, Info, Award, Zap, Sparkles, Send,
  Loader2, Wrench, Package, LogOut, ChevronRight, Globe, Shield
} from 'lucide-react';
import { fadeInUp, fadeInLeft, fadeInRight, staggerContainer, scaleUp } from './components/AnimationSuite';

const API = ''; // Use proxy for all environments

// ─── Background ───────────────────────────────────────────────────────────────
const BackgroundAnimation = () => (
  <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-[#050505]">
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(225,29,72,0.05)_0%,transparent_70%)] z-10" />
    <div className="absolute top-0 w-full h-full opacity-[0.03] bg-[linear-gradient(to_right,#888_1px,transparent_1px),linear-gradient(to_bottom,#888_1px,transparent_1px)] bg-[size:60px_60px] z-0" />
    
    <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-rose-600/10 blur-[120px] rounded-full animate-pulse" />
    <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-rose-600/5 blur-[120px] rounded-full animate-pulse delay-700" />
    
    <div className="absolute inset-0 z-0 overflow-hidden">
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: Math.random() * 1000 }}
          animate={{ opacity: [0, 0.2, 0], y: -100 }}
          transition={{ duration: 5 + Math.random() * 5, repeat: Infinity, delay: Math.random() * 5 }}
          className="absolute w-[1px] h-[100px] bg-gradient-to-t from-transparent via-rose-500/20 to-transparent"
          style={{ left: `${Math.random() * 100}%` }}
        />
      ))}
    </div>
  </div>
);

// ─── Logo ─────────────────────────────────────────────────────────────────────
const PremiumLogo = ({ settings }) => (
  <div className="flex items-center space-x-4 group cursor-pointer">
    <div className="relative">
      <div className="w-14 h-14 bg-gradient-to-br from-rose-600 to-rose-700 rounded-2xl flex items-center justify-center transform group-hover:rotate-[10deg] transition-all duration-700 shadow-[0_15px_35px_rgba(225,29,72,0.3)] border border-white/10">
        <Car className="text-white w-8 h-8" />
      </div>
      <motion.div 
        animate={{ scale: [1, 1.2, 1] }} 
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute -bottom-1 -right-1 w-5 h-5 bg-white rounded-full border-2 border-[#050505] flex items-center justify-center shadow-lg"
      >
        <Zap className="w-3 h-3 text-rose-600" />
      </motion.div>
    </div>
    <div className="flex flex-col leading-tight">
      <span className="text-3xl font-black italic tracking-tighter text-white uppercase group-hover:tracking-normal transition-all duration-700">
        {settings?.storeName?.replace('Tyres', '') || 'Zain'}
        <span className="text-rose-600">Tyres</span>
      </span>
      <div className="flex items-center space-x-2">
        <div className="h-[1px] w-4 bg-rose-500/50" />
        <span className="text-[10px] font-black text-rose-500 tracking-[0.4em] uppercase">Performance Studio</span>
      </div>
    </div>
  </div>
);


// ─── Navbar ───────────────────────────────────────────────────────────────────
const Navbar = ({ cartCount, onOpenCart, onNavigate, currentView, settings }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 w-full z-[100] transition-all duration-700 ${
      scrolled ? 'py-4' : 'py-8'
    }`}>
      <div className="max-w-7xl mx-auto px-6">
        <div className={`glass-panel rounded-[2.5rem] px-8 py-4 flex justify-between items-center transition-all duration-700 ${
          scrolled ? 'shadow-[0_20px_50px_rgba(0,0,0,0.5)] border-white/10' : 'bg-transparent border-transparent'
        }`}>
          <div onClick={() => onNavigate('home')} className="hover:scale-105 transition-transform"><PremiumLogo settings={settings} /></div>

          <div className="hidden lg:flex items-center space-x-12">
            {[
              { label: 'Studio', id: 'home' },
              { label: 'Inventory', id: 'tyres' },
              { label: 'Add-ons', id: 'accessories' },
              { label: 'The Hub', id: 'contactus' },
            ].map(item => {
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`group relative text-[11px] font-black uppercase tracking-[0.3em] transition-all ${
                    isActive ? 'text-rose-500' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {item.label}
                  <motion.div
                    className={`absolute -bottom-1 left-0 h-[2px] bg-rose-600`}
                    initial={false}
                    animate={{ width: isActive ? '100%' : '0%' }}
                    transition={{ duration: 0.5, ease: "circOut" }}
                  />
                </button>
              );
            })}
          </div>

          <div className="flex items-center space-x-6">
            <button
              onClick={onOpenCart}
              className="relative group p-2"
            >
              <div className="absolute inset-0 bg-rose-600 rounded-2xl blur-lg opacity-0 group-hover:opacity-40 transition-opacity" />
              <div className="relative flex items-center space-x-3 bg-white/5 hover:bg-white/10 px-5 py-3 rounded-2xl border border-white/10 transition-all">
                <ShoppingCart size={20} className="text-white group-hover:text-rose-500 transition-colors" />
                <span className="text-[10px] font-black text-white uppercase tracking-widest hidden sm:inline">Bag</span>
                {cartCount > 0 && (
                  <span className="bg-rose-600 text-white font-black text-[9px] w-5 h-5 rounded-lg flex items-center justify-center shadow-lg">
                    {cartCount}
                  </span>
                )}
              </div>
            </button>
            {user ? (
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => onNavigate('account')}
                  className={`flex items-center gap-3 bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2.5 rounded-2xl transition-all ${currentView === 'account' ? 'border-rose-500/50' : ''}`}
                >
                  {user.profileImage ? (
                    <img src={user.profileImage} className="w-6 h-6 rounded-lg object-cover" alt="" />
                  ) : (
                    <div className="w-6 h-6 bg-rose-600 rounded-lg flex items-center justify-center text-[10px] font-black">{user.name?.charAt(0) || user.email?.charAt(0)}</div>
                  )}
                  <span className="text-[10px] font-black text-white uppercase tracking-widest hidden sm:inline">{user.name?.split(' ')[0] || 'Profile'}</span>
                </button>
                <button onClick={logout} className="p-2.5 bg-rose-600/10 hover:bg-rose-600/20 text-rose-500 rounded-xl transition-all border border-rose-500/20" title="Logout">
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <button onClick={() => window.location.href = '/login'} className="p-3 bg-white/5 rounded-2xl text-zinc-400 hover:text-white border border-white/10">
                <User size={20} />
              </button>
            )}
            <button className="lg:hidden p-3 bg-white/5 rounded-2xl text-zinc-400" onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>
      
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="lg:hidden absolute top-24 left-6 right-6 glass-panel rounded-[2.5rem] p-8 overflow-hidden"
          >
            <div className="flex flex-col space-y-6">
              {['Home', 'Tyres', 'Accessories', 'Contact Us'].map(item => (
                <button 
                  key={item} 
                  onClick={() => { onNavigate(item.toLowerCase().replace(' ', '')); setMobileOpen(false); }}
                  className="text-left text-lg font-black uppercase tracking-[0.2em] text-zinc-400 hover:text-rose-500 border-b border-white/5 pb-4 last:border-0"
                >
                  {item}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};


// ─── AI Concierge ─────────────────────────────────────────────────────────────
const AIConsierge = ({ products }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Welcome to the ZainTyres Performance Studio. I am your ✨ AI Concierge. Tell me about your driving style or vehicle, and I'll recommend the perfect setup." }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const callGemini = async (userText) => {
    setIsLoading(true);
    setMessages(prev => [...prev, { role: 'user', content: userText }]);
    setQuery('');
    const systemPrompt = `You are the ZainTyres Performance Concierge. Expert in luxury automotive tyres and accessories. Our inventory: ${JSON.stringify(products.slice(0, 8))}. Be professional, concise, recommend specific products. Use premium tone with terms like tread depth, cornering stability, NVH levels.`;
    try {
      const res = await fetch(`${API}/api/ai/chat`, {
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userText, systemPrompt })
      });
      const data = await res.json();
      const text = data.text || "I'm recalibrating. Please try again.";
      setMessages(prev => [...prev, { role: 'assistant', content: text }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: "Connection failed. Please try again shortly." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-8 right-8 z-[100] flex flex-col items-end">
      {isOpen && (
        <div className="mb-4 w-[350px] sm:w-[400px] h-[500px] bg-zinc-900/95 backdrop-blur-2xl rounded-[2.5rem] border border-rose-500/30 flex flex-col overflow-hidden shadow-[0_0_50px_rgba(225,29,72,0.2)]">
          <div className="p-5 bg-rose-600 flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <Sparkles className="text-white" size={18} />
              <span className="text-white font-black italic uppercase tracking-tighter text-sm">AI Concierge</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white"><X size={18} /></button>
          </div>
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-4" style={{ scrollbarWidth: 'thin', scrollbarColor: '#333 transparent' }}>
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-4 rounded-2xl text-xs leading-relaxed font-medium ${m.role === 'user' ? 'bg-rose-600 text-white rounded-tr-none' : 'bg-zinc-800 text-zinc-300 rounded-tl-none'
                  }`}>{m.content}</div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-zinc-800 p-4 rounded-2xl flex items-center space-x-2">
                  <Loader2 size={14} className="animate-spin text-rose-500" />
                  <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Analyzing...</span>
                </div>
              </div>
            )}
          </div>
          <form onSubmit={e => { e.preventDefault(); if (query.trim()) callGemini(query); }} className="p-4 border-t border-white/5 flex gap-2">
            <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Ask for advice..."
              className="flex-1 bg-zinc-800 rounded-xl px-4 py-3 text-xs text-white placeholder:text-zinc-600 focus:ring-1 focus:ring-rose-500 outline-none border-none" />
            <button type="submit" className="w-10 h-10 bg-rose-600 rounded-xl flex items-center justify-center text-white">
              <Send size={15} />
            </button>
          </form>
        </div>
      )}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative w-16 h-16 bg-rose-600 rounded-full flex items-center justify-center text-white shadow-[0_0_40px_rgba(225,29,72,0.5)] hover:scale-110 transition-transform active:scale-95"
      >
        {isOpen ? <X size={26} /> : <Sparkles size={26} />}
        {!isOpen && <div className="absolute -top-1 -left-1 w-4 h-4 bg-white rounded-full border-2 border-rose-600 animate-bounce" />}
      </button>
    </div>
  );
};

// ─── Product Card ─────────────────────────────────────────────────────────────
const ProductCard = ({ product, onAddToCart }) => {
  const images = product.images && product.images.length > 0 ? product.images : [product.image || 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&q=80&w=400'];
  const [currentIdx, setCurrentIdx] = useState(0);

  return (
  <motion.div 
    variants={fadeInUp}
    className="group relative luxury-card rounded-[3rem] overflow-hidden"
  >
    <div className="relative h-80 overflow-hidden bg-zinc-900 group/image">
      <img
        src={images[currentIdx]}
        alt={product.name}
        onError={e => { e.target.src = 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&q=80&w=400'; }}
        className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-all duration-500"
      />
      
      {images.length > 1 && (
        <>
          <button onClick={e => { e.stopPropagation(); setCurrentIdx(i => (i === 0 ? images.length - 1 : i - 1)); }} className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white opacity-0 group-hover/image:opacity-100 hover:bg-rose-600 transition-all"><ChevronRight size={14} className="rotate-180" /></button>
          <button onClick={e => { e.stopPropagation(); setCurrentIdx(i => (i === images.length - 1 ? 0 : i + 1)); }} className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white opacity-0 group-hover/image:opacity-100 hover:bg-rose-600 transition-all"><ChevronRight size={14} /></button>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 opacity-0 group-hover/image:opacity-100 transition-opacity">
            {images.map((_, i) => <div key={i} className={`h-1 rounded-full transition-all ${i === currentIdx ? 'w-4 bg-rose-500' : 'w-1.5 bg-white/50'}`} />)}
          </div>
        </>
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-[#0D0D0F] via-transparent to-transparent opacity-60 pointer-events-none" />

      
      <div className="absolute top-6 left-6">
        <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] backdrop-blur-xl border border-white/10 ${
          product.subType === 'Used' ? 'bg-amber-500/80 text-black' : 'bg-rose-600/80 text-white'
        }`}>
          {product.condition || product.subType}
        </span>
      </div>

      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 bg-black/40 backdrop-blur-sm">
        <button 
          onClick={() => onAddToCart(product)}
          className="bg-white text-black px-8 py-4 rounded-2xl font-black italic tracking-tighter uppercase flex items-center gap-2 hover:bg-rose-600 hover:text-white transition-all transform translate-y-4 group-hover:translate-y-0"
        >
          <Plus size={18} /> Add to Bag
        </button>
      </div>
    </div>

    <div className="p-10">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center space-x-2 text-rose-500">
          <Star size={12} className="fill-current" />
          <span className="text-[10px] font-black uppercase tracking-widest">{product.rating || '4.9'}</span>
        </div>
        <span className="text-[11px] font-black text-zinc-600 uppercase tracking-widest">{product.brand}</span>
      </div>
      
      <h3 className="text-2xl font-black text-white italic tracking-tighter uppercase mb-4 group-hover:text-rose-500 transition-colors">
        {product.name}
      </h3>
      
      <div className="flex items-end justify-between border-t border-white/5 pt-6">
        <div>
          <p className="text-zinc-600 text-[9px] font-black uppercase tracking-[0.3em] mb-1">Acquisition Cost</p>
          <p className="text-3xl font-black italic tracking-tighter text-white">₹{(product.price || 0).toLocaleString()}</p>
        </div>
        <div className="bg-white/5 p-3 rounded-xl border border-white/5 text-zinc-500 text-[10px] font-black uppercase tracking-widest">
           {product.category}
        </div>
      </div>
    </div>
  </motion.div>
)};


// ─── Cart Sidebar ─────────────────────────────────────────────────────────────
const CartSidebar = ({ cart, setCart, onClose, settings, API, user }) => {
  const navigate = useNavigate();
  const total = cart.reduce((a, b) => a + b.price * b.quantity, 0);

  const updateCartItem = async (productId, quantity, isDelete) => {
    if (!user) {
      if (isDelete) setCart(p => p.filter(i => i.id !== productId));
      else setCart(p => p.map(i => i.id === productId ? { ...i, quantity } : i));
      return;
    }
    
    try {
      if (isDelete) {
        await fetch(`${API}/api/cart/${productId}`, { method: 'DELETE', credentials: 'include' });
        setCart(p => p.filter(i => (i.productId?._id || i.id) !== productId));
      } else {
        await fetch(`${API}/api/cart/${productId}`, { method: 'PUT', headers: {'Content-Type':'application/json'}, body: JSON.stringify({quantity}), credentials: 'include' });
        setCart(p => p.map(i => (i.productId?._id || i.id) === productId ? { ...i, quantity } : i));
      }
    } catch {}
  };
  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-[#0D0D0E] h-full shadow-[0_0_100px_rgba(0,0,0,1)] border-l border-white/5 flex flex-col">
        <div className="p-8 border-b border-white/5 flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-black italic tracking-tighter text-white uppercase">Your Bag</h2>
            <p className="text-[9px] font-black text-rose-500 uppercase tracking-widest mt-1">{cart.reduce((a, b) => a + b.quantity, 0)} Items</p>
          </div>
          <button onClick={onClose} className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center text-zinc-500 hover:text-white hover:bg-white/10 transition-all">
            <X size={22} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-8" style={{ scrollbarWidth: 'none' }}>
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-zinc-800">
              <ShoppingBag size={80} strokeWidth={1} className="mb-6 opacity-20" />
              <p className="font-black uppercase tracking-[0.2em]">Bag Is Empty</p>
            </div>
          ) : cart.map(item => (
            <div key={item.id} className="flex gap-6 group">
              <div className="w-24 h-24 shrink-0 overflow-hidden rounded-[1.5rem] bg-zinc-900 border border-white/5">
                <img src={item.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start mb-1">
                  <h4 className="font-black text-white uppercase italic tracking-tight text-sm">{item.name}</h4>
                  <button onClick={() => updateCartItem(item.id || item.productId?._id, undefined, true)} className="text-zinc-700 hover:text-rose-500 transition-colors ml-2">
                    <Trash2 size={15} />
                  </button>
                </div>
                <p className="text-rose-500 font-black text-xs mb-4">₹{item.price.toLocaleString()}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center bg-zinc-900 rounded-xl border border-white/5 p-1">
                    <button onClick={() => updateCartItem(item.id || item.productId?._id, Math.max(1, item.quantity - 1))} className="w-7 h-7 flex items-center justify-center text-white font-black text-sm">−</button>
                    <span className="w-8 text-center text-xs font-black text-white">{item.quantity}</span>
                    <button onClick={() => updateCartItem(item.id || item.productId?._id, item.quantity + 1)} className="w-7 h-7 flex items-center justify-center text-white font-black text-sm">+</button>
                  </div>
                  <p className="font-black text-white italic text-sm">₹{(item.price * item.quantity).toLocaleString()}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {cart.length > 0 && (
          <div className="p-8 bg-black/40 border-t border-white/5">
            <div className="flex justify-between items-end mb-6">
              <div>
                <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">Subtotal</p>
                <p className="text-4xl font-black italic tracking-tighter text-white">₹{total.toLocaleString()}</p>
              </div>
            </div>
            
            <button
              onClick={() => { onClose(); navigate('/checkout'); }}
              className="block w-full mb-3 bg-white hover:bg-zinc-200 text-black py-4 rounded-[2rem] font-black text-lg italic tracking-tighter shadow-2xl transition-all text-center"
            >
              PROCEED TO CHECKOUT
            </button>

            <a
              href={`https://wa.me/${settings?.whatsapp || '917006628255'}?text=${encodeURIComponent('Hi! I want to order:\n' + cart.map(i => `• ${i.name} x${i.quantity} = ₹${(i.price * i.quantity).toLocaleString()}`).join('\n') + `\nTotal: ₹${total.toLocaleString()}`)}`}
              target="_blank" rel="noreferrer"
              className="block w-full bg-rose-600/10 hover:bg-rose-600/20 text-rose-500 border border-rose-500/20 py-4 rounded-[2rem] font-black text-lg italic tracking-tighter transition-all text-center"
            >
              📱 OR ORDER VIA WHATSAPP
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Home View ────────────────────────────────────────────────────────────────
const HomeView = ({ settings, onNavigate }) => (
  <div className="pt-20">
    {/* Hero Section */}
    <motion.section 
      variants={staggerContainer}
      initial="initial"
      whileInView="whileInView"
      viewport={{ once: true }}
      className="min-h-[85vh] flex flex-col justify-center items-center text-center px-6 relative overflow-hidden"
    >
      <div className="max-w-6xl relative z-10">
        <motion.div variants={fadeInUp} className="inline-flex items-center space-x-4 bg-white/5 px-8 py-3 rounded-full border border-white/10 mb-12 backdrop-blur-md">
          <div className="w-2 h-2 bg-rose-600 rounded-full animate-ping" />
          <span className="text-[10px] font-black uppercase tracking-[0.5em] text-rose-500">
            {settings?.heroSubText || "Elite Performance Engineered"}
          </span>
        </motion.div>
        
        <motion.h1 variants={fadeInUp} className="text-8xl md:text-[11rem] font-black italic tracking-[calc(-0.05em)] uppercase leading-[0.8] mb-16 text-white text-glow-rose">
          {settings?.heroHeading || 'PRECISION'}
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-600 via-rose-500 to-rose-700">
            {settings?.heroHighlight || 'PERFORMANCE'}
          </span>
        </motion.h1>

        <motion.p variants={fadeInUp} className="max-w-2xl mx-auto text-zinc-400 font-medium text-lg md:text-xl mb-16 leading-relaxed">
          Unlock the true potential of your vehicle with our world-class inventory of high-performance tyres and bespoke automotive accessories.
        </motion.p>

        <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row items-center justify-center gap-8">
          <button onClick={() => onNavigate('tyres')}
            className="group relative px-16 py-6 bg-rose-600 hover:bg-rose-700 rounded-[2rem] overflow-hidden transition-all duration-500 shadow-[0_25px_60px_rgba(225,29,72,0.4)]">
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
            <span className="relative flex items-center gap-3 font-black text-2xl italic tracking-tighter text-white">
              EXPLORE UNITS <ArrowRight size={24} />
            </span>
          </button>
          <button onClick={() => onNavigate('contactus')}
            className="px-16 py-6 glass-panel hover:bg-white/10 rounded-[2rem] font-black text-2xl italic tracking-tighter text-white transition-all duration-500 border-white/10">
            LOCATE STUDIO
          </button>
        </motion.div>
      </div>

      {/* Hero Visual Elements */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full pointer-events-none overflow-hidden opacity-30">
        <svg viewBox="0 0 100 100" className="w-[150%] h-[150%] text-rose-600/10">
          <circle cx="50" cy="50" r="48" fill="none" stroke="currentColor" strokeWidth="0.1" strokeDasharray="1 2" />
          <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="0.1" />
          <circle cx="50" cy="50" r="30" fill="none" stroke="currentColor" strokeWidth="0.1" strokeDasharray="3 1" />
        </svg>
      </div>
    </motion.section>

    {/* Brand Marquee */}
    <section className="py-24 border-y border-white/5 bg-zinc-950/50 backdrop-blur-sm overflow-hidden">
      <div className="flex space-x-20 animate-marquee whitespace-nowrap">
        {['MICHELIN', 'PIRELLI', 'CONTINENTAL', 'BRIDGESTONE', 'GOODYEAR', 'DUNLOP', 'YOKOHAMA', 'HANKOOK'].map((brand, i) => (
          <span key={i} className="text-4xl md:text-6xl font-black italic tracking-tighter text-white/10 hover:text-rose-600/50 transition-colors cursor-default select-none">
            {brand}
          </span>
        ))}
        {/* Duplicate for seamless loop */}
        {['MICHELIN', 'PIRELLI', 'CONTINENTAL', 'BRIDGESTONE', 'GOODYEAR', 'DUNLOP', 'YOKOHAMA', 'HANKOOK'].map((brand, i) => (
          <span key={i+10} className="text-4xl md:text-6xl font-black italic tracking-tighter text-white/10 hover:text-rose-600/50 transition-colors cursor-default select-none">
            {brand}
          </span>
        ))}
      </div>
      <style>{`
        @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        .animate-marquee { animation: marquee 30s linear infinite; }
      `}</style>
    </section>

    {/* Features Grid */}
    <section className="py-32 max-w-7xl mx-auto px-6">
      <motion.div 
        variants={staggerContainer}
        initial="initial"
        whileInView="whileInView"
        viewport={{ once: true }}
        className="grid grid-cols-1 md:grid-cols-3 gap-10"
      >
        {[
          { icon: <ShieldCheck size={40} />, title: "Precision Grade", text: "Every unit undergoes a 40-point structural integrity verification before delivery." },
          { icon: <Zap size={40} />, title: "Instant Logistics", text: "Same-day deployment for all performance inventory within metropolitan sectors." },
          { icon: <Globe size={40} />, title: "Global Network", text: "Direct sourcing from manufacturing plants across Europe and Japan." },
        ].map((feat, i) => (
          <motion.div key={i} variants={fadeInUp} className="glass-panel rounded-[3rem] p-12 hover:border-rose-500/30 transition-all duration-700 group">
             <div className="text-rose-600 mb-8 group-hover:scale-110 transition-transform duration-500">{feat.icon}</div>
             <h3 className="text-3xl font-black italic tracking-tighter text-white uppercase mb-6">{feat.title}</h3>
             <p className="text-zinc-500 font-medium leading-relaxed">{feat.text}</p>
          </motion.div>
        ))}
      </motion.div>
    </section>
  </div>
);


// ─── Products Grid ────────────────────────────────────────────────────────────
const ProductsSection = ({ products, loading, error, activeFilter, setActiveFilter, onAddToCart, currentView, onNavigate }) => {
  const filtered = useMemo(() => {
    if (activeFilter === 'All') return products;
    return products.filter(p => p.category === activeFilter);
  }, [products, activeFilter]);

  return (
    <section className="max-w-screen-2xl mx-auto px-6 py-24">
      <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-10">
        <div>
          <h2 className="text-4xl md:text-6xl font-black italic tracking-tighter uppercase text-white mb-3">
            CURATED <span className="text-rose-600">UNITS</span>
          </h2>
          <p className="text-zinc-600 font-black text-[10px] uppercase tracking-[0.4em] italic">Currency: Indian Rupee (₹) • VAT Included</p>
        </div>
        <div className="flex bg-zinc-900/50 p-2 rounded-[2rem] border border-white/5 backdrop-blur-xl">
          {['All', 'Tyres', 'Accessories'].map(f => (
            <button key={f} onClick={() => { setActiveFilter(f); if (f !== 'All' && currentView === 'home') onNavigate(f.toLowerCase()); }}
              className={`px-8 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${activeFilter === f ? 'bg-rose-600 text-white shadow-xl' : 'text-zinc-500 hover:text-white'}`}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="mb-8 px-5 py-4 bg-yellow-500/10 border border-yellow-500/20 rounded-2xl text-yellow-400 text-sm font-bold">
          ⚠️ {error}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-10">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-zinc-900/40 rounded-[2.5rem] border border-white/5 overflow-hidden animate-pulse">
              <div className="h-64 bg-zinc-800" />
              <div className="p-8 space-y-3">
                <div className="h-3 bg-zinc-800 rounded w-1/3" />
                <div className="h-5 bg-zinc-800 rounded" />
                <div className="h-4 bg-zinc-800 rounded w-2/3" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-32 text-zinc-700">
          <Package size={60} className="mx-auto mb-4 opacity-30" />
          <p className="font-black uppercase tracking-widest">No products found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-10">
          {filtered.map(p => <ProductCard key={p.id} product={p} onAddToCart={onAddToCart} />)}
        </div>
      )}
    </section>
  );
};

// ─── Contact View ─────────────────────────────────────────────────────────────
const ContactView = ({ branches, loading, settings }) => (
  <div className="max-w-7xl mx-auto px-6 py-40 relative z-20">
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="text-center mb-32"
    >
      <div className="inline-flex items-center space-x-3 bg-rose-600/10 px-6 py-2 rounded-full border border-rose-500/20 mb-10">
        <Globe size={16} className="text-rose-600" />
        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-rose-500 text-glow-rose">Tactical Network</span>
      </div>
      <h2 className="text-6xl md:text-8xl font-black italic tracking-tight text-white uppercase leading-[0.9] mb-8">
        PREMIUM <span className="text-rose-600">LOCATIONS</span>
      </h2>
      <p className="text-zinc-500 font-medium max-w-2xl mx-auto text-lg leading-relaxed">
        Experience automotive excellence at our specialized studios where artisan craft meets aerospace technology.
      </p>
    </motion.div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-32">
       <div className="glass-panel rounded-[3.5rem] p-16 flex flex-col justify-center border-rose-600/20 shadow-[0_30px_60px_rgba(225,29,72,0.1)]">
          <h3 className="text-4xl font-black italic tracking-tighter text-white uppercase mb-8">Direct Access</h3>
          <div className="space-y-4 mb-12">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-rose-500 shadow-lg border border-white/5"><Smartphone size={20}/></div>
              <p className="text-xl font-black italic text-zinc-300 tracking-tight">{settings?.phone || '+91 98765 43210'}</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-rose-500 shadow-lg border border-white/5"><Mail size={20}/></div>
              <p className="text-xl font-black italic text-zinc-300 tracking-tight">{settings?.email || 'info@zaintyres.com'}</p>
            </div>
          </div>
          <a
            href={`https://wa.me/${settings?.whatsapp || '917006628255'}`}
            target="_blank" rel="noreferrer"
            className="group relative inline-flex items-center justify-center gap-4 bg-rose-600 hover:bg-rose-700 text-white px-10 py-6 rounded-3xl font-black italic uppercase text-lg transition-all shadow-[0_20px_50px_rgba(225,29,72,0.3)]"
          >
            <Sparkles size={24} /> CONNECT VIA WHATSAPP
          </a>
       </div>
       <div className="grid grid-cols-2 gap-6">
          <div className="glass-panel rounded-[3rem] p-10 flex flex-col items-center justify-center text-center opacity-50 hover:opacity-100 transition-opacity">
             <Shield size={32} className="text-rose-600 mb-6" />
             <p className="font-black italic uppercase tracking-tighter text-white text-sm">Certified Techs</p>
          </div>
          <div className="glass-panel rounded-[3rem] p-10 flex flex-col items-center justify-center text-center opacity-50 hover:opacity-100 transition-opacity">
             <Clock size={32} className="text-rose-600 mb-6" />
             <p className="font-black italic uppercase tracking-tighter text-white text-sm">24/7 Response</p>
          </div>
          <div className="glass-panel rounded-[3rem] p-10 flex flex-col items-center justify-center text-center opacity-50 hover:opacity-100 transition-opacity">
             <Truck size={32} className="text-rose-600 mb-6" />
             <p className="font-black italic uppercase tracking-tighter text-white text-sm">Quick Deploy</p>
          </div>
          <div className="glass-panel rounded-[3rem] p-10 flex flex-col items-center justify-center text-center opacity-50 hover:opacity-100 transition-opacity">
             <Award size={32} className="text-rose-600 mb-6" />
             <p className="font-black italic uppercase tracking-tighter text-white text-sm">Best-in-Class</p>
          </div>
       </div>
    </div>

    {loading ? (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {[1, 2, 3].map(i => <div key={i} className="luxury-card rounded-[3.5rem] h-[500px] animate-pulse" />)}
      </div>
    ) : (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {branches.map(branch => (
          <motion.div 
            key={branch.id} 
            variants={fadeInUp}
            whileHover={{ y: -10 }}
            className="group luxury-card rounded-[3.5rem] overflow-hidden"
          >
            <div className="h-48 bg-zinc-900 relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(225,29,72,0.2)_0%,transparent_100%)] opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              <div className="absolute inset-0 flex items-center justify-center">
                 <MapPin size={48} className="text-rose-600/30 group-hover:text-rose-600 transition-colors duration-700 group-hover:scale-110 transform" />
              </div>
            </div>
            <div className="p-12">
              <h3 className="text-3xl font-black italic tracking-tighter text-white uppercase mb-8 group-hover:text-rose-600 transition-colors">{branch.name}</h3>
              <div className="space-y-6 text-zinc-500 font-medium text-sm">
                <p className="flex items-start gap-4"><MapPin className="text-rose-600 shrink-0" size={20} />{branch.address}</p>
                <p className="flex items-center gap-4"><Smartphone className="text-rose-600 shrink-0" size={20} />{branch.phone}</p>
                <p className="flex items-center gap-4"><Clock className="text-rose-600 shrink-0" size={20} />{branch.hours}</p>
              </div>
              {branch.mapLink && branch.mapLink !== '' && (
                <a href={branch.mapLink} target="_blank" rel="noreferrer"
                  className="mt-10 inline-flex items-center gap-3 text-rose-500 text-[10px] font-black uppercase tracking-[0.3em] hover:text-white transition-all group">
                  Locate Studio <ChevronRight size={14} className="group-hover:translate-x-2 transition-transform" />
                </a>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    )}
  </div>
);


// ─── Main Public App ──────────────────────────────────────────────────────────
function PublicApp() {
  const [view, setView] = useState('home');
  const [products, setProducts] = useState([]);
  const [branches, setBranches] = useState([]);
  const [settings, setSettings] = useState(null);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingBranches, setLoadingBranches] = useState(true);
  const [productError, setProductError] = useState(null);
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState('All');

  const { user, API } = useAuth();
  const location = useLocation();

  useEffect(() => {
    fetch(`${API}/api/products`)
      .then(r => r.ok ? r.json() : Promise.reject(new Error('Network error')))
      .then(data => { 
        if(Array.isArray(data)) setProducts(data); 
        else { setProducts([]); setProductError(data?.error || 'Failed to fetch products'); }
        setLoadingProducts(false); 
      })
      .catch(() => { setProductError('Server offline. Ensure backend is running.'); setProducts([]); setLoadingProducts(false); });

    fetch(`${API}/api/branches`)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(data => { 
        setBranches(Array.isArray(data) ? data : []); 
        setLoadingBranches(false); 
      })
      .catch(() => { setBranches([]); setLoadingBranches(false); });

    fetch(`${API}/api/settings`)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(data => setSettings(data))
      .catch(() => { });

    if (user) {
      // Sync cart
      fetch(`${API}/api/cart`, { credentials: 'include' }).then(r=>r.json()).then(data => {
        if(data && data.items) {
          setCart(data.items.map(i => ({...i.productId, quantity: i.quantity})));
        }
      });
    }
  }, [user, API]);

  async function addToCart(p) {
    if (!user) {
      alert("Please log in to add products to your cart.");
      window.location.href = '/login';
      return;
    }
    
    // DB sync
    try {
      await fetch(`${API}/api/cart`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json'},
        body: JSON.stringify({ productId: p.id, quantity: 1 }),
        credentials: 'include'
      });
      // Update local optimistically
      setCart(prev => {
        const exists = prev.find(i => i.id === p.id);
        if (exists) return prev.map(i => i.id === p.id ? { ...i, quantity: i.quantity + 1 } : i);
        return [...prev, { ...p, quantity: 1 }];
      });
      setIsCartOpen(true);
    } catch (e) { console.error('Add to cart failed'); }
  }

  function navigate(to) {
    setView(to);
    if (to === 'tyres') setActiveFilter('Tyres');
    else if (to === 'accessories') setActiveFilter('Accessories');
    else if (to === 'home') setActiveFilter('All');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  const cartCount = cart.reduce((a, b) => a + b.quantity, 0);
  const showProducts = view === 'home' || view === 'tyres' || view === 'accessories';

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-zinc-100 font-sans selection:bg-rose-600 selection:text-white overflow-x-hidden">
      <BackgroundAnimation />
      <Navbar currentView={view} onNavigate={navigate} cartCount={cartCount} onOpenCart={() => setIsCartOpen(true)} settings={settings} />
      <AIConsierge products={products} />

      <main className="relative z-20">
        {view === 'home' && <HomeView settings={settings} onNavigate={navigate} />}
        {showProducts && (
          <ProductsSection
            products={products}
            loading={loadingProducts}
            error={productError}
            activeFilter={activeFilter}
            setActiveFilter={setActiveFilter}
            onAddToCart={addToCart}
            currentView={view}
            onNavigate={navigate}
          />
        )}
        {view === 'contactus' && <ContactView branches={branches} loading={loadingBranches} settings={settings} />}
        {view === 'account' && <AccountView user={user} />}
      </main>

      <footer className="relative z-20 pt-48 pb-16 px-6 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-24 mb-32">
          <div className="md:col-span-2 space-y-12">
            <PremiumLogo settings={settings} />
            <p className="text-zinc-500 text-xl font-medium leading-relaxed max-w-lg">
              {settings?.footerText || "Redefining the boundaries of automotive performance through precision engineering and visionary service standards."}
            </p>
            <div className="flex items-center space-x-8">
               {['INSTAGRAM', 'FACEBOOK', 'TWITTER', 'LINKEDIN'].map(social => (
                 <a key={social} href="#" className="text-[10px] font-black tracking-[0.3em] text-zinc-700 hover:text-rose-600 transition-colors uppercase">{social}</a>
               ))}
            </div>
          </div>
          
          <div>
            <h4 className="text-white font-black uppercase text-xs tracking-[0.4em] mb-12 italic">The Collection</h4>
            <ul className="space-y-6">
              <li onClick={() => navigate('tyres')} className="text-zinc-500 hover:text-rose-500 cursor-pointer transition-all font-black uppercase text-[10px] tracking-widest flex items-center gap-3 group">
                <div className="w-1 h-1 bg-rose-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" /> Tyres Studio
              </li>
              <li onClick={() => navigate('accessories')} className="text-zinc-500 hover:text-rose-500 cursor-pointer transition-all font-black uppercase text-[10px] tracking-widest flex items-center gap-3 group">
                <div className="w-1 h-1 bg-rose-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" /> Performance Add-ons
              </li>
              <li className="text-zinc-500 font-black uppercase text-[10px] tracking-widest opacity-30 cursor-not-allowed">Specialty Units</li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-black uppercase text-xs tracking-[0.4em] mb-12 italic">Studio Info</h4>
            <ul className="space-y-6">
              <li className="text-zinc-500 hover:text-white cursor-pointer transition-all font-black uppercase text-[10px] tracking-widest">Maintenance Guide</li>
              <li className="text-zinc-500 hover:text-white cursor-pointer transition-all font-black uppercase text-[10px] tracking-widest">Network Coverage</li>
              <li className="text-zinc-500 hover:text-white cursor-pointer transition-all font-black uppercase text-[10px] tracking-widest">Brand Credentials</li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-10 border-t border-white/5 pt-16">
          <p className="text-[10px] font-black text-zinc-700 uppercase tracking-[0.4em]">
            © 2026 {settings?.storeName?.toUpperCase() || 'ZAINTYRES'} PERFORMANCE STUDIO. ALL RIGHTS RESERVED.
          </p>
          <div className="flex items-center space-x-10">
            <span className="text-[9px] font-black text-zinc-800 uppercase tracking-widest">Privacy Protocol</span>
            <span className="text-[9px] font-black text-zinc-800 uppercase tracking-widest">Ownership Terms</span>
          </div>
        </div>
      </footer>


      {isCartOpen && <CartSidebar cart={cart} setCart={setCart} onClose={() => setIsCartOpen(false)} settings={settings} API={API} user={user} />}

      <style>{`
        .text-glow { text-shadow: 0 0 40px rgba(225,29,72,0.3); }
      `}</style>
    </div>
  );
}

function ProtectedRoute({ children, adminOnly = false }) {
  const { user, loading } = useAuth();
  
  if (loading) return <div className="min-h-screen bg-[#050505] flex items-center justify-center text-white">Loading Auth...</div>;
  if (!user) return <Navigate to="/auth" replace />;
  if (adminOnly && user.role !== 'admin') return <Navigate to="/" replace />;
  
  return children;
}

// ─── Root App with Router ─────────────────────────────────────────────────────
export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Router>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/login" element={<Navigate to="/auth" replace />} />
            <Route path="/signup" element={<Navigate to="/auth" replace />} />
            
            <Route path="/admin" element={
              <ProtectedRoute adminOnly={true}>
                <AdminPanel />
              </ProtectedRoute>
            } />
            
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            
            <Route path="/checkout" element={<CheckoutWrapper />} />
            <Route path="/*" element={<PublicApp />} />
          </Routes>
        </Router>
      </ToastProvider>
    </AuthProvider>
  );
}

// Wrapper to pass cart to checkout
function CheckoutWrapper() {
  const [cart, setCart] = useState([]);
  const [settings, setSettings] = useState(null);
  const { user, API } = useAuth();
  
  useEffect(() => {
    if (user) {
      fetch(`${API}/api/cart`, { credentials: 'include' }).then(r=>r.json()).then(data => {
        if(data && data.items) setCart(data.items.map(i => ({...i.productId, quantity: i.quantity, price: i.productId.price, image: i.productId.image, name: i.productId.name})));
      });
    }
  }, [user, API]);

  return <Checkout cart={cart} clearCart={() => setCart([])} settings={settings} />
}
