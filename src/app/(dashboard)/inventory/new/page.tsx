"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";

interface Category {
  id: string;
  name: string;
}

export default function NewItemPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);

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
  });

  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then(setCategories)
      .catch(() => toast.error("Failed to load categories"));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name || !form.categoryId) {
      toast.error("Name and category are required");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        toast.success("Item created successfully");
        router.push("/inventory");
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to create item");
      }
    } catch {
      toast.error("Failed to create item");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/inventory">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Add New Item</h1>
          <p className="text-gray-500 dark:text-gray-400">
            Add a new item to your inventory
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Item Details</CardTitle>
            <CardDescription>Fill in the item information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) =>
                    setForm({ ...form, name: e.target.value })
                  }
                  placeholder="Item name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={form.categoryId}
                  onValueChange={(v) =>
                    setForm({ ...form, categoryId: v })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
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
                placeholder="Item description"
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
                    setForm({ ...form, quantity: parseInt(e.target.value) || 0 })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="minStock">Min Stock Threshold</Label>
                <Input
                  id="minStock"
                  type="number"
                  min="0"
                  value={form.minStock}
                  onChange={(e) =>
                    setForm({ ...form, minStock: parseInt(e.target.value) || 0 })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={form.status}
                  onValueChange={(v) =>
                    setForm({ ...form, status: v })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Auto-detect" />
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
                  placeholder="Supplier name"
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
                  placeholder="Warehouse / Shelf"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 flex justify-end gap-3">
          <Link href="/inventory">
            <Button variant="outline" type="button">
              Cancel
            </Button>
          </Link>
          <Button type="submit" disabled={loading}>
            {loading ? (
              <Loader2 className="animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Create Item
          </Button>
        </div>
      </form>
    </div>
  );
}
