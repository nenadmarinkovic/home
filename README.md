# Nenad Marinkovic - Personal Portfolio

This is the source code for my personal portfolio website, where I showcase my projects, services, and blog. It also includes some fun integrations with Spotify, Notion, and Resend.

## Features

- **Spotify Integration:** Displays my currently playing music from Spotify.
- **Notion-Powered Blog:** The blog content is fetched from a Notion database, allowing for easy content management.
- **Contact Form:** A functional contact form that sends emails using the Resend API.
- **Project Showcase:** A dedicated section to display personal projects.
- **GitHub Integration:** Fetches and displays data from GitHub.

## Tech Stack

- **Framework:** [Next.js](https://nextjs.org/)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [CSS Modules](https://github.com/css-modules/css-modules)
- **Content Management:** [Notion API](https://developers.notion.com/)
- **Email:** [Resend](https://resend.com/)
- **Music:** [Spotify API](https://developer.spotify.com/)

## Getting Started

To get a local copy up and running, follow these steps.

### Prerequisites

You need to have [Node.js](https://nodejs.org/) (version 18.17 or later) and npm installed on your machine.

### Installation

1.  **Clone the repository**
    ```bash
    git clone [https://github.com/nenadmarinkovic/home.git](https://github.com/nenadmarinkovic/home.git)
    ```
2.  **Navigate to the project directory**
    ```bash
    cd home
    ```
3.  **Install NPM packages**
    ```bash
    npm install
    ```
4.  **Set up environment variables**
    Create a `.env.local` file in the root of the project and add the following keys. You will need to get your own API keys from the respective services.

5.  **Run the development server**
    ```bash
    npm run dev
    ```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the result.
