"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus, Edit, Trash2, Loader2, Tags } from "lucide-react";
import toast from "react-hot-toast";

interface Category {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  _count: { items: number };
}

export default function CategoriesPage() {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "ADMIN";
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialog, setDialog] = useState<"create" | "edit" | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/categories");
      const data = await res.json();
      setCategories(data);
    } catch {
      toast.error("Failed to fetch categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCreate = async () => {
    if (!name.trim()) {
      toast.error("Name is required");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), description: description.trim() || null }),
      });
      if (res.ok) {
        toast.success("Category created");
        setDialog(null);
        setName("");
        setDescription("");
        fetchCategories();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to create");
      }
    } catch {
      toast.error("Failed to create category");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = async () => {
    if (!editId || !name.trim()) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/categories/${editId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), description: description.trim() || null }),
      });
      if (res.ok) {
        toast.success("Category updated");
        setDialog(null);
        setEditId(null);
        setName("");
        setDescription("");
        fetchCategories();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to update");
      }
    } catch {
      toast.error("Failed to update category");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/categories/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Category deleted");
        fetchCategories();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to delete");
      }
    } catch {
      toast.error("Failed to delete category");
    }
    setDeleteDialog(null);
  };

  const openEdit = (cat: Category) => {
    setEditId(cat.id);
    setName(cat.name);
    setDescription(cat.description || "");
    setDialog("edit");
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Categories</h1>
          <p className="text-gray-500 dark:text-gray-400">
            Manage inventory categories
          </p>
        </div>
        {isAdmin && (
          <Button
            onClick={() => {
              setName("");
              setDescription("");
              setDialog("create");
            }}
          >
            <Plus className="h-4 w-4" />
            Add Category
          </Button>
        )}
      </div>

      {categories.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-20 text-gray-500">
            <Tags className="h-12 w-12 mb-4 opacity-50" />
            <p className="text-lg font-medium">No categories yet</p>
            <p className="text-sm">Create your first category to get started</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {categories.map((cat) => (
            <Card key={cat.id}>
              <CardHeader className="flex flex-row items-start justify-between pb-2">
                <div>
                  <CardTitle className="text-base">{cat.name}</CardTitle>
                  {cat.description && (
                    <p className="mt-1 text-sm text-gray-500">
                      {cat.description}
                    </p>
                  )}
                </div>
                <Badge variant="secondary">{cat._count.items} items</Badge>
              </CardHeader>
              {isAdmin && (
                <CardContent className="flex gap-2 pt-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openEdit(cat)}
                  >
                    <Edit className="h-4 w-4" />
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-500 hover:text-red-700"
                    onClick={() => setDeleteDialog(cat.id)}
                    disabled={cat._count.items > 0}
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </Button>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog
        open={dialog !== null}
        onOpenChange={() => {
          setDialog(null);
          setEditId(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {dialog === "create" ? "Create Category" : "Edit Category"}
            </DialogTitle>
            <DialogDescription>
              {dialog === "create"
                ? "Add a new inventory category"
                : "Update category details"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cat-name">Name</Label>
              <Input
                id="cat-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Category name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cat-desc">Description</Label>
              <Textarea
                id="cat-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optional description"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialog(null)}>
              Cancel
            </Button>
            <Button
              onClick={dialog === "create" ? handleCreate : handleEdit}
              disabled={saving}
            >
              {saving && <Loader2 className="animate-spin" />}
              {dialog === "create" ? "Create" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog
        open={!!deleteDialog}
        onOpenChange={() => setDeleteDialog(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Category</DialogTitle>
            <DialogDescription>
              Are you sure? This cannot be undone.
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
