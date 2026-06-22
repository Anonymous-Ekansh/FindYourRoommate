"use client";
import { useEffect } from "react";

export default function ScrollReveal() {
  useEffect(() => {
    // 1. Observe Sections (Fade in and slide up)
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("reveal-visible");
            sectionObserver.unobserve(entry.target); // Trigger only once
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
    );

    const sections = document.querySelectorAll(".reveal-section");
    sections.forEach((sec) => sectionObserver.observe(sec));

    // 2. Observe Hero Cards (Staggered reveal)
    const heroObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const cards = entry.target.querySelectorAll(".reveal-hero-card");
            cards.forEach((card, idx) => {
              setTimeout(() => {
                card.classList.add("reveal-card-visible");
              }, idx * 120); // 120ms stagger
            });
            heroObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    const heroSection = document.querySelector("#hero");
    if (heroSection) heroObserver.observe(heroSection);

    // 3. Observe FAQ Items (Simple list reveal)
    const faqObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const items = entry.target.querySelectorAll(".reveal-faq-item");
            items.forEach((item) => {
              item.classList.add("reveal-faq-visible");
            });
            faqObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    const faqSection = document.querySelector("#faq");
    if (faqSection) faqObserver.observe(faqSection);

    return () => {
      sectionObserver.disconnect();
      heroObserver.disconnect();
      faqObserver.disconnect();
    };
  }, []);

  return null;
}
