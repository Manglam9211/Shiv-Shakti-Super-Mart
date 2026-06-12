const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const path = require('path');

const app = express();

// 50MB Highway locked for High-Quality Mobile Uploads
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(express.static('public'));

app.set('views', path.join(__dirname, 'views'));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

// Cloudinary Direct Config
cloudinary.config({
  cloud_name: 'dmtafwfxg',
  api_key: '183174449285855',
  api_secret: '7RORd5OHjwY3U6Z'
});

// Bridge Storage Routing Setup
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'shiv_shakti_fresh_zone',
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp']
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 30 * 1024 * 1024 }
}).any();

// MongoDB Connection with FRESH COLLECTION MAP to bypass old empty records
const mongoURI = process.env.MONGO_URI || "mongodb+srv://Manglam9211:Manglam9211@cluster0.pnhpxpj.mongodb.net/shiv_shakti_mart?retryWrites=true&w=majority&appName=Cluster0";
mongoose.connect(mongoURI)
  .then(() => console.log("Database Sync Connection Live on Fresh Collection Engine"))
  .catch(err => console.log("Database Sync Error: ", err));

// Database Model Scheme - Locked strict formatting rule maps
const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  costPrice: { type: Number, default: 0 },
  category: { type: String, default: 'General' },
  description: { type: String, default: '' },
  images: { type: [String], default: [] },
  image: { type: String, default: '' },
  clicks: { type: Number, default: 0 }
}, { collection: 'active_shiv_shakti_stock' }); // ? FRESH COLLECTION TO BYPASS OLD BLANK DATA
const Product = mongoose.model('Product', productSchema);

// universal Frontend Pages Routes
app.get('/', (req, res) => res.render('index.html'));
app.get('/admin', (req, res) => res.render('admin.html'));

// AI FEATURE 1: DYNAMIC BANNER SYNC
app.get('/api/ai-banner', (req, res) => {
  res.json({ text: "Welcome to Shiv Shakti Super Mart", active: false });
});

app.get('/api/products', async (req, res) => {
  try {
    const products = await Product.find({}).sort({ _id: -1 });
    res.json(products || []);
  } catch (e) { res.status(200).json([]); }
});

// AI FEATURE 2: WHATSAPP BLAST LOGIC
app.get('/api/ai-marketing/blast', async (req, res) => {
  try {
    const products = await Product.find({});
    if (!products || products.length === 0) return res.json({ success: false, text: "Stock khali hai." });
    const featured = products[0];
    const message = `AGRAHUNDA ME DHAMAKA OFFER!\n\nSaman: *${featured.name}*\nKhaas Rate: *?${featured.price}*\n\n?? https://shiv-shakti-super-mart.onrender.com`;
    res.json({ success: true, text: message });
  } catch (e) { res.json({ success: false, text: "Error" }); }
});

// BULLETPROOF MULTIPART SAVE TUNNEL
app.post('/api/products', (req, res) => {
  upload(req, res, async function (err) {
    if (err) {
      console.error(err);
      return res.status(500).json({ success: false, message: "Upload stream failed" });
    }
    
    try {
      const { name, price, costPrice, category, description } = req.body;
      
      // Stop execution if core values are missing
      if(!name || !price) {
        return res.status(400).json({ success: false, message: "Name and Price required" });
      }

      let uploadedUrls = [];
      if (req.files && req.files.length > 0) {
        uploadedUrls = req.files.map(file => file.path);
      }

      const backupMainImage = uploadedUrls.length > 0 ? uploadedUrls[0] : 'https://via.placeholder.com/150';

      const newProduct = new Product({
        name: name,
        price: Number(price),
        costPrice: Number(costPrice || 0),
        category: category || 'General',
        description: description || '',
        images: uploadedUrls,
        image: backupMainImage,
        clicks: 0
      });
      
      await newProduct.save();
      return res.status(200).json({ success: true });
    } catch (error) {
      console.error(error);
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