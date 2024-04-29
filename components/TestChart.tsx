'use client';

import React, { useEffect, useState, useRef } from 'react';

import styles from '../styles/components/Test.module.css';
interface TestChartProps {
  maxValue: number;
  circleValue: number;
  testChartText: string;
}

const TestChart: React.FC<TestChartProps> = ({
  maxValue,
  circleValue,
  testChartText,
}) => {
  const [displayedNumber, setDisplayedNumber] = useState(0);
  const [scrollPercentage, setScrollPercentage] = useState(0);
  const circleRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    const checkIfInView = () => {
      if (circleRef.current) {
        const rect = circleRef.current.getBoundingClientRect();
        const isInView =
          rect.bottom >= 0 && rect.bottom <= window.innerHeight;
        setScrollPercentage(isInView ? 99 : 0);
        if (!isInView) {
          setDisplayedNumber(0); // Reset the number when not in view
        }
      }
    };

    checkIfInView();

    window.addEventListener('scroll', checkIfInView);
    return () => window.removeEventListener('scroll', checkIfInView);
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (scrollPercentage === 99) {
      setDisplayedNumber(0); // Reset the number before starting the animation
      interval = setInterval(() => {
        setDisplayedNumber((prevNumber) => {
          if (prevNumber < maxValue) {
            return prevNumber + 1;
          }
          clearInterval(interval);
          return prevNumber;
        });
      }, 20);
    }
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [scrollPercentage, maxValue]);

  const radius = 60;
  const strokeWidth = 7;
  const normalizedRadius = radius - strokeWidth * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset =
    circumference -
    (displayedNumber / 100) * circumference * circleValue;

  return (
    <>
      <div className={styles.chartContainer}>
        <svg height="150" width="150" ref={circleRef}>
          <circle
            stroke="#18271E"
            fill="#18271E"
            strokeWidth={strokeWidth}
            r={normalizedRadius}
            cx="75"
            cy="75"
          />
          <circle
            stroke="#aaf555"
            fill="transparent"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference + ' ' + circumference}
            style={{
              strokeDashoffset,
              transition: `stroke-dashoffset ${
                1 * (maxValue - displayedNumber)
              }ms linear`,
            }}
            strokeLinecap="round"
            r={normalizedRadius}
            cx="75"
            cy="75"
          />
          <text
            x="50%"
            y="50%"
            textAnchor="middle"
            fill="#aaf555"
            dy=".3em"
            fontSize="30"
            fontFamily="monospace"
            fontWeight={700}
          >
            {displayedNumber}
          </text>
        </svg>
        <span
          className={`${styles.text} ${
            displayedNumber === maxValue ? styles.textPopup : ''
          }`}
        >
          {testChartText}
        </span>
      </div>
    </>
  );
};

export default TestChart;
