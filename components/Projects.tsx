'use client';

import React, { useState } from 'react';
import SectionHeader from './Section';

import styles from '../styles/components/Projects.module.css';
import Container from '@/containers/Container';

function Projects() {
  const [selectedProject, setSelectedProject] = useState(0);

  const projects = [
    {
      name: 'Project 1',
      description: 'This is a description of Project 1.',
    },
    {
      name: 'Project 2',
      description: 'This is a description of Project 2.',
    },
    {
      name: 'Project 3',
      description: 'This is a description of Project 3.',
    },
  ];
  return (
    <>
      <div className={styles.projectContainer}>
        <Container>
          <SectionHeader
            header="Projects"
            title="Personal web projects including technical details"
            text="I have worked on a variety of projects, ranging from personal websites to full-stack applications. Here are some of the projects I have worked on."
          />
          <div>
            {projects.map((project, index) => (
              <button
                key={index}
                onClick={() => setSelectedProject(index)}
              >
                {project.name}
              </button>
            ))}
          </div>
          <div className={styles.projectDescription}>
            <p>{projects[selectedProject].description}</p>
          </div>
        </Container>
      </div>
    </>
  );
}

export default Projects;
