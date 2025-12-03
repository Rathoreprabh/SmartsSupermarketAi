'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PrivateRoute from '@/components/auth/PrivateRoute';
import Navbar from '@/components/layout/Navbar';
import { Product } from '@/data/product';
import { ShippingAddress } from '@/types/order';
import { Loader, AlertCircle, CheckCircle } from 'lucide-react';

export default function CheckoutPage() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<(Product & { quantity: number })[]>([]);
  const [currentStep, setCurrentStep] = useState<'shipping' | 'payment' | 'review'>('shipping');
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
  });

  const [paymentMethod, setPaymentMethod] = useState('credit-card');
  const [cardDetails, setCardDetails] = useState({
    cardName: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
  });

  // Load cart
  useEffect(() => {
    const cart = localStorage.getItem('cart');
    if (cart) {
      const items = JSON.parse(cart);
      if (items.length === 0) {
        router.push('/cart');
      } else {
        setCartItems(items);
      }
    } else {
      router.push('/cart');
    }

    // Load user info
    const user = localStorage.getItem('user');
    if (user) {
      const userData = JSON.parse(user);
      setShippingAddress(prev => ({
        ...prev,
        email: userData.email,
        firstName: userData.fullName.split(' ')[0],
        lastName: userData.fullName.split(' ')[1] || '',
      }));
    }

    setIsLoading(false);
  }, [router]);

  // Calculations
  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const tax = subtotal * 0.08;
  const shipping = 9.99;
  const total = subtotal + tax + shipping;

  // Form handlers
  const handleShippingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setShippingAddress(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCardChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCardDetails(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  // Validate shipping address
  const validateShipping = () => {
    if (
      !shippingAddress.firstName ||
      !shippingAddress.lastName ||
      !shippingAddress.email ||
      !shippingAddress.phone ||
      !shippingAddress.address ||
      !shippingAddress.city ||
      !shippingAddress.zipCode ||
      !shippingAddress.country
    ) {
      setError('Please fill in all shipping fields');
      return false;
    }
    setError('');
    return true;
  };

  // Validate payment
  const validatePayment = () => {
    if (paymentMethod === 'credit-card') {
      if (
        !cardDetails.cardName ||
        !cardDetails.cardNumber ||
        !cardDetails.expiryDate ||
        !cardDetails.cvv
      ) {
        setError('Please fill in all card details');
        return false;
      }
    }
    setError('');
    return true;
  };

  // Handle step navigation
  const handleNextStep = () => {
    if (currentStep === 'shipping') {
      if (validateShipping()) {
        setCurrentStep('payment');
      }
    } else if (currentStep === 'payment') {
      if (validatePayment()) {
        setCurrentStep('review');
      }
    }
  };

  const handlePreviousStep = () => {
    if (currentStep === 'payment') {
      setCurrentStep('shipping');
    } else if (currentStep === 'review') {
      setCurrentStep('payment');
    }
  };

// Place order
const handlePlaceOrder = async () => {
  setIsProcessing(true);
  setError('');

  try {
    const token = localStorage.getItem('token');
    
    console.log('🔍 Debug - Token:', token ? 'EXISTS' : 'MISSING');
    console.log('🔍 Debug - Token preview:', token?.substring(0, 20));

    if (!token) {
      console.error('❌ No token found in localStorage');
      setError('Authentication error. Please logout and login again.');
      setIsProcessing(false);
      return;
    }

    console.log('📤 Sending order request...');

    const response = await fetch('/api/orders/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        items: cartItems,
        shippingAddress,
        paymentMethod,
        subtotal,
        tax,
        shipping,
        total,
      }),
    });

    console.log('📥 Response status:', response.status);

    const data = await response.json();
    console.log('📥 Response data:', data);

    if (!response.ok) {
      throw new Error(data.error || 'Failed to place order');
    }

    // Clear cart
    localStorage.removeItem('cart');

    console.log('✅ Order created successfully! Redirecting...');

    // Redirect to confirmation
    router.push(`/cart/checkout/confirmation?orderId=${data.order.id}`);
  } catch (err: any) {
    console.error('❌ Order error:', err);
    setError(err.message || 'An error occurred');
    setIsProcessing(false);
  }
};

  if (isLoading) {
    return (
      <PrivateRoute>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <div className="max-w-7xl mx-auto px-4 py-12 text-center">
            <Loader className="w-8 h-8 animate-spin mx-auto text-blue-600 mb-2" />
            <p className="text-gray-600">Loading checkout...</p>
          </div>
        </div>
      </PrivateRoute>
    );
  }

  return (
    <PrivateRoute>
      <div className="min-h-screen bg-gray-50">
        <Navbar />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Checkout</h1>
            <p className="text-gray-600">Complete your purchase</p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-red-900">{error}</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {/* Progress Steps */}
              <div className="mb-8 flex items-center justify-between">
                {(['shipping', 'payment', 'review'] as const).map((step, index) => (
                  <div key={step} className="flex items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition ${
                        currentStep === step || (index === 0 && ['shipping', 'payment', 'review'].indexOf(currentStep) > 0)
                          ? 'bg-blue-600 text-white'
                          : (index === 1 && currentStep === 'review')
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 text-gray-600'
                      }`}
                    >
                      {index === 0 && <span>1</span>}
                      {index === 1 && <span>2</span>}
                      {index === 2 && <span>3</span>}
                    </div>
                    {index < 2 && (
                      <div
                        className={`w-16 h-1 mx-2 transition ${
                          ['shipping', 'payment', 'review'].indexOf(currentStep) > index
                            ? 'bg-blue-600'
                            : 'bg-gray-300'
                        }`}
                      ></div>
                    )}
                  </div>
                ))}
              </div>

              {/* Step Labels */}
              <div className="flex justify-between text-xs font-semibold text-gray-600 mb-8">
                <span>Shipping Address</span>
                <span>Payment Method</span>
                <span>Review Order</span>
              </div>

              {/* Shipping Step */}
              {currentStep === 'shipping' && (
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    Shipping Address
                  </h2>

                  <div className="space-y-4">
                    {/* Name Row */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          First Name
                        </label>
                        <input
                          type="text"
                          name="firstName"
                          value={shippingAddress.firstName}
                          onChange={handleShippingChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Last Name
                        </label>
                        <input
                          type="text"
                          name="lastName"
                          value={shippingAddress.lastName}
                          onChange={handleShippingChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    {/* Email & Phone */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Email
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={shippingAddress.email}
                          onChange={handleShippingChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Phone
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          value={shippingAddress.phone}
                          onChange={handleShippingChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    {/* Address */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Street Address
                      </label>
                      <input
                        type="text"
                        name="address"
                        value={shippingAddress.address}
                        onChange={handleShippingChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    {/* City, State, Zip */}
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          City
                        </label>
                        <input
                          type="text"
                          name="city"
                          value={shippingAddress.city}
                          onChange={handleShippingChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          State
                        </label>
                        <input
                          type="text"
                          name="state"
                          value={shippingAddress.state}
                          onChange={handleShippingChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Zip Code
                        </label>
                        <input
                          type="text"
                          name="zipCode"
                          value={shippingAddress.zipCode}
                          onChange={handleShippingChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    {/* Country */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Country
                      </label>
                      <input
                        type="text"
                        name="country"
                        value={shippingAddress.country}
                        onChange={handleShippingChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Payment Step */}
              {currentStep === 'payment' && (
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    Payment Method
                  </h2>

                  {/* Payment Options */}
                  <div className="space-y-4 mb-8">
                    {/* Credit Card Option */}
                    <label className="flex items-center p-4 border-2 rounded-lg cursor-pointer transition hover:bg-blue-50"
                      style={{
                        borderColor: paymentMethod === 'credit-card' ? '#2563eb' : '#e5e7eb',
                        backgroundColor: paymentMethod === 'credit-card' ? '#f0f9ff' : 'transparent',
                      }}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="credit-card"
                        checked={paymentMethod === 'credit-card'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="w-4 h-4 accent-blue-600"
                      />
                      <span className="ml-3 text-lg font-semibold text-gray-900">
                        💳 Credit Card
                      </span>
                    </label>

                    {/* PayPal Option */}
                    <label className="flex items-center p-4 border-2 border-gray-300 rounded-lg cursor-pointer transition hover:bg-gray-50">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="paypal"
                        checked={paymentMethod === 'paypal'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="w-4 h-4 accent-blue-600"
                      />
                      <span className="ml-3 text-lg font-semibold text-gray-900">
                        🅿️ PayPal
                      </span>
                    </label>

                    {/* Apple Pay Option */}
                    <label className="flex items-center p-4 border-2 border-gray-300 rounded-lg cursor-pointer transition hover:bg-gray-50">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="apple-pay"
                        checked={paymentMethod === 'apple-pay'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="w-4 h-4 accent-blue-600"
                      />
                      <span className="ml-3 text-lg font-semibold text-gray-900">
                        🍎 Apple Pay
                      </span>
                    </label>
                  </div>

                  {/* Credit Card Details */}
                  {paymentMethod === 'credit-card' && (
                    <div className="space-y-4 border-t pt-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Cardholder Name
                        </label>
                        <input
                          type="text"
                          name="cardName"
                          value={cardDetails.cardName}
                          onChange={handleCardChange}
                          placeholder="John Doe"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Card Number
                        </label>
                        <input
                          type="text"
                          name="cardNumber"
                          value={cardDetails.cardNumber}
                          onChange={handleCardChange}
                          placeholder="4532 1234 5678 9010"
                          maxLength={19}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Expiry Date
                          </label>
                          <input
                            type="text"
                            name="expiryDate"
                            value={cardDetails.expiryDate}
                            onChange={handleCardChange}
                            placeholder="MM/YY"
                            maxLength={5}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            CVV
                          </label>
                          <input
                            type="text"
                            name="cvv"
                            value={cardDetails.cvv}
                            onChange={handleCardChange}
                            placeholder="123"
                            maxLength={3}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>

                      {/* Security Info */}
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <p className="text-xs text-blue-700">
                          🔒 Your payment information is secured and encrypted
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Review Step */}
              {currentStep === 'review' && (
                <div className="space-y-6">
                  {/* Order Items */}
                  <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">
                      Order Items
                    </h3>
                    <div className="space-y-3">
                      {cartItems.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between pb-3 border-b border-gray-200"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-3xl">{item.image}</span>
                            <div>
                              <p className="font-semibold text-gray-900">{item.name}</p>
                              <p className="text-sm text-gray-600">
                                Qty: {item.quantity} × ${item.price.toFixed(2)}
                              </p>
                            </div>
                          </div>
                          <p className="font-bold text-gray-900">
                            ${(item.price * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Shipping Info */}
                  <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">
                      Shipping Address
                    </h3>
                    <div className="text-gray-700 space-y-1">
                      <p className="font-semibold">
                        {shippingAddress.firstName} {shippingAddress.lastName}
                      </p>
                      <p>{shippingAddress.address}</p>
                      <p>
                        {shippingAddress.city}, {shippingAddress.state}{' '}
                        {shippingAddress.zipCode}
                      </p>
                      <p>{shippingAddress.country}</p>
                      <p className="text-sm text-gray-600 mt-2">
                        📧 {shippingAddress.email}
                        <br />
                        📱 {shippingAddress.phone}
                      </p>
                    </div>
                  </div>

                  {/* Payment Info */}
                  <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">
                      Payment Method
                    </h3>
                    <p className="text-gray-900 capitalize">
                      {paymentMethod === 'credit-card' && '💳 Credit Card'}
                      {paymentMethod === 'paypal' && '🅿️ PayPal'}
                      {paymentMethod === 'apple-pay' && '🍎 Apple Pay'}
                    </p>
                    {paymentMethod === 'credit-card' && (
                      <p className="text-sm text-gray-600 mt-2">
                        Card ending in {cardDetails.cardNumber.slice(-4)}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="mt-8 flex gap-4">
                <button
                  onClick={handlePreviousStep}
                  disabled={currentStep === 'shipping' || isProcessing}
                  className="px-6 py-3 border-2 border-gray-300 text-gray-900 rounded-lg hover:bg-gray-50 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ← Back
                </button>

                {currentStep !== 'review' ? (
                  <button
                    onClick={handleNextStep}
                    disabled={isProcessing}
                    className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    Continue →
                  </button>
                ) : (
                  <button
                    onClick={handlePlaceOrder}
                    disabled={isProcessing}
                    className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isProcessing ? (
                      <>
                        <Loader className="w-4 h-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        Place Order
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* Order Summary Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow p-6 sticky top-20 h-fit">
                <h3 className="text-lg font-bold text-gray-900 mb-6">
                  Order Summary
                </h3>

                {/* Items Count */}
                <div className="mb-6 pb-6 border-b border-gray-200">
                  <p className="text-sm text-gray-600 mb-2">
                    {cartItems.length} item{cartItems.length !== 1 ? 's' : ''} in cart
                  </p>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">
                          {item.name} x{item.quantity}
                        </span>
                        <span className="font-semibold text-gray-900">
                          ${(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Price Breakdown */}
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Tax (8%)</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping</span>
                    <span>${shipping.toFixed(2)}</span>
                  </div>
                </div>

                {/* Total */}
                <div className="pb-6 border-b border-gray-200">
                  <div className="flex justify-between">
                    <span className="font-bold text-gray-900">Total</span>
                    <span className="font-bold text-2xl text-blue-600">
                      ${total.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Benefits */}
                <div className="mt-6 space-y-2 text-xs text-gray-600">
                  <p>✓ Fast & free delivery</p>
                  <p>✓ 30-day returns</p>
                  <p>✓ Secure checkout</p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </PrivateRoute>
  );
}