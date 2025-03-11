const express = require('express');
const session = require('express-session');
const router = express.Router();
const User = require('./models/User');
const Counter = require('./models/Counter');
const Product = require('./models/Product');
const CryptoJS = require('crypto-js');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

router.use(session({
    secret: 'Abc@123', 
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } 
}));

const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

router.get('/users', async (req, res) => {
    try {
        const users = await User.find( { status: 'active' });
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.get('/user', async (req, res) => {
    try {
        const users = await User.find( { status: 'pending' });
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.post('/register', async (req, res) => {
    let seqId;
    try {
        const existingUser = await User.findOne({
            $or: [
                { email: req.body.email },
                { username: req.body.username }
            ]
        });

        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
    try {
        const counter = await Counter.findByIdAndUpdate(
            { _id: 'userId' },
            { $inc: { seq: 1 } },
            { new: true, upsert: true }
        );
        seqId = counter.seq;
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }

    const user = new User({
        _id: seqId,
        name: req.body.name,
        email: req.body.email,
        username: req.body.username,
        password: req.body.password,
        phonenumber: req.body.phonenumber,
        role: req.body.role,
        status: req.body.status
        
    });

    try {
        const newUser = await user.save();
        res.status(201).json(newUser);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

router.put('/user/:id', async (req, res) => {
    const { status } = req.body;
    if (!['active', 'inactive'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status' });
    }

    try {
        const user = await User.findByIdAndUpdate(req.params.id, { status }, { new: true });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.post('/login', (req, res) => {
    const { email, password } = req.body;
    User.findOne({ $and: [{ $or: [{ email: email }, { username: email }] }, { status: 'active' }] })
        .then(user => {
            if (user) {
                const decryptedPassword = CryptoJS.AES.decrypt(user.password, 'Vraj@123').toString(CryptoJS.enc.Utf8);
                if (decryptedPassword === password) {
                    req.session.user = user;
                    res.json({ success: true, user });
                } else {
                    res.json({ success: false, message: "Wrong password" });
                }
            } else {
                res.json({ success: false, message: "No records found!" });
            }
        })
        .catch(err => res.status(500).json({ success: false, message: "Login failed", error: err }));
});



router.post('/update/:id', async (req, res) => {
    const { name, email, username, password, phonenumber } = req.body;

    if (!name || !email || !username || !password || !phonenumber) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    try {
        const updatedData = { name, email, username, phonenumber };
        if (password) {
            updatedData.password = CryptoJS.AES.encrypt(password, 'Vraj@123').toString();
        }

        await User.findByIdAndUpdate(req.params.id, updatedData);
        res.json({ message: 'User updated!' });
    } catch (err) {
        res.status(400).json({ message: 'Error: ' + err });
    }
});

router.post('/addproduct', upload.array('image', 10 ), async (req, res) => {
    debugger;
    let seqId;
    try {
        const counter = await Counter.findByIdAndUpdate(
            { _id: 'productId' },
            { $inc: { seq: 1 } },
            { new: true, upsert: true }
        );
        seqId = counter.seq;
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }

    const product = new Product({
        _id: seqId,
        name: req.body.name,
        price: req.body.price,
        description: req.body.description,
        
        image: req.files ? req.files.map((file) => file.filename) : []
    });
    try { 
        const newProduct = await product.save();
        res.status(201).json(newProduct);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

router.get('/products', async (req, res) => {
    try {
        const products = await Product.find({ status: 'active' });
        res.json(products);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.get('/product', async (req, res) => {
    try {
        const products = await Product.find({ status: 'pending' });
        res.json(products);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.get('/product/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        res.json(product);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.put('/product/:id', async (req, res) => {
    const { status } = req.body;
    if (!['active', 'inactive'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status' });
    }

    try {
        const product = await Product.findByIdAndUpdate(req.params.id, { status }, { new: true });
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.json(product);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});
        

module.exports = router;