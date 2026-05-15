"use client";

import { siteContent } from "@/lib/site-content";

function GitHubIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 fill-current">
      <path d="M12 1.75a10.25 10.25 0 0 0-3.24 19.98c.51.1.69-.22.69-.49 0-.24-.01-1.04-.01-1.88-2.52.46-3.18-.62-3.39-1.19-.11-.29-.58-1.19-.99-1.43-.34-.18-.82-.64-.01-.66.76-.01 1.31.7 1.49.98.87 1.47 2.25 1.06 2.8.81.09-.63.34-1.06.62-1.31-2.24-.25-4.58-1.12-4.58-4.98 0-1.1.39-2 .98-2.71-.1-.25-.43-1.29.1-2.68 0 0 .81-.26 2.66 1.03a9.16 9.16 0 0 1 4.84 0c1.85-1.3 2.66-1.03 2.66-1.03.53 1.39.2 2.43.1 2.68.61.71.98 1.6.98 2.71 0 3.87-2.35 4.72-4.59 4.97.36.31.68.9.68 1.82 0 1.31-.01 2.36-.01 2.69 0 .27.18.59.69.49A10.25 10.25 0 0 0 12 1.75Z" />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 fill-current">
      <path d="M5.5 8.5h3.18V19H5.5V8.5Zm1.59-5.03a1.84 1.84 0 1 1 0 3.68 1.84 1.84 0 0 1 0-3.68ZM10.67 8.5h3.05v1.43h.04c.42-.8 1.46-1.65 3-1.65 3.21 0 3.8 2.11 3.8 4.86V19h-3.18v-5.19c0-1.24-.02-2.83-1.72-2.83-1.73 0-1.99 1.35-1.99 2.74V19h-3.18V8.5Z" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current">
      <path
        d="M3.75 6.75h16.5v10.5H3.75z"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="m4.5 7.5 7.5 6 7.5-6"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function DocumentIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current">
      <path
        d="M7.25 3.75h6.2l3.3 3.3v13.2h-9.5z"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M13.25 3.75v3.5h3.5"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8.75 12h6.5M8.75 15.5h6.5"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function SiteFooter() {
  const { footer, person } = siteContent;
  const contactLinks = [
    {
      label: "Email",
      href: `mailto:${person.email}`,
      icon: <MailIcon />,
    },
    {
      label: "GitHub",
      href: person.github,
      icon: <GitHubIcon />,
      external: true,
    },
    {
      label: "LinkedIn",
      href: person.linkedin,
      icon: <LinkedInIcon />,
      external: true,
    },
    {
      label: "CV",
      href: person.cvHref,
      icon: <DocumentIcon />,
      external: true,
    },
  ];

  return (
    <footer
      id="contact"
      className="relative z-10 border-t border-border/20 bg-background py-16"
    >
      <div className="container">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.1fr)_auto] lg:gap-12">
          <div className="space-y-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-foreground-muted">
              {footer.brand}
            </p>
            <p className="font-mono text-[10px] text-foreground-muted/60 leading-relaxed max-w-xs">
              {footer.note}
            </p>
          </div>

          <div className="space-y-5">
            <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-foreground-muted">
              Contact
            </p>

            <div className="flex flex-wrap gap-3">
              {contactLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  target={link.external ? "_blank" : undefined}
                  rel={link.external ? "noreferrer" : undefined}
                  className="group inline-flex items-center gap-3 border border-border/20 bg-background/30 px-3.5 py-2.5 font-mono text-[10px] uppercase tracking-[0.22em] text-foreground-muted transition-colors hover:border-primary/30 hover:text-foreground"
                >
                  <span className="text-foreground-muted/75 transition-colors group-hover:text-foreground">
                    {link.icon}
                  </span>
                  <span>{link.label}</span>
                </a>
              ))}
            </div>
          </div>

          <div className="space-y-2 text-left lg:text-right">
            <p className="font-mono text-[10px] text-foreground-muted/40">
              2026 — All rights reserved
            </p>
            <p className="font-mono text-[10px] text-foreground-muted/40">
              {footer.updated}
            </p>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border/10">
          <p className="font-mono text-[10px] text-foreground-muted/30 text-center tracking-widest">
            ∞
          </p>
        </div>
      </div>
    </footer>
  );
}
