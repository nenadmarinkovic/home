export const site = {
  name: "Nenad Marinković",
  title: "Nenad Marinković",
  description:
    "Software developer based in Vienna. I mostly build for the web.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://nenadmarinkovic.com",
  author: {
    name: "Nenad Marinković",
    email: "nenadmarinkovic@protonmail.com",
  },
} as const;
