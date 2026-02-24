import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getInventoryInsights } from "@/lib/groq";

export async function GET() {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const items = await prisma.inventoryItem.findMany({
      include: { category: { select: { name: true } } },
    });

    if (items.length === 0) {
      return NextResponse.json({
        insight:
          "No inventory items found. Add some items to get AI-powered insights!",
      });
    }

    const summary = items.map((item) => ({
      name: item.name,
      sku: item.sku,
      category: item.category.name,
      quantity: item.quantity,
      minStock: item.minStock,
      status: item.status,
      costPrice: item.costPrice,
      sellingPrice: item.sellingPrice,
      supplier: item.supplier,
    }));

    const insight = await getInventoryInsights(JSON.stringify(summary, null, 2));

    return NextResponse.json({ insight });
  } catch (error) {
    console.error("AI insights error:", error);
    return NextResponse.json(
      { error: "Failed to generate insights" },
      { status: 500 }
    );
  }
}
