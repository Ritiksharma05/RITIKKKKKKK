import mongoose, { Schema, model, models } from 'mongoose';

const ProductSchema = new Schema({
  name: { type: String, required: true },
  brand: String,
  size: String,       // e.g. "205/55 R16"
  price: Number,
  stock: Number,
  imageUrl: String,
  description: String,
  createdAt: { type: Date, default: Date.now }
});

const Product = models.Product || model('Product', ProductSchema);

export default Product;
