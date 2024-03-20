'use client';

import React, { useEffect, useState } from 'react';
import styles from '../styles/components/Deploy.module.css';
import Image from 'next/image';

function DeployChart() {
  // const [currentItem, setCurrentItem] = useState(0);

  // useEffect(() => {
  //   const timer = setInterval(() => {
  //     setCurrentItem((prevItem) => (prevItem + 1) % 2); // Cycle between 0 and 1
  //   }, 4000); // Change item every 4 seconds

  //   return () => {
  //     clearInterval(timer);
  //   };
  // }, []);
  return (
    <div className={styles.deploy_container}>
      <div className={styles.deploy_chart}>
        <div className={styles.deploy_chart_item_border}></div>
        <div className={styles.deploy_chart_item}>
          <div className={styles.deploy_chart_item_icon}>
            <Image
              className={styles.deploy_chart_item_icon_spinner}
              src="/icons/loading.svg"
              alt="Loading"
              width={30}
              height={30}
            />
            <Image
              className={styles.deploy_chart_item_icon_check}
              src="/icons/check.svg"
              alt="Loading"
              width={30}
              height={30}
            />
          </div>
          <p className={styles.deploy_chart_item_text}>
            1. Deploy your application to the cloud. Lorem ipsum dolor
            sit amet.
          </p>
        </div>
        <div className={styles.deploy_chart_item}>
          <div className={styles.deploy_chart_item_icon}>
            <Image
              className={styles.deploy_chart_item_icon_spinner}
              src="/icons/loading.svg"
              alt="Loading"
              width={30}
              height={30}
            />
            <Image
              className={styles.deploy_chart_item_icon_check}
              src="/icons/check.svg"
              alt="Loading"
              width={30}
              height={30}
            />
          </div>
          <p className={styles.deploy_chart_item_text}>
            2. Deploy your application to the cloud. Lorem ipsum dolor
            sit amet.
          </p>
        </div>
        <div className={styles.deploy_chart_item}>
          <div className={styles.deploy_chart_item_icon}>
            <Image
              className={styles.deploy_chart_item_icon_spinner}
              src="/icons/loading.svg"
              alt="Loading"
              width={30}
              height={30}
            />
            <Image
              className={styles.deploy_chart_item_icon_check}
              src="/icons/check.svg"
              alt="Loading"
              width={30}
              height={30}
            />
          </div>
          <p className={styles.deploy_chart_item_text}>
            3. Deploy your application to the cloud. Lorem ipsum dolor
            sit amet.
          </p>
        </div>
        <div className={styles.deploy_chart_item}>
          <div className={styles.deploy_chart_item_icon}>
            <Image
              className={styles.deploy_chart_item_icon_spinner}
              src="/icons/loading.svg"
              alt="Loading"
              width={30}
              height={30}
            />
            <Image
              className={styles.deploy_chart_item_icon_check}
              src="/icons/check.svg"
              alt="Loading"
              width={30}
              height={30}
            />
          </div>
          <p className={styles.deploy_chart_item_text}>
            4. Deploy your application to the cloud. Lorem ipsum dolor
            sit amet.
          </p>
        </div>
      </div>
    </div>
  );
}

export default DeployChart;
