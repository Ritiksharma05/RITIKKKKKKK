/**
 * app/api/admin/update-status/route.ts
 * Admin updates delivery status. Triggers notifications on key stages.
 */
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Order from '@/models/Order';
import {
  sendWhatsAppOrderShipped,
  sendWhatsAppOutForDelivery,
  sendWhatsAppDelivered,
  sendEmailShippingConfirmation,
  sendEmailDelivered,
} from '@/lib/notifications';

const STAGE_TO_TIMELINE_KEY: Record<string, string> = {
  'Order Placed':      'orderPlaced',
  'Processing':        'processing',
  'Packed':            'packed',
  'Shipped':           'shipped',
  'Out for Delivery':  'outForDelivery',
  'Delivered':         'delivered',
};

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || (session.user as any)?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const { orderId, status, trackingNumber } = await req.json();

    if (!orderId || !status) {
      return NextResponse.json({ error: 'orderId and status are required' }, { status: 400 });
    }

    await dbConnect();

    const timelineKey = STAGE_TO_TIMELINE_KEY[status];
    const updateData: any = {
      deliveryStatus: status,
      [`timeline.${timelineKey}`]: new Date(),
    };

    if (trackingNumber) {
      updateData.trackingNumber = trackingNumber;
    }

    const order = await Order.findByIdAndUpdate(orderId, updateData, { new: true });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Trigger notifications based on status (fire-and-forget)
    if (status === 'Shipped') {
      Promise.allSettled([
        sendWhatsAppOrderShipped(order),
        sendEmailShippingConfirmation(order),
      ]).catch(console.error);
    } else if (status === 'Out for Delivery') {
      Promise.allSettled([
        sendWhatsAppOutForDelivery(order),
      ]).catch(console.error);
    } else if (status === 'Delivered') {
      Promise.allSettled([
        sendWhatsAppDelivered(order),
        sendEmailDelivered(order),
      ]).catch(console.error);
    }

    return NextResponse.json({ success: true, order });
  } catch (error: any) {
    console.error('update-status error:', error);
    return NextResponse.json({ error: 'Failed to update status' }, { status: 500 });
  }
}
