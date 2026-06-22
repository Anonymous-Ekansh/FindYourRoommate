import styles from "./SocialProof.module.css";

export default function SocialProof() {
  return (
    <section className={styles.section} id="social-proof">
      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.badge}>
            <span className={styles.badgeInner}>Early bird</span>
          </div>

          <h2 className={styles.heading}>
            Be one of the first to join
          </h2>

          <p className={styles.subtext}>
            We're just getting started — and the first ones in get the best
            picks. Like getting to the mess before they run out of paneer.
          </p>

          <div className={styles.decorRow}>
            <span className={styles.doodleTag} style={{ transform: "rotate(-3deg)", background: "var(--cream-white)" }}>
              future roomie
            </span>
            <span className={styles.doodleTag} style={{ transform: "rotate(2deg)", background: "var(--sticky-pink)" }}>
              early access
            </span>
            <span className={styles.doodleTag} style={{ transform: "rotate(-1deg)", background: "var(--soft-yellow)" }}>
              good vibes only
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
