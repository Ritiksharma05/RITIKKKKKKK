import mongoose, { Schema, model, models } from 'mongoose';

const OrderSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  customerName: { type: String, required: true },
  customerEmail: { type: String, required: true },
  customerPhone: { type: String, required: true },
  address: {
    line1: String,
    city: String,
    state: String,
    pincode: String
  },
  items: [
    {
      productId: { type: Schema.Types.ObjectId, ref: 'Product' },
      name: String,
      quantity: Number,
      price: Number
    }
  ],
  total: { type: Number, required: true },
  paymentId: String,
  razorpayOrderId: String,
  paymentStatus: { type: String, default: 'pending' }, // pending | paid | failed
  deliveryStatus: { type: String, default: 'Order Placed' },
  // 6-stage pipeline: Order Placed → Processing → Packed → Shipped → Out for Delivery → Delivered
  trackingNumber: String,
  estimatedDelivery: Date,
  timeline: {
    orderPlaced:    Date,
    processing:     Date,
    packed:         Date,
    shipped:        Date,
    outForDelivery: Date,
    delivered:      Date
  }
}, { timestamps: true });

const Order = models.Order || model('Order', OrderSchema);

export default Order;
