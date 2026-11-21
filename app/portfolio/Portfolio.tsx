"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { Scene } from "../scene";
import { Certifications } from "./Certifications";
import { OwnerAccess } from "./OwnerAccess";
import {
  aboutCards,
  contactChannels,
  education,
  learningStages,
  learningVectors,
  navItems,
  profile,
  projects,
  skillGroups,
} from "./content";
import { refreshReveals } from "./reveal";

function SectionHead({
  chapter,
  kicker,
  title,
  lead,
  meta,
}: {
  chapter: string;
  kicker: string;
  title: string;
  lead?: string;
  meta?: string;
}) {
  return (
    <header className="section__head" data-reveal>
      <p className="eyebrow">
        <span>
          {chapter}{" // "}{kicker}
        </span>
        {meta ? <span className="eyebrow__meta">{meta}</span> : null}
      </p>
      <h2 className="section__title">{title}</h2>
      {lead ? <p className="section__lead">{lead}</p> : null}
    </header>
  );
}

export function Portfolio() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [ownerOpen, setOwnerOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [active, setActive] = useState("home");
  const [scrolled, setScrolled] = useState(false);
  const progressRef = useRef<HTMLDivElement>(null);

  const openOwner = useCallback(() => {
    setMenuOpen(false);
    setOwnerOpen(true);
  }, []);

  const closeOwner = useCallback(() => setOwnerOpen(false), []);

  const bumpCertificates = useCallback(
    () => setRefreshKey((value: number) => value + 1),
    []
  );

  useEffect(() => {
    refreshReveals();
  }, [refreshKey]);

  // Chapter tracking for the rail and the navigation.
  useEffect(() => {
    const sections = navItems
      .map((item) => document.getElementById(item.id))
      .filter((section): section is HTMLElement => Boolean(section));

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id);
        }
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
    );

    sections.forEach((section) => io.observe(section));
    return () => io.disconnect();
  }, []);

  // Scroll progress + nav condensation.
  useEffect(() => {
    let frame = 0;

    const update = () => {
      frame = 0;
      setScrolled(window.scrollY > 24);

      const max = document.documentElement.scrollHeight - window.innerHeight;
      const ratio = max > 0 ? Math.min(1, window.scrollY / max) : 0;
      progressRef.current?.style.setProperty("--progress", String(ratio));
    };

    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const close = () => setMenuOpen(false);
    window.addEventListener("hashchange", close);
    return () => window.removeEventListener("hashchange", close);
  }, [menuOpen]);

  return (
    <>
      <Scene />

      <div className="progress" ref={progressRef} aria-hidden="true">
        <span />
      </div>

      <header className={`nav${scrolled ? " is-scrolled" : ""}`}>
        <a className="nav__brand" href="#home" aria-label="P. Mohamed Idris — home">
          <span className="nav__mark">MI</span>
          <span className="nav__brandtext">
            <strong>P. Mohamed Idris</strong>
            <small>NEURAL // ECE</small>
          </span>
        </a>

        <nav className="nav__links" aria-label="Sections">
          {navItems.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className={`nav__link${active === item.id ? " is-active" : ""}`}
              aria-current={active === item.id ? "true" : undefined}
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="nav__actions">
          <button type="button" className="btn btn--ghost btn--sm" onClick={openOwner}>
            Owner access
          </button>
          <button
            type="button"
            className="icon-btn nav__burger"
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            onClick={() => setMenuOpen((value) => !value)}
          >
            {menuOpen ? "✕" : "≡"}
          </button>
        </div>
      </header>

      {menuOpen ? (
        <div className="menu" id="mobile-menu">
          {navItems.map((item) => (
            <a key={item.id} href={`#${item.id}`} onClick={() => setMenuOpen(false)}>
              <span>{item.chapter}</span>
              {item.label}
            </a>
          ))}
          <a href={profile.github} target="_blank" rel="noreferrer noopener">
            <span>↗</span> GitHub
          </a>
          <a href={profile.linkedin} target="_blank" rel="noreferrer noopener">
            <span>↗</span> LinkedIn
          </a>
        </div>
      ) : null}

      <nav className="rail" aria-label="Chapter progress">
        {navItems.map((item) => (
          <a
            key={item.id}
            href={`#${item.id}`}
            className={active === item.id ? "is-active" : ""}
          >
            <span className="rail__num">{item.chapter}</span>
            <span className="rail__label">{item.label}</span>
          </a>
        ))}
      </nav>

      <main className="site">

        {/* ── 00 · HERO ─────────────────────────────────────────── */}

        <section className="hero" id="home">
          <div className="hero__scrim" aria-hidden="true" />

          <div className="shell hero__inner">
            <div className="hero__content">
              <p className="eyebrow hero__eyebrow" data-reveal>
                <span>ECE // VLSI TRACK</span>
                <span className="eyebrow__meta">
                  {profile.place.toUpperCase()} • 2026 – 2030
                </span>
              </p>

              <h1 className="hero__title" data-reveal>
                <span>{profile.first}</span>
                <span className="hero__title--accent">{profile.last}</span>
              </h1>

              <p className="hero__role" data-reveal>
                {profile.role}
              </p>

              <div className="hero__portrait-wrapper" data-reveal>
                <img
                  className="hero__portrait"
                  src={profile.portrait}
                  alt="P. Mohamed Idris"
                  width="180"
                  height="180"
                  style={{ borderRadius: "50%", border: "2px solid var(--red)", marginTop: "16px" }}
                />
              </div>

              <p className="hero__lede" data-reveal>
                B.E. Electronics and Communication Engineering student at
                <strong>{profile.college}</strong>, Nagapattinam — building toward
                VLSI design while engineering creative interfaces on the web.
              </p>

              <ul className="chips" data-reveal>
                {profile.interests.map((interest) => (
                  <li key={interest}>{interest}</li>
                ))}
              </ul>

              <div className="hero__actions" data-reveal>
                <a className="btn" href="#projects">
                  Explore the work
                </a>
                <a className="btn btn--ghost" href="#certifications">
                  View credentials
                </a>
                <a
                  className="link"
                  href={profile.github}
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  GitHub <span aria-hidden="true">↗</span>
                </a>
                <a
                  className="link"
                  href={profile.linkedin}
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  LinkedIn <span aria-hidden="true">↗</span>
                </a>
              </div>

              <dl className="telemetry" data-reveal>
                <div>
                  <dt>Degree</dt>
                  <dd>B.E. ECE • 2026–2030</dd>
                </div>
                <div>
                  <dt>Career focus</dt>
                  <dd>VLSI Design Engineer</dd>
                </div>
                <div>
                  <dt>Status</dt>
                  <dd>Learning & building</dd>
                </div>
                <div>
                  <dt>Base</dt>
                  <dd>Nagapattinam, TN</dd>
                </div>
              </dl>
            </div>

            <a className="hero__cue" href="#about" aria-label="Scroll to about">
              <span>Scroll</span>
              <i aria-hidden="true" />
            </a>
          </div>
        </section>

        {/* ── 01 · ABOUT ────────────────────────────────────────── */}

        <section className="section" id="about">
          <div className="shell">
            <SectionHead
              chapter="01"
              kicker="PROFILE"
              title="An ECE student with a developer mindset."
              lead="Honest curiosity over inflated titles. I bridge physical circuitry fundamentals with creative software design — and I am steering that foundation toward VLSI."
              meta="SINC // NAGAPATTINAM"
            />

            <div className="about">
              {aboutCards.map((card, index) => (
                <article
                  className="panel about__card"
                  key={card.kicker}
                  data-reveal
                  
                >
                  <p className="panel__kicker">{card.kicker}</p>
                  <h3 className="panel__title">{card.title}</h3>
                  {card.body.map((paragraph) => (
                    <p className="panel__text" key={paragraph.slice(0, 24)}>
                      {paragraph}
                    </p>
                  ))}
                  <ul className="trail">
                    {card.trail.map((step) => (
                      <li key={step}>{step}</li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ── 02 · EDUCATION ────────────────────────────────────── */}

        <section className="section section--alt" id="education">
          <div className="shell">
            <SectionHead
              chapter="02"
              kicker="TIMELINE"
              title="Academic foundation"
              lead="The institutions and milestones that shaped my scientific thinking and technical path."
            />

            <ol className="timeline">
              {education.map((entry, index) => (
                <li
                  className={`tl${entry.current ? " tl--active" : ""}`}
                  key={entry.school}
                  data-reveal
                  
                >
                  <div className="tl__marker" aria-hidden="true" />
                  <div className="tl__body">
                    <p className="tl__meta">
                      <span>{entry.phase}</span>
                      <span>{entry.period}</span>
                      <span className="tl__status">{entry.status}</span>
                    </p>
                    <h3 className="tl__school">{entry.school}</h3>
                    <p className="tl__detail">{entry.detail}</p>
                    <ul className="trail trail--tight">
                      {entry.modules.map((module) => (
                        <li key={module}>{module}</li>
                      ))}
                    </ul>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ── 03 · SKILLS ───────────────────────────────────────── */}

        <section className="section" id="skills">
          <div className="shell">
            <SectionHead
              chapter="03"
              kicker="CAPABILITIES"
              title="Tools I use. Things I'm learning."
              lead="Verified capabilities based on actual code and current coursework. No inflated percentages."
            />

            <div className="skills">
              {skillGroups.map((group, index) => (
                <article
                  className="panel skills__group"
                  key={group.title}
                  data-reveal
                  
                >
                  <p className="panel__kicker">{group.kicker}</p>
                  <h3 className="panel__title">{group.title}</h3>
                  <ul className="skills__list">
                    {group.items.map((item) => (
                      <li key={item.name}>
                        <div>
                          <p className="skills__name">{item.name}</p>
                          <p className="skills__note">{item.note}</p>
                        </div>
                        <span className="tag">{item.tag}</span>
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ── 04 · PROJECTS ────────────────────────────────────── */}

        <section className="section section--alt" id="projects">
          <div className="shell">
            <SectionHead
              chapter="04"
              kicker="REPOSITORIES"
              title="Things I've built."
              lead="Experiments in scroll choreography, interface engineering and ECE-focused telemetry — all published in the open."
              meta="OPEN SOURCE"
            />

            <div className="projects">
              {projects.map((project, index) => (
                <article
                  className="panel project"
                  key={project.index}
                  data-reveal
                  
                >
                  <div className="project__head">
                    <p className="panel__kicker">
                      {project.index} <span aria-hidden="true">/</span> {project.kind}
                    </p>
                    <span className="tag">{project.status}</span>
                  </div>
                  {project.image ? (
                    <img
                      className="project__image"
                      src={project.image}
                      alt={`${project.title} project preview`}
                      loading="lazy"
                      decoding="async"
                    />
                  ) : null}
                  <h3 className="project__title">{project.title}</h3>
                  <p className="panel__text">{project.description}</p>

                  <ul className="trail trail--tight">
                    {project.tags.map((tag) => (
                      <li key={tag}>{tag}</li>
                    ))}
                  </ul>

                  <ul className="readout" aria-label="Project telemetry">
                    {project.readout.map((line) => (
                      <li key={line}>{line}</li>
                    ))}
                  </ul>

                  {project.links.length > 0 ? (
                    <div className="project__links">
                      {project.links.map((link) => (
                        <a
                          key={link.href}
                          className="link"
                          href={link.href}
                          target="_blank"
                          rel="noreferrer noopener"
                        >
                          {link.label} <span aria-hidden="true">↗</span>
                        </a>
                      ))}
                    </div>
                  ) : null}
                </article>
              ))}
            </div>

            <div className="section__foot" data-reveal>
              <a
                className="btn btn--ghost"
                href={`${profile.github}?tab=repositories`}
                target="_blank"
                rel="noreferrer noopener"
              >
                View all on GitHub <span aria-hidden="true">↗</span>
              </a>
            </div>
          </div>
        </section>

        {/* ── 05 · CERTIFICATIONS ───────────────────────────────── */}

        <Certifications refreshKey={refreshKey} onOwnerAccess={openOwner} />

        {/* ── 06 · LEARNING ─────────────────────────────────────── */}

        <section className="section section--alt" id="learning">
          <div className="shell">
            <SectionHead
              chapter="06"
              kicker="ENGINEERING PHILOSOPHY"
              title="Building. Learning. Repeating."
              lead="A disciplined four-stage loop: hands-on code paired with deliberate conceptual study."
            />

            <ol className="stages">
              {learningStages.map((stage, index) => (
                <li
                  key={stage.index}
                  className="stage"
                  data-reveal
                  
                >
                  <span className="stage__index">{stage.index}</span>
                  <h3 className="stage__title">{stage.title}</h3>
                  <p className="panel__text">{stage.body}</p>
                </li>
              ))}
            </ol>

            <div className="vectors">
              {learningVectors.map((vector, index) => (
                <article
                  className="panel vector"
                  key={vector.title}
                  data-reveal
                  
                >
                  <p className="panel__kicker">{vector.label}</p>
                  <div className="vector__head">
                    <h3 className="panel__title">{vector.title}</h3>
                    <span className="tag">{vector.tag}</span>
                  </div>
                  <p className="panel__text">{vector.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ── 07 · CONTACT ──────────────────────────────────────── */}

        <section className="section section--contact" id="contact">
          <div className="shell">
            <SectionHead
              chapter="07"
              kicker="CONNECT"
              title="Let's build something."
              lead="Have an idea, a project, an experiment — or want to talk VLSI and silicon? Reach out through my verified channels."
            />

            <div className="contact">
              {contactChannels.map((channel, index) => (
                <a
                  className="panel contact__card"
                  key={channel.name}
                  href={channel.href}
                  target="_blank"
                  rel="noreferrer noopener"
                  data-reveal
                  
                >
                  <div className="contact__head">
                    <span className="contact__net">{channel.network}</span>
                    <span className="panel__kicker">{channel.meta}</span>
                  </div>
                  <h3 className="panel__title">{channel.name}</h3>
                  <p className="contact__handle">{channel.handle}</p>
                  <p className="panel__text">{channel.description}</p>
                  <span className="link">
                    {channel.cta} <span aria-hidden="true">↗</span>
                  </span>
                </a>
              ))}
            </div>

            <div className="closing" data-reveal>
              <p className="closing__line">
                Currently studying electronics, writing code, and working toward
                silicon.
              </p>
              <button type="button" className="btn btn--btn--sm" onClick={openOwner}>
                Owner access
              </button>
            </div>
          </div>
        </section>

      </main>

      <footer className="footer">
        <div className="shell footer__inner">
          <p>
            <strong>{profile.name}</strong> / STATUS: CURRENTLY LEARNING & BUILDING
          </p>
          <p className="footer__meta">
            © 2026 {profile.name}. All rights reserved. · SYS_REV: 04.29
          </p>
          <p className="footer__nav">
            <a href={profile.github} target="_blank" rel="noreferrer noopener">
              GitHub ↗
            </a>
            <a href={profile.linkedin} target="_blank" rel="noreferrer noopener">
              LinkedIn ↗
            </a>
            <a href="#home">Back to top ↑</a>
          </p>
        </div>
      </footer>

      <OwnerAccess open={ownerOpen} onClose={closeOwner} onChanged={bumpCertificates} />
    </>
  );
}