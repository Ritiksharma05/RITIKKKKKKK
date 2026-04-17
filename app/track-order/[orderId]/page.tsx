/**
 * app/track-order/[orderId]/page.tsx
 * Customer order tracking page with Flipkart-style stepper.
 * Polls for updates every 30 seconds via client-side refetch.
 */
'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { Loader2, RefreshCw } from 'lucide-react';
import OrderTracker from '@/components/OrderTracker';

export default function TrackOrderPage() {
  const params  = useParams();
  const orderId = params.orderId as string;

  const [order, setOrder]     = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchOrder = useCallback(async () => {
    try {
      const res  = await fetch(`/api/orders/${orderId}`);
      const data = await res.json();
      if (data.success) {
        setOrder(data.order);
        setLastUpdated(new Date());
      }
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  // Initial fetch
  useEffect(() => { fetchOrder(); }, [fetchOrder]);

  // Poll every 30 seconds for real-time updates
  useEffect(() => {
    const interval = setInterval(fetchOrder, 30_000);
    return () => clearInterval(interval);
  }, [fetchOrder]);

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
        <div className="text-center">
          <p className="text-white text-xl font-bold mb-2">Order Not Found</p>
          <p className="text-gray-500 text-sm">The order ID may be invalid or you may not have access.</p>
          <a href="/" className="mt-4 inline-block text-orange-400 hover:underline">← Go Home</a>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#0a0a0a] py-12 px-4">
      <div className="max-w-xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <a href="/" className="text-gray-500 hover:text-orange-400 text-sm transition-colors">← Back to home</a>
          <div className="flex items-start justify-between mt-4">
            <div>
              <h1 className="text-3xl font-black text-white">Track Order</h1>
              <p className="text-gray-500 text-sm mt-1 font-mono">#{orderId.slice(-12).toUpperCase()}</p>
            </div>
            <button
              onClick={fetchOrder}
              className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
              title="Refresh"
            >
              <RefreshCw size={16} className="text-gray-400" />
            </button>
          </div>
          {lastUpdated && (
            <p className="text-xs text-gray-600 mt-1">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </p>
          )}
        </div>

        {/* Order meta */}
        <div className="glass rounded-2xl p-5 mb-6 grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Customer</p>
            <p className="text-white font-medium">{order.customerName}</p>
          </div>
          <div>
            <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Total Paid</p>
            <p className="text-orange-400 font-bold">₹{order.total}</p>
          </div>
          <div className="col-span-2">
            <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Delivery Address</p>
            <p className="text-white">{order.address?.line1}, {order.address?.city}, {order.address?.state} — {order.address?.pincode}</p>
          </div>
        </div>

        {/* Items */}
        <div className="glass rounded-2xl p-5 mb-6">
          <p className="text-gray-500 text-xs uppercase tracking-wider mb-3">Items</p>
          {order.items.map((item: any, i: number) => (
            <div key={i} className="flex justify-between text-sm py-1.5 border-b border-white/5 last:border-0">
              <span className="text-white">{item.name} <span className="text-gray-500">x{item.quantity}</span></span>
              <span className="text-orange-400">₹{item.price * item.quantity}</span>
            </div>
          ))}
        </div>

        {/* Tracker stepper */}
        <div className="glass rounded-2xl p-6">
          <OrderTracker
            deliveryStatus={order.deliveryStatus}
            timeline={order.timeline || {}}
            estimatedDelivery={order.estimatedDelivery}
            trackingNumber={order.trackingNumber}
          />
        </div>
      </div>
    </main>
  );
}
