import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [totalItems, lowStockCount, categories, lowStockItems, recentActivity, allItems] =
    await Promise.all([
      prisma.inventoryItem.count(),
      prisma.inventoryItem.count({
        where: { status: "LOW_STOCK" },
      }),
      prisma.category.findMany({
        select: {
          name: true,
          _count: { select: { items: true } },
        },
        orderBy: { name: "asc" },
      }),
      prisma.inventoryItem.findMany({
        where: {
          status: { in: ["LOW_STOCK", "ORDERED"] },
        },
        include: { category: { select: { name: true } } },
        orderBy: { quantity: "asc" },
        take: 10,
      }),
      prisma.activityLog.findMany({
        include: {
          user: { select: { name: true, email: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
      prisma.inventoryItem.findMany({
        select: { sellingPrice: true, quantity: true },
      }),
    ]);

  const totalValue = allItems.reduce(
    (sum, item) => sum + item.sellingPrice * item.quantity,
    0
  );

  return NextResponse.json({
    totalItems,
    lowStockCount,
    totalValue,
    categoryCount: categories.length,
    lowStockItems,
    recentActivity,
    categoryBreakdown: categories,
  });
}
