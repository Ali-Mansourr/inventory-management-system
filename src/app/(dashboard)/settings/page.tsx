"use client";

import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Shield, User, Mail, Calendar } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function SettingsPage() {
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
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-gray-500 dark:text-gray-400">
          Manage your account and preferences
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Your account information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
              {session?.user?.image ? (
                <img
                  src={session.user.image}
                  alt=""
                  className="h-16 w-16 rounded-full"
                />
              ) : (
                <User className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              )}
            </div>
            <div>
              <p className="text-lg font-medium">
                {session?.user?.name || "No name set"}
              </p>
              <div className="flex items-center gap-1 text-sm text-gray-500">
                <Mail className="h-3 w-3" />
                {session?.user?.email}
              </div>
            </div>
          </div>

          <div className="grid gap-4 rounded-lg border border-gray-200 p-4 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium">Role</span>
              </div>
              {session?.user?.role && getRoleBadge(session.user.role)}
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium">Member since</span>
              </div>
              <span className="text-sm text-gray-500">
                {session?.user ? formatDate(new Date().toISOString()) : "—"}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>Customize the look and feel</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">Theme</p>
              <p className="text-xs text-gray-500">
                Switch between light and dark mode
              </p>
            </div>
            <ThemeToggle />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>About</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-gray-500">
            <p>
              <span className="font-medium text-gray-900 dark:text-gray-100">
                InvenAI
              </span>{" "}
              — Smart Inventory Management System
            </p>
            <p>
              Built with Next.js, Prisma, NextAuth, and Groq AI. Powered by
              Llama 3.3 70B for intelligent inventory insights.
            </p>
            <p>Version 1.0.0</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
