const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'views'));

// 🔑 CLOUDINARY CONFIGURATION (Apki Real Chabiyan Yahan Match Kar Di Hain)
cloudinary.config({ 
  cloud_name: 'dmtafwfxg', 
  api_key: '183174449285855', 
  api_secret: '7RORd5OHj-uBmG72qAs5YqeTac8' 
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'shakti_mart_gallery',
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
  },
});
const upload = multer({ storage: storage });

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  costPrice: { type: Number, default: 0 },
  description: String,
  category: { type: String, default: 'General' },
  image: String,
  clicks: { type: Number, default: 0 }
});
const Product = mongoose.model('Product', productSchema);

const bannerSchema = new mongoose.Schema({
  text: { type: String, default: '✨ Welcome to Shiv Shakti Super Mart ✨' },
  active: { type: Boolean, default: true }
});
const Banner = mongoose.model('Banner', bannerSchema);

app.get('/', (req, res) => { res.sendFile(path.join(__dirname, 'views', 'index.html')); });
app.get('/admin', (req, res) => { res.sendFile(path.join(__dirname, 'views', 'admin.html')); });

app.get('/api/products', async (req, res) => {
  try { res.json(await Product.find({})); } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/products', upload.single('image'), async (req, res) => {
  try {
    const { name, price, costPrice, description, category } = req.body;
    const imageUrl = req.file ? req.file.path : 'https://via.placeholder.com/150';
    const newProduct = new Product({ name, price, costPrice: costPrice || 0, description, category, image: imageUrl });
    await newProduct.save();
    res.status(201).json({ success: true, product: newProduct });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/products/:id', async (req, res) => {
  try { await Product.findByIdAndDelete(req.params.id); res.json({ success: true }); } 
  catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/products/click/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) { product.clicks = (product.clicks || 0) + 1; await product.save(); res.json({ success: true }); } 
    else { res.status(404).json({ error: "Not found" }); }
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/ai-banner', async (req, res) => {
  let banner = await Banner.findOne({}); if(!banner) { banner = new Banner(); await banner.save(); }
  res.json(banner);
});

app.post('/api/ai-banner', async (req, res) => {
  const { text, active } = req.body;
  let banner = await Banner.findOne({}); if(!banner) { banner = new Banner(); }
  banner.text = text; banner.active = active; await banner.save();
  res.json({ success: true });
});

// 🤖 PURE HINGLISH AUTO MARKETING ENGINE FOR WHATSAPP BLAST
app.get('/api/ai-whatsapp-blast', async (req, res) => {
  try {
    const topProduct = await Product.findOne({}).sort({ clicks: -1 });
    if(!topProduct) return res.status(404).json({ success: false });

    const customHinglishAd = `✨ SHIV SHAKTI SUPER MART - AGRAHUNDA ✨\n\n` +
      `🔥 AA GAYA SABSE BADA DHAMAKA OFFER! 🔥\n\n` +
      `Hamari dukan par sabse jyada pasand kiya jaane wala item *${topProduct.name}* ab mil raha hai ekdum saste rate me!\n\n` +
      `💰 *Special Sale Price:* sirf ₹${topProduct.price}/-\n` +
      `ℹ️ *Details:* ${topProduct.description || 'Premium quality ka naya saman.'}\n\n` +
      `🏃‍♂️ Stock bahut limited hai aur demand bahut high hai! Jaldi karein, kahi mauka nikal na jaye.\n\n` +
      `👇 Niche diye link par click karke abhi apna order WhatsApp par book karein:\n` +
      `🌐 https://shiv-shakti-super-mart.onrender.com \n\n` +
      `📞 Direct Call ke liye: *9450222868*`;

    res.json({ success: true, message: customHinglishAd });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://admin:admin@cluster.mongodb.net/shakti_mart";
mongoose.connect(MONGO_URI)
  .then(() => {
    console.log("🟢 Shiv Shakti AI Database Connected Permanently!");
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => console.log(`🚀 Server on port ${PORT}`));
  })
  .catch(err => console.log(err));