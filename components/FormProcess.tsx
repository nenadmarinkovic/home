import React from "react";

import styles from "../styles/components/FormProcess.module.css";

type ProcessStep = {
  number: number;
  title: string;
  text: string;
};

type ProcessProps = {
  steps: ProcessStep[];
};

function FormProcess({ steps }: ProcessProps) {
  return (
    <div>
      <ul className={styles.formProcess}>
        {steps.map((step, index) => (
          <li key={index}>
            <span className={styles.number}>{step.number}</span>
            <span className={styles.textContainer}>
              <span className={styles.title}>{step.title}</span>
              <span className={styles.text}>{step.text}</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default FormProcess;
