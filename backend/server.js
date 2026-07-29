const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
require('dotenv').config();

const Product = require('./models/product');

const app = express();
const ADMIN_KEY = process.env.ADMIN_KEY || "INDIANI@2025";

app.use(cors());
app.use(express.json());

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const MONGO_URI = process.env.ATLAS_URI;
console.log("URI check:", MONGO_URI ? "FOUND" : "MISSING");

let cached = global.mongoose;
if (!cached) cached = global.mongoose = { conn: null, promise: null };

async function connectDB() {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGO_URI, { dbName: "indianway" }).then(m => m);
  }
  cached.conn = await cached.promise;
  console.log("MongoDB Connected SUCCESS");
  return cached.conn;
}

app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (e) {
    console.log("MongoDB Error:", e.message);
    next(e);
  }
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: { folder: 'Indiani_way', allowed_formats: ['jpg', 'png', 'jpeg', 'webp'] }
});
const upload = multer({ storage });

function checkAdmin(req, res, next){
  const key = req.headers['x-admin-key'] || req.query.key;
  if(key === ADMIN_KEY) next();
  else res.status(403).json({ message: "Access Denied" });
}

app.get('/', (req,res) => res.send('Indiani Way Backend is Live!'));
app.get('/api/products', async (req, res) => {
  const products = await Product.find().sort({ createdAt: -1 });
  res.json(products);
});
app.post('/api/products', checkAdmin, upload.single('image'), async (req, res) => {
  try {
    const { name, category, price, discountedPrice, description, isFeatured } = req.body;
    const newProduct = new Product({
      name: name.trim(),
      category: category.trim().toLowerCase(),
      price: Number(price),
      discountedPrice: discountedPrice ? Number(discountedPrice) : null,
      description: description || "",
      image: req.file ? req.file.path : 'no-image.jpg',
      isFeatured: isFeatured === 'true' || isFeatured === true
    });
    await newProduct.save();
    res.json({ message: "Product Added", product: newProduct });
  } catch (err) { console.log("SAVE ERROR:", err); res.status(500).json({ error: err.message }); }
});
app.put('/api/products/:id', checkAdmin, upload.single('image'), async (req, res) => {
  const { name, category, price, discountedPrice, description, isFeatured } = req.body;
  const updateData = { name, category: category.toLowerCase(), price: Number(price), discountedPrice: discountedPrice? Number(discountedPrice) : null, description, isFeatured: isFeatured === 'true' || isFeatured === true };
  if(req.file) updateData.image = req.file.path;
  const updated = await Product.findByIdAndUpdate(req.params.id, updateData, { new: true });
  res.json(updated);
});
app.delete('/api/products/:id', checkAdmin, async (req, res) => {
  await Product.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted" });
});

if (process.env.NODE_ENV !== 'production') {
  app.listen(5000, () => console.log(`Backend: http://localhost:5000`));
}
module.exports = app;
