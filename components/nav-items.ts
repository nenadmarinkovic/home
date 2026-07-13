export type NavItem = {
  href: string;
  label: string;
};

export const baseNavItems: NavItem[] = [
  { href: "/writing", label: "Writing" },
  { href: "/links", label: "Links" },
  { href: "/contact", label: "Contact" },
];

export function getAuthNavItem(authed: boolean): NavItem | null {
  return authed ? { href: "/admin", label: "Admin" } : null;
}

export function isNavActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}
