"use client";

import { GL } from "./gl";
import { MoonStage } from "./moon-stage";
import { siteContent } from "@/lib/site-content";
import Link from "next/link";

export function Hero() {
  const { person, hero } = siteContent;

  return (
    <div className="relative min-h-svh">
      {/* Particle Background */}
      <GL />

      {/* Content Layer */}
      <div className="relative z-10 min-h-svh flex flex-col">
        {/* Header */}
        <header className="container flex items-center justify-between py-8">
          <div className="font-mono text-xs tracking-[0.3em] text-foreground-muted uppercase">
            {person.name}
          </div>
          <nav className="hidden md:flex items-center gap-8 font-mono text-xs tracking-wide text-foreground-muted">
            <Link href="#about" className="hover:text-foreground transition-colors">
              About
            </Link>
            <Link href="#piano-works" className="hover:text-foreground transition-colors">
              Piano Works
            </Link>
            <Link href="#contact" className="hover:text-foreground transition-colors">
              Contact
            </Link>
          </nav>
        </header>

        {/* Main Hero Content */}
        <main className="relative flex-1 flex flex-col items-center justify-center px-6">
          <MoonStage />

          {/* Title Section - Academic Paper Style */}
          <div className="relative z-10 mt-[clamp(15rem,32vw,20rem)] text-center max-w-2xl">
            <p className="font-mono text-[10px] tracking-[0.4em] text-foreground-muted uppercase mb-4">
              {hero.eyebrow}
            </p>
            <h1 className="font-sans text-4xl md:text-5xl lg:text-6xl font-light tracking-tight text-balance leading-tight">
              {person.name}
            </h1>
            <p className="mt-5 font-sans text-lg md:text-xl text-foreground/90">
              {person.role}
            </p>
            <p className="mt-8 font-mono text-xs md:text-sm text-foreground-muted leading-relaxed max-w-md mx-auto">
              {hero.summary}
            </p>
            <div className="mt-8 flex items-center justify-center gap-5">
              <a
                href={person.cvHref}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 font-mono text-xs tracking-[0.24em] text-foreground uppercase hover:text-primary transition-colors"
              >
                <span>Open CV</span>
                <span className="text-foreground-muted/60">↗</span>
              </a>
              <Link
                href="#contact"
                className="inline-flex items-center gap-2 font-mono text-xs tracking-[0.24em] text-foreground-muted uppercase hover:text-foreground transition-colors"
              >
                <span>Contact</span>
                <span className="text-foreground-muted/50">→</span>
              </Link>
            </div>
          </div>
        </main>

        {/* Footer Coordinates */}
        <footer className="container py-8 flex items-end justify-between">
          <div className="font-mono text-[10px] text-foreground-muted/60 leading-relaxed">
            <span className="block">{hero.microcopyLeft[0]}</span>
            <span className="block">{hero.microcopyLeft[1]}</span>
          </div>
          <div className="font-mono text-[10px] text-foreground-muted/60 text-right">
            <span className="block">{hero.microcopyRight[0]}</span>
            <span className="block mt-1 animate-pulse">{hero.microcopyRight[1]}</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
