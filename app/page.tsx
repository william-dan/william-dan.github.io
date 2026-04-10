import { Hero } from "@/components/hero";
import { AboutSection } from "@/components/about-section";
import { PianoWorksSection } from "@/components/piano-works-section";
import { SiteFooter } from "@/components/site-footer";

export default function Home() {
  return (
    <>
      <Hero />
      <AboutSection />
      <PianoWorksSection />
      <SiteFooter />
    </>
  );
}
