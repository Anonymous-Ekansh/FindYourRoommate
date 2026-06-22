"use client";
import { useState } from "react";
import styles from "./FAQ.module.css";

const faqs = [
  {
    q: "Is this only for SNU?",
    a: "Yep, for now. We're starting with our own campus to make sure the experience is solid before expanding anywhere else.",
  },
  {
    q: "Will my profile be visible to everyone?",
    a: "Yes — your profile is visible to other verified students on the platform. That's kind of the point! But your contact info stays hidden until there's a mutual match.",
  },
  {
    q: "How will I know if someone's interested in me?",
    a: 'Check your "Who\'s Interested" tab. When someone taps Interested on your profile, you\'ll see them there. If you tap Interested back — boom, it\'s a match.',
  },
  {
    q: "Is my data safe?",
    a: "Absolutely. We don't sell your data, we don't share it with third parties, and we use verified college emails to keep the platform legit. You can delete your profile anytime.",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);

  const toggle = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className={styles.section} id="faq">
      {/* Decorative doodle question marks */}
      <svg className={styles.doodleQ1} width="40" height="50" viewBox="0 0 40 50" fill="none">
        <path d="M12 8 C12 4 20 2 24 6 C28 10 24 16 20 18 L20 26" stroke="var(--sticky-pink)" strokeWidth="3" strokeLinecap="round" fill="none" />
        <circle cx="20" cy="33" r="3" fill="var(--sticky-pink)" />
      </svg>
      <svg className={styles.doodleQ2} width="30" height="40" viewBox="0 0 30 40" fill="none">
        <path d="M8 6 C8 3 14 1 17 4 C20 7 17 12 14 13 L14 19" stroke="var(--butter-yellow)" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.6" />
        <circle cx="14" cy="24" r="2.5" fill="var(--butter-yellow)" opacity="0.6" />
      </svg>

      <div className={styles.container}>
        <h2 className={styles.heading}>
          Got questions?
          <span className={styles.headingSub}> (we've got answers)</span>
        </h2>

        <div className={styles.faqList}>
          {faqs.map((faq, i) => (
            <div
              key={i}
              className={`${styles.faqItem} ${openIndex === i ? styles.open : ""}`}
            >
              <button
                className={styles.faqQuestion}
                onClick={() => toggle(i)}
                aria-expanded={openIndex === i}
                id={`faq-q-${i}`}
              >
                <span className={styles.qText}>{faq.q}</span>
                <span className={styles.qIcon}>
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <line x1="4" y1="10" x2="16" y2="10" stroke="var(--ink-black)" strokeWidth="2.5" strokeLinecap="round" />
                    <line
                      x1="10" y1="4" x2="10" y2="16"
                      stroke="var(--ink-black)" strokeWidth="2.5" strokeLinecap="round"
                      className={styles.verticalLine}
                    />
                  </svg>
                </span>
              </button>
              <div className={styles.faqAnswer}>
                <p>{faq.a}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
