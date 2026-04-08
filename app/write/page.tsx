import Link from "next/link";
import { siteContent } from "@/lib/site-content";

export default function WritePage() {
  const { writePage } = siteContent;

  return (
    <main className="relative min-h-svh overflow-hidden bg-background text-foreground">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(196,204,220,0.08),rgba(10,10,15,0)_40%)]" />
      <div className="relative container flex min-h-svh flex-col justify-center py-24">
        <Link
          href="/"
          className="mb-10 inline-flex items-center gap-2 font-mono text-xs tracking-[0.24em] uppercase text-foreground-muted hover:text-foreground transition-colors"
        >
          <span>←</span>
          <span>{writePage.backLabel}</span>
        </Link>

        <div className="max-w-2xl border border-border/20 bg-background/40 px-8 py-10 backdrop-blur-sm md:px-12 md:py-14">
          <p className="font-mono text-[10px] tracking-[0.3em] uppercase text-foreground-muted">
            {writePage.eyebrow}
          </p>
          <h1 className="mt-6 font-sans text-4xl md:text-5xl font-light tracking-tight">
            {writePage.title}
          </h1>
          <p className="mt-6 max-w-xl font-sans text-lg leading-relaxed text-foreground/90">
            {writePage.intro}
          </p>
          <p className="mt-4 max-w-xl font-sans text-sm md:text-base leading-relaxed text-foreground-muted">
            {writePage.body}
          </p>

          <div className="mt-10 border-t border-border/20 pt-6">
            <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-foreground-muted/70">
              Future archive entry point
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
