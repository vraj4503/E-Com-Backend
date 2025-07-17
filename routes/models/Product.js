const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    _id: { type: Number, required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    description: { type: String, required: true },
    image: [String],
    status: {type: String, required: true, default: 'pending' }
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product; 
