"use client";

import React, { useState } from "react";
import SectionHeader from "./Section";
import Container from "@/containers/Container";

import styles from "../styles/components/Projects.module.css";

function Projects() {
  const [selectedProject, setSelectedProject] = useState(0);
  const [key, setKey] = useState(0);

  function handleClick() {
    setKey((prevKey) => prevKey + 1);
  }

  const projects = [
    {
      name: "Studio Minsky",
      tags: ["Web agency", "Development", "AI"],
      link: "https://studiominsky.com",
      description:
        "Studio Minsky is a digital studio focused on building web applications, AI solutions, and data visualizations. The website is built with Next.js and TypeScript, and it showcases the studio's portfolio and services. It features a blog powered by Notion, a contact form using Resend, and an AI chatbot for user interaction. The site also supports multiple languages.",
    },
    {
      name: "Panellio",
      tags: ["Management", "SaaS", "AI"],
      link: "https://panellio.com",
      description:
        "Panellio is a personal management tool designed to help organize your online life, reduce distractions, and boost productivity. It allows users to create directories, add assets and features like notes, tasks, and habits. Panellio also includes an AI assistant to monitor and analyze data and track stats. It offers both free and paid versions.",
    },
    {
      name: "Fine Interface",
      tags: ["Design curation", "Inspiration", "UI"],
      link: "https://fineinterface.com",
      description:
        "Fine Interface is a curated collection of beautiful website designs for inspiration. Users can create an account, submit websites, and create folders of their favorite designs. The platform is built with Next.js, TypeScript, and Firebase for authentication and database. It features a clean, modern interface with light and dark modes.",
    },
  ];
  return (
    <div className={styles.projectContainer}>
      <Container>
        <SectionHeader
          header="Projects"
          title="Personal projects with technical details"
          text="Alongside my professional work, I like building and maintaining a variety of personal projects. Here are a few I'm currently working on. All are open-source and available on GitHub."
        />
        <div className={styles.flexItems}>
          <div className={styles.buttons}>
            {projects.map((project, index) => (
              <button
                className={`${styles.button} ${
                  selectedProject === index ? styles.selected : ""
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
              Visit the page{" "}
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
