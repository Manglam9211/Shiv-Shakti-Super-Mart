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

// Cloudinary Credentials Configuration
cloudinary.config({
  cloud_name: 'dmtafwfxg',
  api_key: '183174449285855',
  api_secret: '7RORd5OHjwY3U6Z'
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'shiv_shakti_fresh_zone',
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp']
  }
});

// SUCCESS TUNNEL: Restored exact multipart listener
const upload = multer({ storage: storage }).any();

const mongoURI = process.env.MONGO_URI || "mongodb+srv://Manglam9211:Manglam9211@cluster0.pnhpxpj.mongodb.net/shiv_shakti_mart?retryWrites=true&w=majority&appName=Cluster0";
mongoose.connect(mongoURI)
  .then(() => console.log("Database connected successfully to original layout"))
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

app.get('/', (req, res) => res.render('index.html'));
app.get('/admin', (req, res) => res.render('admin.html'));

app.get('/api/products', async (req, res) => {
  try {
    const products = await Product.find({}).sort({ _id: -1 });
    res.json(products || []);
  } catch (e) { res.status(200).json([]); }
});

// 🤖 ADVANCED AI MARKETING ENGINE: 6 CHANNELS DYNAMIC ADS
app.get('/api/ai-marketing/blast', async (req, res) => {
  try {
    const products = await Product.find({}).sort({ clicks: -1 });
    if (!products || products.length === 0) return res.json({ success: false, text: "Stock khali hai." });
    
    const bestSellerItem = products[0];
    const shopUrl = `https://shiv-shakti-super-mart.onrender.com`;

    const aiCampaigns = [
      `🌅 *MORNING SUPER FLASH DEAL* 🌅\n\nशिव शक्ति सुपर守 मार्ट (अग्रहुंडा) पर आज सुबह की सबसे बड़ी बचत!\n\n📦 आइटम: *${bestSellerItem.name}*\n🔥 धमाका रेट: मात्र *₹${bestSellerItem.price}*\n\nस्टॉक सीमित है! तुरंत नीचे लिंक पर क्लिक करके लाइव ऑर्डर पक्का करें 👇\n👉 ${shopUrl}`,
      `🎉 *WEEKEND LOOT BAZAAR* 🎉\n\nपूरे चित्रकूट में ऐसा दाम कहीं नहीं मिलेगा! इस स्पेशल ऑफर सीधा हमारी दुकान से:\n\n⭐ बेस्ट सेलर: *${bestSellerItem.name}*\n🤑 लूट लो रेट: *₹${bestSellerItem.price}*\n\nघर बैठे व्हाट्सएप पर दुकान खोलने के लिए तुरंत यहाँ क्लिक करें 👇\n👉 ${shopUrl}`,
      `👑 *AGRAHUNDA GRAPEVINE: CUSTOMER CHOICE* 👑\n\nहमारी दुकान का सबसे ज्यादा बिकने वाला सामान अब फिर से स्टॉक में आ गया है!\n\n🔥 आइटम का नाम: *${bestSellerItem.name}*\n✨ वीआईपी रेट: *₹${bestSellerItem.price}*\n\nऑर्डर के लिए लिंक खोलें 👇\n👉 ${shopUrl}`,
      `🚨 *LIMITED STOCK EMERGENCY ALERT* 🚨\n\n*${bestSellerItem.name}* का स्टॉक बहुत तेजी से खत्म हो रहा है।\n\n💰 स्पेशल डिस्काउंट रेट: *₹${bestSellerItem.price}*\n\nव्हाट्सएप शॉप पर जाकर अपना ऑर्डर पक्का लॉक करें 👇\n👉 ${shopUrl}`,
      `💥 *SHIV SHAKTI FESTIVAL DHAMAKA* 💥\n\nशिव शक्ति मार्ट लाया है सबसे तगड़ा ऑफर:\n\n📦 आइटम: *${bestSellerItem.name}*\n💸 सीधा दाम: *₹${bestSellerItem.price}*\n\nदुकान का लाइव रेट कार्ड देखने के लिए लिंक खोलें 👇\n👉 ${shopUrl}`,
      `🤑 *सस्ते का बादशाह: SUPER SAVER DEAL* 🤑\n\nआज की सबसे तगड़ी बचत सिर्फ आपके लिए:\n\n🔥 सामान: *${bestSellerItem.name}*\n👉 हमारा रेट: *₹${bestSellerItem.price}*\n\nतुरंत लिंक पर क्लिक करो और खुद देखो 👇\n👉 ${shopUrl}`
    ];

    const finalAd = aiCampaigns[Math.floor(Math.random() * aiCampaigns.length)];
    res.json({ success: true, text: finalAd });
  } catch (e) { res.json({ success: false, text: "AI Engine error" }); }
});

// ORIGINAL BULLETPROOF UPLOAD STREAM
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