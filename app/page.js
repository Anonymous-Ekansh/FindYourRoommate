import Navbar from "@/components/Navbar/Navbar";
import Hero from "@/components/Hero/Hero";
import ProblemSection from "@/components/ProblemSection/ProblemSection";
import HowItWorks from "@/components/HowItWorks/HowItWorks";
import SocialProof from "@/components/SocialProof/SocialProof";
import FAQ from "@/components/FAQ/FAQ";
import FinalCTA from "@/components/FinalCTA/FinalCTA";
import Footer from "@/components/Footer/Footer";
import CursorGlow from "@/components/CursorGlow/CursorGlow";

export default function Home() {
  return (
    <>
      <CursorGlow />
      <Navbar />
      <main>
        <Hero />
        <ProblemSection />
        <HowItWorks />
        <SocialProof />
        <FAQ />
        <FinalCTA />
      </main>
      <Footer />
    </>
  );
}
