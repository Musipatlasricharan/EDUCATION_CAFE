import { useState, useCallback } from 'react';
import api from '../lib/axios';
import toast from 'react-hot-toast';

/**
 * useRazorpay - shared hook to trigger Razorpay Premium checkout
 * Usage:
 *   const { initiatePayment, paying } = useRazorpay({ onSuccess: () => { ... } });
 */
export default function useRazorpay({ onSuccess } = {}) {
  const [paying, setPaying] = useState(false);

  const loadScript = () =>
    new Promise((resolve) => {
      if (document.getElementById('razorpay-script')) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.id = 'razorpay-script';
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });

  const initiatePayment = useCallback(async (user) => {
    setPaying(true);

    // 1. Load Razorpay SDK
    const loaded = await loadScript();
    if (!loaded) {
      toast.error('Failed to load payment gateway. Please check your connection.');
      setPaying(false);
      return;
    }

    // 2. Create order on backend
    let order;
    try {
      const res = await api.post('/payment/create-order');
      if (!res.data.success) throw new Error('Order creation failed');
      order = res.data.order;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not create payment order. Try again.');
      setPaying(false);
      return;
    }

    // 3. Open Razorpay checkout
    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_live_SczjKmuskhu5Wt',
      amount: order.amount,
      currency: order.currency,
      name: 'EduCafe',
      description: 'Premium Membership – Unlimited Access',
      image: 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
      order_id: order.id,
      prefill: {
        name: user?.name || '',
        email: user?.email || '',
      },
      theme: {
        color: '#6366f1',
        backdrop_color: 'rgba(0, 0, 0, 0.85)'
      },
      modal: {
        backdropclose: false,
        ondismiss: () => {
          toast('Payment cancelled.', { icon: '⚠️' });
          setPaying(false);
        }
      },
      handler: async (response) => {
        // 4. Verify payment on backend
        try {
          const verifyRes = await api.post('/payment/verify', {
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          });

          if (verifyRes.data.success) {
            toast.success('🎉 Premium activated! Welcome to EduCafe Pro!');
            if (onSuccess) onSuccess();
          } else {
            toast.error('Payment verification failed. Contact support.');
          }
        } catch {
          toast.error('Verification error. Contact support with your payment ID.');
        } finally {
          setPaying(false);
        }
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.on('payment.failed', (resp) => {
      toast.error(`Payment failed: ${resp.error.description}`);
      setPaying(false);
    });
    rzp.open();
  }, [onSuccess]);

  return { initiatePayment, paying };
}
