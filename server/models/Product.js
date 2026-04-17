const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  brand: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  discountPrice: { type: Number },
  category: { type: String, required: true }, // Tyres, Accessories
  subType: { type: String, default: 'New' },
  images: [{ type: String }],
  image: { type: String }, // thumbnail
  stock: { type: Number, default: 0 },
  sku: { type: String },
  rating: { type: Number, default: 4.0 },
  sales: { type: Number, default: 0 },
  condition: { type: String, default: 'New' },
  vehicle: [{ type: String }], // Compatible vehicles
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
