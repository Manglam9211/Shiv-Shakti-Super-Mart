const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.set('views', path.join(__dirname, 'views'));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

// Cloudinary Configuration
cloudinary.config({
  cloud_name: 'dmtafwfxg',
  api_key: '183174449285855',
  api_secret: '7RORd5OHjwY3U6Z'
});

// Image Storage Engine
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'shiv_shakti_mart',
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp']
  }
});
const upload = multer({ storage: storage });

// Database Connection
const mongoURI = process.env.MONGO_URI || "mongodb+srv://Manglam9211:Manglam9211@cluster0.pnhpxpj.mongodb.net/shiv_shakti_mart?retryWrites=true&w=majority&appName=Cluster0";
mongoose.connect(mongoURI)
  .then(() => console.log("MongoDB Connected Safely!"))
  .catch(err => console.log("DB Connection Error: ", err));

// Database Schema Setup
const productSchema = new mongoose.Schema({
  name: String,
  price: Number,
  costPrice: Number,
  category: String,
  images: { type: [String], default: [] },
  image: { type: String, default: '' },
  clicks: { type: Number, default: 0 }
});
const Product = mongoose.model('Product', productSchema);

const bannerSchema = new mongoose.Schema({
  text: { type: String, default: "✨ Welcome to Shiv Shakti Super Mart ✨" },
  active: { type: Boolean, default: false }
});
const Banner = mongoose.model('Banner', bannerSchema);

// Frontend Routes
app.get('/', (req, res) => res.render('index.html'));
app.get('/admin', (req, res) => res.render('admin.html'));

app.get('/api/ai-banner', async (req, res) => {
  let banner = await Banner.findOne();
  if (!banner) banner = await Banner.create({});
  res.json(banner);
});

app.get('/api/products', async (req, res) => {
  try {
    const products = await Product.find({});
    res.json(products);
  } catch (e) { res.status(500).json([]); }
});

// AI Marketing Hinglish Blast Generator Route
app.get('/api/ai-marketing/blast', async (req, res) => {
  try {
    const products = await Product.find({});
    if (!products || products.length === 0) return res.json({ success: false, text: "Stock khali hai." });

    const sorted = [...products].sort((a,b) => b.clicks - a.clicks);
    const featured = sorted[0];

    const catchyLines = [
      `\uD83D\uDD25 AGRAHUNDA ME DHAMAKA OFFER! \uD83D\uDD25\n\nGrahak bhaiyo dhyan do! Sabse zyada pasand kiya jaane wala maal ab bache hue stock me hai!`,
      `\u26A1 SHIV SHAKTI SUPER MART VIP DISCOUNT! \u26A1\n\nPure Chitrakoot me ghum aao, aisa rate aur aisi solid quality kahi nahi milegi, Shiv Shakti ki guarantee hai!`,
      `\uD83D\uDC51 AAJ KA SABSE BADA MAHA OFFER! \uD83D\uDC51\n\nBina deri kiye turant dekhein! Ye item dukan par sabse tez bik raha hai, stock khatam hone wala hai!`
    ];
    const randomLine = catchyLines[Math.floor(Math.random() * catchyLines.length)];

    const message = `${randomLine}\n\n📦 Saman: *${featured.name}*\n💰 Khaas Rate: *₹${featured.price}* bacha ke!\n\n⏳ AI Alert: Sirf thoda sa piece bacha hai! Niche diye link par click karke photo dekhein aur turant order book karein 👇\n👉 https://shiv-shakti-super-mart.onrender.com`;
    res.json({ success: true, text: message });
  } catch (e) { res.json({ success: false, text: "Error" }); }
});

// Product Upload Secure Route
app.post('/api/products', upload.array('images', 5), async (req, res) => {
  try {
    const { name, price, costPrice, category } = req.body;
    const imageUrls = req.files ? req.files.map(file => file.path) : [];

    const newProduct = new Product({
      name: name,
      price: Number(price),
      costPrice: Number(costPrice || 0),
      category: category || 'General',
      images: imageUrls,
      image: imageUrls.length > 0 ? imageUrls[0] : 'https://via.placeholder.com/150'
    });
    
    await newProduct.save();
    res.redirect('/admin?status=success');
  } catch (error) {
    res.redirect('/admin?status=error');
  }
});

// Delete Product Route
app.delete('/api/products/:id', async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: true }); }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server blasting live on port ${PORT}`));