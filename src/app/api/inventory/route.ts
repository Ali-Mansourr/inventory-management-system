import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logActivity } from "@/lib/activity";
import { generateSKU } from "@/lib/utils";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") || "";
  const category = searchParams.get("category") || "";
  const status = searchParams.get("status") || "";
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const sortBy = searchParams.get("sortBy") || "createdAt";
  const sortOrder = (searchParams.get("sortOrder") || "desc") as "asc" | "desc";

  const where: Record<string, unknown> = {};

  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { sku: { contains: search, mode: "insensitive" } },
      { supplier: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ];
  }

  if (category) {
    where.categoryId = category;
  }

  if (status) {
    where.status = status;
  }

  const [items, total] = await Promise.all([
    prisma.inventoryItem.findMany({
      where,
      include: {
        category: { select: { id: true, name: true } },
        createdBy: { select: { name: true, email: true } },
      },
      orderBy: { [sortBy]: sortOrder },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.inventoryItem.count({ where }),
  ]);

  return NextResponse.json({
    items,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  });
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role === "USER") {
    return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const {
      name,
      description,
      quantity,
      minStock,
      costPrice,
      sellingPrice,
      supplier,
      location,
      status,
      categoryId,
    } = body;

    if (!name || !categoryId) {
      return NextResponse.json(
        { error: "Name and category are required" },
        { status: 400 }
      );
    }

    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    const sku = generateSKU(category.name);

    const computedStatus =
      status ||
      (quantity <= 0
        ? "DISCONTINUED"
        : quantity <= (minStock || 10)
          ? "LOW_STOCK"
          : "IN_STOCK");

    const item = await prisma.inventoryItem.create({
      data: {
        name,
        sku,
        description: description || null,
        quantity: quantity || 0,
        minStock: minStock || 10,
        costPrice: costPrice || 0,
        sellingPrice: sellingPrice || 0,
        supplier: supplier || null,
        location: location || null,
        status: computedStatus,
        categoryId,
        createdById: session.user.id,
      },
      include: {
        category: { select: { name: true } },
      },
    });

    await logActivity(
      session.user.id,
      "created",
      "inventory item",
      item.id,
      `Created item "${item.name}" (${item.sku})`
    );

    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    console.error("Create item error:", error);
    return NextResponse.json(
      { error: "Failed to create item" },
      { status: 500 }
    );
  }
}
