"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Activity,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Package,
  Tags,
  Users,
  Settings,
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import toast from "react-hot-toast";

interface ActivityEntry {
  id: string;
  action: string;
  entityType: string;
  entityId: string | null;
  details: string | null;
  createdAt: string;
  user: { name: string | null; email: string; image: string | null };
}

const entityIcons: Record<string, React.ReactNode> = {
  "inventory item": <Package className="h-4 w-4" />,
  category: <Tags className="h-4 w-4" />,
  user: <Users className="h-4 w-4" />,
  settings: <Settings className="h-4 w-4" />,
};

export default function ActivityPage() {
  const [logs, setLogs] = useState<ActivityEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [entityType, setEntityType] = useState("");

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    params.set("page", String(page));
    if (entityType) params.set("entityType", entityType);

    try {
      const res = await fetch(`/api/activity?${params}`);
      const data = await res.json();
      setLogs(data.logs);
      setTotalPages(data.totalPages);
    } catch {
      toast.error("Failed to fetch activity");
    } finally {
      setLoading(false);
    }
  }, [page, entityType]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Activity Log</h1>
          <p className="text-gray-500 dark:text-gray-400">
            Track all changes and actions
          </p>
        </div>
        <Select
          value={entityType}
          onValueChange={(v) => {
            setEntityType(v === "ALL" ? "" : v);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Types</SelectItem>
            <SelectItem value="inventory item">Inventory</SelectItem>
            <SelectItem value="inventory items">Bulk Inventory</SelectItem>
            <SelectItem value="category">Categories</SelectItem>
            <SelectItem value="user">Users</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          ) : logs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500">
              <Activity className="h-12 w-12 mb-4 opacity-50" />
              <p>No activity recorded yet</p>
            </div>
          ) : (
            <div className="space-y-1">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-start gap-4 rounded-lg p-3 hover:bg-gray-50 dark:hover:bg-gray-900/30"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                    {log.user.image ? (
                      <img
                        src={log.user.image}
                        alt=""
                        className="h-10 w-10 rounded-full"
                      />
                    ) : (
                      <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                        {(log.user.name || log.user.email)[0].toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">
                        {log.user.name || log.user.email}
                      </span>
                      <span className="text-sm text-gray-500">
                        {log.action}
                      </span>
                      <span className="inline-flex items-center gap-1 text-sm">
                        {entityIcons[log.entityType] || null}
                        {log.entityType}
                      </span>
                    </div>
                    {log.details && (
                      <p className="text-sm text-gray-500 mt-0.5 truncate">
                        {log.details}
                      </p>
                    )}
                    <p className="text-xs text-gray-400 mt-0.5">
                      {formatDate(log.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

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
    </div>
  );
}
