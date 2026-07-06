"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Briefcase,
  Users,
  UserRoundCog,
} from "lucide-react";

const links = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    href: "/servicos",
    label: "Serviços",
    icon: Briefcase,
  },
  {
    href: "/barbeiros",
    label: "Barbeiros",
    icon: Users,
  },
  {
    href: "/convites",
    label: "Convites",
    icon: UserRoundCog,
  },
];

export default function AdminNavigation() {
  const pathname = usePathname();

  return (
    <nav className="mb-8 flex flex-wrap gap-3">
      {links.map((link) => {
        const Icon = link.icon;

        return (
          <Link
            key={link.href}
            href={link.href}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 font-medium transition ${
              pathname === link.href
                ? "bg-lime-500 text-black"
                : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            <Icon size={18} />
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}