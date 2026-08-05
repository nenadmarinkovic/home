export const site = {
  name: "Nenad Marinković",
  title: "Nenad Marinković",
  description:
    "Hi. I'm software developer and I enjoy building stuff on the web.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://nenadmarinkovic.com",
  author: {
    name: "Nenad Marinković",
    email: "nenadmarinkovic@protonmail.com",
  },
} as const;
