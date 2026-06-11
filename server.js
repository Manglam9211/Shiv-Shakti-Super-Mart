const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const multer = require('multer');
const path = require('path');
const session = require('express-session');

const app = express();
const PORT = process.env.PORT || 10000;

// Database Connection
const db = new sqlite3.Database('./database.db');

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
    secret: 'shiv_shakti_flipkart_secret',
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

// Create Advanced Table Structure
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        price REAL NOT NULL,
        description TEXT,
        category TEXT,
        image TEXT,
        stock INTEGER DEFAULT 10
    )`);
});

// ==================== HTML ROUTES ====================

// Client Home Page (With Search & Filters)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

// Admin Panel (Manage Inventory, Prices, Stock)
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'admin.html'));
});

// ==================== ADVANCED API ROUTES ====================

// 1. GET ALL PRODUCTS (With Advanced Search and Category Filtering)
app.get('/api/products', (req, res) => {
    const { search, category } = req.query;
    let query = 'SELECT * FROM products WHERE 1=1';
    let params = [];

    if (search) {
        query += ' AND name LIKE ?';
        params.push(`%${search}%`);
    }
    if (category) {
        query += ' AND category = ?';
        params.push(category);
    }

    db.all(query, params, (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// 2. ADD NEW PRODUCT (With Stock Management)
app.post('/admin/add', upload.single('image'), (req, res) => {
    const { name, price, description, category, stock } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : '/uploads/default.jpg';
    const productStock = stock ? parseInt(stock) : 10;

    db.run(`INSERT INTO products (name, price, description, category, image, stock) VALUES (?, ?, ?, ?, ?, ?)`,
        [name, parseFloat(price), description, category, image, productStock],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.redirect('/admin');
        }
    );
});

// 3. EDIT/UPDATE PRODUCT PRICE AND STOCK (Flipkart Feature)
app.post('/admin/update/:id', (req, res) => {
    const { price, stock } = req.body;
    db.run(`UPDATE products SET price = ?, stock = ? WHERE id = ?`,
        [parseFloat(price), parseInt(stock), req.params.id],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: "Product updated successfully!" });
        }
    );
});

// 4. DELETE PRODUCT FROM INVENTORY
app.delete('/api/products/:id', (req, res) => {
    db.run('DELETE FROM products WHERE id = ?', req.params.id, (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Product deleted successfully from mart!" });
    });
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running with Flipkart features on port ${PORT}`);
});