/**
 * app/admin/orders/[orderId]/page.tsx
 * Admin: single order detail with status update panel.
 */
'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Loader2, ArrowLeft } from 'lucide-react';
import OrderTracker from '@/components/OrderTracker';
import Link from 'next/link';

const STAGES = ['Order Placed', 'Processing', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered'];

export default function AdminOrderDetailPage() {
  const params  = useParams();
  const orderId = params.orderId as string;

  const [order, setOrder]   = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [newStatus, setNewStatus] = useState('');
  const [trackingNum, setTrackingNum] = useState('');
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch(`/api/admin/orders/${orderId}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          setOrder(d.order);
          setNewStatus(d.order.deliveryStatus);
          setTrackingNum(d.order.trackingNumber || '');
        }
      })
      .finally(() => setLoading(false));
  }, [orderId]);

  const handleUpdate = async () => {
    setUpdating(true);
    setMessage('');
    try {
      const res = await fetch('/api/admin/update-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, status: newStatus, trackingNumber: trackingNum }),
      });
      const data = await res.json();
      if (data.success) {
        setOrder(data.order);
        setMessage('✅ Status updated and customer notified!');
      } else {
        setMessage('❌ Failed to update status');
      }
    } finally {
      setUpdating(false);
    }
  };

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
    <main className="min-h-screen bg-[#0a0a0a] py-10 px-4">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Back */}
        <Link href="/admin" className="flex items-center gap-2 text-gray-500 hover:text-orange-400 transition-colors text-sm">
          <ArrowLeft size={16} /> Back to orders
        </Link>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-black text-white">Order Detail</h1>
            <p className="text-orange-400 font-mono mt-1">#{orderId.slice(-12).toUpperCase()}</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs border ${order.paymentStatus === 'paid' ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-red-500/20 text-red-400 border-red-500/30'}`}>
            Payment: {order.paymentStatus}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Customer info */}
          <div className="glass rounded-2xl p-6 space-y-3">
            <h2 className="font-bold text-white mb-3">Customer</h2>
            {[
              ['Name',    order.customerName],
              ['Email',   order.customerEmail],
              ['Phone',   order.customerPhone],
              ['Address', `${order.address?.line1}, ${order.address?.city}, ${order.address?.state} — ${order.address?.pincode}`],
            ].map(([label, value]) => (
              <div key={label}>
                <p className="text-xs text-gray-500 uppercase tracking-wider">{label}</p>
                <p className="text-white text-sm">{value}</p>
              </div>
            ))}
          </div>

          {/* Status update panel */}
          <div className="glass rounded-2xl p-6 space-y-4">
            <h2 className="font-bold text-white">Update Status</h2>
            <div className="grid grid-cols-2 gap-2">
              {STAGES.map((s) => (
                <button
                  key={s}
                  onClick={() => setNewStatus(s)}
                  className={`px-3 py-2 rounded-lg text-xs font-medium border transition-colors ${newStatus === s ? 'bg-orange-500 text-white border-orange-500' : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10'}`}
                >
                  {s}
                </button>
              ))}
            </div>
            {newStatus === 'Shipped' && (
              <div>
                <label className="text-xs text-gray-500 uppercase tracking-wider mb-1 block">Tracking Number</label>
                <input
                  type="text"
                  value={trackingNum}
                  onChange={(e) => setTrackingNum(e.target.value)}
                  placeholder="e.g. DTDC123456789"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-orange-500"
                />
              </div>
            )}
            {message && (
              <p className={`text-sm ${message.startsWith('✅') ? 'text-green-400' : 'text-red-400'}`}>{message}</p>
            )}
            <button
              onClick={handleUpdate}
              disabled={updating}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {updating ? <><Loader2 size={16} className="animate-spin" />Updating...</> : 'Update & Notify Customer'}
            </button>
          </div>
        </div>

        {/* Items */}
        <div className="glass rounded-2xl p-6">
          <h2 className="font-bold text-white mb-4">Items</h2>
          {order.items.map((item: any, i: number) => (
            <div key={i} className="flex justify-between py-2 border-b border-white/5 last:border-0 text-sm">
              <span className="text-white">{item.name} <span className="text-gray-500">x{item.quantity}</span></span>
              <span className="text-orange-400">₹{item.price * item.quantity}</span>
            </div>
          ))}
          <div className="flex justify-between pt-3 font-bold">
            <span className="text-white">Total</span>
            <span className="text-orange-400 text-lg">₹{order.total}</span>
          </div>
        </div>

        {/* Tracker */}
        <div className="glass rounded-2xl p-6">
          <h2 className="font-bold text-white mb-4">Delivery Timeline</h2>
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
