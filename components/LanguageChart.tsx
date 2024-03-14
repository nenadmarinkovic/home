'use client';

import React, { useEffect, useRef, useState } from 'react';
import { LanguageChartProps } from '../types/types';

export const LanguageChart: React.FC<LanguageChartProps> = ({
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
    <svg width="600" height={groupedData.length * 80} ref={chartRef}>
      {groupedData.map(({ language, percentage }, i) => (
        <g key={i} transform={`translate(100, ${i * 35})`}>
          <rect
            width={inView ? (percentage / maxPercentage) * 400 : 0}
            height="20"
            fill={`hsl(84, 77%, ${
              50 - (i / (groupedData.length - 1)) * 50
            }%)`}
            style={{
              opacity: 1 - i / groupedData.length / 2,
              transition: 'width 1s',
            }}
          />
          <text x={-100} y="10" fill="#fff" dominantBaseline="middle">
            {language}
          </text>
          <text
            x={inView ? (percentage / maxPercentage) * 400 : 0}
            y="10"
            fill="#fff"
            dominantBaseline="middle"
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
  );
};
