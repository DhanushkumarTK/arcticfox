import ProductCard from './ProductCard';

export default function ProductCarousel({ tag, title, subtitle, products, altBg }) {
  return (
    <section className={`product-carousel-section${altBg ? ' alt-bg' : ''}`} id={`section-${tag?.toLowerCase().replace(/\s/g, '-')}`}>
      <div className="container">
        <div className="section-header">
          {tag && <span className="section-tag">{tag}</span>}
          <h2 className="section-title">{title}</h2>
          {subtitle && <p className="section-subtitle">{subtitle}</p>}
        </div>
        <div className="product-grid">
          {products.map(p => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </div>
    </section>
  );
}
