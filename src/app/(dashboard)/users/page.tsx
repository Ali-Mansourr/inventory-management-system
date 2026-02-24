"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, Shield, Trash2, Users } from "lucide-react";
import { formatDate } from "@/lib/utils";
import toast from "react-hot-toast";

interface UserData {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  role: string;
  createdAt: string;
  _count: { items: number; activityLogs: number };
}

export default function UsersPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialog, setDeleteDialog] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/users");
      const data = await res.json();
      setUsers(data);
    } catch {
      toast.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId: string, role: string) => {
    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
      if (res.ok) {
        toast.success("Role updated");
        fetchUsers();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to update role");
      }
    } catch {
      toast.error("Failed to update role");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/users/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("User deleted");
        fetchUsers();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to delete user");
      }
    } catch {
      toast.error("Failed to delete user");
    }
    setDeleteDialog(null);
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "destructive" as const;
      case "MANAGER":
        return "warning" as const;
      default:
        return "secondary" as const;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">User Management</h1>
        <p className="text-gray-500 dark:text-gray-400">
          Manage user roles and permissions
        </p>
      </div>

      {users.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-20 text-gray-500">
            <Users className="h-12 w-12 mb-4 opacity-50" />
            <p className="text-lg font-medium">No users found</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900/50">
                    <th className="px-4 py-3 text-left font-medium">User</th>
                    <th className="px-4 py-3 text-left font-medium">Role</th>
                    <th className="px-4 py-3 text-left font-medium">Items Created</th>
                    <th className="px-4 py-3 text-left font-medium">Activities</th>
                    <th className="px-4 py-3 text-left font-medium">Joined</th>
                    <th className="px-4 py-3 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr
                      key={user.id}
                      className="border-b border-gray-100 dark:border-gray-800"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                            {user.image ? (
                              <img
                                src={user.image}
                                alt=""
                                className="h-9 w-9 rounded-full"
                              />
                            ) : (
                              <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                                {(user.name || user.email)[0].toUpperCase()}
                              </span>
                            )}
                          </div>
                          <div>
                            <p className="font-medium">
                              {user.name || "No name"}
                            </p>
                            <p className="text-xs text-gray-500">
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Select
                          value={user.role}
                          onValueChange={(v) => handleRoleChange(user.id, v)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue>
                              <Badge variant={getRoleBadgeVariant(user.role)}>
                                <Shield className="mr-1 h-3 w-3" />
                                {user.role}
                              </Badge>
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ADMIN">Admin</SelectItem>
                            <SelectItem value="MANAGER">Manager</SelectItem>
                            <SelectItem value="USER">User</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="px-4 py-3">{user._count.items}</td>
                      <td className="px-4 py-3">{user._count.activityLogs}</td>
                      <td className="px-4 py-3 text-xs text-gray-500">
                        {formatDate(user.createdAt)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-500 hover:text-red-700"
                          onClick={() => setDeleteDialog(user.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      <Dialog
        open={!!deleteDialog}
        onOpenChange={() => setDeleteDialog(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>
              This will permanently delete this user and all their data.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialog(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteDialog && handleDelete(deleteDialog)}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
