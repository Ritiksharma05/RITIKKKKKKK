/**
 * components/AdminOrderTable.tsx
 * Full admin orders table with search, filter, status update, and tracking number input.
 */
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, Filter, RefreshCw, ChevronRight, Loader2 } from 'lucide-react';

const STATUSES = ['All', 'Order Placed', 'Processing', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered'];

const STATUS_COLORS: Record<string, string> = {
  'Order Placed':    'bg-blue-500/20 text-blue-400 border-blue-500/30',
  'Processing':      'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  'Packed':          'bg-purple-500/20 text-purple-400 border-purple-500/30',
  'Shipped':         'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  'Out for Delivery':'bg-orange-500/20 text-orange-400 border-orange-500/30',
  'Delivered':       'bg-green-500/20 text-green-400 border-green-500/30',
};

interface Order {
  _id: string;
  customerName: string;
  customerEmail: string;
  items: { name: string; quantity: number; price: number }[];
  total: number;
  paymentStatus: string;
  deliveryStatus: string;
  createdAt: string;
  trackingNumber?: string;
}

export default function AdminOrderTable() {
  const [orders, setOrders]     = useState<Order[]>([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [filter, setFilter]     = useState('All');
  const [page, setPage]         = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [updating, setUpdating] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [newStatus, setNewStatus] = useState('');
  const [trackingInput, setTrackingInput] = useState('');

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ status: filter, search, page: String(page), limit: '15' });
      const res = await fetch(`/api/admin/orders?${params}`);
      const data = await res.json();
      if (data.success) {
        setOrders(data.orders);
        setTotalPages(data.pages);
      }
    } finally {
      setLoading(false);
    }
  }, [filter, search, page]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const handleStatusUpdate = async (orderId: string) => {
    if (!newStatus) return;
    setUpdating(orderId);
    try {
      const res = await fetch('/api/admin/update-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, status: newStatus, trackingNumber: trackingInput }),
      });
      const data = await res.json();
      if (data.success) {
        setOrders((prev) => prev.map((o) => o._id === orderId ? { ...o, deliveryStatus: newStatus, trackingNumber: trackingInput || o.trackingNumber } : o));
        setSelectedOrder(null);
        setNewStatus('');
        setTrackingInput('');
      }
    } finally {
      setUpdating(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Search + Filter bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Search order ID or customer name..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-orange-500 text-sm transition-colors"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-gray-500" />
          <select
            value={filter}
            onChange={(e) => { setFilter(e.target.value); setPage(1); }}
            className="bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-orange-500 transition-colors"
          >
            {STATUSES.map((s) => <option key={s} value={s} className="bg-gray-900">{s}</option>)}
          </select>
        </div>
        <button
          onClick={fetchOrders}
          className="p-2.5 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors"
          title="Refresh"
        >
          <RefreshCw size={16} className="text-gray-400" />
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-white/10">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 bg-white/5">
              {['Order ID', 'Customer', 'Items', 'Total', 'Payment', 'Delivery', 'Date', 'Action'].map((h) => (
                <th key={h} className="text-left text-xs text-gray-500 uppercase tracking-wider px-4 py-3 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} className="text-center py-12">
                  <Loader2 size={24} className="animate-spin text-orange-400 mx-auto" />
                </td>
              </tr>
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-12 text-gray-500">No orders found</td>
              </tr>
            ) : orders.map((order) => (
              <tr key={order._id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                <td className="px-4 py-3 font-mono text-xs text-orange-400">#{order._id.slice(-8).toUpperCase()}</td>
                <td className="px-4 py-3">
                  <p className="text-white font-medium">{order.customerName}</p>
                  <p className="text-gray-500 text-xs">{order.customerEmail}</p>
                </td>
                <td className="px-4 py-3 text-gray-300">{order.items.map((i) => `${i.name} x${i.quantity}`).join(', ')}</td>
                <td className="px-4 py-3 text-white font-semibold">₹{order.total}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs border ${order.paymentStatus === 'paid' ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-red-500/20 text-red-400 border-red-500/30'}`}>
                    {order.paymentStatus}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs border ${STATUS_COLORS[order.deliveryStatus] || 'bg-gray-500/20 text-gray-400 border-gray-500/30'}`}>
                    {order.deliveryStatus}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-500 text-xs">{new Date(order.createdAt).toLocaleDateString('en-IN')}</td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => { setSelectedOrder(order); setNewStatus(order.deliveryStatus); setTrackingInput(order.trackingNumber || ''); }}
                    className="p-1.5 rounded-lg bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 transition-colors"
                  >
                    <ChevronRight size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`w-8 h-8 rounded-lg text-sm transition-colors ${p === page ? 'bg-orange-500 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}
            >
              {p}
            </button>
          ))}
        </div>
      )}

      {/* Update Status Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-white/10 rounded-2xl p-6 w-full max-w-md space-y-4">
            <h3 className="text-white font-bold text-lg">Update Order Status</h3>
            <p className="text-gray-400 text-sm">Order #{selectedOrder._id.slice(-8).toUpperCase()} — {selectedOrder.customerName}</p>

            <div>
              <label className="text-xs text-gray-500 uppercase tracking-wider mb-1 block">Delivery Status</label>
              <div className="grid grid-cols-2 gap-2">
                {STATUSES.filter((s) => s !== 'All').map((s) => (
                  <button
                    key={s}
                    onClick={() => setNewStatus(s)}
                    className={`px-3 py-2 rounded-lg text-xs font-medium border transition-colors ${newStatus === s ? 'bg-orange-500 text-white border-orange-500' : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10'}`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {newStatus === 'Shipped' && (
              <div>
                <label className="text-xs text-gray-500 uppercase tracking-wider mb-1 block">Tracking Number</label>
                <input
                  type="text"
                  value={trackingInput}
                  onChange={(e) => setTrackingInput(e.target.value)}
                  placeholder="e.g. DTDC123456789"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-orange-500 text-sm"
                />
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setSelectedOrder(null)}
                className="flex-1 py-2.5 rounded-xl bg-white/5 text-gray-400 hover:bg-white/10 transition-colors text-sm"
              >
                Cancel
              </button>
              <button
                onClick={() => handleStatusUpdate(selectedOrder._id)}
                disabled={!!updating}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-red-600 text-white font-semibold text-sm disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {updating ? <><Loader2 size={14} className="animate-spin" />Updating...</> : 'Update Status'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
