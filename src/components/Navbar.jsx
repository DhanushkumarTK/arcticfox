import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiSearch, FiUser, FiHeart, FiShoppingBag, FiMenu, FiX } from 'react-icons/fi';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { cartCount } = useCart();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const links = ['Men', 'Women', 'New Arrivals', 'Oversized', 'Collections'];

  return (
    <>
      <header className={`navbar${scrolled ? ' scrolled' : ''}`} id="navbar">
        <div className="container navbar-top">
          <div className="navbar-left">
            <button className="nav-hamburger" onClick={() => setMobileOpen(true)} aria-label="Open menu">
              <FiMenu />
            </button>
            <nav className="nav-links">
              {links.map(l => <a key={l} href="#">{l}</a>)}
            </nav>
          </div>

          <Link to="/" className="navbar-brand">
            <img src={`${import.meta.env.BASE_URL}images/logo.png`} alt="Arctic Fox" />
            <span className="brand-text">Arctic Fox</span>
          </Link>

          <div className="navbar-right">
            <div className="nav-search">
              <FiSearch size={16} />
              <input type="text" placeholder="Search for products..." />
            </div>
            <Link to="/login" className="nav-icon" aria-label="Account"><FiUser /></Link>
            <button className="nav-icon" aria-label="Wishlist"><FiHeart /></button>
            <Link to="/cart" className="nav-icon" aria-label="Cart">
              <FiShoppingBag />
              {cartCount > 0 && <span className="badge">{cartCount}</span>}
            </Link>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <div className={`mobile-menu-overlay${mobileOpen ? ' open' : ''}`} onClick={() => setMobileOpen(false)}>
        <div className="mobile-menu" onClick={e => e.stopPropagation()}>
          <div className="mobile-menu-header">
            <span className="brand-text">Arctic Fox</span>
            <button className="mobile-close" onClick={() => setMobileOpen(false)}><FiX /></button>
          </div>
          <nav>
            {links.map(l => <a key={l} href="#" onClick={() => setMobileOpen(false)}>{l}</a>)}
          </nav>
        </div>
      </div>
    </>
  );
}
