"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import {
  Plus,
  Search,
  Download,
  Trash2,
  Edit,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Package,
} from "lucide-react";
import { formatCurrency, formatDate, getStatusColor, getStatusLabel } from "@/lib/utils";
import toast from "react-hot-toast";

interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  description: string | null;
  quantity: number;
  minStock: number;
  costPrice: number;
  sellingPrice: number;
  supplier: string | null;
  location: string | null;
  status: string;
  categoryId: string;
  createdAt: string;
  category: { id: string; name: string };
  createdBy: { name: string | null; email: string };
}

interface Category {
  id: string;
  name: string;
}

export default function InventoryPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const canEdit = session?.user?.role !== "USER";

  const [items, setItems] = useState<InventoryItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [statusFilter, setStatusFilter] = useState(searchParams.get("status") || "");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [deleteDialog, setDeleteDialog] = useState<string | null>(null);
  const [bulkStatusDialog, setBulkStatusDialog] = useState(false);
  const [bulkStatus, setBulkStatus] = useState("");

  const fetchItems = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (statusFilter) params.set("status", statusFilter);
    if (categoryFilter) params.set("category", categoryFilter);
    params.set("page", String(page));

    try {
      const res = await fetch(`/api/inventory?${params}`);
      const data = await res.json();
      setItems(data.items);
      setTotalPages(data.totalPages);
      setTotal(data.total);
    } catch {
      toast.error("Failed to fetch items");
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, categoryFilter, page]);

  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then(setCategories)
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/inventory/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Item deleted");
        fetchItems();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to delete");
      }
    } catch {
      toast.error("Failed to delete item");
    }
    setDeleteDialog(null);
  };

  const handleBulkDelete = async () => {
    if (selected.size === 0) return;
    try {
      const res = await fetch("/api/inventory/bulk", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: Array.from(selected) }),
      });
      if (res.ok) {
        toast.success(`${selected.size} items deleted`);
        setSelected(new Set());
        fetchItems();
      } else {
        toast.error("Failed to delete items");
      }
    } catch {
      toast.error("Failed to delete items");
    }
  };

  const handleBulkStatusUpdate = async () => {
    if (selected.size === 0 || !bulkStatus) return;
    try {
      const res = await fetch("/api/inventory/bulk", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: Array.from(selected), status: bulkStatus }),
      });
      if (res.ok) {
        toast.success(`${selected.size} items updated`);
        setSelected(new Set());
        setBulkStatusDialog(false);
        fetchItems();
      } else {
        toast.error("Failed to update items");
      }
    } catch {
      toast.error("Failed to update items");
    }
  };

  const handleExport = () => {
    window.open("/api/inventory/export", "_blank");
  };

  const toggleSelect = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  };

  const toggleSelectAll = () => {
    if (selected.size === items.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(items.map((i) => i.id)));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Inventory</h1>
          <p className="text-gray-500 dark:text-gray-400">
            {total} items total
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
          {canEdit && (
            <Link href="/inventory/new">
              <Button>
                <Plus className="h-4 w-4" />
                Add Item
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-3 md:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search items..."
                className="pl-9"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
              />
            </div>
            <Select
              value={statusFilter}
              onValueChange={(v) => {
                setStatusFilter(v === "ALL" ? "" : v);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-full md:w-44">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Statuses</SelectItem>
                <SelectItem value="IN_STOCK">In Stock</SelectItem>
                <SelectItem value="LOW_STOCK">Low Stock</SelectItem>
                <SelectItem value="ORDERED">Ordered</SelectItem>
                <SelectItem value="DISCONTINUED">Discontinued</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={categoryFilter}
              onValueChange={(v) => {
                setCategoryFilter(v === "ALL" ? "" : v);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-full md:w-44">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selected.size > 0 && canEdit && (
        <Card>
          <CardContent className="flex items-center justify-between p-3">
            <span className="text-sm font-medium">
              {selected.size} item{selected.size > 1 ? "s" : ""} selected
            </span>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setBulkStatusDialog(true)}
              >
                Change Status
              </Button>
              {session?.user?.role === "ADMIN" && (
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={handleBulkDelete}
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-500">
              <Package className="h-12 w-12 mb-4 opacity-50" />
              <p className="text-lg font-medium">No items found</p>
              <p className="text-sm">Try adjusting your filters or add a new item</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900/50">
                    {canEdit && (
                      <th className="px-4 py-3 text-left">
                        <input
                          type="checkbox"
                          checked={selected.size === items.length && items.length > 0}
                          onChange={toggleSelectAll}
                          className="rounded border-gray-300"
                        />
                      </th>
                    )}
                    <th className="px-4 py-3 text-left font-medium">Item</th>
                    <th className="px-4 py-3 text-left font-medium">SKU</th>
                    <th className="px-4 py-3 text-left font-medium">Category</th>
                    <th className="px-4 py-3 text-left font-medium">Qty</th>
                    <th className="px-4 py-3 text-left font-medium">Price</th>
                    <th className="px-4 py-3 text-left font-medium">Status</th>
                    <th className="px-4 py-3 text-left font-medium">Updated</th>
                    {canEdit && (
                      <th className="px-4 py-3 text-right font-medium">Actions</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr
                      key={item.id}
                      className="border-b border-gray-100 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-900/30"
                    >
                      {canEdit && (
                        <td className="px-4 py-3">
                          <input
                            type="checkbox"
                            checked={selected.has(item.id)}
                            onChange={() => toggleSelect(item.id)}
                            className="rounded border-gray-300"
                          />
                        </td>
                      )}
                      <td className="px-4 py-3">
                        <Link
                          href={`/inventory/${item.id}`}
                          className="font-medium text-blue-600 hover:underline dark:text-blue-400"
                        >
                          {item.name}
                        </Link>
                        {item.supplier && (
                          <p className="text-xs text-gray-500">{item.supplier}</p>
                        )}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs">
                        {item.sku}
                      </td>
                      <td className="px-4 py-3">{item.category.name}</td>
                      <td className="px-4 py-3">
                        <span
                          className={
                            item.quantity <= item.minStock
                              ? "font-semibold text-amber-600"
                              : ""
                          }
                        >
                          {item.quantity}
                        </span>
                        <span className="text-gray-400">
                          /{item.minStock}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {formatCurrency(item.sellingPrice)}
                      </td>
                      <td className="px-4 py-3">
                        <Badge className={getStatusColor(item.status)}>
                          {getStatusLabel(item.status)}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500">
                        {formatDate(item.createdAt)}
                      </td>
                      {canEdit && (
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() =>
                                router.push(`/inventory/${item.id}`)
                              }
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setDeleteDialog(item.id)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Page {page} of {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage(page + 1)}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!deleteDialog}
        onOpenChange={() => setDeleteDialog(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Item</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this item? This action cannot be
              undone.
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

      {/* Bulk Status Dialog */}
      <Dialog open={bulkStatusDialog} onOpenChange={setBulkStatusDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Status</DialogTitle>
            <DialogDescription>
              Update status for {selected.size} selected items
            </DialogDescription>
          </DialogHeader>
          <Select value={bulkStatus} onValueChange={setBulkStatus}>
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="IN_STOCK">In Stock</SelectItem>
              <SelectItem value="LOW_STOCK">Low Stock</SelectItem>
              <SelectItem value="ORDERED">Ordered</SelectItem>
              <SelectItem value="DISCONTINUED">Discontinued</SelectItem>
            </SelectContent>
          </Select>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setBulkStatusDialog(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleBulkStatusUpdate} disabled={!bulkStatus}>
              Update
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
