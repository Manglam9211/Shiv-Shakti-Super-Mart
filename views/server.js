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

// Cloudinary Credentials
cloudinary.config({
  cloud_name: 'dmtafwfxg',
  api_key: '183174449285855',
  api_secret: '7RORd5OHjwY3U6Z'
});

// Setup Multiple Images Storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'shiv_shakti_mart',
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp']
  }
});
const upload = multer({ storage: storage });

// Database URI Connection
const mongoURI = process.env.MONGO_URI || "mongodb+srv://Manglam9211:Manglam9211@cluster0.pnhpxpj.mongodb.net/shiv_shakti_mart?retryWrites=true&w=majority&appName=Cluster0";
mongoose.connect(mongoURI)
  .then(() => console.log("MongoDB Connected Safely!"))
  .catch(err => console.log("DB Connection Error: ", err));

// Product Schema
const productSchema = new mongoose.Schema({
  name: String,
  price: Number,
  costPrice: Number,
  category: String,
  images: [String],
  clicks: { type: Number, default: 0 }
});
const Product = mongoose.model('Product', productSchema);

const bannerSchema = new mongoose.Schema({
  text: { type: String, default: "✨ Welcome to Shiv Shakti Super Mart ✨" },
  active: { type: Boolean, default: false }
});
const Banner = mongoose.model('Banner', bannerSchema);

// HTML Routes
app.get('/', (req, res) => res.render('index.html'));
app.get('/admin', (req, res) => res.render('admin.html'));

// API Routes
app.get('/api/ai-banner', async (req, res) => {
  let banner = await Banner.findOne();
  if (!banner) banner = await Banner.create({});
  res.json(banner);
});

app.post('/api/ai-banner', async (req, res) => {
  const { text, active } = req.body;
  let banner = await Banner.findOne();
  if (!banner) banner = new Banner();
  banner.text = text;
  banner.active = active;
  await banner.save();
  res.json({ success: true });
});

app.get('/api/products', async (req, res) => {
  const products = await Product.find({});
  res.json(products);
});

// 🤖 🔥 ULTRA ADVANCED HINGLISH AI MARKETING ENGINE (Pure Desi Advertising)
app.get('/api/ai-marketing/blast', async (req, res) => {
  try {
    const products = await Product.find({});
    if (products.length === 0) return res.json({ message: "Dukan me koi saman nahi hai." });

    // Pick the most popular product or random
    const sorted = [...products].sort((a,b) => b.clicks - a.clicks);
    const featured = sorted[0];

    // 💥 100% Hinglish Mind-Blowing Catchy Lines
    const catchyLines = [
      `🔥 AGRAHUNDA ME DHAMAKA OFFER! 🔥\n\nGrahak bhaiyo dhyan do! Sabse zyada pasand kiya jaane wala maal ab bache hue stock me hai!`,
      `⚡ SHIV SHAKTI SUPER MART VIP DISCOUNT! ⚡\n\nPure Chitrakoot me ghum aao, aisa rate aur aisi solid quality kahi nahi milegi, Shiv Shakti ki guarantee hai!`,
      `👑 AAJ KA SABSE BADA MAHA OFFER! 👑\n\nBina deri kiye turant dekhein! Ye item dukan par sabse tez bik raha hai, stock khatam hone wala hai!`
    ];
    const randomLine = catchyLines[Math.floor(Math.random() * catchyLines.length)];

    // Fully personalized Hinglish message combination
    const message = `${randomLine}\n\n📦 Saman: *${featured.name}*\n💰 Khaas Rate: *₹${featured.price}* bacha ke!\n\n⏳ AI Alert: Sirf thoda sa piece bacha hai! Niche diye link par click karke photo dekhein aur turant order book karein 👇\n👉 https://shiv-shakti-super-mart.onrender.com`;
    
    res.json({ success: true, text: message });
  } catch (e) { res.status(500).json({ error: true }); }
});

app.post('/api/products', upload.array('images', 5), async (req, res) => {
  try {
    const { name, price, costPrice, category } = req.body;
    const imageUrls = req.files ? req.files.map(file => file.path) : [];
    
    const newProduct = new Product({
      name,
      price: Number(price),
      costPrice: Number(costPrice || 0),
      category: category || 'General',
      images: imageUrls.length > 0 ? imageUrls : ['https://via.placeholder.com/150']
    });
    
    await newProduct.save();
    res.redirect('/admin?status=success');
  } catch (error) {
    res.redirect('/admin?status=error');
  }
});

app.post('/api/products/click/:id', async (req, res) => {
  try {
    await Product.findByIdAndUpdate(req.params.id, { $inc: { clicks: 1 } });
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: true }); }
});

app.delete('/api/products/:id', async (req, res) => {
  await Product.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server blasting live on port ${PORT}`));