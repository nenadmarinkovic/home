"use client";

import React, { useEffect, useState, useRef } from "react";
import Image from "next/image";

import styles from "../styles/components/Deploy.module.css";

function DeployChart() {
  const [isInView, setIsInView] = useState(false);
  const [isCurrent, setIsCurrent] = useState(0);
  const chartRef = useRef<HTMLDivElement | null>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const checkIfInView = () => {
      const chart = chartRef.current;
      if (!chart) return;

      const chartRect = chart.getBoundingClientRect();
      const viewportHeight = window.innerHeight;

      const threshold = 0.1;

      const topVisible = chartRect.top < viewportHeight * (1 - threshold);
      const bottomVisible = chartRect.bottom > viewportHeight * threshold;

      if (topVisible && bottomVisible) {
        setIsInView(true);
      } else {
        setIsInView(false);
      }
    };

    checkIfInView();

    window.addEventListener("scroll", checkIfInView);
    return () => window.removeEventListener("scroll", checkIfInView);
  }, []);

  useEffect(() => {
    if (!isInView) {
      setIsCurrent(0);
    } else {
      const interval = setInterval(() => {
        if (isCurrent < 4) {
          setIsCurrent((prev) => prev + 1);
        } else {
          clearInterval(interval);
        }
      }, 600);
      return () => clearInterval(interval);
    }
  }, [isInView, isCurrent]);

  const steps = [
    "Double-check all code for errors to prevent any potential issues before launch.",
    "Conduct thorough testing to ensure all features function seamlessly.",
    "Test the website under various conditions to guarantee the best performance.",
    `Once confident in your website's readiness, deploy it and share your vision with the world.`,
  ];

  return (
    <div className={`${styles.deployContainer}`} ref={chartRef}>
      <div className={styles.deployChart}>
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className={`${styles.deployChartItem}`}
            ref={(el) => {
              itemRefs.current[i] = el;
            }}
          >
            <div className={styles.deployChartItemIcon}>
              <Image
                className={`${styles.deployChartItemIconSpinner} ${
                  isInView && isCurrent === i ? styles.animate : ""
                }`}
                src="/icons/loading.svg"
                alt="Loading"
                width={30}
                height={30}
              />
              <Image
                className={`${styles.deployChartItemIconCheck} ${
                  isInView && isCurrent > i ? styles.animate : ""
                }`}
                src="/icons/check.svg"
                alt="Check"
                width={30}
                height={30}
              />
            </div>
            <div
              className={`${styles.deployChartItemText} ${
                isInView && isCurrent > i ? styles.textPopup : ""
              }`}
            >
              {i + 1}. {steps[i]}
            </div>
          </div>
        ))}
        {isInView && isCurrent < 4 && (
          <div
            className={styles.deployChartItemBorder}
            style={{
              transform: `translateY(${
                itemRefs.current[isCurrent]?.offsetTop || 0
              }px)`,
            }}
          ></div>
        )}
      </div>
    </div>
  );
}

export default DeployChart;
