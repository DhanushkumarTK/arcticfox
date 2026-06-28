import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import { FiArrowRight } from 'react-icons/fi';

const slides = [
  {
    image: '/images/hero1.png',
    tag: 'New Season',
    title: 'Unleash Your\nWild Side',
    subtitle: 'Discover the Arctic Fox Summer \'26 collection — premium oversized tees crafted for those who dare to stand out.',
    cta: 'Shop Now',
  },
  {
    image: '/images/hero2.png',
    tag: 'Squad Goals',
    title: 'Better Together,\nBolder Together',
    subtitle: 'Matching fits that make a statement. Explore our crew-ready streetwear drops.',
    cta: 'Explore Collection',
  },
  {
    image: '/images/hero3.png',
    tag: 'Trending',
    title: 'Tie-Dye\nReimagined',
    subtitle: 'Pastel dreams meet street-ready comfort. Limited edition tie-dye drops are here.',
    cta: 'Shop Tie-Dye',
  },
];

export default function HeroBanner() {
  return (
    <section className="hero-section" id="hero-banner">
      <Swiper
        modules={[Autoplay, Pagination, Navigation]}
        autoplay={{ delay: 5000, disableOnInteraction: false }}
        pagination={{ clickable: true }}
        navigation
        loop
        speed={800}
      >
        {slides.map((s, i) => (
          <SwiperSlide key={i}>
            <div className="hero-slide">
              <img src={s.image} alt={s.title} />
              <div className="hero-overlay">
                <div className="hero-content">
                  <span className="hero-tag">{s.tag}</span>
                  <h1 className="hero-title">{s.title}</h1>
                  <p className="hero-subtitle">{s.subtitle}</p>
                  <a href="#" className="hero-btn">
                    {s.cta} <FiArrowRight />
                  </a>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}
