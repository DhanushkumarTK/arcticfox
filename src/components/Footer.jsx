import { FiInstagram, FiTwitter, FiFacebook, FiYoutube } from 'react-icons/fi';

export default function Footer() {
  return (
    <footer className="footer" id="footer">
      <div className="footer-main">
        <div className="container">
          <div className="footer-grid">
            <div>
              <div className="footer-brand">
                <img src="/images/logo.png" alt="Arctic Fox" />
                <span>Arctic Fox</span>
              </div>
              <p className="footer-desc">
                Born from the spirit of the wild — Arctic Fox brings you premium streetwear
                that blends comfort, style, and attitude. Every thread tells a story.
              </p>
              <div className="footer-socials">
                <a href="#" className="footer-social-icon" aria-label="Instagram"><FiInstagram /></a>
                <a href="#" className="footer-social-icon" aria-label="Twitter"><FiTwitter /></a>
                <a href="#" className="footer-social-icon" aria-label="Facebook"><FiFacebook /></a>
                <a href="#" className="footer-social-icon" aria-label="YouTube"><FiYoutube /></a>
              </div>
            </div>

            <div className="footer-col">
              <h4>Need Help?</h4>
              <a href="#">Contact Us</a>
              <a href="#">Track Order</a>
              <a href="#">Returns & Exchange</a>
              <a href="#">FAQs</a>
              <a href="#">Size Guide</a>
            </div>

            <div className="footer-col">
              <h4>Company</h4>
              <a href="#">About Us</a>
              <a href="#">Careers</a>
              <a href="#">Blog</a>
              <a href="#">Store Locator</a>
            </div>

            <div className="footer-col">
              <h4>More Info</h4>
              <a href="#">Terms & Conditions</a>
              <a href="#">Privacy Policy</a>
              <a href="#">Shipping Policy</a>
              <a href="#">Sitemap</a>
            </div>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <div className="container">
          © {new Date().getFullYear()} Arctic Fox. All rights reserved. Crafted with 🦊 in India.
        </div>
      </div>
    </footer>
  );
}
