import { categories } from '../data/categories';

export default function CategoryGrid() {
  return (
    <section className="category-section" id="categories">
      <div className="container">
        <div className="section-header">
          <span className="section-tag">Browse By</span>
          <h2 className="section-title">Shop Categories</h2>
          <p className="section-subtitle">Find your perfect fit across our curated collections</p>
        </div>
        <div className="category-grid">
          {categories.map(cat => (
            <a key={cat.id} className="category-card" href="#">
              <div className="category-img">
                <img src={cat.image} alt={cat.name} />
              </div>
              <span className="category-name">{cat.name}</span>
              <span className="category-count">{cat.count} Products</span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
