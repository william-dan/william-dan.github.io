import { Hero } from "@/components/hero";
import { AboutSection } from "@/components/about-section";
import { WritingsSection } from "@/components/writings-section";
import { ContactSection } from "@/components/contact-section";
import { SiteFooter } from "@/components/site-footer";

export default function Home() {
  return (
    <>
      <Hero />
      <AboutSection />
      <WritingsSection />
      <ContactSection />
      <SiteFooter />
    </>
  );
}
