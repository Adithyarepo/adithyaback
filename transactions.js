const express = require('express');
const User = require('../models/User');
const authenticate = require('../middleware/auth');

const router = express.Router();

// Add Transaction
router.post('/transaction', authenticate, async (req, res) => {
    const { sender, receiver, amount } = req.body;

    const senderUser = await User.findOne({ username: sender });
    const receiverUser = await User.findOne({ upiId: receiver });
    if (!receiverUser) return res.status(404).send('Receiver not found');

    if (senderUser.balance < amount) return res.status(400).send('Insufficient balance');

    senderUser.balance -= amount;
    receiverUser.balance += amount;

    senderUser.transactions.push({ sender, receiver, amount });
    receiverUser.transactions.push({ sender, receiver, amount });

    await senderUser.save();
    await receiverUser.save();

    res.send('Transaction successful');
});

// Transaction History
router.get('/history', authenticate, async (req, res) => {
    const user = await User.findById(req.user.userId);
    res.json(user.transactions);
});

module.exports = router;