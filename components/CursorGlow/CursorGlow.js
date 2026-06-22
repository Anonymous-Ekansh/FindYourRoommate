"use client";
import { useEffect, useRef } from "react";
import styles from "./CursorGlow.module.css";

export default function CursorGlow() {
  const glowRef = useRef(null);

  useEffect(() => {
    const glow = glowRef.current;
    if (!glow) return;

    let mouseX = 0;
    let mouseY = 0;
    let currentX = 0;
    let currentY = 0;
    let isMoving = false;

    const onMouseMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      isMoving = true;
    };

    const updatePosition = () => {
      if (isMoving) {
        // Linear interpolation for smooth trailing effect
        currentX += (mouseX - currentX) * 0.1;
        currentY += (mouseY - currentY) * 0.1;
        
        glow.style.transform = `translate3d(${currentX - 100}px, ${currentY - 100}px, 0)`;
      }
      requestAnimationFrame(updatePosition);
    };

    window.addEventListener("mousemove", onMouseMove);
    const animationFrameId = requestAnimationFrame(updatePosition);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <div ref={glowRef} className={styles.glow} aria-hidden="true" />;
}
