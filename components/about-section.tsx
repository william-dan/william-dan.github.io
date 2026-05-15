"use client";

import { siteContent } from "@/lib/site-content";

export function AboutSection() {
  const { about } = siteContent;

  return (
    <section id="about" className="relative z-10 py-32 bg-background/80 backdrop-blur-sm">
      <div className="container">
        {/* Section Header - Academic Style */}
        <div className="flex items-baseline gap-4 mb-16">
          <span className="font-mono text-[10px] text-foreground-muted tracking-widest">§1</span>
          <h2 className="font-sans text-2xl md:text-3xl font-light tracking-tight">About</h2>
          <div className="flex-1 border-t border-border/30 ml-4" />
        </div>

        {/* Two Column Layout */}
        <div className="grid md:grid-cols-2 gap-16 md:gap-24">
          {/* Left Column - Bio */}
          <div className="space-y-6">
            <p className="font-sans text-lg md:text-xl leading-relaxed text-foreground/90">
              {about.intro}
            </p>
            <p className="font-sans text-base leading-relaxed text-foreground-muted">
              {about.body}
            </p>
          </div>

          {/* Right Column - Details */}
          <div className="space-y-8">
            <div>
              <h3 className="font-mono text-[10px] tracking-[0.3em] text-foreground-muted uppercase mb-4">
                Focus Areas
              </h3>
              <ul className="space-y-2 font-sans text-sm text-foreground/80">
                {about.focusAreas.map((focusArea) => (
                  <li key={focusArea} className="flex items-baseline gap-3">
                    <span className="text-foreground-muted">—</span>
                    {focusArea}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Decorative Element - Like a page margin note */}
        <div className="mt-24 pt-8 border-t border-border/20">
          <p className="font-mono text-[10px] text-foreground-muted/50 italic">
            {about.note}
          </p>
        </div>
      </div>
    </section>
  );
}
