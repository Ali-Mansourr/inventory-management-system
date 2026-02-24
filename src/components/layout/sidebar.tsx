"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Tags,
  Users,
  Activity,
  Bot,
  Settings,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Inventory", href: "/inventory", icon: Package },
  { name: "Categories", href: "/categories", icon: Tags },
  { name: "Users", href: "/users", icon: Users, adminOnly: true },
  { name: "Activity Log", href: "/activity", icon: Activity },
  { name: "AI Assistant", href: "/ai", icon: Bot },
  { name: "Settings", href: "/settings", icon: Settings },
];

interface SidebarProps {
  userRole?: string;
}

export function Sidebar({ userRole }: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const filteredNav = navigation.filter(
    (item) => !item.adminOnly || userRole === "ADMIN"
  );

  return (
    <aside
      className={cn(
        "flex flex-col border-r border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950 transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex h-16 items-center justify-between border-b border-gray-200 px-4 dark:border-gray-800">
        {!collapsed && (
          <Link href="/" className="flex items-center gap-2">
            <Package className="h-6 w-6 text-blue-600" />
            <span className="font-bold text-lg">InvenAI</span>
          </Link>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="rounded-lg p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>
      </div>
      <nav className="flex-1 space-y-1 p-2">
        {filteredNav.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200"
              )}
              title={collapsed ? item.name : undefined}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {!collapsed && <span>{item.name}</span>}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
