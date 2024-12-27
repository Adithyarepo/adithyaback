const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    upiId: { type: String, required: true, unique: true },
    balance: { type: Number, default: 0, min: 0 },  // Ensure balance cannot go below 0
    transactions: [{
        date: { type: Date, default: Date.now },
        sender: { type: String },
        receiver: { type: String },
        amount: { type: Number },
    }],
});

// Hash the password before saving it to the database
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();  // Only hash if password is modified
    try {
        const salt = await bcrypt.genSalt(10);  // Generate salt with 10 rounds
        this.password = await bcrypt.hash(this.password, salt);  // Hash the password
        next();
    } catch (err) {
        next(err);  // Handle errors
    }
});

// Method to compare password during login
userSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
