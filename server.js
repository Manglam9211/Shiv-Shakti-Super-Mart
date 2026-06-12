const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const path = require('path');

const app = express();

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(express.static('public'));

app.set('views', path.join(__dirname, 'views'));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

// ⚡ STRICT ENV LINKING FIXED
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dmtafwfxg',
  api_key: process.env.CLOUDINARY_API_KEY || '183174449285855',
  api_secret: process.env.CLOUDINARY_API_SECRET || '7RORd5OHjwY3U6Z'
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'shiv_shakti_fresh_zone',
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp']
  }
});

const upload = multer({ storage: storage }).any();

const mongoURI = process.env.MONGO_URI || "mongodb+srv://Manglam9211:Manglam9211@cluster0.pnhpxpj.mongodb.net/shiv_shakti_mart?retryWrites=true&w=majority&appName=Cluster0";
mongoose.connect(mongoURI)
  .then(() => console.log("Database Synced Successfully"))
  .catch(err => console.log("Database Connection Error: ", err));

const productSchema = new mongoose.Schema({
  name: { type: String, default: 'Naya Saman' },
  price: { type: Number, default: 0 },
  costPrice: { type: Number, default: 0 },
  category: { type: String, default: 'General' },
  description: { type: String, default: '' },
  images: { type: [String], default: [] },
  image: { type: String, default: '' },
  clicks: { type: Number, default: 0 }
});
const Product = mongoose.model('Product', productSchema);

const bannerSchema = new mongoose.Schema({
  text: { type: String, default: "💥 AGRAHUNDA SUPER DEAL: Kam daam me sabsetop item! 💥" }
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
    res.json(products || []);
  } catch (e) { res.status(200).json([]); }
});

app.get('/api/ai-marketing/blast', async (req, res) => {
  try {
    const products = await Product.find({}).sort({ clicks: -1 });
    if (!products || products.length === 0) return res.json({ success: false, text: "Stock khali hai." });
    const bestSellerItem = products[0];
    const shopUrl = `https://shiv-shakti-super-mart.onrender.com`;
    const finalAd = `🌅 *SUPER FLASH DEAL* 🌅\n\nशिव शक्ति सुपर मार्ट पर आइटम *${bestSellerItem.name}* मात्र *₹${bestSellerItem.price}* में! 👇\n👉 ${shopUrl}`;
    res.json({ success: true, text: finalAd });
  } catch (e) { res.json({ success: false, text: "AI Engine error" }); }
});

app.post('/api/products', (req, res) => {
  upload(req, res, async function (err) {
    if (err) return res.status(500).json({ success: false, message: "Upload stream failed" });
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
        description: description || '',
        images: uploadedUrls,
        image: backupMainImage,
        clicks: 0
      });
      await newProduct.save();
      return res.status(200).json({ success: true });
    } catch (error) {
      return res.status(500).json({ success: false, message: "DB write failure" });
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