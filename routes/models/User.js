const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    _id: { type: Number, required: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    username: { type: String, required: true },
    password: { type: String, required: true },
    phonenumber: { type: String, required: true },
    role: { type: String, default: 'user' },
    status: { type: String, default: 'pending' }

});

module.exports = mongoose.model('User', userSchema);