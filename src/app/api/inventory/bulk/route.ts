import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logActivity } from "@/lib/activity";

export async function PUT(request: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role === "USER") {
    return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
  }

  try {
    const { ids, status } = await request.json();

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: "Item IDs required" }, { status: 400 });
    }

    if (!status) {
      return NextResponse.json({ error: "Status required" }, { status: 400 });
    }

    await prisma.inventoryItem.updateMany({
      where: { id: { in: ids } },
      data: { status },
    });

    await logActivity(
      session.user.id,
      "bulk updated",
      "inventory items",
      undefined,
      `Updated ${ids.length} items to status "${status}"`
    );

    return NextResponse.json({
      message: `${ids.length} items updated`,
    });
  } catch (error) {
    console.error("Bulk update error:", error);
    return NextResponse.json({ error: "Failed to update items" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }

  try {
    const { ids } = await request.json();

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: "Item IDs required" }, { status: 400 });
    }

    await prisma.inventoryItem.deleteMany({
      where: { id: { in: ids } },
    });

    await logActivity(
      session.user.id,
      "bulk deleted",
      "inventory items",
      undefined,
      `Deleted ${ids.length} items`
    );

    return NextResponse.json({
      message: `${ids.length} items deleted`,
    });
  } catch (error) {
    console.error("Bulk delete error:", error);
    return NextResponse.json({ error: "Failed to delete items" }, { status: 500 });
  }
}
