const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
require('dotenv').config();

const Product = require('./models/product');

const app = express();
const PORT = process.env.PORT || 5000;
const ADMIN_KEY = process.env.ADMIN_KEY || "INDIANI@2025";

app.use(cors());
app.use(express.json());

// CLOUDINARY CONFIG - TERA FEATURE SAME HAI
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// MongoDB Connect - FIXED
const MONGO_URI = process.env.ATLAS_URI || process.env.atlas_URI;
console.log("URI check:", MONGO_URI ? "FOUND" : "MISSING");

let isConnected = false;
async function connectDB() {
  if (isConnected && mongoose.connection.readyState === 1) return;
  try {
    if (!MONGO_URI) return;
    await mongoose.connect(MONGO_URI, {
      dbName: "indianway"
    });
    isConnected = true;
    console.log("MongoDB Connected SUCCESS");
  } catch (err) {
    console.log("MongoDB Error:", err.message);
  }
}

// har route se pehle call - TERA FEATURE
app.use(async (req, res, next) => {
  await connectDB();
  next();
});

// MULTER + CLOUDINARY SETUP - TERA FEATURE SAME
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'Indiani_way',
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp']
  }
});

const upload = multer({ storage });

// Security Middleware - TERA FEATURE SAME
function checkAdmin(req, res, next){
  const key = req.headers['x-admin-key'] || req.query.key;
  if(key === ADMIN_KEY) next();
  else res.status(403).json({ message: "Access Denied" });
}

// APIs - SAARE SAME HAI
app.get('/', (req,res) => res.send('Indiani Way Backend is Live!'));

app.get('/api/products', async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/products', checkAdmin, upload.single('image'), async (req, res) => {
  try {
    const { name, category, price, discountedPrice, description, isFeatured } = req.body;
    if(!name || !category || !price){
      return res.status(400).json({ error: "name, category, price required" });
    }
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
  } catch (err) { 
    console.log("SAVE ERROR:", err); 
    res.status(500).json({ error: err.message }); 
  }
});

app.put('/api/products/:id', checkAdmin, upload.single('image'), async (req, res) => {
  try {
    const { name, category, price, discountedPrice, description, isFeatured } = req.body;
    const updateData = { 
      name, 
      category: category.toLowerCase(), 
      price: Number(price), 
      discountedPrice: discountedPrice? Number(discountedPrice) : null, 
      description,
      isFeatured: isFeatured === 'true' || isFeatured === true
    };
    if(req.file) updateData.image = req.file.path;
    const updated = await Product.findByIdAndUpdate(req.params.id, updateData, { new: true });
    res.json(updated);
  } catch (err) { res.status(500).json(err); }
});

app.delete('/api/products/:id', checkAdmin, async (req, res) => {
  await Product.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted" });
});

// VERCEL KE LIYE FIX - TERA FEATURE SAME
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Backend: http://localhost:${PORT}`);
  });
}

module.exports = app;
