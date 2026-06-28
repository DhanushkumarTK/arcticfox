import { useState } from 'react';

export default function Newsletter() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email) { setSubmitted(true); setEmail(''); }
  };

  return (
    <section className="newsletter-section" id="newsletter">
      <div className="container">
        <h2 className="newsletter-title">
          {submitted ? 'You\'re In! 🦊' : 'Join the Pack'}
        </h2>
        <p className="newsletter-subtitle">
          {submitted
            ? 'Welcome to the Arctic Fox family. Check your inbox for a surprise.'
            : 'Subscribe for early drops, exclusive deals, and 10% off your first order.'}
        </p>
        {!submitted && (
          <form className="newsletter-form" onSubmit={handleSubmit}>
            <input
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button type="submit">Subscribe</button>
          </form>
        )}
      </div>
    </section>
  );
}
