"use client";

import { siteContent } from "@/lib/site-content";

type ProjectItem = (typeof siteContent.projects.items)[number];

function ProjectCard({ item }: { item: ProjectItem }) {
  return (
    <article className="flex h-full flex-col border border-border/20 bg-background/30 px-6 py-7 md:px-7 md:py-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-foreground-muted/80">
            {item.title}
          </p>
          <h3 className="mt-3 max-w-lg font-sans text-xl font-light leading-tight text-foreground md:text-2xl">
            {item.subtitle}
          </h3>
        </div>
      </div>

      <p className="mt-5 flex-1 font-sans text-sm leading-relaxed text-foreground-muted md:text-[15px]">
        {item.description}
      </p>

      <div className="mt-6 flex flex-wrap gap-2.5">
        {item.tags.map((tag) => (
          <span
            key={tag}
            className="border border-border/20 bg-background/35 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-foreground-muted/80"
          >
            {tag}
          </span>
        ))}
      </div>

      {item.links?.length ? (
        <div className="mt-6 flex flex-wrap gap-3">
          {item.links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.24em] text-foreground-muted transition-colors hover:text-foreground"
            >
              <span>{link.label}</span>
              <span className="text-foreground-muted/60">↗</span>
            </a>
          ))}
        </div>
      ) : null}
    </article>
  );
}

export function ProjectsSection() {
  const { projects } = siteContent;

  return (
    <section
      id="research"
      className="relative z-10 overflow-hidden bg-background/65 py-32 backdrop-blur-sm"
    >
      <div className="container">
        <div className="mb-16 flex items-baseline gap-4">
          <span className="font-mono text-[10px] tracking-widest text-foreground-muted">§2</span>
          <h2 className="font-sans text-2xl font-light tracking-tight md:text-3xl">
            {projects.title}
          </h2>
          <div className="ml-4 flex-1 border-t border-border/30" />
        </div>

        <div className="mb-12 grid gap-8 border border-border/15 bg-background/20 px-6 py-7 md:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] md:px-8 md:py-8">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-foreground-muted">
              {projects.eyebrow}
            </p>
          </div>
          <p className="max-w-2xl font-sans text-base leading-relaxed text-foreground/84 md:text-lg">
            {projects.intro}
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {projects.items.map((item) => (
            <ProjectCard key={item.title} item={item} />
          ))}
        </div>
      </div>
    </section>
  );
}
