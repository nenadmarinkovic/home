import React from 'react';
import TestChart from './TestChart';
import Container from '@/containers/Container';

import styles from '../styles/components/Box.module.css';

function Test() {
  return (
    <Container>
      <div className={`${styles.boxContainer} ${styles.boxSecond}`}>
        <div className={styles.boxDetail}>
          <div className={styles.boxCharts}>
            <div className={styles.boxChartItems}>
              <TestChart
                maxValue={99}
                circleValue={0.97}
                testChartText="Performance"
              />
              <TestChart
                maxValue={100}
                circleValue={1}
                testChartText="Accessibility"
              />
            </div>
            <div className={styles.boxChartItems}>
              <TestChart
                maxValue={100}
                circleValue={1}
                testChartText="Best Practices"
              />
              <TestChart
                maxValue={100}
                circleValue={1}
                testChartText="SEO"
              />
            </div>
          </div>
          <span className={`${styles.boxInfo} ${styles.boxInfoTest}`}>
            Data estimation based on average results of Lighthouse
            tests on this website.
          </span>
        </div>
        <div className={styles.boxItem}>
          <div className={styles.boxItemInside}>
            <h3
              className={`${styles.boxItem_header_title} ${styles.green}`}
            >
              Test
            </h3>
            <p className={styles.boxItemHeaderText}>
              I employ state-of-the-art testing methodologies to
              ensure that every aspect of your website functions
              seamlessly across different platforms.
            </p>
            <p
              className={`${styles.boxItemMainTitle} ${styles.green}`}
            >
              Rigorous testing in every stage of the project lifecycle
            </p>
            <div className={styles.boxItemMainItems}>
              <div className={styles.boxItemMainItem}>
                <svg
                  className={styles.boxItemMainIcon}
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.59 14.37a6 6 0 0 1-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 0 0 6.16-12.12A14.98 14.98 0 0 0 9.631 8.41m5.96 5.96a14.926 14.926 0 0 1-5.841 2.58m-.119-8.54a6 6 0 0 0-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 0 0-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 0 1-2.448-2.448 14.9 14.9 0 0 1 .06-.312m-2.24 2.39a4.493 4.493 0 0 0-1.757 4.306 4.493 4.493 0 0 0 4.306-1.758M16.5 9a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z"
                  />
                </svg>
                <span className={styles.boxItemMainItemText}>
                  Performance testing fine-tunes load times and
                  overall user experience.
                </span>
              </div>
              <div className={styles.boxItemMainItem}>
                <svg
                  className={styles.boxItemMainIcon}
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.59 14.37a6 6 0 0 1-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 0 0 6.16-12.12A14.98 14.98 0 0 0 9.631 8.41m5.96 5.96a14.926 14.926 0 0 1-5.841 2.58m-.119-8.54a6 6 0 0 0-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 0 0-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 0 1-2.448-2.448 14.9 14.9 0 0 1 .06-.312m-2.24 2.39a4.493 4.493 0 0 0-1.757 4.306 4.493 4.493 0 0 0 4.306-1.758M16.5 9a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z"
                  />
                </svg>
                <span className={styles.boxItemMainItemText}>
                  Testing across diverse devices and browsers
                  guarantees seamless interaction
                </span>
              </div>
              <div className={styles.boxItemMainItem}>
                <svg
                  className={styles.boxItemMainIcon}
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.59 14.37a6 6 0 0 1-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 0 0 6.16-12.12A14.98 14.98 0 0 0 9.631 8.41m5.96 5.96a14.926 14.926 0 0 1-5.841 2.58m-.119-8.54a6 6 0 0 0-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 0 0-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 0 1-2.448-2.448 14.9 14.9 0 0 1 .06-.312m-2.24 2.39a4.493 4.493 0 0 0-1.757 4.306 4.493 4.493 0 0 0 4.306-1.758M16.5 9a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z"
                  />
                </svg>
                <span className={styles.boxItemMainItemText}>
                  Usability testing collects feedback to enhance
                  intuitive design and navigation.
                </span>
              </div>
            </div>
          </div>
          <div className={`${styles.blur} ${styles.blurGreen}`}></div>
        </div>
        <div className={styles.boxDots}></div>
      </div>
    </Container>
  );
}

export default Test;
