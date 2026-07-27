const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const fs = require('fs');
require('dotenv').config();

console.log("URI check:", process.env.atlas_URI);

// require('dotenv').config({ path: __dirname + '/.env' });
// console.log("ENV CHECK:", process.env.atlas_URL ? "URL missing"  : "URL found"); 

const Product = require('./models/product');

const app = express();
const PORT = process.env.PORT || 5000;
const ADMIN_KEY = process.env.ADMIN_KEY || "INDIANI@2025";

app.use(cors());
app.use(express.json());

// CLOUDINARY CONFIG
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});


// Image folder banao agar nahi hai
if (!fs.existsSync('uploads')) fs.mkdirSync('uploads');
app.use('/uploads', express.static('uploads'));


// Frontend serve karo - backend se ek folder bahar
app.use(express.static(path.join(__dirname, '../Frontend')));
app.use(express.static(__dirname)); // admin.html ke liye


// MongoDB Connect
mongoose.connect(process.env.atlas_URI)
 .then(() => console.log("MongoDB Connected "))
 .catch(err => console.log("MongoDB Error:", err));

// MULTER + CLOUDINARY SETUP - YAHI MAIN CHANGE HAI
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'Indiani_way', // Cloudinary me is naam se folder banega
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp']
  }
});

// Multer setup - image kaha save hogi
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => cb(null, 'uploads/'),
//   filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
// }); local host me save krne ke liye without deployment

const upload = multer({ storage });

// Security Middleware
function checkAdmin(req, res, next){
  const key = req.headers['x-admin-key'] || req.query.key;
  if(key === ADMIN_KEY) next();
  else res.status(403).json({ message: "Access Denied - Wrong key" });
}

// === APIs ===

// 1. Public - sab products dikhao
app.get('/api/products', async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Private - Add product
app.post('/api/products', checkAdmin, upload.single('image'), async (req, res) => {
  try {
    console.log("BODY AAYA:", req.body); // debug ke liye
    const { name, category, price, discountedPrice, description, isFeatured } = req.body;
    if(!name || !category || !price){
      return res.status(400).json({ error: "name, category, price required" });
    }
    
    const newProduct = new Product({
      name: name.trim(),
      category: category.trim().toLowerCase(), // yaha se hi category fix hogi
      price: Number(price),
      discountedPrice: discountedPrice ? Number(discountedPrice) : null,
      description: description || "",
      image: req.file ? req.file.filename : 'no-image.jpg',
      isFeatured: isFeatured === 'true' || isFeatured === true
    });
    
    await newProduct.save();
    console.log("SAVED:", newProduct.name);
    res.json({ message: "Product Added", product: newProduct });
  } catch (err) { 
    console.log("SAVE ERROR:", err); 
    res.status(500).json({ error: err.message }); 
  }
});

// 3. Private PUT - Update product
app.put('/api/products/:id', checkAdmin, upload.single('image'), async (req, res) => {
  try {
    const { name, category, price, discountedPrice, description, isFeatured } = req.body;
      if(!name || !category || !price){
      return res.status(400).json({ error: "name, category, price required" });
    }
    const updateData = { 
      name, 
      category: category.toLowerCase(), 
      price: Number(price), 
      discountedPrice: discountedPrice? Number(discountedPrice) : null, 
      description,
      isFeatured: isFeatured === 'true' || isFeatured === true
    };
    if(req.file) updateData.image = req.file.filename;
    const updated = await Product.findByIdAndUpdate(req.params.id, updateData, { new: true });
    res.json(updated);
  } catch (err) { res.status(500).json(err); }
});

// 4. Private - Delete product
app.delete('/api/products/:id', checkAdmin, async (req, res) => {
  await Product.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted" });
});

app.listen(PORT, () => {
  console.log(`Backend: http://localhost:${PORT}`);
  console.log(`Admin Link: http://localhost:${PORT}/admin.html?key=${ADMIN_KEY}`);
});