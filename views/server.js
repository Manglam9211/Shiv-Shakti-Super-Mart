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

// Cloudinary Credentials Configuration
cloudinary.config({
  cloud_name: 'dmtafwfxg',
  api_key: '183174449285855',
  api_secret: '7RORd5OHjwY3U6Z'
});

// Cloudinary Storage Bridge
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'shiv_shakti_fresh_zone',
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp']
  }
});

const upload = multer({ storage: storage }).any();

// MongoDB Connection Engine
const mongoURI = process.env.MONGO_URI || "mongodb+srv://Manglam9211:Manglam9211@cluster0.pnhpxpj.mongodb.net/shiv_shakti_mart?retryWrites=true&w=majority&appName=Cluster0";
mongoose.connect(mongoURI)
  .then(() => console.log("Database Sync Connection Live"))
  .catch(err => console.log("Database Sync Error: ", err));

// FIXED SCHEMA LAYOUT: Restored Description field safely
const productSchema = new mongoose.Schema({
  name: { type: String, default: 'Naya Saman' },
  price: { type: Number, default: 0 },
  costPrice: { type: Number, default: 0 },
  category: { type: String, default: 'General' },
  description: { type: String, default: '' }, // Restored field mapping
  images: { type: [String], default: [] },
  image: { type: String, default: '' },
  clicks: { type: Number, default: 0 }
});
const Product = mongoose.model('Product', productSchema);

// Frontend Pages Routes
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

// 🚀 FIXED UPLOAD TUNNEL: SYNCED DUAL IMAGE KEYS AND DESCRIPTION INPUT
app.post('/api/products', (req, res) => {
  upload(req, res, async function (err) {
    if (err) {
      console.error("Multer capture breakdown caught:", err);
      return res.status(500).json({ success: false, message: "Upload stream broken" });
    }
    
    try {
      const { name, price, costPrice, category, description } = req.body;
      let uploadedUrls = [];
      
      if (req.files && req.files.length > 0) {
        uploadedUrls = req.files.map(file => file.path);
      }

      const backupMainImage = uploadedUrls.length > 0 ? uploadedUrls[0] : 'https://via.placeholder.com/150';

      const newProduct = new Product({
        name: name || "Naya Saman",
        price: Number(price) || 0,
        costPrice: Number(costPrice || 0),
        category: category || 'General',
        description: description || '', // Description saved successfully
        images: uploadedUrls,            // Array sync fixed
        image: backupMainImage,          // Direct thumb key fixed
        clicks: 0
      });
      
      await newProduct.save();
      return res.status(200).json({ success: true });
    } catch (error) {
      console.error("Database saving error:", error);
      return res.status(500).json({ success: false, message: "Database failure" });
    }
  });
});

app.post('/api/products/click/:id', async (req, res) => {
  try {
    await Product.findByIdAndUpdate(req.params.id, { $inc: { clicks: 1 } });
    res.json({ success: true });
  } catch (e) { res.json({ success: false }); }
});

app.delete('/api/products/:id', async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: true }); }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server live on port ${PORT}`));