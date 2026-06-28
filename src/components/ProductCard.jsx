import { Link } from 'react-router-dom';
import { FiHeart } from 'react-icons/fi';

export default function ProductCard({ product }) {
  const discount = Math.round((1 - product.price / product.originalPrice) * 100);

  const badgeClass = product.badge
    ? product.badge.toLowerCase().replace(' ', '')
    : '';

  return (
    <Link to={`/product/${product.slug}`} className="product-card" id={`product-${product.id}`}>
      <div className="product-img-wrapper">
        <img src={product.image} alt={product.name} loading="lazy" />
        {product.badge && (
          <span className={`product-badge ${badgeClass}`}>{product.badge}</span>
        )}
        <span className="product-fit">{product.fit}</span>
        <button
          className="product-wishlist"
          aria-label="Add to wishlist"
          onClick={(e) => e.preventDefault()}
        >
          <FiHeart />
        </button>
      </div>
      <div className="product-info">
        <h3 className="product-name">{product.name}</h3>
        <p className="product-category">{product.category}</p>
        <div className="product-pricing">
          <span className="product-price">₹{product.price}</span>
          <span className="product-original">₹{product.originalPrice}</span>
          <span className="product-discount">({discount}% OFF)</span>
        </div>
      </div>
    </Link>
  );
}
