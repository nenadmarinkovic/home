'use client';

import { useEffect, useRef, useState } from 'react';
import { BoxPropsTypes } from '../types/types';
import boxStyles from '../styles/components/Box.module.css';

function Box({
  title,
  boxColor,
  headerText,
  mainTitle,
  boxItems,
}: BoxPropsTypes) {
  const [isActive, setIsActive] = useState(false);
  const boxRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio === 1) {
            setIsActive(true);
          } else {
            setIsActive(false);
          }
        });
      },
      { threshold: 1.0 }
    );

    const currentBoxRef = boxRef.current;
    if (currentBoxRef) {
      observer.observe(currentBoxRef);
    }

    return () => {
      if (currentBoxRef) {
        observer.unobserve(currentBoxRef);
      }
    };
  }, []);

  return (
    <div className={boxStyles.boxItem} ref={boxRef}>
      <div className={boxStyles.boxItemInside}>
        <h3
          className={`${boxStyles.boxItemHeaderTitle} ${boxStyles[boxColor]}`}
        >
          {title}
        </h3>
        <p className={boxStyles.boxItemHeaderText}>{headerText}</p>
        <p
          className={`${boxStyles.boxItemMainTitle} ${boxStyles[boxColor]}`}
        >
          {mainTitle}
        </p>
        <div className={boxStyles.boxItemMainItems}>
          {boxItems.map((item, index) => (
            <div key={index} className={boxStyles.boxItemMainItem}>
              {item.icon}
              <span className={boxStyles.boxItemMainItemText}>
                {item.text}
              </span>
            </div>
          ))}
        </div>
      </div>
      <div
        className={`${isActive && boxStyles.active} ${
          boxStyles.blur
        } ${boxStyles[`blur-${boxColor}`]} `}
      ></div>
    </div>
  );
}

export default Box;
