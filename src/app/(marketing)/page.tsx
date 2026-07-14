import HeroSection from "@/features/marketing/HeroSection";
import FeaturedDestinations from "@/features/marketing/FeaturedDestinations";
import HowItWorksSection from "@/features/marketing/HowItWorksSection";
import PartnersStrip from "@/features/marketing/PartnersStrip";
import CTA from "@/features/marketing/CTASection";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[var(--bg)] scroll-smooth">
      <HeroSection />
      <PartnersStrip />
      <FeaturedDestinations />
      <HowItWorksSection />
      <CTA />
    </div>
  );
}
