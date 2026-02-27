import { FinalCTA, Pricing, HowItWorks, Features, Stats, Hero, Navbar, Footer } from "../components/landing";

export default function LandingPage() {
  return (
    <div className="bg-white text-slate-700">
      <Navbar />
      <Hero />
      <Stats />
      <Features />
      <HowItWorks />
      <Pricing />
      <FinalCTA />
      <Footer />
    </div>
  );
}
