export type Article = {
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  date: string;
  dateLabel: string;
  note?: string[];
  body: string[];
};

export const articles: Article[] = [
  {
    slug: "beyond-the-machine",
    title: "Beyond the Machine",
    subtitle: "Creative agency in the AI landscape.",
    description:
      "On using generative AI as an instrument rather than an ideology, a tool, or a weapon — and what it means to honor decades of honed skills in an era of amorphous taste.",
    date: "2025-10-20",
    dateLabel: "October 20, 2025",
    note: [
      "This talk was given on October 14, 2025 at Kinference in Brooklyn, New York.",
      "Spoiler alert: the last part of the talk covers plot points of the movie Spirited Away. Another warning is included right before the spoilers with a jump forward link to the spoiler-free conclusion.",
    ],
    body: [
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
      "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. For more on this idea, see [Frank Chimero’s original talk](https://frankchimero.com/blog/2025/beyond-the-machine/). Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
      "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.",
      "Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem.",
      "Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur. Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur.",
      "At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident, similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga.",
      "Et harum quidem rerum facilis est et expedita distinctio. Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus id quod maxime placeat facere possimus, omnis voluptas assumenda est, omnis dolor repellendus.",
    ],
  },
  {
    slug: "the-quiet-craft",
    title: "The Quiet Craft",
    subtitle: "Notes on slow software.",
    description:
      "Why the most lasting tools are the ones that disappear into the work, and how restraint can become a design principle in its own right.",
    date: "2025-08-12",
    dateLabel: "August 12, 2025",
    body: [
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur fermentum, nulla in luctus consectetur, libero ipsum tempor lectus.",
      "Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Phasellus quis pulvinar tellus. Aenean condimentum risus a nisl tristique, ut feugiat ipsum porta.",
      "Praesent at consequat lectus. Suspendisse sit amet sodales massa, sit amet sollicitudin ligula. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
      "Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Nullam vitae sapien at sapien tincidunt sodales. Donec euismod nisl quis nibh tristique, vel rutrum lectus posuere.",
    ],
  },
  {
    slug: "no-shortcuts",
    title: "No Shortcuts",
    subtitle: "Building durable systems.",
    description:
      "A short essay on the seductions of expediency and what we lose when we automate too soon.",
    date: "2025-05-03",
    dateLabel: "May 3, 2025",
    body: [
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer eu lectus eu enim porta facilisis sit amet vitae justo.",
      "Mauris non ipsum non urna pellentesque cursus. Praesent volutpat felis nec arcu eleifend, sit amet pellentesque tortor euismod. Sed sed nibh sed magna fermentum dignissim.",
      "Cras laoreet, lacus a fringilla mattis, ipsum risus iaculis ipsum, in pulvinar tortor lectus eget metus. Quisque tincidunt risus a ipsum hendrerit, sed luctus dui blandit.",
    ],
  },
  {
    slug: "small-tools-small-teams",
    title: "Small Tools, Small Teams",
    subtitle: "Returning to the workshop.",
    description:
      "How keeping the tooling small keeps the team small, and how a small team writes the kind of software you'd want to live in.",
    date: "2025-02-18",
    dateLabel: "February 18, 2025",
    body: [
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec auctor, lectus eu rutrum tristique, sapien nibh suscipit ipsum, vitae fermentum ipsum quam at risus.",
      "Phasellus quis pulvinar tellus. Aenean condimentum risus a nisl tristique, ut feugiat ipsum porta. Praesent at consequat lectus.",
      "Suspendisse sit amet sodales massa, sit amet sollicitudin ligula. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
    ],
  },
  {
    slug: "on-attention",
    title: "On Attention",
    subtitle: "What we trade and what we keep.",
    description:
      "A meditation on attention as the only nonrenewable resource a working life is made of, and the small disciplines that protect it.",
    date: "2024-11-29",
    dateLabel: "November 29, 2024",
    body: [
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed pretium, sapien sit amet faucibus mattis, sapien sapien sagittis augue, ut posuere lectus arcu eu mi.",
      "Curabitur fermentum, nulla in luctus consectetur, libero ipsum tempor lectus, sed dapibus erat erat sit amet erat. Praesent volutpat felis nec arcu eleifend.",
      "Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae. Donec euismod nisl quis nibh tristique, vel rutrum lectus posuere.",
    ],
  },
];

export function getArticle(slug: string): Article | undefined {
  return articles.find((a) => a.slug === slug);
}
