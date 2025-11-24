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
      tags: [
        "Agency",
        "Development",
        "AI",
        "TypeScript",
        "Next.js",
        "Firebase",
      ],
      link: "https://studiominsky.com",
      description:
        "I built Studio Minsky as a playground for designing and developing modern web experiences with AI at the core. For clients, this means I can deliver tested, cutting-edge solutions that blend creativity with the latest tech. The website is built with Next.js and TypeScript, and it showcases the studio's portfolio and services. It features a blog powered by Notion, a contact form using Resend, and an AI chatbot for user interaction. The site also supports multiple languages.",
    },
    {
      name: "Panellio",
      tags: ["Management", "SaaS", "AI", "TypeScript", "Next.js", "Firebase"],
      link: "https://panellio.com",
      description:
        "Panellio started from my desire to have an application to organize every aspect of my life in directories. In every directory, users can add lists, tasks, and features like a habit tracker, maps with favorite places, or simple sticky notes, and rearrange them however they want. It's perfect for anyone who wants to reclaim their attention and manage their digital life without the noise. Built with Next.js, Firebase, and serverless AI workflows.",
    },
    {
      name: "Fine Interface",
      tags: [
        "Design curation",
        "Inspiration",
        "TypeScript",
        "Next.js",
        "Firebase",
      ],
      link: "https://fineinterface.com",
      description:
        "I created Fine Interface because I needed a clean way to save and revisit beautifully designed websites. It helps designers and developers stay inspired and curate their own collections. Use it to build your own interface collections or simply discover the latest trends in web design. Powered by Next.js, TypeScript, Firebase, and a lightweight submission system.",
    },
    {
      name: "Word Inventory",
      tags: ["Language learning", "AI", "TypeScript", "Next.js", "Supabase"],
      link: "https://wordinventory.com",
      description:
        "Word Inventory grew out of my experience learning German and wanting a tool that makes makign inventory with german words easy and fun. Whenever I hear a new German word, I add it and the AI does the rest like adding grammar explanation, examples, and so on. It transforms language learning from rote memorization into an engaging, visual exploration of how words connect. Built with Next.js 15, Supabase, and the Vercel AI SDK.",
    },
  ];
  return (
    <div id="projects" className={styles.projectContainer}>
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
