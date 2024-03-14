'use client';

import React, { useEffect, useRef, useState } from 'react';

interface LanguageChartProps {
  data: { language: string; percentage: number }[];
  maxPercentage: number;
}

export const LanguageChart: React.FC<LanguageChartProps> = ({
  data,
  maxPercentage,
}) => {
  const chartRef = useRef<SVGSVGElement | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const chart = chartRef.current;
      if (!chart) return;

      const chartRect = chart.getBoundingClientRect();
      const viewportHeight = window.innerHeight;

      // Adjusting the threshold as needed, here 0.2 means 20% of the element is visible
      const threshold = 0.2;

      // Check if the top and bottom of the SVG element is within the viewport
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
    handleScroll(); // Check initial position
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <svg width="600" height={data.length * 80} ref={chartRef}>
      {data.map(({ language, percentage }, i) => (
        <g key={i} transform={`translate(100, ${i * 40})`}>
          <rect
            width={inView ? (percentage / maxPercentage) * 400 : 0}
            height="20"
            fill={`hsl(84, 77%, ${
              50 - (i / (data.length - 1)) * 50
            }%)`}
            style={{
              opacity: 1 - i / data.length / 2,
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
              transition: 'opacity 1s ease-in-out 1s', // Add delay here
            }}
          >
            {percentage.toFixed(2)}%
          </text>
        </g>
      ))}
    </svg>
  );
};
