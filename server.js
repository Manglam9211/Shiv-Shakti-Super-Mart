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

// 🛜 डेटाबेस कनेक्शन (Vercel Environment Variable के साथ सुरक्षित सपोर्ट)
const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://Manglam9211:Manglam9211@cluster0.pnhpxpj.mongodb.net/shiv_shakti_mart?retryWrites=true&w=majority&appName=Cluster0";

mongoose.connect(MONGO_URI)
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
      // 🛒 स्मार्ट क्रॉस-सेलिंग और गिफ्ट इंजन (WhatsApp Order ke liye)
      let freeGift = "";
      if (product.price >= 60 && product.price <= 119) {
        freeGift = "🎁 [Aapke liye FREE: 1 Patta Fancy Sticker]";
      } else if (product.price >= 120 && product.price <= 299) {
        freeGift = "🎁 [Aapke liye FREE: Ek ₹20 tak ki Copy/Stationery]";
      } else if (product.price >= 300) {
        freeGift = "🎁 [Aapke liye FREE: Ek Cricket Ball ya ₹30 tak ka item]";
      }

      const message = `Namaste Shiv Shakti Super Mart, mujhe ye saman order karna hai:\n\n*Saman:* ${product.name}\n*Rate:* ₹${product.price}\n*Description:* ${product.description || 'Badiya Quality'}\n${freeGift}\n\n🤖 *AI Suggestion:* Bhaiya, iske sath dukan ka koi trending item bhi bhej dijiye!`;
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

// 💥 AI WhatsApp Marketing Blast + Amazon/Flipkart Engine
app.get('/api/ai-marketing/blast', async (req, res) => {
  try {
    const products = await Product.find({}).sort({ _id: -1 }).limit(3);
    if(products.length === 0) {
      return res.json({ success: false, text: "Stock khali hai." });
    }
    
    let text = `💥 *SHIV SHAKTI SUPER MART (AGRAHUNDA) - MEGA DEALS* 💥\n\nBhaiya dukan par naya stock aa gaya hai! Aaj ke sabse top offers:\n\n`;
    
    products.forEach(p => {
      let itemPrice = p.price;
      let specialText = "";

      // 1. Amazon-Style Hype Engine
      if (p.viewsCount > 5) {
        specialText += `🔥 *Trending!* Pure ilake me log ise dekh rahe hain!\n`;
      }

      // 2. Flipkart-Style Flash Sale (Agar costPrice save hai aur profit margin theek hai)
      let flashPrice = itemPrice;
      if (p.costPrice && (itemPrice > p.costPrice * 1.15)) {
         let discount = Math.floor(itemPrice * 0.05); // 5% chhoot
         flashPrice = itemPrice - discount;
         specialText += `⚡ *Flash Sale!* ₹${itemPrice} ki jagah sirf ₹${flashPrice} me!\n`;
      } else {
         specialText += `✅ Sirf ₹${itemPrice} me!\n`;
      }

      // 3. Smart Tiered Rewards System (Tumhara exact algorithm)
      let freeGift = "";
      if (flashPrice >= 60 && flashPrice <= 119) {
        freeGift = "🎁 *FREE:* Baccho ka Fancy Sticker (Ek patta)!";
      } else if (flashPrice >= 120 && flashPrice <= 299) {
        freeGift = "🎁 *FREE:* ₹20 tak ki ek badiya Copy/Stationery!";
      } else if (flashPrice >= 300) {
        freeGift = "🎁 *FREE:* Ek Cricket Ball ya ₹30 tak ka super item!";
      }

      text += `🛍️ *${p.name}*\n${specialText}👉 ${p.description || 'Badiya item'}\n${freeGift}\n\n`;
    });
    
    // URL Update - Sirf link, koi image link nahi
    text += `🏃‍♂️ Turnt dukan par aayein ya niche diye link se online dekhein:\n🔗 https://shiv-shakti-super-mart-3n800xqx2-manglam1.vercel.app/`;
    
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

// 🚀 VERCEL SERVERLESS MODIFICATION
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`Server live on port ${PORT}`));
}

module.exports = app;
