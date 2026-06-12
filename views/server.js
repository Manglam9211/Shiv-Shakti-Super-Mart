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

// 🔐 KAL WALE TEENO CLOUD CODE (100% Locked & Working)
cloudinary.config({
  cloud_name: 'dmtafwfxg',
  api_key: '183174449285855',
  api_secret: '7RORd5OHjwY3U6Z'
});

// MULTIPLE IMAGES SAFE INTEGRATION ENGINE
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    return {
      folder: 'shiv_shakti_mart',
      format: 'jpg', // forces safe image formats
      public_id: file.originalname.split('.')[0] + '_' + Date.now()
    };
  }
});
const upload = multer({ storage: storage });

// Database Connection
const mongoURI = process.env.MONGO_URI || "mongodb+srv://Manglam9211:Manglam9211@cluster0.pnhpxpj.mongodb.net/shiv_shakti_mart?retryWrites=true&w=majority&appName=Cluster0";
mongoose.connect(mongoURI)
  .then(() => console.log("MongoDB Connected Safely!"))
  .catch(err => console.log("DB Connection Error: ", err));

// Secure Database Schema (Handles both Old and New items together)
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

// HTML Routes
app.get('/', (req, res) => res.render('index.html'));
app.get('/admin', (req, res) => res.render('admin.html'));

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
      `🔥 AGRAHUNDA ME DHAMAKA OFFER! 🔥\n\nGrahak bhaiyo dhyan do! Sabse zyada pasand kiya jaane wala maal ab bache hue stock me hai!`,
      `⚡ SHIV SHAKTI SUPER MART VIP DISCOUNT! ⚡\n\nPure Chitrakoot me ghum aao, aisa rate aur aisi solid quality kahi nahi milegi!`,
      `👑 AAJ KA SABSE BADA MAHA OFFER! 👑\n\nStock khatam hone wala hai, ek baar click karke photo dekhein aur jaldi order karein!`
    ];
    const randomLine = catchyLines[Math.floor(Math.random() * catchyLines.length)];

    const message = `${randomLine}\n\n📦 Saman: *${featured.name}*\n💰 Khaas Rate: *₹${featured.price}*\n\n👉 https://shiv-shakti-super-mart.onrender.com`;
    res.json({ success: true, text: message });
  } catch (e) { res.json({ success: false, text: "Error" }); }
});

// FIXED PRODUCT UPLOAD ROUTE WITH TRY-CATCH FAIL-SAFE
app.post('/api/products', upload.array('images', 5), async (req, res) => {
  try {
    const { name, price, costPrice, category } = req.body;
    
    // Safely extract paths from uploaded files
    const imageUrls = req.files && req.files.length > 0 ? req.files.map(file => file.path) : [];
    const fallbackImage = imageUrls.length > 0 ? imageUrls[0] : 'https://via.placeholder.com/150';

    const newProduct = new Product({
      name: name,
      price: Number(price),
      costPrice: Number(costPrice || 0),
      category: category || 'General',
      images: imageUrls,
      image: fallbackImage
    });
    
    await newProduct.save();
    res.redirect('/admin?status=success');
  } catch (error) {
    console.error("Upload Error Tracked: ", error);
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
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: true }); }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server blasting live on port ${PORT}`));