"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Package,
  AlertTriangle,
  DollarSign,
  Tags,
  TrendingDown,
  Bot,
  Loader2,
  ArrowRight,
  Activity,
} from "lucide-react";
import { formatCurrency, formatDate, getStatusColor, getStatusLabel } from "@/lib/utils";
import Link from "next/link";

interface DashboardStats {
  totalItems: number;
  lowStockCount: number;
  totalValue: number;
  categoryCount: number;
  lowStockItems: Array<{
    id: string;
    name: string;
    sku: string;
    quantity: number;
    minStock: number;
    status: string;
    category: { name: string };
  }>;
  recentActivity: Array<{
    id: string;
    action: string;
    entityType: string;
    details: string | null;
    createdAt: string;
    user: { name: string | null; email: string };
  }>;
  categoryBreakdown: Array<{
    name: string;
    _count: { items: number };
  }>;
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [aiInsight, setAiInsight] = useState<string>("");
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/dashboard");
      const data = await res.json();
      setStats(data);
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAIInsight = async () => {
    setAiLoading(true);
    try {
      const res = await fetch("/api/ai/insights");
      const data = await res.json();
      setAiInsight(data.insight);
    } catch (error) {
      console.error("Failed to fetch AI insight:", error);
    } finally {
      setAiLoading(false);
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
        <h1 className="text-2xl font-bold">
          Welcome back, {session?.user?.name || "User"}
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          Here&apos;s an overview of your inventory
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Total Items
            </CardTitle>
            <Package className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.totalItems || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Low Stock Alerts
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-600">
              {stats?.lowStockCount || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Total Value
            </CardTitle>
            <DollarSign className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {formatCurrency(stats?.totalValue || 0)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Categories
            </CardTitle>
            <Tags className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {stats?.categoryCount || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* AI Insights */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bot className="h-5 w-5 text-blue-600" />
                <CardTitle>AI Insights</CardTitle>
              </div>
              <Button
                size="sm"
                onClick={fetchAIInsight}
                disabled={aiLoading}
              >
                {aiLoading ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  "Generate"
                )}
              </Button>
            </div>
            <CardDescription>
              AI-powered analysis of your inventory
            </CardDescription>
          </CardHeader>
          <CardContent>
            {aiInsight ? (
              <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap text-sm">
                {aiInsight}
              </div>
            ) : (
              <p className="text-sm text-gray-500">
                Click &quot;Generate&quot; to get AI-powered insights about your
                inventory status, trends, and recommendations.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Low Stock Items */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingDown className="h-5 w-5 text-amber-500" />
                <CardTitle>Low Stock Items</CardTitle>
              </div>
              <Link href="/inventory?status=LOW_STOCK">
                <Button variant="ghost" size="sm">
                  View all <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {stats?.lowStockItems && stats.lowStockItems.length > 0 ? (
              <div className="space-y-3">
                {stats.lowStockItems.slice(0, 5).map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between rounded-lg border border-gray-100 p-3 dark:border-gray-800"
                  >
                    <div>
                      <p className="font-medium text-sm">{item.name}</p>
                      <p className="text-xs text-gray-500">
                        {item.category.name} · {item.sku}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-amber-600">
                        {item.quantity} / {item.minStock}
                      </p>
                      <Badge
                        className={getStatusColor(item.status)}
                      >
                        {getStatusLabel(item.status)}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">
                All items are well stocked!
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Category Breakdown */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Tags className="h-5 w-5 text-purple-600" />
              <CardTitle>Category Breakdown</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {stats?.categoryBreakdown && stats.categoryBreakdown.length > 0 ? (
              <div className="space-y-3">
                {stats.categoryBreakdown.map((cat) => {
                  const maxCount = Math.max(
                    ...stats.categoryBreakdown.map((c) => c._count.items)
                  );
                  const percentage =
                    maxCount > 0
                      ? (cat._count.items / maxCount) * 100
                      : 0;
                  return (
                    <div key={cat.name}>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="font-medium">{cat.name}</span>
                        <span className="text-gray-500">
                          {cat._count.items} items
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-gray-100 dark:bg-gray-800">
                        <div
                          className="h-2 rounded-full bg-blue-600 transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No categories yet.</p>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-green-600" />
                <CardTitle>Recent Activity</CardTitle>
              </div>
              <Link href="/activity">
                <Button variant="ghost" size="sm">
                  View all <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {stats?.recentActivity && stats.recentActivity.length > 0 ? (
              <div className="space-y-3">
                {stats.recentActivity.slice(0, 5).map((log) => (
                  <div
                    key={log.id}
                    className="flex items-start gap-3 rounded-lg border border-gray-100 p-3 dark:border-gray-800"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                      <Activity className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm">
                        <span className="font-medium">
                          {log.user.name || log.user.email}
                        </span>{" "}
                        {log.action}{" "}
                        <span className="text-gray-500">{log.entityType}</span>
                      </p>
                      {log.details && (
                        <p className="text-xs text-gray-500 truncate">
                          {log.details}
                        </p>
                      )}
                      <p className="text-xs text-gray-400">
                        {formatDate(log.createdAt)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No activity yet.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
