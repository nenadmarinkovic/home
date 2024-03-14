'use client';

import { useEffect, useRef } from 'react';
import { InView } from 'react-intersection-observer';

interface LanguageChartProps {
  data: { language: string; percentage: number }[];
  maxPercentage: number;
}

export const LanguageChart: React.FC<LanguageChartProps> = ({
  data,
  maxPercentage,
}) => {
  const chartRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate');
        } else {
          entry.target.classList.remove('animate');
        }
      });
    });

    const bars = chartRef.current?.querySelectorAll('rect');
    bars?.forEach((bar) => observer.observe(bar));

    return () => bars?.forEach((bar) => observer.unobserve(bar));
  }, []);

  return (
    <svg width="600" height={data.length * 80}>
      {data.map(({ language, percentage }, i) => (
        <InView key={i} threshold={0.5}>
          {({ inView, ref }) => (
            <g ref={ref} transform={`translate(100, ${i * 40})`}>
              <rect
                width={
                  inView ? (percentage / maxPercentage) * 400 : 0
                }
                height="20"
                fill={`hsl(84, 77%, ${
                  50 - (i / (data.length - 1)) * 50
                }%)`}
                style={{ opacity: 1 - i / data.length / 2 }}
              />
              <text
                x={-100}
                y="10"
                fill="#fff"
                dominantBaseline="middle"
              >
                {language}
              </text>
              <text
                x={inView ? (percentage / maxPercentage) * 400 : 0}
                y="10"
                fill="#fff"
                dominantBaseline="middle"
                textAnchor="start"
                dx="5"
                style={{ display: inView ? 'initial' : 'none' }}
              >
                {percentage.toFixed(2)}%
              </text>
            </g>
          )}
        </InView>
      ))}
    </svg>
  );
};
