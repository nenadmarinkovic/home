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
              Testing isn&apos;t just about finding bugs — it&apos;s
              about making sure your product works like a charm for
              your customers, keeping them happy and satisfied.
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
                  height="16"
                  strokeLinejoin="round"
                  viewBox="0 0 16 16"
                  width="16"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M5.35066 2.06247C5.96369 1.78847 6.62701 1.60666 7.32351 1.53473L7.16943 0.0426636C6.31208 0.1312 5.49436 0.355227 4.73858 0.693033L5.35066 2.06247ZM8.67651 1.53473C11.9481 1.87258 14.5 4.63876 14.5 8.00001C14.5 11.5899 11.5899 14.5 8.00001 14.5C4.63901 14.5 1.87298 11.9485 1.5348 8.67722L0.0427551 8.83147C0.459163 12.8594 3.86234 16 8.00001 16C12.4183 16 16 12.4183 16 8.00001C16 3.86204 12.8589 0.458666 8.83059 0.0426636L8.67651 1.53473ZM2.73972 4.18084C3.14144 3.62861 3.62803 3.14195 4.18021 2.74018L3.29768 1.52727C2.61875 2.02128 2.02064 2.61945 1.52671 3.29845L2.73972 4.18084ZM1.5348 7.32279C1.60678 6.62656 1.78856 5.96348 2.06247 5.35066L0.693033 4.73858C0.355343 5.4941 0.131354 6.31152 0.0427551 7.16854L1.5348 7.32279ZM8.75001 4.75V4H7.25001V4.75V7.875C7.25001 8.18976 7.3982 8.48615 7.65001 8.675L9.55001 10.1L10.15 10.55L11.05 9.35L10.45 8.9L8.75001 7.625V4.75Z"
                    fill="currentColor"
                  ></path>
                </svg>
                <span className={styles.boxItemMainItemText}>
                  Performance testing fine-tunes load times and
                  overall user experience.
                </span>
              </div>
              <div className={styles.boxItemMainItem}>
                <svg
                  className={styles.boxItemMainIcon}
                  height="16"
                  strokeLinejoin="round"
                  viewBox="0 0 16 16"
                  width="16"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M5.25 0C3.73122 0 2.5 1.23122 2.5 2.75V13.25C2.5 14.7688 3.73122 16 5.25 16H10.75C12.2688 16 13.5 14.7688 13.5 13.25V2.75C13.5 1.23122 12.2688 0 10.75 0H5.25ZM4 2.75C4 2.05964 4.55964 1.5 5.25 1.5H10.75C11.4404 1.5 12 2.05964 12 2.75V13.25C12 13.9404 11.4404 14.5 10.75 14.5H5.25C4.55964 14.5 4 13.9404 4 13.25V2.75ZM6.25 4.75C6.80228 4.75 7.25 4.30228 7.25 3.75C7.25 3.19772 6.80228 2.75 6.25 2.75C5.69772 2.75 5.25 3.19772 5.25 3.75C5.25 4.30228 5.69772 4.75 6.25 4.75Z"
                    fill="currentColor"
                  ></path>
                </svg>
                <span className={styles.boxItemMainItemText}>
                  Testing across diverse devices and browsers
                  guarantees seamless interaction.
                </span>
              </div>
              <div className={styles.boxItemMainItem}>
                <svg
                  className={styles.boxItemMainIcon}
                  height="16"
                  strokeLinejoin="round"
                  viewBox="0 0 16 16"
                  width="16"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M0 1C0 0.447716 0.447715 0 1 0H15C15.5523 0 16 0.447716 16 1V10C16 10.5523 15.5523 11 15 11H12.5V9.5H14.5V1.5H1.5V9.5H3.5V11H1C0.447715 11 0 10.5523 0 10V1ZM8 14C6.84509 14 5.76659 14.5772 5.12596 15.5381L5 15.7271V16H3.5V15.5V15.2729L3.62596 15.084L3.87789 14.7061C4.79671 13.3278 6.34356 12.5 8 12.5C9.65644 12.5 11.2033 13.3278 12.1221 14.7061L12.374 15.084L12.5 15.2729V15.5V16H11V15.7271L10.874 15.5381C10.2334 14.5772 9.15491 14 8 14ZM7.75 6C6.50736 6 5.5 7.00736 5.5 8.25V8.75C5.5 9.99264 6.50736 11 7.75 11H8.25C9.49264 11 10.5 9.99264 10.5 8.75V8.25C10.5 7.00736 9.49264 6 8.25 6H7.75ZM7 8.25C7 7.83579 7.33579 7.5 7.75 7.5H8.25C8.66421 7.5 9 7.83579 9 8.25V8.75C9 9.16421 8.66421 9.5 8.25 9.5H7.75C7.33579 9.5 7 9.16421 7 8.75V8.25Z"
                    fill="currentColor"
                  ></path>
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
