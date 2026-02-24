import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logActivity } from "@/lib/activity";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const item = await prisma.inventoryItem.findUnique({
    where: { id },
    include: {
      category: true,
      createdBy: { select: { name: true, email: true } },
    },
  });

  if (!item) {
    return NextResponse.json({ error: "Item not found" }, { status: 404 });
  }

  return NextResponse.json(item);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role === "USER") {
    return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
  }

  const { id } = await params;

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

    const existing = await prisma.inventoryItem.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    const newQuantity = quantity !== undefined ? quantity : existing.quantity;
    const newMinStock = minStock !== undefined ? minStock : existing.minStock;

    const computedStatus =
      status ||
      (newQuantity <= 0
        ? "DISCONTINUED"
        : newQuantity <= newMinStock
          ? "LOW_STOCK"
          : "IN_STOCK");

    const item = await prisma.inventoryItem.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(quantity !== undefined && { quantity }),
        ...(minStock !== undefined && { minStock }),
        ...(costPrice !== undefined && { costPrice }),
        ...(sellingPrice !== undefined && { sellingPrice }),
        ...(supplier !== undefined && { supplier }),
        ...(location !== undefined && { location }),
        ...(categoryId !== undefined && { categoryId }),
        status: computedStatus,
      },
      include: {
        category: { select: { name: true } },
      },
    });

    const changes: string[] = [];
    if (name && name !== existing.name) changes.push(`name: "${existing.name}" → "${name}"`);
    if (quantity !== undefined && quantity !== existing.quantity) changes.push(`quantity: ${existing.quantity} → ${quantity}`);
    if (status && status !== existing.status) changes.push(`status: ${existing.status} → ${status}`);

    await logActivity(
      session.user.id,
      "updated",
      "inventory item",
      item.id,
      `Updated item "${item.name}"${changes.length ? `: ${changes.join(", ")}` : ""}`
    );

    return NextResponse.json(item);
  } catch (error) {
    console.error("Update item error:", error);
    return NextResponse.json({ error: "Failed to update item" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role === "USER") {
    return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
  }

  const { id } = await params;

  try {
    const item = await prisma.inventoryItem.findUnique({ where: { id } });
    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    await prisma.inventoryItem.delete({ where: { id } });

    await logActivity(
      session.user.id,
      "deleted",
      "inventory item",
      id,
      `Deleted item "${item.name}" (${item.sku})`
    );

    return NextResponse.json({ message: "Item deleted" });
  } catch (error) {
    console.error("Delete item error:", error);
    return NextResponse.json({ error: "Failed to delete item" }, { status: 500 });
  }
}
