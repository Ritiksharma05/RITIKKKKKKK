const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  storeName: { type: String, default: 'ZainTyres' },
  tagline: { type: String, default: "India's #1 Rated Performance Garage" },
  phone: { type: String, default: '+91 98765 43210' },
  whatsapp: { type: String, default: '917006628255' },
  email: { type: String, default: 'info@zaintyres.com' },
  address: { type: String, default: 'Okhla Phase III, New Delhi' },
  heroHeading: { type: String, default: 'PRECISION' },
  heroHighlight: { type: String, default: 'PERFORMANCE' },
  heroSubText: { type: String, default: "India's #1 Rated Performance Garage" },
  footerText: { type: String, default: 'Revolutionizing the automotive landscape in India with premium performance tyres and world-class service centers.' },
  instagramUrl: { type: String, default: '#' },
  facebookUrl: { type: String, default: '#' }
}, { timestamps: true });

module.exports = mongoose.model('Settings', settingsSchema);
