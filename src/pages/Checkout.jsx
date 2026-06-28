import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiChevronLeft, FiMapPin, FiCreditCard, FiCheckCircle, FiChevronRight, FiCheck } from 'react-icons/fi';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useCart } from '../context/CartContext';
import { GOOGLE_SCRIPT_URL } from '../config';

export default function Checkout() {
  const navigate = useNavigate();
  const { cartItems, cartTotal, cartOriginalTotal, cartSavings, cartCount, clearCart } = useCart();

  // Step state: 'address' | 'payment' | 'confirmation'
  const [step, setStep] = useState('address');
  const [orderId, setOrderId] = useState('');
  
  // Address Form State
  const [address, setAddress] = useState(() => {
    try {
      const savedUser = localStorage.getItem('arcticfox-user');
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        return {
          name: parsed.name || '',
          phone: parsed.phone || '',
          email: parsed.email || '',
          pincode: '',
          flatNo: '',
          streetName: '',
          locality: '',
          city: '',
          state: '',
          type: 'Home' // Home or Office
        };
      }
    } catch {}
    return {
      name: '',
      phone: '',
      email: '',
      pincode: '',
      flatNo: '',
      streetName: '',
      locality: '',
      city: '',
      state: ''
    };
  });

  const [addressErrors, setAddressErrors] = useState({});

  // Payment Form State
  const [paymentMethod, setPaymentMethod] = useState('upi'); // upi | card | netbanking | cod
  const [upiId, setUpiId] = useState('');
  const [cardDetails, setCardDetails] = useState({ number: '', expiry: '', cvv: '' });
  const [selectedBank, setSelectedBank] = useState('');
  const [paymentErrors, setPaymentErrors] = useState('');
  const [loading, setLoading] = useState(false);

  // Confetti Canvas ref
  const canvasRef = useRef(null);

  // Redirect if cart is empty and not on confirmation
  useEffect(() => {
    if (cartItems.length === 0 && step !== 'confirmation') {
      navigate('/cart');
    }
  }, [cartItems, step, navigate]);

  // Generate Order ID & Confetti on Confirmation step
  useEffect(() => {
    if (step === 'confirmation') {
      const rand = Math.floor(10000 + Math.random() * 90000);
      setOrderId(`AF-${rand}`);
      startConfetti();
    }
  }, [step]);

  const handleAddressChange = (e) => {
    setAddress({ ...address, [e.target.name]: e.target.value });
    setAddressErrors({ ...addressErrors, [e.target.name]: '' });
  };

  const validateAddress = () => {
    const errors = {};
    if (!address.name.trim()) errors.name = 'Full Name is required';
    if (!address.phone.trim()) errors.phone = 'Mobile Number is required';
    else if (!/^\d{10}$/.test(address.phone.trim())) errors.phone = 'Enter a valid 10-digit number';
    if (!address.pincode.trim()) errors.pincode = 'Pin Code is required';
    else if (!/^\d{6}$/.test(address.pincode.trim())) errors.pincode = 'Enter a valid 6-digit pin code';
    if (!address.flatNo.trim()) errors.flatNo = 'Flat/House number is required';
    if (!address.streetName.trim()) errors.streetName = 'Street/Area details are required';
    if (!address.city.trim()) errors.city = 'City is required';
    if (!address.state.trim()) errors.state = 'State is required';

    setAddressErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleProceedToPayment = (e) => {
    e.preventDefault();
    if (validateAddress()) {
      setStep('payment');
      window.scrollTo(0, 0);
    }
  };

  const handlePlaceOrder = async () => {
    setPaymentErrors('');
    
    // Validate Payment details
    if (paymentMethod === 'upi') {
      if (!upiId.trim() || !upiId.includes('@')) {
        setPaymentErrors('Please enter a valid UPI ID (e.g. name@bank)');
        return;
      }
    } else if (paymentMethod === 'card') {
      if (!cardDetails.number.trim() || cardDetails.number.length < 16) {
        setPaymentErrors('Please enter a valid 16-digit Card Number');
        return;
      }
      if (!cardDetails.expiry.trim() || !cardDetails.expiry.includes('/')) {
        setPaymentErrors('Please enter expiration (MM/YY)');
        return;
      }
      if (!cardDetails.cvv.trim() || cardDetails.cvv.length < 3) {
        setPaymentErrors('Please enter a valid 3-digit CVV');
        return;
      }
    } else if (paymentMethod === 'netbanking') {
      if (!selectedBank) {
        setPaymentErrors('Please select your Bank');
        return;
      }
    }

    setLoading(true);

    const generatedId = `AF-${Math.floor(10000 + Math.random() * 90000)}`;
    const fullAddressString = `${address.flatNo}, ${address.streetName}, ${address.locality ? address.locality + ', ' : ''}${address.city}, ${address.state} - ${address.pincode}`;
    
    const orderPayload = {
      action: 'place_order',
      orderId: generatedId,
      name: address.name,
      email: address.email || 'customer@example.com',
      phone: address.phone,
      address: fullAddressString,
      paymentMethod: paymentMethod.toUpperCase(),
      totalAmount: cartTotal + (cartTotal >= 999 ? 0 : 49),
      timestamp: new Date().toISOString(),
      items: cartItems.map(item => ({
        id: item.id,
        name: item.name,
        size: item.size,
        color: item.color,
        quantity: item.quantity,
        price: item.price,
        customization: item.customization ? { name: item.customization.name } : null
      }))
    };

    // Upload to Google Sheets
    if (GOOGLE_SCRIPT_URL) {
      try {
        await fetch(GOOGLE_SCRIPT_URL, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(orderPayload),
        });
      } catch (err) {
        console.error('Apps Script Order Placement error:', err);
      }
    } else {
      console.log('Demo mode — order processed locally:', orderPayload);
    }

    setOrderId(generatedId);
    setLoading(false);
    
    // Delay clearing cart slightly so confirmation screen can render the lists
    setTimeout(() => {
      clearCart();
    }, 100);

    setStep('confirmation');
    window.scrollTo(0, 0);
  };

  // Canvas Confetti logic
  const startConfetti = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = canvas.parentElement.clientHeight;

    const colors = ['#aa3bff', '#2e86ab', '#27ae60', '#f4a261', '#e76f51'];
    const confettiCount = 120;
    const confettiPieces = [];

    for (let i = 0; i < confettiCount; i++) {
      confettiPieces.push({
        x: Math.random() * canvas.width,
        y: Math.random() * -canvas.height,
        size: Math.random() * 6 + 6,
        color: colors[Math.floor(Math.random() * colors.length)],
        speed: Math.random() * 3 + 2,
        rotation: Math.random() * 360,
        rotationSpeed: Math.random() * 4 - 2
      });
    }

    let animationFrameId;
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let active = false;

      confettiPieces.forEach(p => {
        p.y += p.speed;
        p.rotation += p.rotationSpeed;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        ctx.restore();

        if (p.y < canvas.height) {
          active = true;
        }
      });

      if (active) {
        animationFrameId = requestAnimationFrame(render);
      }
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  };

  // Delivery estimation (3-5 days from now)
  const getDeliveryDate = () => {
    const date = new Date();
    date.setDate(date.getDate() + 4);
    return date.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' });
  };

  return (
    <>
      <Navbar />
      <main className="checkout-page" id="checkout-page">
        <div className="container">
          {/* Checkout Steps Tracker */}
          <div className="checkout-steps-tracker">
            <div className={`checkout-step ${step === 'address' ? 'active' : 'completed'}`}>
              <FiMapPin /> Address
            </div>
            <div className={`checkout-step-line ${step !== 'address' ? 'active' : ''}`} />
            <div className={`checkout-step ${step === 'payment' ? 'active' : step === 'confirmation' ? 'completed' : ''}`}>
              <FiCreditCard /> Payment
            </div>
            <div className={`checkout-step-line ${step === 'confirmation' ? 'active' : ''}`} />
            <div className={`checkout-step ${step === 'confirmation' ? 'active' : ''}`}>
              <FiCheckCircle /> Confirmation
            </div>
          </div>

          {step !== 'confirmation' ? (
            <div className="checkout-layout">
              {/* Left Column — Address/Payment Forms */}
              <div className="checkout-main-panel">
                {step === 'address' ? (
                  <div className="checkout-form-panel">
                    <h2 className="checkout-form-title">Delivery Address</h2>
                    <form onSubmit={handleProceedToPayment} className="checkout-form">
                      <div className="checkout-form-row">
                        <div className="checkout-input-group">
                          <label htmlFor="name">Full Name *</label>
                          <input
                            type="text"
                            id="name"
                            name="name"
                            value={address.name}
                            onChange={handleAddressChange}
                            className="checkout-input"
                            placeholder="Enter your name"
                          />
                          {addressErrors.name && <p className="pdp-customizer-error">{addressErrors.name}</p>}
                        </div>
                        <div className="checkout-input-group">
                          <label htmlFor="phone">Mobile Number (10 digits) *</label>
                          <input
                            type="tel"
                            id="phone"
                            name="phone"
                            maxLength={10}
                            value={address.phone}
                            onChange={handleAddressChange}
                            className="checkout-input"
                            placeholder="Enter 10-digit number"
                          />
                          {addressErrors.phone && <p className="pdp-customizer-error">{addressErrors.phone}</p>}
                        </div>
                      </div>

                      <div className="checkout-form-row">
                        <div className="checkout-input-group">
                          <label htmlFor="email">Email Address *</label>
                          <input
                            type="email"
                            id="email"
                            name="email"
                            value={address.email}
                            onChange={handleAddressChange}
                            className="checkout-input"
                            placeholder="name@example.com"
                            required
                          />
                        </div>
                        <div className="checkout-input-group">
                          <label htmlFor="pincode">Pin Code *</label>
                          <input
                            type="text"
                            id="pincode"
                            name="pincode"
                            maxLength={6}
                            value={address.pincode}
                            onChange={handleAddressChange}
                            className="checkout-input"
                            placeholder="6-digit pincode"
                          />
                          {addressErrors.pincode && <p className="pdp-customizer-error">{addressErrors.pincode}</p>}
                        </div>
                      </div>

                      <div className="checkout-input-group">
                        <label htmlFor="flatNo">Flat / House No. / Building / Apartment *</label>
                        <input
                          type="text"
                          id="flatNo"
                          name="flatNo"
                          value={address.flatNo}
                          onChange={handleAddressChange}
                          className="checkout-input"
                          placeholder="House, Flat or Apartment details"
                        />
                        {addressErrors.flatNo && <p className="pdp-customizer-error">{addressErrors.flatNo}</p>}
                      </div>

                      <div className="checkout-input-group">
                        <label htmlFor="streetName">Street Address / Area / Colony *</label>
                        <input
                          type="text"
                          id="streetName"
                          name="streetName"
                          value={address.streetName}
                          onChange={handleAddressChange}
                          className="checkout-input"
                          placeholder="Colony, Street, Road, or Area name"
                        />
                        {addressErrors.streetName && <p className="pdp-customizer-error">{addressErrors.streetName}</p>}
                      </div>

                      <div className="checkout-form-row">
                        <div className="checkout-input-group">
                          <label htmlFor="city">City *</label>
                          <input
                            type="text"
                            id="city"
                            name="city"
                            value={address.city}
                            onChange={handleAddressChange}
                            className="checkout-input"
                            placeholder="Enter City"
                          />
                          {addressErrors.city && <p className="pdp-customizer-error">{addressErrors.city}</p>}
                        </div>
                        <div className="checkout-input-group">
                          <label htmlFor="state">State *</label>
                          <input
                            type="text"
                            id="state"
                            name="state"
                            value={address.state}
                            onChange={handleAddressChange}
                            className="checkout-input"
                            placeholder="Enter State"
                          />
                          {addressErrors.state && <p className="pdp-customizer-error">{addressErrors.state}</p>}
                        </div>
                      </div>

                      <div className="checkout-input-group">
                        <label>Address Type</label>
                        <div style={{ display: 'flex', gap: '16px', marginTop: '4px' }}>
                          <button
                            type="button"
                            className={`pdp-size-btn ${address.type === 'Home' ? 'active' : ''}`}
                            onClick={() => setAddress({ ...address, type: 'Home' })}
                            style={{ flex: 1, padding: '10px' }}
                          >
                            Home
                          </button>
                          <button
                            type="button"
                            className={`pdp-size-btn ${address.type === 'Office' ? 'active' : ''}`}
                            onClick={() => setAddress({ ...address, type: 'Office' })}
                            style={{ flex: 1, padding: '10px' }}
                          >
                            Office / Commercial
                          </button>
                        </div>
                      </div>

                      <button type="submit" className="checkout-btn-primary" style={{ marginTop: '10px' }}>
                        Proceed to Payment <FiChevronRight />
                      </button>
                    </form>
                  </div>
                ) : (
                  <div className="checkout-form-panel">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                      <h2 className="checkout-form-title" style={{ margin: 0, border: 'none', padding: 0 }}>Choose Payment Method</h2>
                      <button onClick={() => setStep('address')} className="cart-continue-link" style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '13px' }}>
                        <FiChevronLeft /> Change Address
                      </button>
                    </div>

                    <div className="payment-selector-box">
                      {/* Left Tabs (Souled Store tab design) */}
                      <div className="payment-tabs">
                        <button
                          className={`payment-tab-btn ${paymentMethod === 'upi' ? 'active' : ''}`}
                          onClick={() => { setPaymentMethod('upi'); setPaymentErrors(''); }}
                        >
                          UPI / GPay
                        </button>
                        <button
                          className={`payment-tab-btn ${paymentMethod === 'card' ? 'active' : ''}`}
                          onClick={() => { setPaymentMethod('card'); setPaymentErrors(''); }}
                        >
                          Cards (Debit/Credit)
                        </button>
                        <button
                          className={`payment-tab-btn ${paymentMethod === 'netbanking' ? 'active' : ''}`}
                          onClick={() => { setPaymentMethod('netbanking'); setPaymentErrors(''); }}
                        >
                          Net Banking
                        </button>
                        <button
                          className={`payment-tab-btn ${paymentMethod === 'cod' ? 'active' : ''}`}
                          onClick={() => { setPaymentMethod('cod'); setPaymentErrors(''); }}
                        >
                          Cash on Delivery
                        </button>
                      </div>

                      {/* Right Panel Contents */}
                      <div className="payment-tab-content">
                        {paymentMethod === 'upi' && (
                          <div className="checkout-form">
                            <div className="checkout-input-group">
                              <label htmlFor="upiId">Enter UPI ID *</label>
                              <input
                                type="text"
                                id="upiId"
                                value={upiId}
                                onChange={(e) => setUpiId(e.target.value)}
                                className="checkout-input"
                                placeholder="username@bank"
                              />
                              <p style={{ fontSize: '11px', color: '#999', margin: '4px 0 0' }}>Pay directly via Google Pay, PhonePe, Paytm, or BHIM.</p>
                            </div>
                          </div>
                        )}

                        {paymentMethod === 'card' && (
                          <div className="checkout-form">
                            <div className="checkout-input-group">
                              <label htmlFor="cardNumber">Card Number *</label>
                              <input
                                type="text"
                                id="cardNumber"
                                maxLength={16}
                                value={cardDetails.number}
                                onChange={(e) => setCardDetails({ ...cardDetails, number: e.target.value.replace(/\D/g, '') })}
                                className="checkout-input"
                                placeholder="0000 0000 0000 0000"
                              />
                            </div>
                            <div className="checkout-form-row">
                              <div className="checkout-input-group">
                                <label htmlFor="cardExpiry">Expiry Date *</label>
                                <input
                                  type="text"
                                  id="cardExpiry"
                                  maxLength={5}
                                  value={cardDetails.expiry}
                                  onChange={(e) => setCardDetails({ ...cardDetails, expiry: e.target.value })}
                                  className="checkout-input"
                                  placeholder="MM/YY"
                                />
                              </div>
                              <div className="checkout-input-group">
                                <label htmlFor="cardCvv">CVV *</label>
                                <input
                                  type="password"
                                  id="cardCvv"
                                  maxLength={3}
                                  value={cardDetails.cvv}
                                  onChange={(e) => setCardDetails({ ...cardDetails, cvv: e.target.value.replace(/\D/g, '') })}
                                  className="checkout-input"
                                  placeholder="***"
                                />
                              </div>
                            </div>
                          </div>
                        )}

                        {paymentMethod === 'netbanking' && (
                          <div className="checkout-form">
                            <div className="checkout-input-group">
                              <label htmlFor="bankSelect">Select your Bank *</label>
                              <select
                                id="bankSelect"
                                value={selectedBank}
                                onChange={(e) => setSelectedBank(e.target.value)}
                                className="checkout-input"
                                style={{ background: '#fff', cursor: 'pointer' }}
                              >
                                <option value="">-- Choose Bank --</option>
                                <option value="sbi">State Bank of India</option>
                                <option value="hdfc">HDFC Bank</option>
                                <option value="icici">ICICI Bank</option>
                                <option value="axis">Axis Bank</option>
                                <option value="kotak">Kotak Mahindra Bank</option>
                              </select>
                            </div>
                          </div>
                        )}

                        {paymentMethod === 'cod' && (
                          <div>
                            <div className="payment-info-note">
                              <strong>📦 Cash on Delivery (COD) Policy</strong>
                              <p style={{ margin: '8px 0 0', fontSize: '12px' }}>
                                A flat collection fee of <strong>₹49</strong> is applicable for COD orders. You can pay the delivery agent in cash or UPI when your shipment arrives.
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {paymentErrors && (
                      <div className="auth-error" style={{ marginBottom: '20px' }}>
                        {paymentErrors}
                      </div>
                    )}

                    <button
                      onClick={handlePlaceOrder}
                      className="checkout-btn-primary"
                      disabled={loading}
                    >
                      {loading ? (
                        <span className="auth-spinner" style={{ width: '20px', height: '20px', margin: '0 auto', display: 'block' }} />
                      ) : (
                        `Pay & Place Order (₹${(cartTotal + (cartTotal >= 999 ? 0 : 49) + (paymentMethod === 'cod' ? 49 : 0)).toLocaleString()})`
                      )}
                    </button>
                  </div>
                )}
              </div>

              {/* Right Column — Summary Panel */}
              <div className="checkout-summary-panel">
                <div className="cart-price-box">
                  <h3 className="cart-price-title">Order Details</h3>
                  <div className="cart-price-rows">
                    <div className="cart-price-row">
                      <span>Bag Total ({cartCount} {cartCount === 1 ? 'item' : 'items'})</span>
                      <span>₹{cartOriginalTotal.toLocaleString()}</span>
                    </div>
                    <div className="cart-price-row cart-price-savings">
                      <span>Product Discount</span>
                      <span>−₹{cartSavings.toLocaleString()}</span>
                    </div>
                    <div className="cart-price-row">
                      <span>Delivery Fee</span>
                      <span className={cartTotal >= 999 ? 'cart-free-label' : ''}>
                        {cartTotal >= 999 ? 'FREE' : '₹49'}
                      </span>
                    </div>
                    {paymentMethod === 'cod' && step === 'payment' && (
                      <div className="cart-price-row">
                        <span>COD Collection Fee</span>
                        <span>₹49</span>
                      </div>
                    )}
                    <div className="cart-price-divider" />
                    <div className="cart-price-row cart-price-total">
                      <span>Total Amount</span>
                      <span>₹{(cartTotal + (cartTotal >= 999 ? 0 : 49) + (paymentMethod === 'cod' && step === 'payment' ? 49 : 0)).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Items in summary list */}
                <div className="cart-price-box" style={{ marginTop: '16px', padding: '16px 20px' }}>
                  <h4 style={{ margin: '0 0 12px', fontSize: '13px', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Items in Bag</h4>
                  <div className="confirmation-items-list">
                    {cartItems.map((item) => (
                      <div key={`${item.id}-${item.size}-${item.color}`} className="confirmation-item-line">
                        <div className="confirmation-item-meta">
                          <img src={item.image} alt={item.name} />
                          <div>
                            <span style={{ fontWeight: '700', color: 'var(--text-primary)', display: 'block', fontSize: '12px' }}>{item.name}</span>
                            <span style={{ color: 'var(--muted)', fontSize: '11px' }}>Size: {item.size} · Qty: {item.quantity}</span>
                            {item.customization && (
                              <span className="custom-order-badge">Custom</span>
                            )}
                          </div>
                        </div>
                        <span style={{ fontWeight: '700', fontSize: '12px' }}>₹{item.price * item.quantity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Step 3: Confirmation Panel */
            <div className="confirmation-card">
              {/* Confetti canvas */}
              <canvas ref={canvasRef} className="confetti-canvas-overlay" />

              <div className="confirmation-icon">
                <FiCheck />
              </div>
              <h1 className="confirmation-title">Order Placed Successfully!</h1>
              <p className="confirmation-subtitle">
                Thank you for shopping with Arctic Fox. Your order has been registered and is being prepared.
              </p>

              <div className="confirmation-order-details">
                <div className="confirmation-detail-row">
                  <span>Order ID:</span>
                  <strong>{orderId}</strong>
                </div>
                <div className="confirmation-detail-row">
                  <span>Deliver To:</span>
                  <strong>{address.name}</strong>
                </div>
                <div className="confirmation-detail-row">
                  <span>Contact:</span>
                  <strong>{address.phone}</strong>
                </div>
                <div className="confirmation-detail-row">
                  <span>Estimated Delivery:</span>
                  <strong style={{ color: '#27AE60' }}>{getDeliveryDate()}</strong>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '16px' }}>
                <Link to="/" className="checkout-btn-primary" style={{ flex: 1, textDecoration: 'none', textAlign: 'center' }}>
                  Continue Shopping
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
