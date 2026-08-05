export const site = {
  name: "Nenad Marinković",
  title: "Nenad Marinković",
  description:
    "Software developer building thoughtful tools and writing about the craft.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://nenadmarinkovic.com",
  author: {
    name: "Nenad Marinković",
    email: "nenadmarinkovic@protonmail.com",
  },
} as const;
