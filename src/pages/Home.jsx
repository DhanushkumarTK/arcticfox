import Navbar from '../components/Navbar';
import HeroBanner from '../components/HeroBanner';
import ServiceStrip from '../components/ServiceStrip';
import CategoryGrid from '../components/CategoryGrid';
import ProductCarousel from '../components/ProductCarousel';
import CuratedSection from '../components/CuratedSection';
import Newsletter from '../components/Newsletter';
import Footer from '../components/Footer';
import { newArrivals, trending } from '../data/products';

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <HeroBanner />
        <ServiceStrip />
        <CategoryGrid />
        <ProductCarousel
          tag="Just Dropped"
          title="New Arrivals"
          subtitle="Fresh picks — straight from the studio to your wardrobe"
          products={newArrivals}
        />
        <CuratedSection />
        <ProductCarousel
          tag="Fan Favourites"
          title="Trending Now"
          subtitle="What the pack is loving right now"
          products={trending}
          altBg
        />
        <Newsletter />
      </main>
      <Footer />
    </>
  );
}
