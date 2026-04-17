/**
 * app/api/razorpay/verify-payment/route.ts
 * Verifies Razorpay payment signature, saves order to MongoDB,
 * and triggers WhatsApp + Email notifications.
 */
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import crypto from 'crypto';
import dbConnect from '@/lib/mongodb';
import Order from '@/models/Order';
import {
  sendWhatsAppOrderPlaced,
  sendWhatsAppAdminNewOrder,
  sendEmailOrderConfirmation,
  sendEmailAdminNewOrder,
} from '@/lib/notifications';

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      // Order details to save
      customerName,
      customerEmail,
      customerPhone,
      address,
      items,
      total,
    } = body;

    // ── Step 1: Verify Razorpay signature ───────────────────────────────────
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 });
    }

    // ── Step 2: Save order to MongoDB ────────────────────────────────────────
    await dbConnect();

    const estimatedDelivery = new Date();
    estimatedDelivery.setDate(estimatedDelivery.getDate() + 5); // +5 days

    const order = await Order.create({
      userId: (session.user as any).userId,
      customerName,
      customerEmail,
      customerPhone,
      address,
      items,
      total,
      paymentId: razorpay_payment_id,
      razorpayOrderId: razorpay_order_id,
      paymentStatus: 'paid',
      deliveryStatus: 'Order Placed',
      estimatedDelivery,
      timeline: {
        orderPlaced: new Date(),
      },
    });

    // ── Step 3: Send notifications (fire-and-forget, don't block response) ──
    Promise.allSettled([
      sendWhatsAppOrderPlaced(order),
      sendWhatsAppAdminNewOrder(order),
      sendEmailOrderConfirmation(order),
      sendEmailAdminNewOrder(order),
    ]).catch(console.error);

    return NextResponse.json({ success: true, orderId: order._id.toString() });
  } catch (error: any) {
    console.error('verify-payment error:', error);
    return NextResponse.json({ error: 'Payment verification failed' }, { status: 500 });
  }
}
