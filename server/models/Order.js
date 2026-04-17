const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true } // Captured at time of order
  }],
  addressId: { type: mongoose.Schema.Types.ObjectId, ref: 'Address', required: true },
  paymentMethod: { type: String, enum: ['Card', 'UPI', 'COD'], required: true },
  paymentStatus: { type: String, enum: ['Pending', 'Completed', 'Failed', 'Paid'], default: 'Pending' },
  orderStatus: { type: String, enum: ['Order Placed', 'Processing', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'], default: 'Order Placed' },
  trackingNumber: { type: String },
  subtotal: { type: Number, required: true },
  tax: { type: Number, required: true },
  shipping: { type: Number, required: true },
  total: { type: Number, required: true },
  timeline: {
    orderPlaced: { type: Date },
    processing: { type: Date },
    packed: { type: Date },
    shipped: { type: Date },
    outForDelivery: { type: Date },
    delivered: { type: Date },
  }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
