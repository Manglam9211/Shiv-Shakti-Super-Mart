const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const path = require('path');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/public', express.static(path.join(__dirname, 'public')));

app.set('views', path.join(__dirname, 'views'));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

// 📸 इंटरनेट स्पेशल: 6-7 भारी फोटो एक साथ संभालने के लिए लाइव क्लाउड कॉन्फ़िगरेशन
cloudinary.config({
  cloud_name: 'dl93m9v8p',
  api_key: '557766528731118',
  api_secret: 'V9P05Cnd32Q-89wYQkY9KxRsm8M'
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'shiv_shakti_mart_products',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 800, quality: 'auto:good' }] // 🧠 ऑटो-कंप्रेसर: फोटो भारी होने पर भी सर्वर क्रैश नहीं होगा
  }
});

const upload = multer({ storage: storage });

mongoose.connect("mongodb+srv://Manglam9211:Manglam9211@cluster0.pnhpxpj.mongodb.net/shiv_shakti_mart?retryWrites=true&w=majority&appName=Cluster0")
  .then(() => console.log("Database Synced Successfully"))
  .catch(err => console.log(err));

// डेटाबेस मॉडल (क्लिक्स और व्यूज दोनों बिल्कुल अलग तिजोरी में)
const productSchema = new mongoose.Schema({
  name: String,
  price: Number,
  costPrice: Number,
  category: String,
  description: String,
  images: [String],
  clicks: { type: Number, default: 0 },      
  viewsCount: { type: Number, default: 0 }  
});
const Product = mongoose.model('Product', productSchema);

const bannerSchema = new mongoose.Schema({
  text: { type: String, default: "AGRAHUNDA SUPER DEAL: Kam daam me sabsetop item!" }
});
const Banner = mongoose.model('Banner', bannerSchema);

app.get('/', (req, res) => res.render('index.html'));
app.get('/admin', (req, res) => res.render('admin.html'));

app.get('/api/ai-banner', async (req, res) => {
  try {
    let banner = await Banner.findOne({});
    if(!banner) { banner = new Banner(); await banner.save(); }
    res.json(banner);
  } catch(e) { res.json({ text: "Welcome to Shiv Shakti Super Mart" }); }
});

app.post('/api/ai-banner', async (req, res) => {
  try {
    await Banner.findOneAndUpdate({}, { text: req.body.text }, { upsert: true });
    res.json({ success: true });
  } catch(e) { res.status(500).json({ success: false }); }
});

app.get('/api/products', async (req, res) => {
  try {
    const products = await Product.find({}).sort({ _id: -1 });
    res.json(products);
  } catch (e) { res.status(500).json([]); }
});

// व्यू काउंटर रूट
app.post('/api/products/:id/view', async (req, res) => {
  try {
    await Product.findByIdAndUpdate(req.params.id, { $inc: { viewsCount: 1 } });
    res.json({ success: true });
  } catch (e) { res.status(500).json({ success: false }); }
});

// व्हाट्सएप्प मुनाफा क्लिक रूट
app.post('/api/products/:id/click', async (req, res) => {
  try {
    await Product.findByIdAndUpdate(req.params.id, { $inc: { clicks: 1 } });
    res.json({ success: true });
  } catch (e) { res.status(500).json({ success: false }); }
});

// 🚀 क्लाउड पर सीधे 7 फोटो सुरक्षित चढ़ाने का इंजन
app.post('/api/products', upload.array('photo', 7), async (req, res) => {
  try {
    const { name, price, costPrice, category, description } = req.body;
    let imageUrls = [];
    
    if (req.files && req.files.length > 0) {
      imageUrls = req.files.map(file => file.path); // क्लाउडिनरी का सीधा लिंक
    } else {
      imageUrls = ['https://via.placeholder.com/600'];
    }

    const newProduct = new Product({
      name, price: Number(price), costPrice: Number(costPrice),
      category, description, images: imageUrls, clicks: 0, viewsCount: 0
    });
    await newProduct.save();
    res.json({ success: true });
  } catch (error) { 
    console.log(error);
    res.status(500).json({ success: false }); 
  }
});

app.delete('/api/products/:id', async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: true }); }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server live on port ${PORT}`));
