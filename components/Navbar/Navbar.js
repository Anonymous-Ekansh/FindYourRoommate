"use client";
import { useState, useEffect } from "react";
import styles from "./Navbar.module.css";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`${styles.navbar} ${scrolled ? styles.scrolled : ""}`}
      id="navbar"
    >
      <div className={styles.inner}>
        <a href="/" className={styles.logo} id="nav-logo">
          Haven
        </a>

        <div className={styles.desktopLinks}>
          <a href="/signup" className={styles.loginLink} id="nav-login">
            Log in
          </a>
          <a href="/signup" className={styles.signupBtn} id="nav-signup">
            Sign Up
          </a>
        </div>

        <button
          className={`${styles.hamburger} ${mobileOpen ? styles.open : ""}`}
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
          id="nav-hamburger"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>

      {mobileOpen && (
        <div className={styles.mobileMenu} id="nav-mobile-menu">
          <a
            href="/signup"
            className={styles.mobileLink}
            onClick={() => setMobileOpen(false)}
          >
            Log in
          </a>
          <a
            href="/signup"
            className={styles.mobileSignup}
            onClick={() => setMobileOpen(false)}
          >
            Sign Up
          </a>
        </div>
      )}
    </nav>
  );
}
