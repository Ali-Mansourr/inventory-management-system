import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const items = await prisma.inventoryItem.findMany({
    include: {
      category: { select: { name: true } },
      createdBy: { select: { name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const headers = [
    "SKU",
    "Name",
    "Description",
    "Category",
    "Quantity",
    "Min Stock",
    "Cost Price",
    "Selling Price",
    "Supplier",
    "Location",
    "Status",
    "Created By",
    "Created At",
  ];

  const rows = items.map((item) => [
    item.sku,
    `"${item.name.replace(/"/g, '""')}"`,
    `"${(item.description || "").replace(/"/g, '""')}"`,
    item.category.name,
    item.quantity,
    item.minStock,
    item.costPrice,
    item.sellingPrice,
    item.supplier || "",
    item.location || "",
    item.status,
    item.createdBy.name || item.createdBy.email,
    item.createdAt.toISOString(),
  ]);

  const csv = [headers.join(","), ...rows.map((row) => row.join(","))].join(
    "\n"
  );

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="inventory-${new Date().toISOString().split("T")[0]}.csv"`,
    },
  });
}
