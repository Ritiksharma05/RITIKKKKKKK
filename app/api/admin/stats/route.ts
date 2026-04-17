/**
 * app/api/admin/stats/route.ts
 * Dashboard stats: total orders, revenue today, pending, delivered.
 */
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Order from '@/models/Order';

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session || (session.user as any)?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    await dbConnect();

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [totalOrders, pending, delivered, revenueResult] = await Promise.all([
      Order.countDocuments(),
      Order.countDocuments({ deliveryStatus: { $in: ['Order Placed', 'Processing', 'Packed', 'Shipped', 'Out for Delivery'] } }),
      Order.countDocuments({ deliveryStatus: 'Delivered' }),
      Order.aggregate([
        { $match: { createdAt: { $gte: todayStart }, paymentStatus: 'paid' } },
        { $group: { _id: null, total: { $sum: '$total' } } },
      ]),
    ]);

    const revenueToday = revenueResult[0]?.total || 0;

    return NextResponse.json({ success: true, totalOrders, pending, delivered, revenueToday });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
