"use client";

import { siteContent } from "@/lib/site-content";

export function ContactSection() {
  const { person, contact } = siteContent;

  return (
    <section id="contact" className="relative z-10 py-32 bg-background/80 backdrop-blur-sm">
      <div className="container">
        {/* Section Header */}
        <div className="flex items-baseline gap-4 mb-16">
          <span className="font-mono text-[10px] text-foreground-muted tracking-widest">§3</span>
          <h2 className="font-sans text-2xl md:text-3xl font-light tracking-tight">Contact</h2>
          <div className="flex-1 border-t border-border/30 ml-4" />
        </div>

        {/* Contact Content */}
        <div className="grid md:grid-cols-2 gap-16">
          {/* Left - Message */}
          <div>
            <p className="font-sans text-lg leading-relaxed text-foreground/90 max-w-md">
              {contact.intro}
            </p>
          </div>

          {/* Right - Contact Details */}
          <div className="space-y-8">
            {/* Email */}
            <div>
              <h3 className="font-mono text-[10px] tracking-[0.3em] text-foreground-muted uppercase mb-3">
                Electronic Mail
              </h3>
              <a
                href={`mailto:${person.email}`}
                className="font-sans text-base text-foreground hover:text-primary transition-colors"
              >
                {person.email}
              </a>
            </div>

            {/* Social Links */}
            <div>
              <h3 className="font-mono text-[10px] tracking-[0.3em] text-foreground-muted uppercase mb-3">
                Elsewhere
              </h3>
              <div className="flex flex-wrap gap-6">
                <a
                  href={person.github}
                  target="_blank"
                  rel="noreferrer"
                  className="font-mono text-xs text-foreground-muted hover:text-foreground transition-colors"
                >
                  GitHub
                </a>
                <a
                  href={person.linkedin}
                  target="_blank"
                  rel="noreferrer"
                  className="font-mono text-xs text-foreground-muted hover:text-foreground transition-colors"
                >
                  LinkedIn
                </a>
                <a
                  href={person.cvHref}
                  target="_blank"
                  rel="noreferrer"
                  className="font-mono text-xs text-foreground-muted hover:text-foreground transition-colors"
                >
                  CV
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
