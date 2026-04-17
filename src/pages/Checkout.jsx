import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Check, CreditCard, MapPin, Truck, ChevronRight } from 'lucide-react';

export default function Checkout({ cart, clearCart, settings }) {
  const { user, API } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Address, 2: Payment, 3: Review
  
  // Addresses
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [newAddress, setNewAddress] = useState({ fullName: '', phone: '', line1: '', line2: '', city: '', state: '', pincode: '', country: 'India' });
  const [showAddressForm, setShowAddressForm] = useState(false);

  // Payment
  const [paymentMethod, setPaymentMethod] = useState('Card');

  const subtotal = cart.reduce((a, b) => a + b.price * b.quantity, 0);
  const tax = subtotal * 0.18;
  const shipping = subtotal > 10000 ? 0 : 500;
  const total = subtotal + tax + shipping;

  useEffect(() => {
    if (!user) { navigate('/login?redirect=checkout'); return; }
    if (cart.length === 0) { navigate('/'); return; }
    
    // Fetch user addresses
    fetch(`${API}/api/orders/addresses`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        setAddresses(data);
        if (data.length > 0) setSelectedAddress(data[0]._id);
        else setShowAddressForm(true);
      })
      .catch(console.error);
  }, [user, cart, navigate, API]);

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API}/api/orders/address`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAddress),
        credentials: 'include'
      });
      const added = await res.json();
      setAddresses(p => [...p, added]);
      setSelectedAddress(added._id);
      setShowAddressForm(false);
    } catch (err) { alert('Failed to save address'); }
  };

  const handlePlaceOrder = async () => {
    try {
      const payload = {
        orderItems: cart.map(i => ({ productId: i.id || i.productId._id, quantity: i.quantity, price: i.price })),
        addressId: selectedAddress,
        paymentMethod,
        subtotal, tax, shipping, total
      };
      
      const res = await fetch(`${API}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'include'
      });
      
      if (!res.ok) throw new Error('Order creation failed');
      const order = await res.json();
      clearCart();
      alert(`Order Placed Successfully! Order ID: ${order._id}`);
      navigate('/');
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-100 pt-32 pb-20 px-6">
      <div className="max-w-5xl mx-auto flex flex-col lg:flex-row gap-10">
        
        {/* Left Side: Steps */}
        <div className="flex-1 space-y-6">
          
          {/* Step 1: Address */}
          <div className={`p-8 rounded-[2rem] border transition-colors ${step === 1 ? 'bg-zinc-900 border-rose-500/50 shadow-[0_0_30px_rgba(225,29,72,0.1)]' : 'bg-transparent border-white/10 opacity-60'}`}>
            <h2 className="text-xl font-black italic uppercase tracking-tighter flex items-center gap-3">
              <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${step === 1 ? 'bg-rose-600' : 'bg-white/10'}`}>1</span>
              Delivery Location
            </h2>
            
            {step === 1 && (
              <div className="mt-8">
                {addresses.length > 0 && !showAddressForm && (
                  <div className="space-y-4 mb-6">
                    {addresses.map(addr => (
                      <div key={addr._id} onClick={() => setSelectedAddress(addr._id)} className={`p-5 rounded-2xl border cursor-pointer flex gap-4 ${selectedAddress === addr._id ? 'border-rose-500 bg-rose-500/10' : 'border-white/10 hover:border-white/20'}`}>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${selectedAddress === addr._id ? 'border-rose-500' : 'border-zinc-600'}`}>
                          {selectedAddress === addr._id && <div className="w-2.5 h-2.5 bg-rose-500 rounded-full" />}
                        </div>
                        <div>
                          <p className="font-bold text-white">{addr.fullName} <span className="text-zinc-500 text-xs ml-2">{addr.phone}</span></p>
                          <p className="text-sm text-zinc-400 mt-1">{addr.line1}, {addr.line2}</p>
                          <p className="text-sm text-zinc-400">{addr.city}, {addr.state} - {addr.pincode}</p>
                        </div>
                      </div>
                    ))}
                    <button onClick={() => setShowAddressForm(true)} className="text-rose-500 font-bold text-sm hover:underline">+ Add New Address</button>
                  </div>
                )}

                {showAddressForm && (
                  <form onSubmit={handleSaveAddress} className="space-y-4 mb-6 bg-black/40 p-6 rounded-2xl border border-white/5">
                    <div className="grid grid-cols-2 gap-4">
                      <input placeholder="Full Name" required value={newAddress.fullName} onChange={e => setNewAddress({...newAddress, fullName: e.target.value})} className="col-span-2 bg-zinc-800 border border-white/10 rounded-xl px-4 py-3 text-sm" />
                      <input placeholder="Phone Number" required value={newAddress.phone} onChange={e => setNewAddress({...newAddress, phone: e.target.value})} className="col-span-2 md:col-span-1 bg-zinc-800 border border-white/10 rounded-xl px-4 py-3 text-sm" />
                      <input placeholder="City" required value={newAddress.city} onChange={e => setNewAddress({...newAddress, city: e.target.value})} className="col-span-2 md:col-span-1 bg-zinc-800 border border-white/10 rounded-xl px-4 py-3 text-sm" />
                      <textarea placeholder="Address Line 1" required value={newAddress.line1} onChange={e => setNewAddress({...newAddress, line1: e.target.value})} className="col-span-2 bg-zinc-800 border border-white/10 rounded-xl px-4 py-3 text-sm resize-none" rows="2" />
                      <input placeholder="State" required value={newAddress.state} onChange={e => setNewAddress({...newAddress, state: e.target.value})} className="col-span-2 md:col-span-1 bg-zinc-800 border border-white/10 rounded-xl px-4 py-3 text-sm" />
                      <input placeholder="Pincode" required value={newAddress.pincode} onChange={e => setNewAddress({...newAddress, pincode: e.target.value})} className="col-span-2 md:col-span-1 bg-zinc-800 border border-white/10 rounded-xl px-4 py-3 text-sm" />
                    </div>
                    <div className="flex gap-3">
                      {addresses.length > 0 && <button type="button" onClick={() => setShowAddressForm(false)} className="px-5 py-2.5 bg-zinc-800 rounded-xl text-sm font-bold">Cancel</button>}
                      <button type="submit" className="px-5 py-2.5 bg-zinc-100 text-black rounded-xl text-sm font-black">Save Address</button>
                    </div>
                  </form>
                )}

                <button onClick={() => selectedAddress && setStep(2)} disabled={!selectedAddress} className="w-full bg-rose-600 disabled:opacity-50 text-white py-4 rounded-xl font-black uppercase text-sm tracking-widest flex justify-center items-center gap-2">
                  Continue to Payment <ChevronRight size={16} />
                </button>
              </div>
            )}
            {step > 1 && (
              <div className="mt-4 text-sm text-zinc-400 pl-11">
                {addresses.find(a => a._id === selectedAddress)?.line1}, {addresses.find(a => a._id === selectedAddress)?.city}
                <button onClick={() => setStep(1)} className="ml-4 text-rose-500 hover:text-white transition-colors uppercase text-[10px] font-black tracking-widest">Change</button>
              </div>
            )}
          </div>

          {/* Step 2: Payment */}
          <div className={`p-8 rounded-[2rem] border transition-colors ${step === 2 ? 'bg-zinc-900 border-rose-500/50 shadow-[0_0_30px_rgba(225,29,72,0.1)]' : 'bg-transparent border-white/10 opacity-60'}`}>
            <h2 className="text-xl font-black italic uppercase tracking-tighter flex items-center gap-3">
              <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${step === 2 ? 'bg-rose-600' : 'bg-white/10'}`}>2</span>
              Payment Method
            </h2>
            {step === 2 && (
              <div className="mt-8 space-y-4">
                {['Card', 'UPI', 'COD'].map(method => (
                  <label key={method} className={`flex items-center gap-4 p-5 rounded-2xl border cursor-pointer transition-colors ${paymentMethod === method ? 'border-rose-500 bg-rose-500/10' : 'border-white/10 hover:border-white/20'}`}>
                    <input type="radio" name="payment" value={method} checked={paymentMethod === method} onChange={() => setPaymentMethod(method)} className="w-5 h-5 accent-rose-500" />
                    <div>
                      <p className="font-bold text-white uppercase">{method === 'COD' ? 'Cash on Delivery' : method}</p>
                      <p className="text-xs text-zinc-500 mt-1">{method === 'Card' ? 'Credit/Debit cards processed securely' : method === 'UPI' ? 'Google Pay, PhonePe, Paytm' : 'Pay when you receive the unit'}</p>
                    </div>
                  </label>
                ))}

                <button onClick={() => setStep(3)} className="w-full mt-6 bg-rose-600 text-white py-4 rounded-xl font-black uppercase text-sm tracking-widest flex justify-center items-center gap-2">
                  Review Order <ChevronRight size={16} />
                </button>
              </div>
            )}
            {step > 2 && (
              <div className="mt-4 text-sm text-zinc-400 pl-11">
                {paymentMethod === 'COD' ? 'Cash on Delivery' : paymentMethod}
                <button onClick={() => setStep(2)} className="ml-4 text-rose-500 hover:text-white transition-colors uppercase text-[10px] font-black tracking-widest">Change</button>
              </div>
            )}
          </div>

        </div>

        {/* Right Side: Order Summary */}
        <div className="lg:w-96 shrink-0">
          <div className="bg-zinc-900 border border-white/5 rounded-[2rem] p-8 sticky top-32">
            <h3 className="font-black italic uppercase tracking-tighter text-xl mb-6 border-b border-white/10 pb-4">Order Summary</h3>
            
            <div className="space-y-4 mb-6">
              {cart.map(item => (
                <div key={item.id} className="flex gap-4">
                  <img src={item.image} alt={item.name} className="w-16 h-16 rounded-xl object-cover bg-zinc-800" />
                  <div className="flex-1 text-sm">
                    <p className="font-bold text-white line-clamp-1">{item.name}</p>
                    <p className="text-zinc-500">Qty: {item.quantity}</p>
                    <p className="font-black text-rose-500 mt-1">₹{(item.price * item.quantity).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-3 py-4 border-y border-white/10 text-sm font-medium">
              <div className="flex justify-between text-zinc-400"><p>Subtotal</p><p>₹{subtotal.toLocaleString()}</p></div>
              <div className="flex justify-between text-zinc-400"><p>Tax (18% GST)</p><p>₹{tax.toLocaleString()}</p></div>
              <div className="flex justify-between text-zinc-400"><p>Shipping</p><p>{shipping === 0 ? 'FREE' : `₹${shipping}`}</p></div>
            </div>

            <div className="flex justify-between items-end mt-6 mb-8">
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Total Payable</p>
              <p className="text-3xl font-black italic tracking-tighter text-white">₹{total.toLocaleString()}</p>
            </div>

            {step === 3 && (
              <button onClick={handlePlaceOrder} className="w-full bg-rose-600 hover:bg-rose-500 text-white py-5 rounded-2xl font-black uppercase italic tracking-tighter shadow-[0_10px_30px_rgba(225,29,72,0.3)] transition-all flex items-center justify-center gap-2">
                <Check size={20} /> Place Order
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
