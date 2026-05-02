const Razorpay = require('razorpay');
const crypto = require('crypto');
const User = require('../models/User');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Create a subscription order
exports.createSubscriptionOrder = async (req, res) => {
  try {
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      console.error('❌ Razorpay keys are missing in environment variables');
      return res.status(500).json({ success: false, message: 'Payment configuration missing on server' });
    }

    const options = {
      amount: 49900, // Amount in paise (499 INR)
      currency: "INR",
      receipt: `sub_${Date.now()}`,
    };

    console.log('🔄 Creating Razorpay order with options:', options);
    const order = await razorpay.orders.create(options);
    console.log('✅ Razorpay order created:', order.id);
    res.status(200).json({ success: true, order });
  } catch (error) {
    console.error('❌ Razorpay Order Error:', error);
    res.status(500).json({ success: false, message: error.message || 'Could not create order' });
  }
};

// Verify payment and upgrade user
exports.verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest("hex");

    if (razorpay_signature === expectedSign) {
      // Payment verified
      await User.findByIdAndUpdate(req.user.id, { isPremium: true });
      res.status(200).json({ success: true, message: "Subscription activated successfully" });
    } else {
      res.status(400).json({ success: false, message: "Invalid signature" });
    }
  } catch (error) {
    console.error('Verify Payment Error:', error);
    res.status(500).json({ success: false, message: "Verification failed" });
  }
};
