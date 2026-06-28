import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FiHeart, FiShoppingBag, FiChevronRight, FiStar, FiTruck, FiRefreshCw, FiShield, FiChevronDown, FiCheck } from 'react-icons/fi';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ProductCard from '../components/ProductCard';
import { allProducts } from '../data/products';
import { useCart } from '../context/CartContext';
import { GOOGLE_SCRIPT_URL } from '../config';

export default function ProductDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const product = allProducts.find(p => p.slug === slug);

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [sizeError, setSizeError] = useState(false);
  const [openAccordion, setOpenAccordion] = useState('description');
  const [addedToBag, setAddedToBag] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const [isZooming, setIsZooming] = useState(false);

  // Customization States
  const [isCustomized, setIsCustomized] = useState(false);
  const [customImage, setCustomImage] = useState(null);
  const [customName, setCustomName] = useState(() => {
    try {
      const savedUser = localStorage.getItem('arcticfox-user');
      if (savedUser) {
        return JSON.parse(savedUser).name || '';
      }
    } catch {}
    return '';
  });
  const [customImageError, setCustomImageError] = useState('');
  const [uploading, setUploading] = useState(false);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      setCustomImageError('Please select a valid image file (PNG/JPG/JPEG)');
      setCustomImage(null);
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setCustomImageError('Image size exceeds 5MB. Please upload a smaller image.');
      setCustomImage(null);
      return;
    }

    setCustomImageError('');
    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      setCustomImage(uploadEvent.target.result);
    };
    reader.readAsDataURL(file);
  };

  // Scroll to top on product change
  useEffect(() => {
    window.scrollTo(0, 0);
    setSelectedImage(0);
    setSelectedSize('');
    setSelectedColor('');
    setAddedToBag(false);
    setSizeError(false);
    setIsCustomized(false);
    setCustomImage(null);
    setCustomImageError('');
    try {
      const savedUser = localStorage.getItem('arcticfox-user');
      if (savedUser) {
        setCustomName(JSON.parse(savedUser).name || '');
      }
    } catch {}
  }, [slug]);

  if (!product) {
    return (
      <>
        <Navbar />
        <main className="pdp-not-found">
          <div className="container">
            <h1>Product Not Found</h1>
            <p>Sorry, this product doesn't exist.</p>
            <Link to="/" className="pdp-back-home">Back to Home</Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const discount = Math.round((1 - product.price / product.originalPrice) * 100);

  const relatedProducts = allProducts
    .filter(p => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  // If not enough from same category, fill from others
  const recommendations = relatedProducts.length >= 4
    ? relatedProducts
    : [...relatedProducts, ...allProducts.filter(p => p.id !== product.id && !relatedProducts.find(r => r.id === p.id)).slice(0, 4 - relatedProducts.length)];

  const handleAddToBag = async () => {
    if (!selectedSize) {
      setSizeError(true);
      return;
    }

    if (isCustomized) {
      if (!customImage) {
        setCustomImageError('Please upload a print design to customize your T-shirt.');
        return;
      }
      if (!customName.trim()) {
        setCustomImageError('Please enter a name for the customization.');
        return;
      }

      setUploading(true);
      
      // Upload to Google Sheets
      if (GOOGLE_SCRIPT_URL) {
        try {
          const payload = {
            action: 'customize',
            name: customName,
            productName: product.name,
            size: selectedSize,
            color: selectedColor || product.colors[0]?.name || 'Default',
            imageData: customImage,
            timestamp: new Date().toISOString(),
          };

          await fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });
        } catch (err) {
          console.error('Apps Script Customization error:', err);
        }
      } else {
        console.log('Demo mode — customization saved locally:', {
          name: customName,
          product: product.name,
          imageLength: customImage.length
        });
      }
      
      setUploading(false);

      addToCart(product, selectedSize, selectedColor || product.colors[0]?.name || 'Default', {
        image: customImage,
        name: customName
      });
    } else {
      addToCart(product, selectedSize, selectedColor || product.colors[0]?.name || 'Default');
    }

    setAddedToBag(true);
    setTimeout(() => setAddedToBag(false), 2000);
  };

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPos({ x, y });
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <FiStar
          key={i}
          className={`pdp-star ${i <= Math.floor(rating) ? 'filled' : i - 0.5 <= rating ? 'half' : ''}`}
        />
      );
    }
    return stars;
  };

  const badgeClass = product.badge ? product.badge.toLowerCase().replace(' ', '') : '';

  return (
    <>
      <Navbar />
      <main className="pdp-page" id="product-detail">
        {/* Breadcrumb */}
        <div className="container">
          <nav className="pdp-breadcrumb" id="pdp-breadcrumb">
            <Link to="/">Home</Link>
            <FiChevronRight />
            <span>{product.category}</span>
            <FiChevronRight />
            <span className="pdp-breadcrumb-current">{product.name}</span>
          </nav>
        </div>

        {/* Main Product Section */}
        <section className="pdp-main">
          <div className="container pdp-layout">
            {/* Image Gallery */}
            <div className="pdp-gallery" id="pdp-gallery">
              <div
                className="pdp-main-image"
                onMouseMove={handleMouseMove}
                onMouseEnter={() => setIsZooming(true)}
                onMouseLeave={() => setIsZooming(false)}
              >
                <img
                  src={product.images[selectedImage]}
                  alt={product.name}
                  style={isZooming ? {
                    transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                    transform: 'scale(1.8)',
                  } : {}}
                />
                
                {/* Custom Overlay Print centered on chest */}
                {isCustomized && customImage && (
                  <div className="pdp-custom-print-overlay">
                    <img src={customImage} alt="Custom chest print" />
                  </div>
                )}

                {product.badge && (
                  <span className={`pdp-badge ${badgeClass}`}>{product.badge}</span>
                )}
                <span className="pdp-fit-tag">{product.fit}</span>
              </div>
              <div className="pdp-thumbnails">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    className={`pdp-thumb ${selectedImage === i ? 'active' : ''}`}
                    onClick={() => setSelectedImage(i)}
                  >
                    <img src={img} alt={`${product.name} view ${i + 1}`} />
                  </button>
                ))}
              </div>
            </div>

            {/* Product Info */}
            <div className="pdp-info" id="pdp-info">
              <h1 className="pdp-product-name">{product.name}</h1>
              <p className="pdp-product-category">{product.category} · {product.fit}</p>

              {/* Rating */}
              <div className="pdp-rating">
                <div className="pdp-stars">{renderStars(product.rating)}</div>
                <span className="pdp-rating-value">{product.rating}</span>
                <span className="pdp-review-count">({product.reviewCount} Reviews)</span>
              </div>

              {/* Pricing */}
              <div className="pdp-pricing">
                <span className="pdp-price">₹{isCustomized ? product.price + 250 : product.price}</span>
                <span className="pdp-original-price">₹{isCustomized ? product.originalPrice + 250 : product.originalPrice}</span>
                <span className="pdp-discount-badge">{isCustomized ? 'CUSTOMIZED' : `${discount}% OFF`}</span>
              </div>
              <p className="pdp-tax-note">Inclusive of all taxes</p>

              {/* Color Selector */}
              {product.colors && product.colors.length > 0 && (
                <div className="pdp-section">
                  <h3 className="pdp-section-label">
                    Color: <span className="pdp-selected-value">{selectedColor || product.colors[0].name}</span>
                  </h3>
                  <div className="pdp-color-swatches">
                    {product.colors.map((c) => (
                      <button
                        key={c.name}
                        className={`pdp-color-swatch ${(selectedColor || product.colors[0].name) === c.name ? 'active' : ''}`}
                        onClick={() => setSelectedColor(c.name)}
                        aria-label={c.name}
                        title={c.name}
                      >
                        <span
                          className="pdp-swatch-inner"
                          style={{ background: c.hex, border: c.hex === '#FFFFFF' ? '1px solid #ddd' : 'none' }}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Size Selector */}
              <div className="pdp-section">
                <div className="pdp-size-header">
                  <h3 className="pdp-section-label">
                    Select Size {selectedSize && <span className="pdp-selected-value">{selectedSize}</span>}
                  </h3>
                  <button className="pdp-size-guide">Size Guide</button>
                </div>
                <div className="pdp-sizes">
                  {product.sizes.map((s) => (
                    <button
                      key={s}
                      className={`pdp-size-btn ${selectedSize === s ? 'active' : ''}`}
                      onClick={() => { setSelectedSize(s); setSizeError(false); }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
                {sizeError && <p className="pdp-size-error">Please select a size</p>}
              </div>

              {/* Customizer Section */}
              <div className="pdp-customizer-box pdp-section">
                <label className="pdp-customize-toggle-label">
                  <input
                    type="checkbox"
                    checked={isCustomized}
                    onChange={(e) => {
                      setIsCustomized(e.target.checked);
                      setCustomImageError('');
                    }}
                    id="customize-toggle"
                  />
                  <span className="pdp-customize-toggle-text">
                    <strong>Yes, I want to customize this T-shirt!</strong> (+₹250 customization charge)
                  </span>
                </label>

                {isCustomized && (
                  <div className="pdp-customizer-form animate-fade-in">
                    <div className="pdp-customizer-input-group">
                      <label htmlFor="custom-name">Your Name for Customization:</label>
                      <input
                        type="text"
                        id="custom-name"
                        value={customName}
                        onChange={(e) => {
                          setCustomName(e.target.value);
                          if (customImageError.includes('name')) setCustomImageError('');
                        }}
                        placeholder="Enter user name"
                        className="pdp-custom-input"
                      />
                    </div>

                    <div className="pdp-customizer-input-group">
                      <label>Upload Print Image (less than 5MB):</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="pdp-custom-file-input"
                        id="custom-image-file"
                      />
                      {customImageError && (
                        <p className="pdp-customizer-error">{customImageError}</p>
                      )}
                      {customImage && (
                        <div className="pdp-customizer-success-tag">
                          ✓ Image loaded and optimized!
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pdp-actions">
                <button
                  className={`pdp-add-to-bag ${addedToBag ? 'added' : ''}`}
                  onClick={handleAddToBag}
                  id="add-to-bag"
                  disabled={uploading}
                >
                  {uploading ? (
                    <span className="auth-spinner" style={{ width: '20px', height: '20px', margin: '0 auto', display: 'block' }} />
                  ) : addedToBag ? (
                    <><FiCheck /> Added to Bag</>
                  ) : (
                    <><FiShoppingBag /> Add to Bag</>
                  )}
                </button>
                <button
                  className={`pdp-wishlist-btn ${wishlisted ? 'active' : ''}`}
                  onClick={() => setWishlisted(!wishlisted)}
                  id="add-to-wishlist"
                >
                  <FiHeart /> {wishlisted ? 'Wishlisted' : 'Wishlist'}
                </button>
              </div>

              {/* Delivery Strip */}
              <div className="pdp-delivery-strip">
                <div className="pdp-delivery-item">
                  <FiTruck />
                  <div>
                    <strong>Free Delivery</strong>
                    <span>On orders above ₹999</span>
                  </div>
                </div>
                <div className="pdp-delivery-item">
                  <FiRefreshCw />
                  <div>
                    <strong>Easy Returns</strong>
                    <span>15-day return policy</span>
                  </div>
                </div>
                <div className="pdp-delivery-item">
                  <FiShield />
                  <div>
                    <strong>Quality Assured</strong>
                    <span>Premium materials</span>
                  </div>
                </div>
              </div>

              {/* Accordion */}
              <div className="pdp-accordion">
                <div className="pdp-accordion-item">
                  <button
                    className={`pdp-accordion-header ${openAccordion === 'description' ? 'open' : ''}`}
                    onClick={() => setOpenAccordion(openAccordion === 'description' ? '' : 'description')}
                  >
                    Product Description
                    <FiChevronDown />
                  </button>
                  {openAccordion === 'description' && (
                    <div className="pdp-accordion-body">
                      <p>{product.description}</p>
                    </div>
                  )}
                </div>
                <div className="pdp-accordion-item">
                  <button
                    className={`pdp-accordion-header ${openAccordion === 'fabric' ? 'open' : ''}`}
                    onClick={() => setOpenAccordion(openAccordion === 'fabric' ? '' : 'fabric')}
                  >
                    Fabric & Care
                    <FiChevronDown />
                  </button>
                  {openAccordion === 'fabric' && (
                    <div className="pdp-accordion-body">
                      <div className="pdp-spec-row"><strong>Fabric:</strong> <span>{product.fabric}</span></div>
                      <div className="pdp-spec-row"><strong>Wash Care:</strong> <span>{product.washCare}</span></div>
                    </div>
                  )}
                </div>
                <div className="pdp-accordion-item">
                  <button
                    className={`pdp-accordion-header ${openAccordion === 'shipping' ? 'open' : ''}`}
                    onClick={() => setOpenAccordion(openAccordion === 'shipping' ? '' : 'shipping')}
                  >
                    Shipping & Returns
                    <FiChevronDown />
                  </button>
                  {openAccordion === 'shipping' && (
                    <div className="pdp-accordion-body">
                      <div className="pdp-spec-row"><strong>Delivery:</strong> <span>3-7 business days across India</span></div>
                      <div className="pdp-spec-row"><strong>Free Shipping:</strong> <span>On all prepaid orders above ₹999</span></div>
                      <div className="pdp-spec-row"><strong>Returns:</strong> <span>15-day hassle-free returns & exchange</span></div>
                      <div className="pdp-spec-row"><strong>COD:</strong> <span>Available (₹49 extra)</span></div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* You May Also Like */}
        {recommendations.length > 0 && (
          <section className="pdp-recommendations" id="recommendations">
            <div className="container">
              <div className="section-header">
                <span className="section-tag">You May Also Like</span>
                <h2 className="section-title">Similar Products</h2>
              </div>
              <div className="product-grid">
                {recommendations.map(p => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
      <Footer />
    </>
  );
}
