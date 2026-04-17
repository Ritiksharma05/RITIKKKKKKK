import mongoose, { Schema, model, models } from 'mongoose';

const UserSchema = new Schema({
  name: String,
  email: { type: String, unique: true, required: true },
  phone: String,
  image: String,
  role: { type: String, default: 'customer' }, // "customer" | "admin"
  createdAt: { type: Date, default: Date.now }
});

const User = models.User || model('User', UserSchema);

export default User;
