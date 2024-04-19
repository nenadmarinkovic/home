import DeployChart from './DeployChart';
import Container from '@/containers/Container';

import styles from '../styles/components/Box.module.css';
import SpotifyPlay from './Spotify';

function Deploy() {
  return (
    <Container>
      <div className={styles.boxContainer}>
        <div className={styles.boxItem}>
          <div className={styles.boxItemInside}>
            <h3
              className={`${styles.boxItem_header_title} ${styles.pink}`}
            >
              Deploy
            </h3>

            <p className={styles.boxItemHeaderText}>
              With automated deployments, your customers can trust
              that your product is always up-to-date and secure,
              enhancing their confidence in your brand.
            </p>
            <p
              className={`${styles.boxItemMainTitle} ${styles.pink}`}
            >
              Smooth deployment process with continuous monitoring
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
                  Deployment is crucial in modern web development for
                  timely updates and adaptation.
                </span>
              </div>
              <div className={styles.boxItemMainItem}>
                <svg
                  height="16"
                  strokeLinejoin="round"
                  className={styles.boxItemMainIcon}
                  viewBox="0 0 16 16"
                  width="16"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M1 1V12.75C1 13.9926 2.00736 15 3.25 15H15V13.5H3.25C2.83579 13.5 2.5 13.1642 2.5 12.75V1H1ZM9.5 3.75V3H8V3.75V11.25V12H9.5V11.25V3.75ZM6 8V8.75V11.25V12H4.5V11.25V8.75V8H6ZM13 6.75V6H11.5V6.75V11.25V12H13V11.25V6.75Z"
                    fill="currentColor"
                  ></path>
                </svg>
                <span className={styles.boxItemMainItemText}>
                  Optimized deployments lead to improved performance,
                  ensuring swift load times.
                </span>
              </div>
              <div className={styles.boxItemMainItem}>
                <svg
                  height="16"
                  strokeLinejoin="round"
                  className={styles.boxItemMainIcon}
                  viewBox="0 0 16 16"
                  width="16"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M8.99107 1.57556C7.01494 1.27234 4.92586 1.88176 3.40381 3.40381C0.865398 5.94221 0.865398 10.0578 3.40381 12.5962L3.93414 13.1265L2.87348 14.1872L2.34315 13.6569C-0.781049 10.5327 -0.781049 5.46734 2.34315 2.34315C4.40973 0.276566 7.32564 -0.423021 9.96727 0.244385L8.99107 1.57556ZM13.8304 5.12254C15.0295 7.55167 14.6181 10.5743 12.5962 12.5962L12.0659 13.1265L13.1265 14.1872L13.6569 13.6569C16.334 10.9797 16.7171 6.87715 14.8061 3.79209L13.8304 5.12254ZM8 9C8.55228 9 9 8.55228 9 8C9 7.44772 8.55228 7 8 7C7.44772 7 7 7.44772 7 8C7 8.55228 7.44772 9 8 9ZM8 10.5C9.38071 10.5 10.5 9.38071 10.5 8C10.5 7.42572 10.3064 6.89666 9.98082 6.47456L13.4475 2.14119C13.0815 1.80067 12.6834 1.49405 12.2585 1.22632L8.74837 5.61394C8.51209 5.53991 8.2607 5.5 8 5.5C6.61929 5.5 5.5 6.61929 5.5 8C5.5 9.38071 6.61929 10.5 8 10.5Z"
                    fill="currentColor"
                  ></path>
                </svg>
                <span className={styles.boxItemMainItemText}>
                  A well-executed deployment guarantees that your web
                  application remains stable and reliable.
                </span>
              </div>
            </div>
          </div>
          <div className={`${styles.blur} ${styles.blurPink}`}></div>
        </div>
        <div className={styles.boxDetail}>
          <DeployChart />
        </div>
        <div className={styles.boxDots}></div>
      </div>
    </Container>
  );
}

export default Deploy;
