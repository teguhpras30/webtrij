import Navbar from "@/components/layout/Navbar";
import HeroSection from "@/components/home/HeroSection";
//import BrandLogo from "@/components/home/BrandLogo";
import InfoSection from "@/components/home/InfoSection";
import Showcase from "@/components/home/ShowcaseSection";
import ProductSection from "@/components/home/ProductsSection";
import ExploreProductsSection from "@/components/home/ExploreProductsSection";
import TestimonialSection from "@/components/home/TestimonialSection";
import Footer from "@/components/layout/Footer";

export default function HomePage() {
  return (
    <main>
      <Navbar />
      <HeroSection />
      {/* <BrandLogo /> */}
      <InfoSection />
      <Showcase />
      <ProductSection />
      <ExploreProductsSection />
      <TestimonialSection />
      <Footer />
    </main>
  );
}