import styles from "./FinalCTA.module.css";

export default function FinalCTA() {
  return (
    <section className={styles.section} id="final-cta">
      {/* Squiggles */}
      <svg className={styles.squiggle} width="120" height="20" viewBox="0 0 120 20" fill="none">
        <path
          d="M2 10 Q12 2 22 10 Q32 18 42 10 Q52 2 62 10 Q72 18 82 10 Q92 2 102 10 Q112 18 118 10"
          stroke="var(--ink-black)"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
          opacity="0.2"
        />
      </svg>

      <div className={styles.container}>
        <h2 className={styles.heading}>
          Looking for a roommate?
        </h2>
        <p className={styles.sub}>
          Join in under 2 minutes. Seriously, it's faster than waiting for hostel wifi to load.
        </p>

        <div className={styles.ctaWrap}>
          <a href="/login" className={styles.ctaButton} id="final-signup-cta">
            Sign up with college email
          </a>
          {/* Wobbly arrow */}
          <svg
            className={styles.wobblyArrow}
            width="52"
            height="36"
            viewBox="0 0 52 36"
            fill="none"
          >
            <path
              d="M4 28 C12 12, 24 6, 42 14"
              stroke="var(--ink-black)"
              strokeWidth="2.5"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M36 8 L43 14 L34 18"
              stroke="var(--ink-black)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </svg>
        </div>
      </div>
    </section>
  );
}
