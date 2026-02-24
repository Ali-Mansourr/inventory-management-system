import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getRestockSuggestions } from "@/lib/groq";

export async function GET() {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const items = await prisma.inventoryItem.findMany({
      where: {
        status: { in: ["LOW_STOCK", "ORDERED"] },
      },
      include: { category: { select: { name: true } } },
      orderBy: { quantity: "asc" },
    });

    if (items.length === 0) {
      return NextResponse.json({
        suggestions:
          "All items are well-stocked! No restocking needed at this time.",
      });
    }

    const summary = items.map((item) => ({
      name: item.name,
      sku: item.sku,
      category: item.category.name,
      currentQuantity: item.quantity,
      minStock: item.minStock,
      status: item.status,
      supplier: item.supplier,
      costPrice: item.costPrice,
    }));

    const suggestions = await getRestockSuggestions(
      JSON.stringify(summary, null, 2)
    );

    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error("AI restock error:", error);
    return NextResponse.json(
      { error: "Failed to generate suggestions" },
      { status: 500 }
    );
  }
}
