import {
  ArrowLeft,
  ArrowRight,
  Check,
  Grid3X3,
  Maximize2,
  MousePointerSquareDashed,
  RotateCw,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import styles from "./updates.module.css";

export const metadata = {
  title: "Updates and Changelog",
  description:
    "See the latest Khattat releases, improvements, and Square Kufic editor updates.",
  alternates: { canonical: "/updates" },
  openGraph: {
    type: "website",
    url: "/updates",
    title: "Khattat Updates and Changelog",
    description:
      "See the latest releases and improvements to the Khattat Square Kufic editor.",
    siteName: "Khattat",
    images: [
      {
        url: "/og.png",
        width: 1730,
        height: 909,
        alt: "Khattat geometric Kufic design workspace",
      },
    ],
  },
};

const releaseFeatures = [
  {
    icon: Maximize2,
    title: "Infinite canvas",
    copy: "Pan, zoom, center, and work without a fixed page boundary.",
  },
  {
    icon: Grid3X3,
    title: "Grid construction",
    copy: "Draw and erase modular forms on a configurable square grid.",
  },
  {
    icon: MousePointerSquareDashed,
    title: "Selection tools",
    copy: "Move, scale, duplicate, recolor, and group selected structures.",
  },
  {
    icon: RotateCw,
    title: "Transform and export",
    copy: "Rotate or flip studies, then export SVG, PNG, or a project file.",
  },
];

export default function UpdatesPage() {
  return (
    <main className={styles.page}>
      <header className={styles.siteHeader}>
        <div className={styles.headerInner}>
          <Link className={styles.wordmark} href="/" aria-label="Khattat home">
            <span>
              <Image src="/logo.svg" alt="" width={42} height={20} priority />
            </span>
            <span>
              <strong>Khattat</strong>
              <small>Kufic design environment</small>
            </span>
          </Link>
          <nav aria-label="Updates navigation">
            <Link href="/">
              <ArrowLeft aria-hidden="true" size={15} />
              Editor
            </Link>
          </nav>
          <Link className={styles.headerAction} href="/">
            Open Editor <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </header>

      <section className={styles.hero}>
        <div className={styles.heroFolio} aria-hidden="true">
          <span>U</span>
          <i />
          <small>RELEASE LEDGER</small>
        </div>
        <div className={styles.heroCopy}>
          <p>Product updates / release notes</p>
          <h1>
            The work continues,
            <br />
            <em>one measured change at a time.</em>
          </h1>
        </div>
        <div className={styles.heroAside}>
          <p>
            A record of stable releases, editor improvements, and changes to
            the Khattat web workspace.
          </p>
          <div>
            <span>Current release</span>
            <strong>1.0.0</strong>
          </div>
        </div>
      </section>

      <section className={styles.release} aria-labelledby="release-title">
        <aside className={styles.releaseMeta}>
          <p>RELEASE / 001</p>
          <dl>
            <div>
              <dt>Version</dt>
              <dd>1.0.0</dd>
            </div>
            <div>
              <dt>Published</dt>
              <dd>June 2026</dd>
            </div>
            <div>
              <dt>Channel</dt>
              <dd>Stable</dd>
            </div>
            <div>
              <dt>Access</dt>
              <dd>Web</dd>
            </div>
          </dl>
          <Link href="/">
            Open editor
            <ArrowRight aria-hidden="true" size={17} />
          </Link>
        </aside>

        <article className={styles.releaseDocument}>
          <header>
            <div className={styles.status}>
              <Check aria-hidden="true" size={15} />
              Stable release
            </div>
            <span>KHATTAT / VERSION 1.0.0</span>
            <h2 id="release-title">The first complete Khattat workspace.</h2>
            <p>
              Version 1.0.0 establishes the core environment for constructing,
              refining, saving, and exporting geometric Square Kufic studies.
            </p>
          </header>

          <div className={styles.featureGrid}>
            {releaseFeatures.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <section key={feature.title}>
                  <span>0{index + 1}</span>
                  <Icon aria-hidden="true" size={21} />
                  <h3>{feature.title}</h3>
                  <p>{feature.copy}</p>
                </section>
              );
            })}
          </div>

          <div className={styles.releaseNotes}>
            <h3>Included in this release</h3>
            <ul>
              <li>Reusable Kufic preset library with positional categories</li>
              <li>Undo and redo history for drawing operations</li>
              <li>Portable Khattat project files</li>
              <li>High-resolution PNG and clean SVG export</li>
              <li>Browser-based editor with no installation required</li>
            </ul>
          </div>
        </article>
      </section>

      <section className={styles.next}>
        <div aria-hidden="true" className={styles.nextGrid} />
        <span>FOLLOW THE PROJECT</span>
        <h2>Build with the latest release.</h2>
        <p>
          Open the web editor now to start designing directly in your browser.
        </p>
        <div>
          <Link href="/">
            Open the editor <ArrowRight aria-hidden="true" size={17} />
          </Link>
        </div>
      </section>

      <footer className={styles.footer}>
        <span>KHATTAT / RELEASE LEDGER</span>
        <Link href="/">Return to editor</Link>
        <span>Open source under the Apache License 2.0</span>
      </footer>
    </main>
  );
}
