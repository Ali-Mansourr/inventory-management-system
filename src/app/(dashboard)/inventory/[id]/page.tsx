"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft, Loader2, Save, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatDate, getStatusColor, getStatusLabel } from "@/lib/utils";
import toast from "react-hot-toast";
import Link from "next/link";

interface Category {
  id: string;
  name: string;
}

export default function EditItemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: session } = useSession();
  const router = useRouter();
  const canEdit = session?.user?.role !== "USER";
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);

  const [form, setForm] = useState({
    name: "",
    description: "",
    quantity: 0,
    minStock: 10,
    costPrice: 0,
    sellingPrice: 0,
    supplier: "",
    location: "",
    status: "",
    categoryId: "",
    sku: "",
    createdAt: "",
    createdBy: { name: "", email: "" },
  });

  useEffect(() => {
    Promise.all([
      fetch(`/api/inventory/${id}`).then((r) => r.json()),
      fetch("/api/categories").then((r) => r.json()),
    ])
      .then(([item, cats]) => {
        setForm({
          name: item.name,
          description: item.description || "",
          quantity: item.quantity,
          minStock: item.minStock,
          costPrice: item.costPrice,
          sellingPrice: item.sellingPrice,
          supplier: item.supplier || "",
          location: item.location || "",
          status: item.status,
          categoryId: item.categoryId,
          sku: item.sku,
          createdAt: item.createdAt,
          createdBy: item.createdBy,
        });
        setCategories(cats);
      })
      .catch(() => toast.error("Failed to load item"))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEdit) return;

    setSaving(true);
    try {
      const res = await fetch(`/api/inventory/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          description: form.description,
          quantity: form.quantity,
          minStock: form.minStock,
          costPrice: form.costPrice,
          sellingPrice: form.sellingPrice,
          supplier: form.supplier,
          location: form.location,
          status: form.status,
          categoryId: form.categoryId,
        }),
      });

      if (res.ok) {
        toast.success("Item updated");
        router.push("/inventory");
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to update");
      }
    } catch {
      toast.error("Failed to update item");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      const res = await fetch(`/api/inventory/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Item deleted");
        router.push("/inventory");
      } else {
        toast.error("Failed to delete item");
      }
    } catch {
      toast.error("Failed to delete item");
    }
    setDeleteDialog(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/inventory">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">
              {canEdit ? "Edit Item" : "View Item"}
            </h1>
            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
              <span className="font-mono text-sm">{form.sku}</span>
              <Badge className={getStatusColor(form.status)}>
                {getStatusLabel(form.status)}
              </Badge>
            </div>
          </div>
        </div>
        {canEdit && (
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setDeleteDialog(true)}
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
        )}
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Item Details</CardTitle>
            <CardDescription>
              Created {formatDate(form.createdAt)} by{" "}
              {form.createdBy.name || form.createdBy.email}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) =>
                    setForm({ ...form, name: e.target.value })
                  }
                  disabled={!canEdit}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={form.categoryId}
                  onValueChange={(v) =>
                    setForm({ ...form, categoryId: v })
                  }
                  disabled={!canEdit}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                disabled={!canEdit}
                rows={3}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="0"
                  value={form.quantity}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      quantity: parseInt(e.target.value) || 0,
                    })
                  }
                  disabled={!canEdit}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="minStock">Min Stock</Label>
                <Input
                  id="minStock"
                  type="number"
                  min="0"
                  value={form.minStock}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      minStock: parseInt(e.target.value) || 0,
                    })
                  }
                  disabled={!canEdit}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={form.status}
                  onValueChange={(v) => setForm({ ...form, status: v })}
                  disabled={!canEdit}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="IN_STOCK">In Stock</SelectItem>
                    <SelectItem value="LOW_STOCK">Low Stock</SelectItem>
                    <SelectItem value="ORDERED">Ordered</SelectItem>
                    <SelectItem value="DISCONTINUED">Discontinued</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="costPrice">Cost Price ($)</Label>
                <Input
                  id="costPrice"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.costPrice}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      costPrice: parseFloat(e.target.value) || 0,
                    })
                  }
                  disabled={!canEdit}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sellingPrice">Selling Price ($)</Label>
                <Input
                  id="sellingPrice"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.sellingPrice}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      sellingPrice: parseFloat(e.target.value) || 0,
                    })
                  }
                  disabled={!canEdit}
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="supplier">Supplier</Label>
                <Input
                  id="supplier"
                  value={form.supplier}
                  onChange={(e) =>
                    setForm({ ...form, supplier: e.target.value })
                  }
                  disabled={!canEdit}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={form.location}
                  onChange={(e) =>
                    setForm({ ...form, location: e.target.value })
                  }
                  disabled={!canEdit}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {canEdit && (
          <div className="mt-6 flex justify-end gap-3">
            <Link href="/inventory">
              <Button variant="outline" type="button">
                Cancel
              </Button>
            </Link>
            <Button type="submit" disabled={saving}>
              {saving ? (
                <Loader2 className="animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Save Changes
            </Button>
          </div>
        )}
      </form>

      <Dialog open={deleteDialog} onOpenChange={setDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Item</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{form.name}&quot;? This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
