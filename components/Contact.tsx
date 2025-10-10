"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import SectionHeader from "./Section";
import Container from "@/containers/Container";
import Link from "next/link";
import Image from "next/image";
import stylesButton from "../styles/components/Button.module.css";
import styles from "../styles/components/Contact.module.css";

function Contact() {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [stars, setStars] = useState<
    { top: string; left: string; delay: number; size: number }[]
  >([]);
  const [launchRocket, setLaunchRocket] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.2 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (isVisible && stars.length === 0) {
      const newStars = Array.from({ length: 40 }).map(() => ({
        top: `${Math.random() * 100}%`,
        left: `${Math.random() * 100}%`,
        delay: Math.random() * 1.5,
        size: Math.random() < 0.75 ? 2 : 4,
      }));
      setStars(newStars);

      if (window.innerWidth >= 768) {
        setTimeout(() => setLaunchRocket(true), 1500);
      }
    }
  }, [isVisible, stars.length]);

  return (
    <div
      className={styles.contactContainer}
      ref={ref}
      style={{ position: "relative", overflow: "hidden" }}
    >
      {stars.map((star, i) => (
        <motion.div
          key={`star-${i}`}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            delay: star.delay,
            duration: 0.8,
            ease: "easeOut",
          }}
          style={{
            position: "absolute",
            top: star.top,
            left: star.left,
            width: `${star.size}px`,
            height: `${star.size}px`,
            backgroundColor: "#9fbbbb",
            borderRadius: "50%",
            pointerEvents: "none",
            opacity: 0.8,
          }}
        />
      ))}

      {launchRocket && (
        <motion.div
          initial={{ x: 0, y: 0, opacity: 1, rotate: 0, scale: 1 }}
          animate={{
            x: "70vw",
            y: "-70vh",
            opacity: 0,
            rotate: 0,
            scale: 1,
          }}
          transition={{
            duration: 40,
            ease: [0.2, 1, 0.5, 1],
            opacity: { duration: 1, delay: 4 },
          }}
          style={{
            position: "absolute",
            bottom: 0,
            left: "40%",
            transform: "translateX(-40%)",
            width: "12px",
            height: "12px",
            zIndex: 0,
          }}
        >
          <Image src="/rocket.svg" alt="Flying Rocket" width={23} height={23} />
        </motion.div>
      )}

      <Container>
        <SectionHeader
          header="Contact"
          title="Contact me for inquiries or project proposals"
          text="I'm always looking for new opportunities to collaborate. Feel free to reach out to me for any inquiries or project proposals."
        />
        <Link href="/contact">
          <button className={stylesButton.button}>Contact</button>
        </Link>
      </Container>
    </div>
  );
}

export default Contact;
