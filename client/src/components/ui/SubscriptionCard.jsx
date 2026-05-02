import React, { useState } from 'react';
import api from '../../lib/axios';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import { Check, Sparkles, CreditCard, Zap, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import './SubscriptionCard.css';

export default function SubscriptionCard() {
  const { user, login } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async () => {
    if (!user) return toast.error('Please login to subscribe');
    setLoading(true);

    try {
      // 1. Create order on backend
      const { data } = await api.post('/payment/create-order');
      
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_live_SczjKmuskhu5Wt', // Environment variable or fallback
        amount: data.order.amount,
        currency: "INR",
        name: "EduCafe",
        description: "Premium Academic Subscription",
        image: "/vite.svg",
        order_id: data.order.id,
        handler: async (response) => {
          try {
            // 2. Verify payment on backend
            const verifyRes = await api.post('/payment/verify', response);
            if (verifyRes.data.success) {
              toast.success('🎉 Welcome to Premium!');
              // Refresh user data (if login updates user)
              window.location.reload(); 
            }
          } catch (err) {
            toast.error('Payment verification failed');
          }
        },
        prefill: {
          name: user.name,
          email: user.email,
        },
        theme: {
          color: "#4f46e5",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
       const message = error.response?.data?.message || 'Could not initiate payment';
       toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  if (user?.isPremium) {
     return (
       <div className="premium-active-card">
         <Sparkles className="text-yellow-400" />
         <h3>Premium Active</h3>
         <p>You have full access to all AI Agents and special resources.</p>
       </div>
     );
  }

  return (
    <motion.div 
      className="subscription-card-container"
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
    >
      <div className="subscription-card-inner">
        <div className="sub-header">
          <div className="sub-badge">LIMITED TIME OFFER</div>
          <h2>Unlock Infinite Learning</h2>
          <p>Get unlimited access to AI Agents, Mock Interviews, and Premium Study Rooms.</p>
          <div className="price-tag">
            <span className="currency">₹</span>
            <span className="amount">499</span>
            <span className="period">/ lifetime access</span>
          </div>
        </div>

        <ul className="sub-features">
          <li><Check size={18} className="text-success" /> <span>Unlimited AI Agent Queries</span></li>
          <li><Check size={18} className="text-success" /> <span>Unlimited Question Paper Generation</span></li>
          <li><Check size={18} className="text-success" /> <span>Priority Support & No Ads</span></li>
          <li><Check size={18} className="text-success" /> <span>Exclusive Study Room Themes</span></li>
          <li><Check size={18} className="text-success" /> <span>Detailed Mock Interview Analytics</span></li>
        </ul>

        <button 
          className="sub-btn" 
          onClick={handleSubscribe}
          disabled={loading}
        >
          {loading ? 'Processing...' : (
            <>
              Upgrade Now <Zap size={18}/>
            </>
          )}
        </button>

        <div className="sub-footer">
          <span><ShieldCheck size={14} /> Secure Payment by Razorpay</span>
          <span><CreditCard size={14} /> Multiple payment modes</span>
        </div>
      </div>
    </motion.div>
  );
}
