const express = require('express');
const mongoose = require('mongoose');
const path = require('path');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/public', express.static(path.join(__dirname, 'public')));

app.set('views', path.join(__dirname, 'views'));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

// 🛜 डेटाबेस कनेक्शन (आपकी मंगोडीबी तिजोरी)
mongoose.connect("mongodb+srv://Manglam9211:Manglam9211@cluster0.pnhpxpj.mongodb.net/shiv_shakti_mart?retryWrites=true&w=majority&appName=Cluster0")
  .then(() => console.log("Database Synced Successfully"))
  .catch(err => console.log(err));

// डेटाबेस मॉडल
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

// 📞 व्हाट्सएप्प मुनाफा क्लिक रूट + आपका असली नंबर लॉक (9450222868)
app.post('/api/products/:id/click', async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, { $inc: { clicks: 1 } });
    if (product) {
      // सीधे आपके नंबर पर ऑर्डर भेजने का लिंक तैयार करेगा
      const message = `Namaste Shiv Shakti Super Mart, mujhe ye saman order karna hai:\n\n*Saman:* ${product.name}\n*Rate:* ₹${product.price}\n*Description:* ${product.description || 'Badiya Quality'}`;
      const waLink = `https://wa.me/919450222868?text=${encodeURIComponent(message)}`;
      return res.json({ success: true, redirectUrl: waLink });
    }
    res.json({ success: true });
  } catch (e) { res.status(500).json({ success: false }); }
});

// 🚀 मोबाइल से सीधे आने वाले लिंक्स का रिसीवर
app.post('/api/products', async (req, res) => {
  try {
    const { name, price, costPrice, category, description, images } = req.body;
    let imageUrls = [];
    
    if (images && images.length > 0) {
      imageUrls = images;
    } else {
      imageUrls = ['https://via.placeholder.com/600'];
    }

    const newProduct = new Product({
      name, 
      price: Number(price), 
      costPrice: Number(costPrice),
      category, 
      description, 
      images: imageUrls, 
      clicks: 0, 
      viewsCount: 0
    });
    
    await newProduct.save();
    res.json({ success: true });
  } catch (error) { 
    console.log(error);
    res.status(500).json({ success: false }); 
  }
});

// 💥 गायब हुआ AI WhatsApp Marketing Blast इंजन वापस आ गया
app.get('/api/ai-marketing/blast', async (req, res) => {
  try {
    const products = await Product.find({}).sort({ _id: -1 }).limit(3);
    if(products.length === 0) {
      return res.json({ success: false, text: "Stock khali hai." });
    }
    
    let text = `💥 *SHIV SHAKTI SUPER MART (AGRAHUNDA)* 💥\n\nBhaiya dukan par naya stock aa gaya hai! Kam daam me sabse top quality item:\n\n`;
    products.forEach(p => {
      text += `🛍️ *${p.name}* - Sirf ₹${p.price}\n👉 ${p.description || 'Badiya item'}\n\n`;
    });
    text += `🏃‍♂️ Turnt dukan par aayein ya niche diye link se online dekhein:\nhttps://shiv-shakti-super-mart.onrender.com`;
    
    res.json({ success: true, text: text });
  } catch (e) {
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
