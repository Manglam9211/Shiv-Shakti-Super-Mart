const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const path = require('path');

const app = express();

// FLIPKART ARCHITECTURE: Unlocked 50MB Payload limits for high-resolution images
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(express.static('public'));

app.set('views', path.join(__dirname, 'views'));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

// Cloudinary Main Node Configuration
cloudinary.config({
  cloud_name: 'dmtafwfxg',
  api_key: '183174449285855',
  api_secret: '7RORd5OHjwY3U6Z'
});

// Cloudinary Multipart Storage Rules Engine
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'shiv_shakti_fresh_zone',
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp']
  }
});

// Multiplex stream handler for multi-angle pictures
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 25 * 1024 * 1024 } // Safe 25MB per file capacity
}).any();

// MongoDB Core Connection Block
const mongoURI = process.env.MONGO_URI || "mongodb+srv://Manglam9211:Manglam9211@cluster0.pnhpxpj.mongodb.net/shiv_shakti_mart?retryWrites=true&w=majority&appName=Cluster0";
mongoose.connect(mongoURI)
  .then(() => console.log("Database Sync Active with Flipkart Style Schema Model"))
  .catch(err => console.log("Database Connection Error: ", err));

// STRICT DATA MODEL SCHEMATICS (Tied with Front-end Multi-images array)
const productSchema = new mongoose.Schema({
  name: { type: String, default: 'Naya Saman' },
  price: { type: Number, default: 0 },
  costPrice: { type: Number, default: 0 },
  category: { type: String, default: 'General' },
  description: { type: String, default: '' },
  images: { type: [String], default: [] }, // Array for 5-6 heavy images
  image: { type: String, default: '' },   // Main primary thumbnail reference
  clicks: { type: Number, default: 0 }
});
const Product = mongoose.model('Product', productSchema);

// Universal System Route Dispatches
app.get('/', (req, res) => res.render('index.html'));
app.get('/admin', (req, res) => res.render('admin.html'));

// ?? AI ENGINE ROOT 1: DYNAMIC BANNER CONTEXT STRIP
app.get('/api/ai-banner', (req, res) => {
  res.json({ text: "Welcome to Shiv Shakti Super Mart", active: false });
});

// Fetch product stock listings ordered by newest entries
app.get('/api/products', async (req, res) => {
  try {
    const products = await Product.find({}).sort({ _id: -1 });
    res.json(products || []);
  } catch (e) { 
    res.status(200).json([]); 
  }
});

// ?? AI ENGINE ROOT 2: AUTOMATED MARKETING TARGETED BLAST
app.get('/api/ai-marketing/blast', async (req, res) => {
  try {
    const products = await Product.find({});
    if (!products || products.length === 0) return res.json({ success: false, text: "Stock khali hai." });
    const featured = products[0];
    const message = `AGRAHUNDA ME DHAMAKA OFFER!\n\nSaman: *${featured.name}*\nKhaas Rate: *?${featured.price}*\n\n?? https://shiv-shakti-super-mart.onrender.com`;
    res.json({ success: true, text: message });
  } catch (e) { res.json({ success: false, text: "Error" }); }
});

// STABLE BULLETPROOF UPLOAD TRACKER PIPELINE
app.post('/api/products', (req, res) => {
  upload(req, res, async function (err) {
    if (err) {
      console.error("Multer buffer routing failure:", err);
      return res.status(500).json({ success: false, message: "Upload stream failed" });
    }
    try {
      const { name, price, costPrice, category, description } = req.body;
      let uploadedUrls = [];
      
      // Map multiple images array securely matching any input files stream
      if (req.files && req.files.length > 0) {
        uploadedUrls = req.files.map(file => file.path);
      }

      const backupMainImage = uploadedUrls.length > 0 ? uploadedUrls[0] : 'https://via.placeholder.com/150';

      const newProduct = new Product({
        name: name || "Naya Saman",
        price: Number(price) || 0,
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
      console.error("Database structural validation failure:", error);
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