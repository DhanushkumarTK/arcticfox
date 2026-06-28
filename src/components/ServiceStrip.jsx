import { FiTruck, FiRefreshCw, FiPercent } from 'react-icons/fi';

const services = [
  { icon: <FiPercent />, text: '10% Off on First Order — Use code FOXFIRST' },
  { icon: <FiRefreshCw />, text: '30 Days Easy Returns & Exchange' },
  { icon: <FiTruck />, text: 'Free Shipping on Orders Above ₹999' },
];

export default function ServiceStrip() {
  return (
    <section className="service-strip" id="service-strip">
      <div className="container">
        {services.map((s, i) => (
          <div key={i} className="service-item">
            <span className="service-icon">{s.icon}</span>
            {s.text}
          </div>
        ))}
      </div>
    </section>
  );
}
