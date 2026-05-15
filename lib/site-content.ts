type PianoWork = {
  id: string;
  title: string;
  audioSrc?: string;
  available: boolean;
};

type ProjectLink = {
  label: string;
  href: string;
};

type Project = {
  title: string;
  subtitle: string;
  description: string;
  tags: readonly string[];
  links?: readonly ProjectLink[];
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
    role: "M.Sc. Computer Science, University of Bern",
    email: "william.anze.dan@gmail.com",
    github: "https://github.com/william-dan",
    linkedin: "https://linkedin.com/in/william-dan-b8a9aa325",
    cvHref: "/William_Dan_CV.pdf",
  },
  metadata: {
    title: "William Dan — Software & Systems Security",
    description:
      "Personal site of William Dan, M.Sc. Computer Science graduate focused on software supply chain security, CBOM/SBOM, program analysis, runtime monitoring, and systems security.",
  },
  hero: {
    eyebrow: "Vol. I — Research & Systems",
    summary:
      "Software and systems security researcher interested in software supply chain security, CBOM/SBOM, program analysis, code instrumentation, and runtime monitoring.",
    microcopyLeft: ["Based in Bern", "Software & Systems Security"],
    microcopyRight: ["Scroll to explore", "↓"],
  },
  about: {
    intro:
      "I am a Computer Science M.Sc. graduate from the University of Bern, focusing on software and systems security. My recent work connects cryptographic asset discovery, software supply-chain transparency, program analysis, and runtime monitoring.",
    body:
      "My master's thesis, Dynamic CBOM, surveyed Cryptography Bill of Materials generation techniques and built an eBPF/bpftrace-based runtime proof-of-concept for tracing OpenSSL/libcrypto usage and producing CycloneDX CBOM artifacts. Earlier systems work in MLIR-based query optimization, compiler construction, and a QEMU-emulated multicore OS supports my interest in practical security tooling grounded in program representations and low-level runtime behavior.",
    focusAreas: [
      "Software supply chain security",
      "SBOM / CBOM / CycloneDX",
      "Program analysis & instrumentation",
      "Runtime monitoring with eBPF",
      "Compiler and systems engineering",
    ],
    note:
      "Selected details only — the full academic and project background lives in the CV.",
  },
  projects: {
    eyebrow: "Selected Work",
    title: "Research Threads",
    intro:
      "Selected projects across software supply chain security, runtime tracing, compiler systems, and low-level engineering.",
    items: [
      {
        title: "Dynamic CBOM",
        subtitle: "Runtime Cryptographic Bill-of-Materials Generation",
        description:
          "Master's thesis project surveying CBOM generation techniques and building an eBPF/bpftrace runtime prototype for OpenSSL/libcrypto tracing, CycloneDX 1.6 CBOM generation, and evaluation against ground truth and IBM's CBOMkit.",
        tags: ["CBOM", "eBPF", "bpftrace", "CycloneDX", "Runtime Monitoring"],
        links: [
          {
            label: "GitHub",
            href: "https://github.com/SEG-UNIBE/DynamicCBOM",
          },
          {
            label: "Thesis PDF",
            href: "/MScThesis_WilliamDan_CBOM.pdf",
          },
        ],
      },
      {
        title: "LingoDB-CSE",
        subtitle: "MLIR-Based Multi-Query Optimization",
        description:
          "Bachelor's thesis prototype on top of LingoDB for common sub-join elimination, reusable hash structures, and cross-query optimization through shared MLIR modules.",
        tags: ["MLIR", "Query Optimization", "IR Transformation", "Relational Algebra"],
        links: [
          {
            label: "GitHub",
            href: "https://github.com/william-dan/LingoDB-CSE",
          },
        ],
      },
      {
        title: "SysY2022-to-ARMv7 Compiler",
        subtitle: "Optimizing Compiler for Huawei BiSheng Cup",
        description:
          "End-to-end C++ optimizing compiler for a C-like language targeting ARMv7, with parsing, semantic analysis, SSA/CFG-based optimization, code generation, and register allocation.",
        tags: ["Compiler", "SSA", "CFG", "ARMv7", "C++"],
        links: [
          {
            label: "GitHub",
            href: "https://github.com/william-dan/SysY2022-ARMv7-Compiler",
          },
        ],
      },
      {
        title: "Operating System",
        subtitle: "QEMU-Emulated Multicore OS",
        description:
          "Systems project implementing core kernel components including process management, memory allocation, page-fault handling, synchronization, block-device I/O, caching, logging, and an inode-based file-system layer.",
        tags: ["Operating Systems", "QEMU", "C", "Concurrency", "Virtual Memory"],
      },
    ] satisfies readonly Project[],
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
    note: "Personal site, research/project archive, and piano works. Built with Next.js and Three.js.",
    updated: "Last updated: May 2026",
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
