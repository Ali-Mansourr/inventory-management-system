"use client";

import { signOut, useSession } from "next-auth/react";
import { ThemeToggle } from "./theme-toggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, User, Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function Header() {
  const { data: session } = useSession();

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "ADMIN":
        return <Badge variant="destructive">Admin</Badge>;
      case "MANAGER":
        return <Badge variant="warning">Manager</Badge>;
      default:
        return <Badge variant="secondary">User</Badge>;
    }
  };

  return (
    <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6 dark:border-gray-800 dark:bg-gray-950">
      <div />
      <div className="flex items-center gap-3">
        <ThemeToggle />
        {session?.user && (
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-2 rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-800">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                {session.user.image ? (
                  <img
                    src={session.user.image}
                    alt=""
                    className="h-8 w-8 rounded-full"
                  />
                ) : (
                  <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                )}
              </div>
              <span className="hidden text-sm font-medium md:block">
                {session.user.name || session.user.email}
              </span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col gap-1">
                  <span>{session.user.name}</span>
                  <span className="text-xs font-normal text-gray-500">
                    {session.user.email}
                  </span>
                  <div className="flex items-center gap-1 mt-1">
                    <Shield className="h-3 w-3" />
                    {getRoleBadge(session.user.role)}
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => signOut({ callbackUrl: "/auth/signin" })}
                className="text-red-600 dark:text-red-400 cursor-pointer"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  );
}
