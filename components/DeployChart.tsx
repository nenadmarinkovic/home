'use client';
import React, { useEffect, useState, useRef } from 'react';
import styles from '../styles/components/Deploy.module.css';
import Image from 'next/image';

function DeployChart() {
  const [isInView, setIsInView] = useState(false);
  const [isCurrent, setIsCurrent] = useState(0);
  const chartRef = useRef<HTMLDivElement | null>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const checkIfInView = () => {
      if (chartRef.current) {
        const rect = chartRef.current.getBoundingClientRect();
        const isInView =
          rect.top >= 0 && rect.bottom <= window.innerHeight;
        setIsInView(isInView);
      }
    };

    checkIfInView();

    window.addEventListener('scroll', checkIfInView);
    return () => window.removeEventListener('scroll', checkIfInView);
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

  return (
    <div className={`${styles.deploy_container}`} ref={chartRef}>
      <div className={styles.deploy_chart}>
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className={`${styles.deploy_chart_item}`}
            ref={(el) => (itemRefs.current[i] = el)}
          >
            <div className={styles.deploy_chart_item_icon}>
              <Image
                className={`${
                  styles.deploy_chart_item_icon_spinner
                } ${
                  isInView && isCurrent === i ? styles.animate : ''
                }`}
                src="/icons/loading.svg"
                alt="Loading"
                width={30}
                height={30}
              />
              <Image
                className={`${styles.deploy_chart_item_icon_check} ${
                  isInView && isCurrent > i ? styles.animate : ''
                }`}
                src="/icons/check.svg"
                alt="Check"
                width={30}
                height={30}
              />
            </div>
            <div
              className={`${styles.deploy_chart_item_text} ${
                isInView && isCurrent > i ? styles.textPopup : ''
              }`}
            >
              {i + 1}. Deploy your application to the cloud. Lorem
              ipsum dolor sit amet.
            </div>
          </div>
        ))}
        {isInView && isCurrent < 4 && (
          <div
            className={styles.deploy_chart_item_border}
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
