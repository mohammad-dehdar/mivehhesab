import {
  BookUserIcon,
  CalendarPlusIcon,
  ChartColumnIcon,
  HistoryIcon,
  HouseIcon,
  type LucideIcon,
  SettingsIcon,
} from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Shown directly in the phone bottom bar (others go under "بیشتر"). */
  mobile?: boolean;
};

export type NavSection = { title?: string; items: NavItem[] };

/** Single source of truth for the sidebar and the phone bottom bar. */
export const navigation: NavSection[] = [
  {
    items: [
      { href: "/", label: "داشبورد", icon: HouseIcon, mobile: true },
      { href: "/day/", label: "ثبت روز", icon: CalendarPlusIcon, mobile: true },
      { href: "/days/", label: "روزها", icon: HistoryIcon, mobile: true },
      { href: "/accounts/", label: "دفتر حساب‌ها", icon: BookUserIcon, mobile: true },
      { href: "/reports/", label: "گزارش‌ها", icon: ChartColumnIcon },
    ],
  },
  {
    items: [{ href: "/settings/", label: "تنظیمات و پشتیبان", icon: SettingsIcon }],
  },
];

export const allNavItems = navigation.flatMap((section) => section.items);

const trim = (path: string) => (path.length > 1 ? path.replace(/\/+$/, "") : path);

/** Compares paths ignoring the trailing slash the static export adds. */
const matches = (pathname: string, href: string) => {
  const [p, h] = [trim(pathname), trim(href)];
  return h === "/" ? p === "/" : p === h || p.startsWith(`${h}/`);
};

/** Longest matching href wins, so /accounts/person/ lights up only "دفتر حساب‌ها". */
export function activeHref(pathname: string): string | undefined {
  return allNavItems
    .map((item) => item.href)
    .filter((href) => matches(pathname, href))
    .sort((a, b) => b.length - a.length)[0];
}
