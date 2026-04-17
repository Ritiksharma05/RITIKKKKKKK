/**
 * app/page.tsx
 * Landing / Home page — showcases products and links to checkout.
 */
import Link from 'next/link';
import { ShoppingCart, Star, Truck, Shield, Phone } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'ZainsTyres — Premium Tyres Online India',
  description: 'Buy premium MRF, Apollo, CEAT and Bridgestone tyres online. Best prices, fast delivery across India.',
};

const FEATURED_PRODUCTS = [
  { id: 'p1', name: 'MRF ZVTS',          brand: 'MRF',        size: '205/55 R16', price: 4500, rating: 4.8, tag: 'Best Seller' },
  { id: 'p2', name: 'Apollo Alnac 4G',   brand: 'Apollo',     size: '145/80 R13', price: 2200, rating: 4.6, tag: 'Value Pick' },
  { id: 'p3', name: 'CEAT Milaze X3',    brand: 'CEAT',       size: '155/80 R13', price: 2600, rating: 4.5, tag: 'Popular' },
  { id: 'p4', name: 'Bridgestone B290',  brand: 'Bridgestone', size: '185/65 R15', price: 5200, rating: 4.9, tag: 'Premium' },
  { id: 'p5', name: 'MRF Wanderer',      brand: 'MRF',        size: '165/80 R14', price: 3100, rating: 4.7, tag: 'New' },
  { id: 'p6', name: 'Apollo Amazer 4G',  brand: 'Apollo',     size: '175/65 R14', price: 3400, rating: 4.6, tag: null },
];

const TAG_COLORS: Record<string, string> = {
  'Best Seller': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  'Value Pick':  'bg-blue-500/20 text-blue-400 border-blue-500/30',
  'Popular':     'bg-purple-500/20 text-purple-400 border-purple-500/30',
  'Premium':     'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  'New':         'bg-green-500/20 text-green-400 border-green-500/30',
};

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a]">

      {/* ── Navbar ── */}
      <nav className="sticky top-0 z-50 bg-[#0a0a0a]/80 backdrop-blur border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-white font-black text-sm">Z</div>
            <span className="font-black text-white text-lg">ZainsTyres</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/checkout"
              className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-red-600 text-white text-sm font-semibold px-4 py-2 rounded-xl hover:from-orange-400 hover:to-red-500 transition-all"
            >
              <ShoppingCart size={15} /> Checkout
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden py-24 px-4">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-orange-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-red-500/10 rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 rounded-full px-4 py-1.5 text-orange-400 text-sm">
            🚚 Free delivery on orders above ₹5000
          </div>
          <h1 className="text-5xl md:text-7xl font-black leading-tight">
            Premium Tyres<br />
            <span className="gradient-text">Delivered Fast</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-xl mx-auto">
            Shop MRF, Apollo, CEAT & Bridgestone tyres at the best prices. 
            Secure payment via Razorpay. Pan-India delivery.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link
              href="/checkout"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold px-8 py-3.5 rounded-xl hover:from-orange-400 hover:to-red-500 transition-all shadow-lg shadow-orange-500/25 hover:scale-105 active:scale-95"
            >
              <ShoppingCart size={18} /> Shop Now
            </Link>
            <a
              href="tel:+91-999-999-9999"
              className="inline-flex items-center gap-2 glass text-white font-semibold px-8 py-3.5 rounded-xl hover:bg-white/10 transition-all"
            >
              <Phone size={18} /> Call Us
            </a>
          </div>
        </div>
      </section>

      {/* ── Trust badges ── */}
      <section className="py-10 px-4 border-y border-white/5">
        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            { icon: Truck,  title: 'Fast Delivery',     desc: 'Delivered in 3–7 business days anywhere in India' },
            { icon: Shield, title: '100% Genuine',      desc: 'All tyres are genuine & come with manufacturer warranty' },
            { icon: Star,   title: 'Best Prices',       desc: 'Price match guarantee — we beat any competitor quote' },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center shrink-0">
                <Icon size={20} className="text-orange-400" />
              </div>
              <div>
                <p className="text-white font-semibold">{title}</p>
                <p className="text-gray-500 text-sm mt-0.5">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Featured Products ── */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="mb-10">
            <h2 className="text-3xl font-black text-white">Featured Tyres</h2>
            <p className="text-gray-500 mt-1">Top-selling tyres trusted by thousands of customers</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURED_PRODUCTS.map((product) => (
              <div key={product.id} className="glass rounded-2xl p-5 hover:border-orange-500/30 transition-all duration-300 group hover:-translate-y-1">
                {/* Placeholder tyre image */}
                <div className="w-full h-44 rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center mb-4 overflow-hidden">
                  <div className="w-28 h-28 rounded-full border-8 border-gray-600 group-hover:border-orange-500/50 transition-colors duration-300 flex items-center justify-center">
                    <div className="w-10 h-10 rounded-full bg-gray-700" />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-xs text-gray-500">{product.brand}</p>
                      <h3 className="text-white font-bold">{product.name}</h3>
                    </div>
                    {product.tag && (
                      <span className={`text-xs px-2 py-0.5 rounded-full border shrink-0 ${TAG_COLORS[product.tag]}`}>
                        {product.tag}
                      </span>
                    )}
                  </div>
                  <p className="text-gray-500 text-sm">Size: {product.size}</p>
                  <div className="flex items-center gap-1">
                    <Star size={12} className="text-yellow-400 fill-yellow-400" />
                    <span className="text-yellow-400 text-xs font-medium">{product.rating}</span>
                  </div>
                  <div className="flex items-center justify-between pt-2">
                    <p className="text-2xl font-black text-orange-400">₹{product.price.toLocaleString()}</p>
                    <Link
                      href="/checkout"
                      className="flex items-center gap-1.5 bg-orange-500/10 hover:bg-orange-500 border border-orange-500/30 hover:border-orange-500 text-orange-400 hover:text-white text-xs font-semibold px-4 py-2 rounded-xl transition-all duration-200"
                    >
                      <ShoppingCart size={13} /> Add
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-white/5 py-10 px-4 text-center">
        <p className="text-gray-600 text-sm">© {new Date().getFullYear()} ZainsTyres. All rights reserved.</p>
        <div className="flex justify-center gap-6 mt-3 text-xs text-gray-600">
          <a href="#" className="hover:text-gray-400 transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-gray-400 transition-colors">Terms of Service</a>
          <a href="#" className="hover:text-gray-400 transition-colors">Contact</a>
          <Link href="/admin" className="hover:text-orange-400 transition-colors">Admin</Link>
        </div>
      </footer>
    </div>
  );
}
