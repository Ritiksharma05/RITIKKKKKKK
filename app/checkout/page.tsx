/**
 * app/checkout/page.tsx
 * Checkout page — server component that reads cart from searchParams,
 * then renders the client CheckoutForm.
 */
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import CheckoutForm from '@/components/CheckoutForm';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Checkout — ZainsTyres',
  description: 'Complete your order securely with Razorpay',
};

// Dummy cart for demo — in production, read from DB / session / cookie
const DEMO_CART = [
  { productId: 'demo-1', name: 'MRF ZVTS 205/55 R16', quantity: 2, price: 4500 },
  { productId: 'demo-2', name: 'Apollo Alnac 4G 145/80 R13', quantity: 4, price: 2200 },
];

export default async function CheckoutPage() {
  const session = await auth();
  if (!session) redirect('/login?callbackUrl=/checkout');

  const total = DEMO_CART.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <main className="min-h-screen bg-[#0a0a0a] py-12 px-4">
      {/* Header */}
      <div className="max-w-5xl mx-auto mb-10">
        <a href="/" className="text-gray-500 hover:text-orange-400 text-sm transition-colors">← Back to shop</a>
        <h1 className="text-4xl font-black mt-4">
          <span className="gradient-text">Secure</span> Checkout
        </h1>
        <p className="text-gray-500 mt-1">Complete your order below</p>
      </div>

      {/* Form */}
      <div className="max-w-5xl mx-auto">
        <CheckoutForm
          items={DEMO_CART}
          total={total}
          userEmail={session.user?.email || ''}
          userName={session.user?.name || ''}
        />
      </div>
    </main>
  );
}
