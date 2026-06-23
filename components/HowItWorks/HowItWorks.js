"use client";
import { useEffect, useRef } from "react";
import styles from "./HowItWorks.module.css";

const steps = [
  {
    num: "01",
    title: "Create your profile",
    desc: "Habits, vibe, preferences — takes 2 minutes, not an essay.",
    bg: "var(--cream-white)",
    rotate: -2,
  },
  {
    num: "02",
    title: "Browse & filter",
    desc: "See other students who are also looking. Filter by what matters to you.",
    bg: "var(--cream-white)",
    rotate: 1.5,
  },
  {
    num: "03",
    title: 'Tap "Interested"',
    desc: "Like someone's profile? Tap interested — they'll see it in their inbox.",
    bg: "var(--sticky-pink)",
    rotate: -1,
  },
  {
    num: "04",
    title: "It's a match!",
    desc: "If they're interested too, contact info unlocks for both of you. Done.",
    bg: "var(--lime-mint)",
    rotate: 2,
    isMatch: true,
  },
];

export default function HowItWorks() {
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add(styles.visible);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -50px 0px" }
    );

    const cards = sectionRef.current?.querySelectorAll(`.${styles.stepCard}`);
    cards?.forEach((card) => observer.observe(card));

    return () => observer.disconnect();
  }, []);

  return (
    <section className={styles.section} id="how-it-works" ref={sectionRef}>
      <div className={styles.container}>
        <div className={styles.sectionLabel}>
          <span className={styles.labelChip}>How it works</span>
          {/* Doodled exclamation marks */}
          <svg
            className={styles.exclamation}
            width="24"
            height="32"
            viewBox="0 0 24 32"
            fill="none"
          >
            <path d="M10 4 L13 4 L12 20 L11 20 Z" fill="var(--coral-punch)" />
            <circle cx="11.5" cy="26" r="3" fill="var(--coral-punch)" />
            <path d="M17 2 L20 2 L19 16 L18 16 Z" fill="var(--coral-punch)" opacity="0.5" />
            <circle cx="18.5" cy="20" r="2" fill="var(--coral-punch)" opacity="0.5" />
          </svg>
        </div>

        <h2 className={styles.heading}>
          Four steps. Two minutes.
          <br />
          <span className={styles.headingAccent}>Zero awkwardness.</span>
        </h2>

        <div className={styles.stepsGrid}>
          {steps.map((step, i) => (
            <div
              key={i}
              className={`${styles.stepCard} ${step.isMatch ? styles.matchCard : ""}`}
              style={{
                "--card-bg": step.bg,
                "--card-rotate": `${step.rotate}deg`,
                "--delay": `${i * 0.15}s`,
              }}
            >
              <span className={styles.stepNum}>{step.num}</span>
              <h3 className={styles.stepTitle}>{step.title}</h3>
              <p className={styles.stepDesc}>{step.desc}</p>
              {step.isMatch && (
                <span className={styles.matchBadge}>Match!</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
