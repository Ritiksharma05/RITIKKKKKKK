const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Address = require('../models/Address');
const Cart = require('../models/Cart');
const { protect } = require('../middleware/auth');

// Add address
router.post('/address', protect, async (req, res) => {
  try {
    const address = await Address.create({ userId: req.user._id, ...req.body });
    res.status(201).json(address);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get user addresses
router.get('/addresses', protect, async (req, res) => {
  try {
    const addresses = await Address.find({ userId: req.user._id });
    res.json(addresses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

let Razorpay;
try {
  Razorpay = require('razorpay');
} catch (e) {
  console.warn('Razorpay not installed. Run npm install razorpay in server/');
}

// Razorpay Init
router.post('/razorpay', protect, async (req, res) => {
  try {
    if (!Razorpay) return res.status(500).json({ error: 'Razorpay module not loaded on server' });
    const instance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID || 'YOUR_RAZORPAY_KEY',
      key_secret: process.env.RAZORPAY_SECRET || 'YOUR_RAZORPAY_SECRET'
    });
    const options = { amount: parseInt(req.body.amount * 100), currency: "INR", receipt: "rcpt_" + Date.now() };
    const order = await instance.orders.create(options);
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create Order
router.post('/', protect, async (req, res) => {
  const { orderItems, addressId, paymentMethod, subtotal, tax, shipping, total, paymentId, razorpayOrderId } = req.body;
  if (!orderItems || orderItems.length === 0) return res.status(400).json({ error: 'No order items' });

  try {
    const orderStatus = paymentMethod === 'COD' ? 'Pending' : (paymentId ? 'Confirmed' : 'Pending');
    const paymentStatus = paymentMethod === 'COD' ? 'Pending' : (paymentId ? 'Paid' : 'Pending');

    const order = new Order({
      userId: req.user._id,
      items: orderItems,
      addressId,
      paymentMethod,
      orderStatus,
      paymentStatus, // ensure you add this field manually or it ignores if strict
      razorpayPaymentId: paymentId,
      subtotal, tax, shipping, total
    });
    const createdOrder = await order.save();
    
    // Clear user cart
    await Cart.findOneAndUpdate({ userId: req.user._id }, { items: [] });
    
    // WhatsApp Notification to Admin
    try {
      const accountSid = process.env.TWILIO_ACCOUNT_SID;
      const authToken = process.env.TWILIO_AUTH_TOKEN;
      if (accountSid && authToken) {
        const client = require('twilio')(accountSid, authToken);
        await client.messages.create({
          body: `*New Order Alert - ZainsTyres*\n\nOrder ID: ${createdOrder._id}\nTotal: ₹${total}\nPayment Method: ${paymentMethod}\nStatus: ${paymentStatus}\nUser ID: ${req.user._id}`,
          from: 'whatsapp:+14155238886',
          to: `whatsapp:${process.env.ADMIN_WHATSAPP || '+911234567890'}`
        });
      }
    } catch (e) { console.error('WhatsApp Notification Failed:', e.message); }

    res.status(201).json(createdOrder);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get User Orders
router.get('/myorders', protect, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user._id }).populate('items.productId').populate('addressId').sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
