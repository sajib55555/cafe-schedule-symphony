import { HeroSection } from "@/components/landing/HeroSection";
import { FeaturesGrid } from "@/components/landing/FeaturesGrid";
import { CTASection } from "@/components/landing/CTASection";
import { NavigationBar } from "@/components/landing/NavigationBar";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#FDF6E3]">
      <NavigationBar />
      <HeroSection />
      <FeaturesGrid />
      <CTASection />
    </div>
  );
}