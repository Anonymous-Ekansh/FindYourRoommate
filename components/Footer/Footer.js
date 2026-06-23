import styles from "./Footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer} id="footer">
      <div className={styles.container}>
        <div className={styles.topRow}>
          <div className={styles.brand}>
            <span className={styles.logo}>Roomy</span>
            <p className={styles.tagline}>
              Roommate matching based on vibe, not luck.
            </p>
          </div>
          <div className={styles.links}>
            <a href="mailto:helloworldiamekansh@gmail.com" className={styles.link} id="footer-contact">
              Contact: helloworldiamekansh@gmail.com
            </a>
          </div>
        </div>

        <div className={styles.divider}></div>

        <div className={styles.bottomRow}>
          <p className={styles.credit}>
            Brought to you by Ekansh and one and only Ananya ma'am
          </p>
          <p className={styles.copyright}>
            © 2026 Roomy
          </p>
        </div>
      </div>
    </footer>
  );
}
