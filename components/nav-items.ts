export type NavItem = {
  href: string;
  label: string;
};

export const baseNavItems: NavItem[] = [
  { href: "/writing", label: "Writing" },
  { href: "/projects", label: "Projects" },
  { href: "/tools", label: "Tools" },
  { href: "/infrastructure", label: "Infrastructure" },
];

export function getAuthNavItem(authed: boolean): NavItem | null {
  return authed ? { href: "/admin", label: "Admin" } : null;
}

export function isNavActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}
