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

// Cloudinary Credentials Locked
cloudinary.config({
  cloud_name: 'dmtafwfxg',
  api_key: '183174449285855',
  api_secret: '7RORd5OHjwY3U6Z'
});

// Windows 7 Secure Storage Configuration
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'shiv_shakti_mart',
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp']
  }
});

const upload = multer({ storage: storage }).any();

// Secure Database Connection
const mongoURI = process.env.MONGO_URI || "mongodb+srv://Manglam9211:Manglam9211@cluster0.pnhpxpj.mongodb.net/shiv_shakti_mart?retryWrites=true&w=majority&appName=Cluster0";
mongoose.connect(mongoURI)
  .then(() => console.log("MongoDB Connected Safely!"))
  .catch(err => console.log("DB Connection Error: ", err));

// Database Schema
const productSchema = new mongoose.Schema({
  name: { type: String, default: 'Naya Saman' },
  price: { type: Number, default: 0 },
  costPrice: { type: Number, default: 0 },
  category: { type: String, default: 'General' },
  images: { type: [String], default: [] },
  image: { type: String, default: '' },
  clicks: { type: Number, default: 0 }
});
const Product = mongoose.model('Product', productSchema);

// Page Routes
app.get('/', (req, res) => res.render('index.html'));
app.get('/admin', (req, res) => res.render('admin.html'));

app.get('/api/ai-banner', (req, res) => {
  res.json({ text: "Welcome to Shiv Shakti Super Mart", active: false });
});

app.get('/api/products', async (req, res) => {
  try {
    const products = await Product.find({});
    res.json(products || []);
  } catch (e) { 
    res.status(200).json([]); 
  }
});

app.get('/api/ai-marketing/blast', async (req, res) => {
  try {
    const products = await Product.find({});
    if (!products || products.length === 0) return res.json({ success: false, text: "Stock khali hai." });
    const featured = products[0];
    const message = `AGRAHUNDA ME DHAMAKA OFFER!\n\nSaman: *${featured.name}*\nKhaas Rate: *₹${featured.price}*\n\n👉 https://shiv-shakti-super-mart.onrender.com`;
    res.json({ success: true, text: message });
  } catch (e) { res.json({ success: false, text: "Error" }); }
});

// 🚀 100% FIXED RAW POST ENGINE
app.post('/api/products', (req, res) => {
  upload(req, res, async function (err) {
    if (err) {
      return res.status(500).json({ error: true, message: "Multer upload failed" });
    }
    
    try {
      const { name, price, costPrice, category } = req.body;
      
      // Extract cloud links from incoming files safely
      let uploadedUrls = [];
      if (req.files && req.files.length > 0) {
        uploadedUrls = req.files.map(file => file.path);
      }

      const mainSingleImage = uploadedUrls.length > 0 ? uploadedUrls[0] : 'https://via.placeholder.com/150';

      const newProduct = new Product({
        name: name || "Naya Saman",
        price: Number(price) || 0,
        costPrice: Number(costPrice || 0),
        category: category || 'General',
        images: uploadedUrls,
        image: mainSingleImage,
        clicks: 0
      });
      
      await newProduct.save();
      return res.status(200).json({ success: true });
    } catch (error) {
      return res.status(500).json({ error: true, message: "Database save failed" });
    }
  });
});

app.delete('/api/products/:id', async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: true }); }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server live on port ${PORT}`));