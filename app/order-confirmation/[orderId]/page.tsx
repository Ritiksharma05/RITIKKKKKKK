/**
 * app/order-confirmation/[orderId]/page.tsx
 * Shows order success details and auto-redirects to home after 5s countdown.
 */
'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { CheckCircle, Package, MapPin, Clock, ArrowRight, Loader2 } from 'lucide-react';

export default function OrderConfirmationPage() {
  const router  = useRouter();
  const params  = useParams();
  const orderId = params.orderId as string;

  const [order, setOrder]       = useState<any>(null);
  const [loading, setLoading]   = useState(true);
  const [countdown, setCountdown] = useState(5);

  // Fetch order
  useEffect(() => {
    if (!orderId) return;
    fetch(`/api/orders/${orderId}`)
      .then((r) => r.json())
      .then((data) => { if (data.success) setOrder(data.order); })
      .finally(() => setLoading(false));
  }, [orderId]);

  // Countdown + redirect
  useEffect(() => {
    if (!order) return;
    const interval = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(interval);
          router.push('/');
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [order, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
        <Loader2 size={32} className="animate-spin text-orange-400" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
        <p className="text-gray-500">Order not found.</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#0a0a0a] py-12 px-4">
      <div className="max-w-2xl mx-auto space-y-6">

        {/* Success header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-500/20 border-2 border-green-500/40 mb-2">
            <CheckCircle size={40} className="text-green-400" />
          </div>
          <h1 className="text-4xl font-black text-white">Order Confirmed! 🎉</h1>
          <p className="text-gray-400">Thank you for shopping with ZainsTyres</p>
        </div>

        {/* Order ID */}
        <div className="glass rounded-2xl p-5 text-center">
          <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Order ID</p>
          <p className="font-mono text-xl text-orange-400 font-bold">#{orderId.slice(-12).toUpperCase()}</p>
        </div>

        {/* Items */}
        <div className="glass rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Package size={18} className="text-orange-400" />
            <h2 className="font-bold text-white">Items Ordered</h2>
          </div>
          {order.items.map((item: any, i: number) => (
            <div key={i} className="flex justify-between items-center py-2 border-b border-white/5 last:border-0">
              <div>
                <p className="text-white text-sm">{item.name}</p>
                <p className="text-gray-500 text-xs">Qty: {item.quantity}</p>
              </div>
              <p className="text-orange-400 font-semibold">₹{item.price * item.quantity}</p>
            </div>
          ))}
          <div className="flex justify-between pt-2">
            <span className="text-white font-bold">Total Paid</span>
            <span className="text-orange-400 font-black text-xl">₹{order.total}</span>
          </div>
        </div>

        {/* Delivery info */}
        <div className="grid grid-cols-2 gap-4">
          <div className="glass rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <MapPin size={16} className="text-orange-400" />
              <p className="text-xs text-gray-500 uppercase tracking-wider">Deliver To</p>
            </div>
            <p className="text-white text-sm">{order.address?.line1}</p>
            <p className="text-gray-400 text-xs">{order.address?.city}, {order.address?.state} — {order.address?.pincode}</p>
          </div>
          <div className="glass rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock size={16} className="text-orange-400" />
              <p className="text-xs text-gray-500 uppercase tracking-wider">Est. Delivery</p>
            </div>
            <p className="text-white text-sm font-bold">{new Date(order.estimatedDelivery).toDateString()}</p>
          </div>
        </div>

        {/* Track button */}
        <a
          href={`/track-order/${orderId}`}
          className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold hover:from-orange-400 hover:to-red-500 transition-all shadow-lg shadow-orange-500/25"
        >
          Track Your Order <ArrowRight size={18} />
        </a>

        {/* Countdown */}
        <div className="text-center">
          <p className="text-gray-600 text-sm">
            Redirecting to home in{' '}
            <span className="text-orange-400 font-bold">{countdown}s</span>...
          </p>
          <div className="w-full h-1 bg-white/5 rounded-full mt-2 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-orange-500 to-red-600 rounded-full transition-all duration-1000"
              style={{ width: `${(countdown / 5) * 100}%` }}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
