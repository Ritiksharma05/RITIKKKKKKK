/**
 * app/admin/page.tsx
 * Admin dashboard — stats + full orders table.
 */
'use client';

import { useEffect, useState } from 'react';
import { ShoppingBag, TrendingUp, Clock, CheckCircle, Loader2 } from 'lucide-react';
import AdminOrderTable from '@/components/AdminOrderTable';

interface Stats {
  totalOrders: number;
  revenueToday: number;
  pending: number;
  delivered: number;
}

export default function AdminDashboard() {
  const [stats, setStats]   = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/stats')
      .then((r) => r.json())
      .then((d) => { if (d.success) setStats(d); })
      .finally(() => setLoading(false));
  }, []);

  const statCards = stats
    ? [
        { label: 'Total Orders',   value: stats.totalOrders,          icon: ShoppingBag,  color: 'blue' },
        { label: 'Revenue Today',  value: `₹${stats.revenueToday.toLocaleString()}`, icon: TrendingUp, color: 'green' },
        { label: 'Pending',        value: stats.pending,              icon: Clock,        color: 'orange' },
        { label: 'Delivered',      value: stats.delivered,            icon: CheckCircle,  color: 'emerald' },
      ]
    : [];

  const colorMap: Record<string, string> = {
    blue:    'from-blue-500/20 to-blue-600/10 border-blue-500/30 text-blue-400',
    green:   'from-green-500/20 to-green-600/10 border-green-500/30 text-green-400',
    orange:  'from-orange-500/20 to-orange-600/10 border-orange-500/30 text-orange-400',
    emerald: 'from-emerald-500/20 to-emerald-600/10 border-emerald-500/30 text-emerald-400',
  };

  return (
    <main className="min-h-screen bg-[#0a0a0a] py-10 px-4">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header */}
        <div>
          <h1 className="text-4xl font-black gradient-text">Admin Dashboard</h1>
          <p className="text-gray-500 mt-1">Manage orders, update delivery status, and monitor revenue</p>
        </div>

        {/* Stats cards */}
        {loading ? (
          <div className="flex items-center gap-2 text-gray-500">
            <Loader2 size={18} className="animate-spin" /> Loading stats...
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {statCards.map((card) => {
              const Icon = card.icon;
              return (
                <div key={card.label} className={`bg-gradient-to-br ${colorMap[card.color]} border rounded-2xl p-5 space-y-2`}>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-500 uppercase tracking-wider">{card.label}</p>
                    <Icon size={18} className={colorMap[card.color].split(' ').at(-1)} />
                  </div>
                  <p className="text-3xl font-black text-white">{card.value}</p>
                </div>
              );
            })}
          </div>
        )}

        {/* Orders table */}
        <div className="glass rounded-2xl p-6">
          <h2 className="text-xl font-bold text-white mb-5">All Orders</h2>
          <AdminOrderTable />
        </div>
      </div>
    </main>
  );
}
