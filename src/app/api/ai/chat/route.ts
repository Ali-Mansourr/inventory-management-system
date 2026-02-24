import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { answerInventoryQuestion } from "@/lib/groq";

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { message } = await request.json();

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const [items, categories] = await Promise.all([
      prisma.inventoryItem.findMany({
        include: { category: { select: { name: true } } },
      }),
      prisma.category.findMany({
        include: { _count: { select: { items: true } } },
      }),
    ]);

    const context = JSON.stringify(
      {
        totalItems: items.length,
        categories: categories.map((c) => ({
          name: c.name,
          itemCount: c._count.items,
        })),
        items: items.map((item) => ({
          name: item.name,
          sku: item.sku,
          category: item.category.name,
          quantity: item.quantity,
          minStock: item.minStock,
          status: item.status,
          costPrice: item.costPrice,
          sellingPrice: item.sellingPrice,
          supplier: item.supplier,
          location: item.location,
        })),
      },
      null,
      2
    );

    const response = await answerInventoryQuestion(message, context);

    return NextResponse.json({ response });
  } catch (error) {
    console.error("AI chat error:", error);
    return NextResponse.json(
      { error: "Failed to process message" },
      { status: 500 }
    );
  }
}
