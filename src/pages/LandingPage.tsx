import { NavigationBar } from "@/components/landing/NavigationBar";
import { HeroSection } from "@/components/landing/HeroSection";
import { FeaturesGrid } from "@/components/landing/FeaturesGrid";
import { CTASection } from "@/components/landing/CTASection";

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <NavigationBar />
      <HeroSection />
      <FeaturesGrid />
      <CTASection />
    </div>
  );
};

export default LandingPage;