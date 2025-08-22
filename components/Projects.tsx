'use client';

import React, { useState } from 'react';
import SectionHeader from './Section';
import Container from '@/containers/Container';

import styles from '../styles/components/Projects.module.css';

function Projects() {
  const [selectedProject, setSelectedProject] = useState(0);
  const [key, setKey] = useState(0);

  function handleClick() {
    setKey((prevKey) => prevKey + 1);
  }

  const projects = [
    {
      name: 'Studio Minsky',
      tags: ['Web agency', 'Development', 'Design'],
      link: 'https://studiominsky.com',
      description:
        'Studio Minsky is the web-development agency I’m building from the ground up, specialising in fast, accessible interfaces and conversational chat-bots. Under the hood it runs on a modern Next.js + TypeScript stack with a reusable component library that powers client projects.',
    },
    {
      name: 'Panellio',
      tags: ['Management', 'SaaS'],
      link: 'https://panellio.com',
      description:
        'Panellio is a minimal edge-deployed redirector that lets teams create branded short links and track real-time click analytics. It’s engineered as a lean SaaS with a Rust edge worker and serverless Postgres, keeping global latency below 50 ms.',
    },
    {
      name: 'Fine Interface',
      tags: ['Design curation', 'Inspiration'],
      link: 'https://fineinterface.com',
      description:
        'Fine Interface is a curated gallery of beautifully crafted user interfaces where the community can submit and save new finds. The site doubles as a design-system testbed, using Radix UI primitives and Next.js server actions to handle votes without page reloads.',
    },
    {
      name: 'Word Inventory',
      tags: ['Language', 'AI', 'Learning'],
      link: 'https://wordinventory.com',
      description:
        'Word Inventory is a web application for storing words in any language and AI...',
    },
  ];
  return (
    <div className={styles.projectContainer}>
      <Container>
        <SectionHeader
          header="Projects"
          title="Personal projects with technical details"
          text="I have worked on a variety of projects, ranging from personal websites to full-stack applications. Here are some of the projects I have worked on."
        />
        <div className={styles.flexItems}>
          <div className={styles.buttons}>
            {projects.map((project, index) => (
              <button
                className={`${styles.button} ${
                  selectedProject === index ? styles.selected : ''
                }`}
                key={index}
                onClick={() => {
                  setSelectedProject(index);
                  handleClick();
                }}
              >
                {project.name}
              </button>
            ))}
          </div>
          <div
            className={`${styles.projectDescription} ${styles.textPopup}`}
            key={key}
          >
            <div>
              <p>{projects[selectedProject].description}</p>
              <div className={styles.tags}>
                {projects[selectedProject].tags.map((tag, index) => (
                  <span className={styles.tag} key={index}>
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            <a
              className={styles.link}
              target="_blank"
              href={projects[selectedProject].link}
            >
              Visit the page{' '}
              <svg
                className={styles.pageIcon}
                height="16"
                strokeLinejoin="round"
                viewBox="0 0 16 16"
                width="16"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M5.75001 2H5.00001V3.5H5.75001H11.4393L2.21968 12.7197L1.68935 13.25L2.75001 14.3107L3.28034 13.7803L12.4988 4.56182V10.25V11H13.9988V10.25V3C13.9988 2.44772 13.5511 2 12.9988 2H5.75001Z"
                  fill="currentColor"
                ></path>
              </svg>
            </a>
          </div>
        </div>
      </Container>
    </div>
  );
}

export default Projects;
