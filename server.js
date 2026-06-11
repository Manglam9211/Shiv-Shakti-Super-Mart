const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const session = require('express-session');

const app = express();
const PORT = process.env.PORT || 10000;

// Connect to Permanent Online Database (MongoDB Atlas)
const MONGO_URI = 'mongodb+srv://Manglam9211:Manglam9211@cluster0.pnhpxpj.mongodb.net/shiv_shakti_mart?retryWrites=true&w=majority&appName=Cluster0';
mongoose.connect(MONGO_URI)
    .then(() => console.log('Shiv Shakti AI Database Connected Permanently!'))
    .catch(err => console.log('Database Connection Error: ', err));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
    secret: 'shiv_shakti_super_ai_secret',
    resave: false,
    saveUninitialized: true
}));

// Setup Image Upload Storage
const storage = multer.diskStorage({
    destination: './public/uploads/',
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// Next-Gen Advanced Product Schema with AI Capabilities
const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true },
    mrp: { type: Number, default: 0 }, 
    description: String,
    category: String,
    image: { type: String, default: '/uploads/default.jpg' },
    stock: { type: Number, default: 10 },
    isFeatured: { type: Boolean, default: false },
    viewsCount: { type: Number, default: 0 }, // AI Analytics Tracking
    salesCount: { type: Number, default: 0 }  // Tracks Popularity Trend
});
const Product = mongoose.model('Product', productSchema);

// ==================== HTML ROUTES ====================
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'admin.html'));
});

// ==================== SUPER ADVANCED AI API ROUTES ====================

// 1. GET ALL PRODUCTS (With AI Personalization & Search Analytics)
app.get('/api/products', async (req, res) => {
    try {
        const { search, category, sort_by } = req.query;
        let filter = {};

        if (search) {
            filter.name = { $regex: search, $options: 'i' };
        }
        if (category) {
            filter.category = category;
        }

        let query = Product.find(filter);

        // AI Dynamic Sorting Algorithm
        if (sort_by === 'popular') {
            query = query.sort({ viewsCount: -1 }); // Shows trending items first
        } else if (sort_by === 'offers') {
            query = query.sort({ mrp: -1 }); // Shows big discount items first
        } else {
            query = query.sort({ isFeatured: -1, _id: -1 }); // Default AI Mix
        }

        const products = await query;
        res.json(products);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2. AI ANALYTICS: TRACK PRODUCT VIEWS (Triggers silently when customer clicks)
app.post('/api/products/track-view/:id', async (req, res) => {
    try {
        await Product.findByIdAndUpdate(req.params.id, { $inc: { viewsCount: 1 } });
        res.json({ success: true, message: "AI analytics engine updated views." });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 3. ADD NEW PRODUCT WITH FULL SPECIFICATIONS
app.post('/admin/add', upload.single('image'), async (req, res) => {
    try {
        const { name, price, mrp, description, category, stock, isFeatured } = req.body;
        const image = req.file ? `/uploads/${req.file.filename}` : '/uploads/default.jpg';

        const newProduct = new Product({
            name,
            price: parseFloat(price),
            mrp: mrp ? parseFloat(mrp) : parseFloat(price),
            description,
            category,
            stock: stock ? parseInt(stock) : 10,
            isFeatured: isFeatured === 'true' || isFeatured === true,
            image
        });

        await newProduct.save();
        res.redirect('/admin');
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 4. SMART INVENTORY UPDATE (Price, Stock & AI Featured State)
app.post('/admin/update/:id', async (req, res) => {
    try {
        const { price, mrp, stock, isFeatured } = req.body;
        let updateData = {};
        
        if(price) updateData.price = parseFloat(price);
        if(mrp) updateData.mrp = parseFloat(mrp);
        if(stock) updateData.stock = parseInt(stock);
        if(isFeatured !== undefined) updateData.isFeatured = (isFeatured === 'true');

        await Product.findByIdAndUpdate(req.params.id, updateData);
        res.json({ message: "Inventory database optimized and updated successfully!" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 5. SECURE INVENTORY PURGE (Delete)
app.delete('/api/products/:id', async (req, res) => {
    try {
        await Product.findByIdAndDelete(req.params.id);
        res.json({ message: "Product systematically purged from cloud core!" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Start AI Cloud Server
app.listen(PORT, () => {
    console.log(`Server running with Permanent Cloud Database and AI Core on port ${PORT}`);
});