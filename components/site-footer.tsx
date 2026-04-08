"use client";

import { siteContent } from "@/lib/site-content";

export function SiteFooter() {
  const currentYear = new Date().getFullYear();
  const { footer } = siteContent;

  return (
    <footer className="relative z-10 py-16 bg-background border-t border-border/20">
      <div className="container">
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-8">
          {/* Left - Colophon */}
          <div className="space-y-4">
            <div className="font-mono text-xs tracking-[0.3em] text-foreground-muted uppercase">
              {footer.brand}
            </div>
            <p className="font-mono text-[10px] text-foreground-muted/60 leading-relaxed max-w-xs">
              {footer.note}
            </p>
          </div>

          {/* Right - Meta Info */}
          <div className="text-right space-y-2">
            <p className="font-mono text-[10px] text-foreground-muted/40">
              {currentYear} — All rights reserved
            </p>
            <p className="font-mono text-[10px] text-foreground-muted/40">
              {footer.updated}
            </p>
          </div>
        </div>

        {/* Bottom Decorative Line */}
        <div className="mt-12 pt-8 border-t border-border/10">
          <p className="font-mono text-[10px] text-foreground-muted/30 text-center tracking-widest">
            ∞
          </p>
        </div>
      </div>
    </footer>
  );
}
