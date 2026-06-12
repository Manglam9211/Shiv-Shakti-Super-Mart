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

// Cloudinary Configuration Locked
cloudinary.config({
  cloud_name: 'dmtafwfxg',
  api_key: '183174449285855',
  api_secret: '7RORd5OHjwY3U6Z'
});

// Windows 7 Safe Storage Configuration
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'shiv_shakti_mart',
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp']
  }
});

// BULLETPROOF: .any() accepts ALL form field names without "Unexpected field" error
const upload = multer({ storage: storage }).any();

// Database Connection
const mongoURI = process.env.MONGO_URI || "mongodb+srv://Manglam9211:Manglam9211@cluster0.pnhpxpj.mongodb.net/shiv_shakti_mart?retryWrites=true&w=majority&appName=Cluster0";
mongoose.connect(mongoURI)
  .then(() => console.log("MongoDB Connected Safely!"))
  .catch(err => console.log("DB Connection Error: ", err));

// Database Schemas
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
  text: { type: String, default: "Welcome to Shiv Shakti Super Mart" },
  active: { type: Boolean, default: false }
});
const Banner = mongoose.model('Banner', bannerSchema);

// Page Routes
app.get('/', (req, res) => res.render('index.html'));
app.get('/admin', (req, res) => res.render('admin.html'));

app.get('/api/ai-banner', async (req, res) => {
  try {
    let banner = await Banner.findOne();
    if (!banner) banner = await Banner.create({ text: "Welcome to Shiv Shakti Super Mart", active: false });
    res.json(banner);
  } catch (e) { 
    res.json({ text: "Welcome to Shiv Shakti Super Mart", active: false }); 
  }
});

app.get('/api/products', async (req, res) => {
  try {
    const products = await Product.find({});
    res.json(products || []);
  } catch (e) { 
    res.status(200).json([]); 
  }
});

// AI Marketing Blast Route
app.get('/api/ai-marketing/blast', async (req, res) => {
  try {
    const products = await Product.find({});
    if (!products || products.length === 0) return res.json({ success: false, text: "Stock khali hai." });

    const sorted = [...products].sort((a,b) => b.clicks - a.clicks);
    const featured = sorted[0];

    const message = `AGRAHUNDA ME DHAMAKA OFFER!\n\nSaman: *${featured.name}*\nKhaas Rate: *₹${featured.price}*\n\n👉 https://shiv-shakti-super-mart.onrender.com`;
    res.json({ success: true, text: message });
  } catch (e) { res.json({ success: false, text: "Error" }); }
});

// 🚀 FIXED UPLOAD ROUTE WITH ANY FIELD LOGIC
app.post('/api/products', (req, res) => {
  upload(req, res, async function (err) {
    if (err) {
      console.error("Multer file catch error:", err);
      return res.redirect('/admin?status=error');
    }
    
    try {
      const { name, price, costPrice, category } = req.body;
      
      // Collect all files regardless of field name (images or image)
      let imageUrls = [];
      if (req.files && req.files.length > 0) {
        imageUrls = req.files.map(file => file.path);
      }

      const newProduct = new Product({
        name: name || "Naya Saman",
        price: Number(price) || 0,
        costPrice: Number(costPrice || 0),
        category: category || 'General',
        images: imageUrls,
        image: imageUrls.length > 0 ? imageUrls[0] : 'https://via.placeholder.com/150'
      });
      
      await newProduct.save();
      res.redirect('/admin?status=success');
    } catch (error) {
      console.error("Database save error:", error);
      res.redirect('/admin?status=error');
    }
  });
});

// Delete Product Route
app.delete('/api/products/:id', async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: true }); }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server live on port ${PORT}`));