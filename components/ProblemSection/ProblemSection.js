import styles from "./ProblemSection.module.css";

export default function ProblemSection() {
  return (
    <section className={styles.section} id="problem">
      {/* Torn paper top edge */}
      <div className={styles.tornTop}></div>

      <div className={styles.container}>
        <div className={styles.content}>
          <h2 className={styles.heading}>
            Roommate roulette isn't{" "}
            <span className={styles.strikethrough}>fun</span> funny when you're
            living it
          </h2>

          <div className={styles.painPoints}>
            <div className={styles.painCard} style={{ transform: "rotate(-1deg)" }}>
              <p>
                They sleep at 9pm. You're up at 3am finishing assignments. Every.
                Single. Night.
              </p>
            </div>

            <div className={styles.painCard} style={{ transform: "rotate(1.5deg)" }}>
              <p>
                Your idea of "clean" is different from someone who thinks the
                floor is a shelf.
              </p>
            </div>

            <div className={styles.painCard} style={{ transform: "rotate(-0.5deg)" }}>
              <p>
                You don't even know who else is looking for a roommate. Zero
                visibility, pure guesswork.
              </p>
            </div>
          </div>

          <p className={styles.closer}>
            You wouldn't pick a group project partner at random.
            <br />
            <strong>Why do it with the person you'll live with for a year?</strong>
          </p>

          {/* Decorative sticker */}
          <div className={styles.stickerDecor}>
            <span className={styles.sticker}>been there</span>
          </div>
        </div>
      </div>

      {/* Torn paper bottom edge */}
      <div className={styles.tornBottom}></div>
    </section>
  );
}
