'use client';
import React, { useEffect, useState, useRef } from 'react';

function Test() {
  const [scrollPercentage, setScrollPercentage] = useState(0);
  const [displayedNumber, setDisplayedNumber] = useState(0);
  const circleRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    const checkIfInView = () => {
      if (circleRef.current) {
        const rect = circleRef.current.getBoundingClientRect();
        const isInView =
          rect.top >= 0 && rect.bottom <= window.innerHeight;
        setScrollPercentage(isInView ? 99 : 0);
      }
    };

    checkIfInView(); // Initial check

    window.addEventListener('scroll', checkIfInView);
    return () => window.removeEventListener('scroll', checkIfInView);
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (scrollPercentage === 99) {
      interval = setInterval(() => {
        setDisplayedNumber((prevNumber) => {
          if (prevNumber < 99) {
            return prevNumber + 1;
          }
          return prevNumber;
        });
      }, 25);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [scrollPercentage]);

  const radius = 70;
  const strokeWidth = 10;
  const normalizedRadius = radius - strokeWidth * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset =
    circumference - (scrollPercentage / 100) * circumference * 0.97;

  return (
    <svg height="150" width="150" ref={circleRef}>
      <circle
        stroke="#18271E"
        fill="transparent"
        strokeWidth={strokeWidth}
        r={normalizedRadius}
        cx="75"
        cy="75"
      />
      <circle
        stroke="#84e119"
        fill="#18271E"
        strokeWidth={strokeWidth}
        strokeDasharray={circumference + ' ' + circumference}
        style={{
          strokeDashoffset,
          transition: 'stroke-dashoffset 3s ease-in-out',
        }}
        r={normalizedRadius}
        strokeLinecap="round"
        cx="75"
        cy="75"
      />
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        fill="#84e119"
        dy=".3em"
        fontSize="30"
        fontFamily="monospace"
        fontWeight={700}
      >
        {displayedNumber}
      </text>
    </svg>
  );
}

export default Test;
