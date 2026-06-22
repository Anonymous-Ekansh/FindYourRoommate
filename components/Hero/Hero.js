"use client";
import Image from "next/image";
import styles from "./Hero.module.css";

const profileCards = [
  {
    name: "Arjun K.",
    year: "2nd Year · CS",
    avatar: "/avatars/avatar1.png",
    habits: ["Night Owl", "Clean Freak", "Gym Bro"],
    vibe: "Chill but focused",
    budget: "₹8k–12k/mo",
    rotation: -3,
    top: "5%",
    left: "5%",
  },
  {
    name: "Priya M.",
    year: "3rd Year · Design",
    avatar: "/avatars/avatar2.png",
    habits: ["Early Bird", "Neat-ish", "Music On"],
    vibe: "Creative chaos",
    budget: "₹6k–10k/mo",
    rotation: 2.5,
    top: "25%",
    left: "55%",
  },
  {
    name: "Riku T.",
    year: "2nd Year · Econ",
    avatar: "/avatars/avatar3.png",
    habits: ["Flexible", "Tidy", "Quiet Study"],
    vibe: "Laid back",
    budget: "₹7k–11k/mo",
    rotation: -1.5,
    top: "55%",
    left: "20%",
  },
];

function ProfileCard({ card }) {
  return (
    <div
      className={styles.profileCard}
      style={{
        transform: `rotate(${card.rotation}deg)`,
        top: card.top,
        left: card.left,
      }}
    >
      {/* Tape strip */}
      <div className={styles.tapeStrip}>
        <svg width="60" height="24" viewBox="0 0 60 24" fill="none">
          <rect
            x="2"
            y="4"
            width="56"
            height="16"
            rx="2"
            fill="#FFE158"
            fillOpacity="0.7"
            stroke="#1A1A1A"
            strokeWidth="1"
            strokeDasharray="3 2"
          />
        </svg>
      </div>

      <div className={styles.cardInner}>
        <div className={styles.cardHeader}>
          <div className={styles.avatarWrap}>
            <Image
              src={card.avatar}
              alt={card.name}
              width={72}
              height={72}
              className={styles.avatar}
            />
          </div>
          <div className={styles.cardInfo}>
            <h3 className={styles.cardName}>{card.name}</h3>
            <span className={styles.cardYear}>{card.year}</span>
          </div>
        </div>

        <div className={styles.habits}>
          {card.habits.map((habit, i) => (
            <span key={i} className={styles.habitChip}>
              {habit}
            </span>
          ))}
        </div>

        <div className={styles.cardMeta}>
          <span className={styles.vibe}>{card.vibe}</span>
          <span className={styles.budget}>{card.budget}</span>
        </div>
      </div>
    </div>
  );
}

export default function Hero() {
  return (
    <section className={styles.hero} id="hero">
      <div className={styles.heroContent}>
        <div className={styles.textSide}>
          <h1 className={styles.headline}>
            Stop rooming with a{" "}
            <span className={styles.squigglyWord}>stranger</span>
          </h1>
          <p className={styles.subheadline}>
            Match with roommates based on habits, vibe, and budget — not luck.
          </p>
          <div className={styles.ctaGroup}>
            <a href="/signup" className={styles.primaryCta} id="hero-signup-cta">
              Sign up with college email
              {/* Wobbly arrow */}
              <svg
                className={styles.wobblyArrow}
                width="48"
                height="32"
                viewBox="0 0 48 32"
                fill="none"
              >
                <path
                  d="M4 20 C10 8, 20 4, 38 12"
                  stroke="var(--ink-black)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  fill="none"
                  strokeDasharray="2 0"
                />
                <path
                  d="M32 6 L39 12 L30 16"
                  stroke="var(--ink-black)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
              </svg>
            </a>
            <a href="#how-it-works" className={styles.secondaryCta}>
              See how it works
            </a>
          </div>
        </div>

        <div className={styles.cardsSide}>
          {profileCards.map((card, i) => (
            <ProfileCard key={i} card={card} />
          ))}

          {/* Pushpin decorations */}
          <svg
            className={styles.pushpin1}
            width="24"
            height="32"
            viewBox="0 0 24 32"
          >
            <circle cx="12" cy="8" r="7" fill="#FF5A4E" stroke="#1A1A1A" strokeWidth="2" />
            <circle cx="12" cy="8" r="3" fill="#fff" fillOpacity="0.4" />
            <line x1="12" y1="15" x2="12" y2="30" stroke="#888" strokeWidth="2" />
          </svg>
          <svg
            className={styles.pushpin2}
            width="24"
            height="32"
            viewBox="0 0 24 32"
          >
            <circle cx="12" cy="8" r="7" fill="#1F6F4A" stroke="#1A1A1A" strokeWidth="2" />
            <circle cx="12" cy="8" r="3" fill="#fff" fillOpacity="0.4" />
            <line x1="12" y1="15" x2="12" y2="30" stroke="#888" strokeWidth="2" />
          </svg>
        </div>
      </div>
    </section>
  );
}
