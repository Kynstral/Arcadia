import {
  Header,
  HeroSection,
  StatsSection,
  FeaturesSection,
  TestimonialsSection,
  PricingSection,
  FAQSection,
  Footer,
} from "@/components/landing";

const LandingPage = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <HeroSection />
      <StatsSection />
      <FeaturesSection />
      <TestimonialsSection />
      <PricingSection />
      <FAQSection />
      <Footer />
    </div>
  );
};

export default LandingPage;
