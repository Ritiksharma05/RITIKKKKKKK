const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const admin = require('firebase-admin');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
require('dotenv').config({ path: path.join(__dirname, '.env') });

// Connect to MongoDB
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/zainstyres';
mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected → ' + MONGO_URI.split('@')[1]?.split('?')[0] || 'localhost'))
  .catch(err => {
    console.error('❌ MongoDB Connection Error:', err.message);
    console.error('👉 TIP: If using MongoDB Atlas, ensure your IP is whitelisted in the Network Access tab.');
  });

// ─── Firebase Initialization ──────────────────────────────────────────────────
const serviceAccount = require('./zainstyres-firebase-adminsdk-fbsvc-7db12bfe3a.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: 'zainstyres.appspot.com'
});
const db = admin.firestore();
const bucket = admin.storage().bucket();

const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 5000;

// Rate limiting for login
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Increased for development/testing
  message: { success: false, message: 'Too many login attempts, please try again after 15 minutes' },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(cors({ 
  origin: function(origin, callback) {
    if (!origin || origin.startsWith('http://localhost') || origin.includes('vercel.app')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }, 
  credentials: true 
}));
app.use(express.json());
app.use(cookieParser());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ─── New modular routes ───────────────────────────────────────────────────
app.use('/api/auth/login', loginLimiter); // Apply rate limit to login only
app.use('/api/auth', require('./routes/auth'));
app.use('/api/cart', require('./routes/cart'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/tracking', require('./routes/tracking'));
app.use('/api/search', require('./routes/search'));
app.use('/api/ai', require('./routes/ai'));

// ─── File Upload Setup (Cloudinary / Fallback) ─────────────────────────
const fs = require('fs');
if (!fs.existsSync(path.join(__dirname, 'uploads'))) {
  fs.mkdirSync(path.join(__dirname, 'uploads'));
}

let storage;
try {
  const cloudinary = require('cloudinary').v2;
  const { CloudinaryStorage } = require('multer-storage-cloudinary');

  if (process.env.CLOUDINARY_CLOUD_NAME) {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET
    });

    storage = new CloudinaryStorage({
      cloudinary: cloudinary,
      params: { folder: 'zainstyres', allowed_formats: ['jpg', 'png', 'webp', 'jpeg'] },
    });
    console.log('Using Cloudinary for uploads');
  } else {
    throw new Error('Cloudinary env vars missing');
  }
} catch (err) {
  console.warn('Fallback to local disk storage for uploads.');
  storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, path.join(__dirname, 'uploads')),
    filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
  });
}

const fileFilter = (req, file, cb) => {
  if (['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type, only JPG/PNG/WEBP is allowed!'), false);
  }
};

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB per file
  fileFilter 
});

app.post('/api/upload', upload.array('images', 10), async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: 'No files uploaded.' });
  }
  
  try {
    const urls = req.files.map(file => {
      if (file.path && file.path.startsWith('http')) {
        return file.path;
      }
      return `${req.protocol}://${req.get('host')}/uploads/${file.filename}`;
    });
    res.json({ urls });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: 'Failed to upload files.' });
  }
});


const Product = require('./models/Product');
const Branch = require('./models/Branch');
const Settings = require('./models/Settings');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

// ─── Data Migration / Seed ───────────────────────────────────────────────────
async function seedDatabase() {
  try {
    // Seed Admin if it doesn't exist
    const adminExists = await User.findOne({ email: 'admin@zaintyres.com' });
    if (!adminExists) {
      console.log('Seeding initial Admin user...');
      const hashedPassword = await bcrypt.hash('AdminPassword123!', 10);
      await User.create({
        email: 'admin@zaintyres.com',
        password: hashedPassword,
        role: 'admin'
      });
      console.log('✅ Admin user created: admin@zaintyres.com / AdminPassword123!');
    }

    const productCount = await Product.countDocuments();
    if (productCount > 0) return; // DB already has data

    console.log('Seeding initial data into MongoDB...');
    
    const defaultProducts = [
      { name: 'Michelin Pilot Sport 4S', brand: 'Michelin', category: 'Tyres', subType: 'New', price: 15499, stock: 12, sales: 45, rating: 4.9, condition: 'New', description: 'Ultra-high performance summer tyre. Best for sports cars and high-speed stability.', image: 'https://images.unsplash.com/photo-1578844541663-4711efaf361a?auto=format&fit=crop&q=80&w=400', images: ['https://images.unsplash.com/photo-1578844541663-4711efaf361a?auto=format&fit=crop&q=80&w=400'], vehicle: ['Creta', 'City', 'Swift'] },
      { name: 'Continental ExtremeContact', brand: 'Continental', category: 'Tyres', subType: 'New', price: 12500, stock: 18, sales: 30, rating: 4.8, condition: 'New', description: 'Exceptional grip in wet and dry. DWS technology for all-season performance.', image: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&q=80&w=400', images: ['https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&q=80&w=400'], vehicle: ['Verna', 'Alcazar'] },
      { name: 'Bridgestone Turanza', brand: 'Bridgestone', category: 'Tyres', subType: 'Used', price: 3500, stock: 8, sales: 15, rating: 4.2, condition: 'Used - 70% Tread', description: 'Reliable touring tyre, great value. Focused on comfort and low road noise.', image: 'https://images.unsplash.com/photo-1606240212046-24e030a08e06?auto=format&fit=crop&q=80&w=400', images: ['https://images.unsplash.com/photo-1606240212046-24e030a08e06?auto=format&fit=crop&q=80&w=400'], vehicle: ['Swift', 'Baleno'] },
      { name: 'Goodyear Eagle F1', brand: 'Goodyear', category: 'Tyres', subType: 'Used', price: 4800, stock: 5, sales: 20, rating: 4.5, condition: 'Used - 85% Tread', description: 'Sport performance with long life. Run-flat technology available.', image: 'https://images.unsplash.com/photo-1594732832278-abd644401416?auto=format&fit=crop&q=80&w=400', images: ['https://images.unsplash.com/photo-1594732832278-abd644401416?auto=format&fit=crop&q=80&w=400'], vehicle: ['Creta', 'Nexon'] }
    ];

    const defaultBranches = [
      { name: 'Elite Hub: Delhi', address: 'Okhla Phase III, New Delhi, 110020', phone: '+91 98765 43210', hours: '9 AM - 9 PM', mapLink: 'https://maps.google.com' },
      { name: 'West Wing: Mumbai', address: 'Andheri East, Mumbai, 400069', phone: '+91 98765 43211', hours: '10 AM - 8 PM', mapLink: 'https://maps.google.com' }
    ];

    const defaultSettings = {
      storeName: 'ZainTyres',
      tagline: "India's #1 Rated Performance Garage",
      phone: '+91 98765 43210',
      whatsapp: '917006628255',
      email: 'info@zaintyres.com',
      address: 'Okhla Phase III, New Delhi',
      heroHeading: 'PRECISION',
      heroHighlight: 'PERFORMANCE',
      heroSubText: "India's #1 Rated Performance Garage",
      footerText: 'Revolutionizing the automotive landscape in India with premium performance tyres and world-class service centers.',
      instagramUrl: '#',
      facebookUrl: '#',
    };

    await Settings.create(defaultSettings);
    await Product.insertMany(defaultProducts);
    await Branch.insertMany(defaultBranches);
    console.log('MongoDB Seeding complete!');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
}

seedDatabase();

// ─── Health ───────────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

// ─── Products ─────────────────────────────────────────────────────────────────
app.get('/api/products', async (req, res) => {
  try {
    const { category, subType } = req.query;
    let query = {};
    if (category) query.category = category;
    if (subType) query.subType = subType;

    const results = await Product.find(query);
    res.json(results.map(p => ({ id: p._id, ...p.toObject() })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/products/:id', async (req, res) => {
  try {
    const doc = await Product.findById(req.params.id);
    if (!doc) return res.status(404).json({ error: 'Not found' });
    res.json({ id: doc._id, ...doc.toObject() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/products', async (req, res) => {
  try {
    const { name, brand, category, price } = req.body;
    if (!name || !brand || !category || price === undefined) {
      return res.status(400).json({ error: 'name, brand, category, price are required' });
    }
    const newProduct = new Product({
      name, brand, category,
      subType: req.body.subType || 'New',
      price: parseFloat(price) || 0,
      stock: parseInt(req.body.stock) || 0,
      sales: 0,
      rating: parseFloat(req.body.rating) || 4.0,
      condition: req.body.condition || 'New',
      description: req.body.description || '',
      image: req.body.image || '',
      images: req.body.images || (req.body.image ? [req.body.image] : []),
      vehicle: req.body.vehicle || [],
    });
    const docRef = await newProduct.save();
    res.status(201).json({ id: docRef._id, ...docRef.toObject() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/products/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const updateData = { ...req.body };
    delete updateData.id; 

    const doc = await Product.findByIdAndUpdate(id, updateData, { new: true });
    res.json({ id: doc._id, ...doc.toObject() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/products/:id', async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Tyre Finder ──────────────────────────────────────────────────────────────
app.get('/api/find', async (req, res) => {
  try {
    const { model, brand, maxPrice } = req.query;
    let query = {};
    if (model) query.vehicle = model;
    if (brand) query.brand = new RegExp(`^${brand}$`, 'i');
    if (maxPrice) query.price = { $lte: parseFloat(maxPrice) };
    
    const results = await Product.find(query);
    res.json(results.map(p => ({ id: p._id, ...p.toObject() })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Branches ─────────────────────────────────────────────────────────────────
app.get('/api/branches', async (req, res) => {
  try {
    const results = await Branch.find();
    res.json(results.map(doc => ({ id: doc._id, ...doc.toObject() })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/branches', async (req, res) => {
  try {
    const { name, address, phone } = req.body;
    if (!name || !address || !phone) return res.status(400).json({ error: 'name, address, phone required' });
    
    const branch = new Branch({ name, address, phone, hours: req.body.hours || '9 AM - 6 PM', mapLink: req.body.mapLink || '' });
    const docRef = await branch.save();
    res.status(201).json({ id: docRef._id, ...docRef.toObject() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/branches/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const updateData = { ...req.body };
    delete updateData.id;
    const doc = await Branch.findByIdAndUpdate(id, updateData, { new: true });
    res.json({ id: doc._id, ...doc.toObject() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/branches/:id', async (req, res) => {
  try {
    await Branch.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Settings ─────────────────────────────────────────────────────────────────
app.get('/api/settings', async (req, res) => {
  try {
    const doc = await Settings.findOne();
    res.json(doc ? doc.toObject() : {});
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/settings', async (req, res) => {
  try {
    let doc = await Settings.findOne();
    if (doc) {
      doc = await Settings.findByIdAndUpdate(doc._id, req.body, { new: true });
    } else {
      doc = await Settings.create(req.body);
    }
    res.json(doc.toObject());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── 404 ──────────────────────────────────────────────────────────────────────
app.use((req, res) => res.status(404).json({ error: `${req.method} ${req.path} not found` }));

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`\n✅ ZainsTyres API → http://localhost:${PORT}\n`);
    console.log('  Products   GET|POST /api/products');
    console.log('  Branches   GET|POST /api/branches');
    console.log('  Settings   GET|PUT  /api/settings');
    console.log('  Auth       POST     /api/admin/login\n');
  });
}

// Export for serverless environments like Vercel
module.exports = app;
