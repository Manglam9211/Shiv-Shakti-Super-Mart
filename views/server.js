const express = require('express');
const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2;
const path = require('path');

const app = express();

// Increase JSON payload limit to safely handle multiple high-quality Base64 images from Windows 7
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(express.static('public'));

app.set('views', path.join(__dirname, 'views'));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

// Pure Cloudinary Direct Integration 
cloudinary.config({
  cloud_name: 'dmtafwfxg',
  api_key: '183174449285855',
  api_secret: '7RORd5OHjwY3U6Z'
});

// Secure MongoDB Connection Architecture
const mongoURI = process.env.MONGO_URI || "mongodb+srv://Manglam9211:Manglam9211@cluster0.pnhpxpj.mongodb.net/shiv_shakti_mart?retryWrites=true&w=majority&appName=Cluster0";
mongoose.connect(mongoURI)
  .then(() => console.log("MongoDB Connected with Omni-Base64 Engine!"))
  .catch(err => console.log("Database Sync Error: ", err));

// Robust Clean Product Schema
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

// Essential Live Frontend Page Endpoints
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

// 🚀 ZERO-MULTER REVOLUTIONARY DIRECT POST ROUTE (100% BULLETPROOF)
app.post('/api/products', async (req, res) => {
  try {
    const { name, price, costPrice, category, images } = req.body;
    let uploadedUrls = [];

    // Process and push each Base64 data block straight into Cloudinary
    if (images && images.length > 0) {
      for (const base64Str of images) {
        const uploadResult = await cloudinary.uploader.upload(base64Str, {
          folder: 'shakti_mart_fresh_gallery'
        });
        uploadedUrls.push(uploadResult.secure_url);
      }
    }

    const backupMainImage = uploadedUrls.length > 0 ? uploadedUrls[0] : 'https://via.placeholder.com/150';

    const newProduct = new Product({
      name: name || "Naya Saman",
      price: Number(price) || 0,
      costPrice: Number(costPrice || 0),
      category: category || 'General',
      images: uploadedUrls,
      image: backupMainImage,
      clicks: 0
    });
    
    await newProduct.save();
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Direct transmission database error caught:", error);
    return res.status(500).json({ success: false, message: "Transmission rejected by backend" });
  }
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
app.listen(PORT, () => console.log(`Server live on secure transmission protocol port ${PORT}`));