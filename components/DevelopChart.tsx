'use client';

import React, { useEffect, useRef, useState } from 'react';
import { DevelopChartProps } from '../types/types';

import styles from '../styles/components/Box.module.css';

export const DevelopChart: React.FC<DevelopChartProps> = ({
  data,
}) => {
  const chartRef = useRef<SVGSVGElement | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const chart = chartRef.current;
      if (!chart) return;

      const chartRect = chart.getBoundingClientRect();
      const viewportHeight = window.innerHeight;

      const threshold = 0.1;

      const topVisible =
        chartRect.top < viewportHeight * (1 - threshold);
      const bottomVisible =
        chartRect.bottom > viewportHeight * threshold;

      if (topVisible && bottomVisible) {
        setInView(true);
      } else {
        setInView(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const maxPercentage = Math.max(
    ...data.map((item) => item.percentage)
  );

  let restPercentage = 0;
  const groupedData = data.filter(({ language, percentage }) => {
    if (percentage < 0.1) {
      restPercentage += percentage;
      return false;
    }
    return true;
  });

  groupedData.push({ language: 'Rest', percentage: restPercentage });

  return (
    <div className={styles.developSVG}>
      <svg
        width="525"
        height={groupedData.length * 34}
        ref={chartRef}
      >
        {groupedData.map(({ language, percentage }, i) => (
          <g key={i} transform={`translate(100, ${i * 35})`}>
            <rect
              width={inView ? (percentage / maxPercentage) * 325 : 0}
              height="20"
              fill={`#36c6ff`}
              style={{
                opacity: 1 - i / groupedData.length / 2,
                transition: 'width 1s',
              }}
            />
            <text
              x={-100}
              y="10"
              fill="#9fbbbb"
              dominantBaseline="middle"
            >
              {language}
            </text>
            <text
              x={inView ? (percentage / maxPercentage) * 325 : 0}
              y="10"
              fill="#9fbbbb"
              dominantBaseline="middle"
              fontSize={14}
              textAnchor="start"
              dx="5"
              style={{
                opacity: inView ? 1 : 0,
                transition: 'opacity 1s ease-in-out 1s',
                visibility: inView ? 'visible' : 'hidden',
              }}
            >
              {percentage.toFixed(2)}%
            </text>
          </g>
        ))}
      </svg>
      <span className={styles.boxInfo}>
        Data is coming from a personal{' '}
        <a
          target="_blank"
          className="link"
          href="https://github.com/nenadmarinkovic"
        >
          GitHub profile
        </a>
        , based on all programming languages used in repositories.
      </span>
    </div>
  );
};
