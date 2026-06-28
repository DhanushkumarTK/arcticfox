import { Link } from 'react-router-dom';
import { FiX, FiMinus, FiPlus, FiShoppingBag, FiArrowLeft, FiTag, FiTruck, FiShield, FiGift } from 'react-icons/fi';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useCart } from '../context/CartContext';

export default function Cart() {
  const {
    cartItems, removeFromCart, updateQuantity, clearCart,
    cartCount, cartTotal, cartOriginalTotal, cartSavings,
  } = useCart();

  if (cartItems.length === 0) {
    return (
      <>
        <Navbar />
        <main className="cart-page cart-empty-page">
          <div className="container">
            <div className="cart-empty" id="cart-empty">
              <div className="cart-empty-icon">
                <FiShoppingBag />
              </div>
              <h2>Your Bag is Empty</h2>
              <p>Looks like you haven't added anything to your bag yet. Explore our collection and find something you love!</p>
              <Link to="/" className="cart-empty-btn">
                <FiArrowLeft /> Continue Shopping
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="cart-page" id="cart-page">
        <div className="container">
          {/* Cart Header */}
          <div className="cart-header">
            <div>
              <h1 className="cart-title">Shopping Bag</h1>
              <p className="cart-subtitle">{cartCount} {cartCount === 1 ? 'item' : 'items'} in your bag</p>
            </div>
            <Link to="/" className="cart-continue-link">
              <FiArrowLeft /> Continue Shopping
            </Link>
          </div>

          <div className="cart-layout">
            {/* Cart Items */}
            <div className="cart-items-section">
              {/* Free Shipping Banner */}
              {cartTotal < 999 ? (
                <div className="cart-shipping-banner">
                  <FiTruck />
                  <span>Add <strong>₹{999 - cartTotal}</strong> more for <strong>FREE Delivery</strong></span>
                  <div className="cart-shipping-progress">
                    <div className="cart-shipping-bar" style={{ width: `${Math.min((cartTotal / 999) * 100, 100)}%` }} />
                  </div>
                </div>
              ) : (
                <div className="cart-shipping-banner cart-shipping-free">
                  <FiTruck />
                  <span>Yay! You get <strong>FREE Delivery</strong> on this order 🎉</span>
                </div>
              )}

              {/* Items List */}
              <div className="cart-items-list" id="cart-items-list">
                {cartItems.map((item) => {
                  const discount = Math.round((1 - item.price / item.originalPrice) * 100);
                  const isCustom = !!item.customization;
                  const itemKey = `${item.id}-${item.size}-${item.color}${isCustom ? '-custom-' + item.customization.name : ''}`;
                  
                  return (
                    <div className="cart-item" key={itemKey} id={`cart-item-${item.id}`}>
                      <div className="cart-item-image">
                        <img src={item.image} alt={item.name} />
                      </div>
                      <div className="cart-item-details">
                        <div className="cart-item-top">
                          <div>
                            <Link to={`/product/${item.slug}`} className="cart-item-name">{item.name}</Link>
                            <p className="cart-item-meta">{item.fit} · {item.color} · {item.size}</p>
                            {isCustom && (
                              <span className="cart-custom-badge">
                                Customized for: {item.customization.name}
                              </span>
                            )}
                          </div>
                          <button
                            className="cart-item-remove"
                            onClick={() => removeFromCart(item.id, item.size, item.color, isCustom, item.customization?.image)}
                            aria-label="Remove item"
                          >
                            <FiX />
                          </button>
                        </div>
                        <div className="cart-item-bottom">
                          <div className="cart-item-pricing">
                            <span className="cart-item-price">₹{item.price * item.quantity}</span>
                            {isCustom ? (
                              <span className="cart-item-discount custom-pricing-badge">Custom Price</span>
                            ) : discount > 0 ? (
                              <>
                                <span className="cart-item-original">₹{item.originalPrice * item.quantity}</span>
                                <span className="cart-item-discount">{discount}% OFF</span>
                              </>
                            ) : null}
                          </div>
                          <div className="cart-qty-controls">
                            <button
                              className="cart-qty-btn"
                              onClick={() => updateQuantity(item.id, item.size, item.color, item.quantity - 1, isCustom, item.customization?.image)}
                              aria-label="Decrease quantity"
                            >
                              <FiMinus />
                            </button>
                            <span className="cart-qty-value">{item.quantity}</span>
                            <button
                              className="cart-qty-btn"
                              onClick={() => updateQuantity(item.id, item.size, item.color, item.quantity + 1, isCustom, item.customization?.image)}
                              disabled={item.quantity >= 10}
                              aria-label="Increase quantity"
                            >
                              <FiPlus />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Order Summary */}
            <div className="cart-summary-section" id="cart-summary">
              {/* Coupon */}
              <div className="cart-coupon-box">
                <div className="cart-coupon-header">
                  <FiTag />
                  <span>Apply Coupon</span>
                </div>
                <div className="cart-coupon-input">
                  <input type="text" placeholder="Enter coupon code" />
                  <button className="cart-coupon-apply">Apply</button>
                </div>
              </div>

              {/* Price Details */}
              <div className="cart-price-box">
                <h3 className="cart-price-title">Price Details ({cartCount} {cartCount === 1 ? 'Item' : 'Items'})</h3>
                <div className="cart-price-rows">
                  <div className="cart-price-row">
                    <span>Total MRP</span>
                    <span>₹{cartOriginalTotal.toLocaleString()}</span>
                  </div>
                  <div className="cart-price-row cart-price-savings">
                    <span>Discount on MRP</span>
                    <span>−₹{cartSavings.toLocaleString()}</span>
                  </div>
                  <div className="cart-price-row">
                    <span>Delivery Fee</span>
                    <span className={cartTotal >= 999 ? 'cart-free-label' : ''}>
                      {cartTotal >= 999 ? 'FREE' : '₹49'}
                    </span>
                  </div>
                  <div className="cart-price-divider" />
                  <div className="cart-price-row cart-price-total">
                    <span>Total Amount</span>
                    <span>₹{(cartTotal + (cartTotal >= 999 ? 0 : 49)).toLocaleString()}</span>
                  </div>
                </div>
                {cartSavings > 0 && (
                  <div className="cart-savings-strip">
                    <FiGift />
                    You're saving <strong>₹{cartSavings.toLocaleString()}</strong> on this order!
                  </div>
                )}
              </div>

              {/* Checkout Button */}
              <Link to="/checkout" className="cart-checkout-btn" id="checkout-btn" style={{ display: 'block', textAlign: 'center', textDecoration: 'none' }}>
                Place Order
              </Link>

              {/* Trust Badges */}
              <div className="cart-trust-badges">
                <div className="cart-trust-item">
                  <FiShield />
                  <span>Secure Payment</span>
                </div>
                <div className="cart-trust-item">
                  <FiTruck />
                  <span>Fast Delivery</span>
                </div>
                <div className="cart-trust-item">
                  <FiGift />
                  <span>Easy Returns</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
