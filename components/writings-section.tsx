"use client";

import Link from "next/link";
import { siteContent } from "@/lib/site-content";

export function WritingsSection() {
  const { writings } = siteContent;

  return (
    <section id="writings" className="relative z-10 py-32 bg-background/60 backdrop-blur-sm">
      <div className="container">
        {/* Section Header */}
        <div className="flex items-baseline gap-4 mb-16">
          <span className="font-mono text-[10px] text-foreground-muted tracking-widest">§2</span>
          <h2 className="font-sans text-2xl md:text-3xl font-light tracking-tight">Writings</h2>
          <div className="flex-1 border-t border-border/30 ml-4" />
        </div>

        <div className="border border-border/20 bg-background/30 px-6 py-10 md:px-10 md:py-12">
          <p className="font-mono text-[10px] tracking-[0.3em] text-foreground-muted uppercase">
            Archive Status
          </p>
          <h3 className="mt-5 font-sans text-2xl md:text-3xl font-light text-foreground">
            {writings.status}
          </h3>
          <p className="mt-4 max-w-xl font-sans text-sm md:text-base leading-relaxed text-foreground-muted">
            {writings.summary}
          </p>
          <div className="mt-8 flex items-center gap-5">
            <Link
              href="/write"
              className="inline-flex items-center gap-2 font-mono text-xs tracking-[0.24em] uppercase text-foreground hover:text-primary transition-colors"
            >
              <span>{writings.cta}</span>
              <span className="text-foreground-muted/60">→</span>
            </Link>
            <span className="font-mono text-[10px] text-foreground-muted/50">
              {writings.footnote}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
