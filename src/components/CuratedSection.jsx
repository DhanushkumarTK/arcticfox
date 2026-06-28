import { FiArrowRight } from 'react-icons/fi';

const curated = [
  {
    image: '/images/hero1.png',
    tag: 'Style Edit',
    title: 'Street Style',
    desc: 'Urban-ready fits for the bold.',
  },
  {
    image: '/images/hero3.png',
    tag: 'Curated',
    title: 'Minimal Edit',
    desc: 'Less is more. Clean cuts, calm tones.',
  },
  {
    image: '/images/hero2.png',
    tag: 'Trending',
    title: 'Bold & Graphic',
    desc: 'Statement tees that speak for you.',
  },
];

export default function CuratedSection() {
  return (
    <section className="curated-section" id="curated">
      <div className="container">
        <div className="section-header">
          <span className="section-tag">Curated For You</span>
          <h2 className="section-title">Style Edits</h2>
          <p className="section-subtitle">Handpicked looks for every mood</p>
        </div>
        <div className="curated-grid">
          {curated.map((c, i) => (
            <a key={i} className="curated-card" href="#">
              <img src={c.image} alt={c.title} />
              <div className="curated-overlay">
                <span className="curated-tag">{c.tag}</span>
                <h3 className="curated-title">{c.title}</h3>
                <p className="curated-desc">{c.desc}</p>
                <span className="curated-link">
                  Explore <FiArrowRight />
                </span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
