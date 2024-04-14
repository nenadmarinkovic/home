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
      name: 'Tab Directory',
      tags: [
        'Task management',
        'File management',
        'Event organizer',
        'SaaS',
      ],
      link: 'https://tab.directory',
      description:
        'Dash Directory is a platform for task and event management, as well as bookmark organization. With its intuitive UI, it simplifies self-management and enhances productivity. Dash Directory empowers users to stay organized and focused on their goals. In development mode.',
    },
    {
      name: 'Snippetbase',
      tags: ['Code snippet', "Developer's tool", 'Codebase'],
      link: 'https://snippetbase.net',
      description:
        'Snippetbase is a platform for code snippets. Discover, share, and leverage ready-to-use code across multiple programming languages and frameworks. Boost your productivity with centralized repository of efficient solutions.',
    },
    {
      name: 'Reactify',
      tags: ['React ecosystem', 'Resources'],
      link: 'https://reactify.org',
      description:
        'Reactify is the ultimate destination for React developers and designers, providing a comprehensive suite of services. Access a wide range of design resources, leverage the power of tested headless CMSs, and foster seamless collaboration through efficient APIs.',
    },
    {
      name: 'Verein Pro',

      tags: ['Organization management', 'People management', 'SaaS'],
      link: 'https://verein.pro',
      description:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
    },
    {
      name: 'Sprachenwald',
      tags: [
        'Language learning',
        'German language',
        'Educational platform',
        'SaaS',
      ],
      link: 'https://sprachenwald.com',

      description:
        'Reactify is the ultimate destination for React developers and designers, providing a comprehensive suite of services. Access a wide range of design resources, leverage the power of tested headless CMSs, and foster seamless collaboration through efficient APIs.',
    },
  ];
  return (
    <div className={styles.projectContainer}>
      <Container>
        <SectionHeader
          header="Projects"
          title="Personal web projects including technical details"
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
