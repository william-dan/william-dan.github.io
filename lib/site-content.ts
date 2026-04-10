type PianoWork = {
  id: string;
  title: string;
  audioSrc?: string;
  available: boolean;
};

const pianoWorkFiles = ["O Tannenbaum.mp4"] as const;

function getPianoWorkTitle(filename: string) {
  return filename.replace(/\.[^.]+$/, "");
}

function getPianoWorkId(filename: string) {
  return filename
    .replace(/\.[^.]+$/, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export const siteContent = {
  person: {
    name: "William Dan",
    role: "M.Sc. Computer Science at the University of Bern",
    email: "william.anze.dan@gmail.com",
    github: "https://github.com/william-dan",
    linkedin: "https://linkedin.com/in/william-dan-b8a9aa325",
    cvHref: "/William_Dan_CV.pdf",
  },
  metadata: {
    title: "William Dan",
    description:
      "Personal site and piano works archive for William Dan, focused on AI systems, backend engineering, applied machine learning, and original piano studies.",
  },
  hero: {
    eyebrow: "Vol. I — Personal Site",
    summary:
      "Building practical, user-oriented software with strong analytical rigor and an interest in impactful technology.",
    microcopyLeft: ["Based in Bern", "Computer Science M.Sc."],
    microcopyRight: ["Scroll to explore", "↓"],
  },
  about: {
    intro:
      "I am a computer science master's student in Bern interested in AI systems, backend product engineering, and applied machine learning.",
    body:
      "My recent work moves between research and product prototypes: from Dynamic CBOM, a thesis project on cryptographic bill-of-materials generation and runtime validation, to Heidi Tender, an end-to-end AI prototype for explainable supplier recommendations.",
    focusAreas: [
      "AI systems",
      "Backend & product engineering",
      "Applied machine learning",
    ],
    note:
      "I also coauthored two 2026 arXiv papers in multimodal learning, contributing across theoretical analysis, architecture, and figure design.",
  },
  pianoWorks: {
    intro: "A small archive of original piano works.",
    items: pianoWorkFiles.map((filename) => ({
      id: getPianoWorkId(filename),
      title: getPianoWorkTitle(filename),
      audioSrc: `/audio/piano-works/${encodeURIComponent(filename)}`,
      available: true,
    })) satisfies PianoWork[],
  },
  footer: {
    brand: "William Dan",
    note: "Personal site, piano works archive, and selected notes. Built with Next.js and Three.js.",
    updated: "Last updated: April 2026",
  },
  writePage: {
    eyebrow: "Reserved",
    title: "Writing Desk",
    intro:
      "This page is a placeholder for a future publishing interface.",
    body:
      "There is no editor or publishing workflow here yet. When the archive opens, new essays will begin from this desk.",
    backLabel: "Return to the site",
  },
} as const;
