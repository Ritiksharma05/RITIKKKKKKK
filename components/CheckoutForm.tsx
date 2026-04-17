/**
 * components/CheckoutForm.tsx
 * Full checkout form with address fields, order summary, and Razorpay integration.
 */
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShoppingCart, MapPin, CreditCard, AlertCircle, Loader2 } from 'lucide-react';

interface Item {
  productId: string;
  name: string;
  quantity: number;
  price: number;
}

interface CheckoutFormProps {
  items: Item[];
  total: number;
  userEmail: string;
  userName: string;
}

export default function CheckoutForm({ items, total, userEmail, userName }: CheckoutFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [form, setForm] = useState({
    name: userName || '',
    email: userEmail || '',
    phone: '',
    line1: '',
    city: '',
    state: '',
    pincode: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handlePayment = async () => {
    // Basic validation
    const required = ['name', 'email', 'phone', 'line1', 'city', 'state', 'pincode'];
    for (const field of required) {
      if (!form[field as keyof typeof form].trim()) {
        setError(`Please fill in: ${field}`);
        return;
      }
    }
    if (!/^\d{10}$/.test(form.phone)) {
      setError('Enter a valid 10-digit phone number');
      return;
    }
    setError('');
    setLoading(true);

    try {
      // Step 1: Create Razorpay order server-side
      const orderRes = await fetch('/api/razorpay/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: total }),
      });
      const orderData = await orderRes.json();
      if (!orderRes.ok) throw new Error(orderData.error || 'Failed to create order');

      // Step 2: Open Razorpay checkout modal
      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'ZainsTyres',
        description: `Order for ${items.length} item(s)`,
        order_id: orderData.orderId,
        prefill: {
          name: form.name,
          email: form.email,
          contact: form.phone,
        },
        theme: { color: '#f97316' },
        handler: async (response: any) => {
          // Step 3: Verify payment on backend
          const verifyRes = await fetch('/api/razorpay/verify-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_order_id:   response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature:  response.razorpay_signature,
              customerName:  form.name,
              customerEmail: form.email,
              customerPhone: form.phone,
              address: {
                line1:   form.line1,
                city:    form.city,
                state:   form.state,
                pincode: form.pincode,
              },
              items,
              total,
            }),
          });
          const verifyData = await verifyRes.json();
          if (verifyData.success) {
            router.push(`/order-confirmation/${verifyData.orderId}`);
          } else {
            setError('Payment verification failed. Please contact support.');
          }
        },
        modal: {
          ondismiss: () => {
            setError('Payment was cancelled.');
            setLoading(false);
          },
        },
      };

      // Load Razorpay script dynamically
      if (!(window as any).Razorpay) {
        await loadRazorpayScript();
      }
      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', (response: any) => {
        setError(`Payment failed: ${response.error.description}`);
        setLoading(false);
      });
      rzp.open();
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* ─── Address Form ─── */}
      <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-6 space-y-5">
        <div className="flex items-center gap-2 mb-2">
          <MapPin size={20} className="text-orange-400" />
          <h2 className="text-lg font-bold text-white">Delivery Address</h2>
        </div>

        {[
          { name: 'name',    label: 'Full Name',      placeholder: 'John Doe' },
          { name: 'email',   label: 'Email',          placeholder: 'john@example.com' },
          { name: 'phone',   label: 'Phone Number',   placeholder: '9876543210' },
          { name: 'line1',   label: 'Address Line 1', placeholder: 'House / Street / Colony' },
          { name: 'city',    label: 'City',           placeholder: 'Mumbai' },
          { name: 'state',   label: 'State',          placeholder: 'Maharashtra' },
          { name: 'pincode', label: 'PIN Code',       placeholder: '400001' },
        ].map((field) => (
          <div key={field.name}>
            <label className="block text-xs text-gray-400 mb-1 uppercase tracking-wider">{field.label}</label>
            <input
              id={`checkout-${field.name}`}
              type="text"
              name={field.name}
              value={form[field.name as keyof typeof form]}
              onChange={handleChange}
              placeholder={field.placeholder}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-orange-500 transition-colors"
            />
          </div>
        ))}
      </div>

      {/* ─── Order Summary ─── */}
      <div className="space-y-4">
        <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <ShoppingCart size={20} className="text-orange-400" />
            <h2 className="text-lg font-bold text-white">Order Summary</h2>
          </div>

          <div className="space-y-3 mb-4">
            {items.map((item, i) => (
              <div key={i} className="flex justify-between items-center py-2 border-b border-white/5">
                <div>
                  <p className="text-white text-sm font-medium">{item.name}</p>
                  <p className="text-gray-500 text-xs">Qty: {item.quantity}</p>
                </div>
                <p className="text-orange-400 font-semibold">₹{item.price * item.quantity}</p>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center pt-2">
            <span className="text-gray-400">Subtotal</span>
            <span className="text-white font-bold text-lg">₹{total}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-500">Shipping</span>
            <span className="text-green-400">FREE</span>
          </div>
          <div className="border-t border-white/10 mt-3 pt-3 flex justify-between items-center">
            <span className="text-white font-bold text-lg">Total</span>
            <span className="text-orange-400 font-bold text-2xl">₹{total}</span>
          </div>
        </div>

        {error && (
          <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/30 rounded-xl p-4">
            <AlertCircle size={18} className="text-red-400 mt-0.5 shrink-0" />
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        <button
          id="pay-btn"
          onClick={handlePayment}
          disabled={loading}
          className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-400 hover:to-red-500 disabled:opacity-50 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all duration-200 shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 hover:scale-[1.02] active:scale-[0.98]"
        >
          {loading ? (
            <><Loader2 size={20} className="animate-spin" /> Processing...</>
          ) : (
            <><CreditCard size={20} /> Pay ₹{total} Securely</>
          )}
        </button>
        <p className="text-center text-xs text-gray-600">🔒 Secured by Razorpay · 256-bit SSL encryption</p>
      </div>
    </div>
  );
}

function loadRazorpayScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload  = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Razorpay SDK'));
    document.body.appendChild(script);
  });
}
