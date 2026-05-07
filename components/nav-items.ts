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

export function getAuthNavItem(authed: boolean): NavItem {
  return authed
    ? { href: "/admin", label: "Admin" }
    : { href: "/login", label: "Login" };
}

export function getNavItems(authed: boolean): NavItem[] {
  return [...baseNavItems, getAuthNavItem(authed)];
}

export function isNavActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}
