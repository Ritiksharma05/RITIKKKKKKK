/**
 * lib/notifications.ts
 * Helper functions for WhatsApp (Twilio) and Email (Resend) notifications.
 */
import twilio from 'twilio';
import { Resend } from 'resend';

const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID!,
  process.env.TWILIO_AUTH_TOKEN!
);

const resend = new Resend(process.env.RESEND_API_KEY!);

// ─── WhatsApp Notifications ──────────────────────────────────────────────────

export async function sendWhatsAppOrderPlaced(order: any) {
  const itemList = order.items
    .map((i: any) => `• ${i.name} x${i.quantity} @ ₹${i.price}`)
    .join('\n');

  const message = `
🛒 *Order Confirmed — ZainsTyres*

Hi ${order.customerName}!

Your order has been placed successfully.

*Order ID:* ${order._id}
*Items:*
${itemList}

*Total: ₹${order.total}*
*Estimated Delivery:* ${new Date(order.estimatedDelivery).toDateString()}

Track your order at: ${process.env.NEXTAUTH_URL}/track-order/${order._id}

Thank you for shopping with us! 🚗
  `.trim();

  await twilioClient.messages.create({
    from: process.env.TWILIO_WHATSAPP_FROM!,
    to: `whatsapp:${order.customerPhone}`,
    body: message,
  });
}

export async function sendWhatsAppOrderShipped(order: any) {
  const message = `
📦 *Order Shipped — ZainsTyres*

Hi ${order.customerName}!

Your order *${order._id}* has been shipped.
*Tracking Number:* ${order.trackingNumber || 'N/A'}

Track your order at: ${process.env.NEXTAUTH_URL}/track-order/${order._id}
  `.trim();

  await twilioClient.messages.create({
    from: process.env.TWILIO_WHATSAPP_FROM!,
    to: `whatsapp:${order.customerPhone}`,
    body: message,
  });
}

export async function sendWhatsAppOutForDelivery(order: any) {
  const message = `
🛵 *Out for Delivery — ZainsTyres*

Hi ${order.customerName}!

Your order *${order._id}* is out for delivery today. Please be available to receive it.

Track: ${process.env.NEXTAUTH_URL}/track-order/${order._id}
  `.trim();

  await twilioClient.messages.create({
    from: process.env.TWILIO_WHATSAPP_FROM!,
    to: `whatsapp:${order.customerPhone}`,
    body: message,
  });
}

export async function sendWhatsAppDelivered(order: any) {
  const message = `
✅ *Order Delivered — ZainsTyres*

Hi ${order.customerName}!

Your order *${order._id}* has been delivered. Enjoy your new tyres! 🚗

Thank you for choosing ZainsTyres!
  `.trim();

  await twilioClient.messages.create({
    from: process.env.TWILIO_WHATSAPP_FROM!,
    to: `whatsapp:${order.customerPhone}`,
    body: message,
  });
}

export async function sendWhatsAppAdminNewOrder(order: any) {
  const itemList = order.items
    .map((i: any) => `• ${i.name} x${i.quantity} @ ₹${i.price}`)
    .join('\n');

  const message = `
🔔 *New Order — ZainsTyres Admin*

*Customer:* ${order.customerName}
*Email:* ${order.customerEmail}
*Phone:* ${order.customerPhone}
*Address:* ${order.address.line1}, ${order.address.city}, ${order.address.state} - ${order.address.pincode}

*Items:*
${itemList}

*Total: ₹${order.total}*
*Order ID:* ${order._id}

Manage at: ${process.env.NEXTAUTH_URL}/admin/orders/${order._id}
  `.trim();

  await twilioClient.messages.create({
    from: process.env.TWILIO_WHATSAPP_FROM!,
    to: `whatsapp:${process.env.ADMIN_WHATSAPP_NUMBER!}`,
    body: message,
  });
}

// ─── Email Notifications ─────────────────────────────────────────────────────

function buildOrderItemsHtml(items: any[]) {
  return items.map((i) => `
    <tr>
      <td style="padding:8px;border-bottom:1px solid #f0f0f0;">${i.name}</td>
      <td style="padding:8px;border-bottom:1px solid #f0f0f0;text-align:center;">${i.quantity}</td>
      <td style="padding:8px;border-bottom:1px solid #f0f0f0;text-align:right;">₹${i.price}</td>
      <td style="padding:8px;border-bottom:1px solid #f0f0f0;text-align:right;">₹${i.price * i.quantity}</td>
    </tr>
  `).join('');
}

export async function sendEmailOrderConfirmation(order: any) {
  const html = `
  <div style="font-family:Inter,sans-serif;max-width:600px;margin:auto;background:#0f0f0f;color:#fff;border-radius:12px;overflow:hidden;">
    <div style="background:linear-gradient(135deg,#f97316,#dc2626);padding:32px;text-align:center;">
      <h1 style="margin:0;font-size:24px;">✅ Order Confirmed!</h1>
      <p style="margin:8px 0 0;opacity:0.9;">Thank you for shopping with ZainsTyres</p>
    </div>
    <div style="padding:32px;">
      <p>Hi <strong>${order.customerName}</strong>,</p>
      <p>Your order has been placed successfully. Here are the details:</p>
      <div style="background:#1a1a1a;border-radius:8px;padding:16px;margin:16px 0;">
        <p><strong>Order ID:</strong> ${order._id}</p>
        <p><strong>Estimated Delivery:</strong> ${new Date(order.estimatedDelivery).toDateString()}</p>
        <p><strong>Delivery Address:</strong><br/>${order.address.line1}, ${order.address.city}, ${order.address.state} - ${order.address.pincode}</p>
      </div>
      <table style="width:100%;border-collapse:collapse;">
        <thead>
          <tr style="background:#1a1a1a;">
            <th style="padding:8px;text-align:left;">Item</th>
            <th style="padding:8px;text-align:center;">Qty</th>
            <th style="padding:8px;text-align:right;">Price</th>
            <th style="padding:8px;text-align:right;">Subtotal</th>
          </tr>
        </thead>
        <tbody>
          ${buildOrderItemsHtml(order.items)}
        </tbody>
        <tfoot>
          <tr>
            <td colspan="3" style="padding:8px;text-align:right;font-weight:bold;">Total:</td>
            <td style="padding:8px;text-align:right;color:#f97316;font-weight:bold;">₹${order.total}</td>
          </tr>
        </tfoot>
      </table>
      <div style="text-align:center;margin-top:24px;">
        <a href="${process.env.NEXTAUTH_URL}/track-order/${order._id}" 
           style="background:linear-gradient(135deg,#f97316,#dc2626);color:#fff;padding:12px 32px;border-radius:8px;text-decoration:none;font-weight:bold;">
          Track Your Order
        </a>
      </div>
    </div>
    <div style="background:#1a1a1a;padding:16px;text-align:center;font-size:12px;color:#666;">
      © ${new Date().getFullYear()} ZainsTyres. All rights reserved.
    </div>
  </div>
  `;

  await resend.emails.send({
    from: 'ZainsTyres <noreply@zainstyres.com>',
    to: [order.customerEmail],
    subject: `✅ Order Confirmed — #${order._id}`,
    html,
  });
}

export async function sendEmailShippingConfirmation(order: any) {
  const html = `
  <div style="font-family:Inter,sans-serif;max-width:600px;margin:auto;background:#0f0f0f;color:#fff;border-radius:12px;overflow:hidden;">
    <div style="background:linear-gradient(135deg,#3b82f6,#1d4ed8);padding:32px;text-align:center;">
      <h1 style="margin:0;font-size:24px;">📦 Your Order is Shipped!</h1>
    </div>
    <div style="padding:32px;">
      <p>Hi <strong>${order.customerName}</strong>,</p>
      <p>Great news! Your order <strong>#${order._id}</strong> has been shipped.</p>
      <div style="background:#1a1a1a;border-radius:8px;padding:16px;margin:16px 0;">
        <p><strong>Tracking Number:</strong> ${order.trackingNumber || 'Will be updated soon'}</p>
        <p><strong>Estimated Delivery:</strong> ${new Date(order.estimatedDelivery).toDateString()}</p>
      </div>
      <div style="text-align:center;margin-top:24px;">
        <a href="${process.env.NEXTAUTH_URL}/track-order/${order._id}"
           style="background:linear-gradient(135deg,#3b82f6,#1d4ed8);color:#fff;padding:12px 32px;border-radius:8px;text-decoration:none;font-weight:bold;">
          Track Your Shipment
        </a>
      </div>
    </div>
  </div>
  `;

  await resend.emails.send({
    from: 'ZainsTyres <noreply@zainstyres.com>',
    to: [order.customerEmail],
    subject: `📦 Order Shipped — #${order._id}`,
    html,
  });
}

export async function sendEmailDelivered(order: any) {
  const html = `
  <div style="font-family:Inter,sans-serif;max-width:600px;margin:auto;background:#0f0f0f;color:#fff;border-radius:12px;overflow:hidden;">
    <div style="background:linear-gradient(135deg,#22c55e,#16a34a);padding:32px;text-align:center;">
      <h1 style="margin:0;font-size:24px;">✅ Order Delivered!</h1>
    </div>
    <div style="padding:32px;">
      <p>Hi <strong>${order.customerName}</strong>,</p>
      <p>Your order <strong>#${order._id}</strong> has been delivered. Enjoy your new tyres!</p>
      <div style="text-align:center;margin-top:24px;">
        <a href="${process.env.NEXTAUTH_URL}"
           style="background:linear-gradient(135deg,#22c55e,#16a34a);color:#fff;padding:12px 32px;border-radius:8px;text-decoration:none;font-weight:bold;">
          Shop Again
        </a>
      </div>
    </div>
  </div>
  `;

  await resend.emails.send({
    from: 'ZainsTyres <noreply@zainstyres.com>',
    to: [order.customerEmail],
    subject: `✅ Order Delivered — #${order._id}`,
    html,
  });
}

export async function sendEmailAdminNewOrder(order: any) {
  const html = `
  <div style="font-family:Inter,sans-serif;max-width:600px;margin:auto;background:#0f0f0f;color:#fff;border-radius:12px;overflow:hidden;">
    <div style="background:linear-gradient(135deg,#7c3aed,#4f46e5);padding:32px;text-align:center;">
      <h1 style="margin:0;font-size:24px;">🔔 New Order Received</h1>
    </div>
    <div style="padding:32px;">
      <p><strong>Customer:</strong> ${order.customerName}</p>
      <p><strong>Email:</strong> ${order.customerEmail}</p>
      <p><strong>Phone:</strong> ${order.customerPhone}</p>
      <p><strong>Address:</strong> ${order.address.line1}, ${order.address.city}, ${order.address.state} - ${order.address.pincode}</p>
      <p><strong>Total:</strong> ₹${order.total}</p>
      <div style="text-align:center;margin-top:24px;">
        <a href="${process.env.NEXTAUTH_URL}/admin/orders/${order._id}"
           style="background:linear-gradient(135deg,#7c3aed,#4f46e5);color:#fff;padding:12px 32px;border-radius:8px;text-decoration:none;font-weight:bold;">
          Manage Order
        </a>
      </div>
    </div>
  </div>
  `;

  await resend.emails.send({
    from: 'ZainsTyres Admin <admin@zainstyres.com>',
    to: [process.env.ADMIN_EMAIL!],
    subject: `🔔 New Order — ₹${order.total} from ${order.customerName}`,
    html,
  });
}
