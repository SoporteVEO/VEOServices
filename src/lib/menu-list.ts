import { Users, LayoutGrid, LucideIcon, Bell } from "lucide-react";

type Submenu = {
  href: string;
  label: string;
  active?: boolean;
};

type Menu = {
  href: string;
  label: string;
  active?: boolean;
  icon: LucideIcon;
  submenus?: Submenu[];
};

type Group = {
  groupLabel: string;
  menus: Menu[];
};

export function getMenuList(pathname: string): Group[] {
  return [
    {
      groupLabel: "",
      menus: [
        {
          href: "/dashboard",
          label: "Dashboard",
          icon: LayoutGrid,
          submenus: [],
        },
      ],
    },
    {
      groupLabel: "Módulos",
      menus: [
        {
          href: "/notifications",
          label: "Notificaciones",
          icon: Bell,
          submenus: [],
        },
      ],
    },
    {
      groupLabel: "Sistema",
      menus: [
        {
          href: "/users",
          label: "Users",
          icon: Users,
        },
      ],
    },
  ];
}
