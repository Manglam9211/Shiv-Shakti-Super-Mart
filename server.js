const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const multer = require('multer');
const path = require('path');
const session = require('express-session');

const app = express();
const db = new sqlite3.Database('./database.db');

// ????????? ?????
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(session({ secret: 'shiv_shakti_secret', resave: false, saveUninitialized: true }));

// ???????? ????? ???? ?? ??? ??????
const storage = multer.diskStorage({
    destination: './public/uploads/',
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// ??????? ?????? ?????
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        price REAL,
        description TEXT,
        category TEXT,
        image TEXT
    )`);
});app.get('/', (req, res) => { res.sendFile('E:\\shiv sakti super mart\\views\\index.html'); });
app.get('/admin', (req, res) => { res.sendFile('E:\\shiv sakti super mart\\views\\admin.html'); });
// --- API ROUTES ---

// 1. ??? ?????????? ????? (?????? ?? ????? ?? ???)
app.get('/api/products', (req, res) => {
    db.all("SELECT * FROM products", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// 2. ??? ???????? ????? (Admin Only)
app.post('/admin/add', upload.single('image'), (req, res) => {
    const { name, price, description, category } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : '/uploads/default.jpg';
    
    db.run(`INSERT INTO products (name, price, description, category, image) VALUES (?, ?, ?, ?, ?)`,
        [name, price, description, category, image],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.redirect('/admin');
        }
    );
});

// 3. ???????? ????? ???? (Admin Only)
app.delete('/api/products/:id', (req, res) => {
    db.run(`DELETE FROM products WHERE id = ?`, req.params.id, (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Product deleted successfully" });
    });
});

// ????? ???? ????
app.get('/admin', (req, res) => {
    res.render('admin');
});
app.listen(3000, () => console.log('Server running on http://localhost:3000'));