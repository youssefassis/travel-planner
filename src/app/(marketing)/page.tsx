import HeroSection from "@/features/marketing/HeroSection";
import FeaturedDestinations from "@/features/marketing/FeaturedDestinations";
import HowItWorksSection from "@/features/marketing/HowItWorksSection";
import CTA from "@/features/marketing/CTASection";
import ResumeTripCard from "./_components/ResumeTripCard";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[var(--bg)] scroll-smooth">
      <HeroSection />
      <ResumeTripCard />
      <FeaturedDestinations />
      <HowItWorksSection />
      <CTA />
    </div>
  );
}
