import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logActivity } from "@/lib/activity";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }

  const { id } = await params;

  try {
    const { name, description } = await request.json();

    const category = await prisma.category.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
      },
    });

    await logActivity(
      session.user.id,
      "updated",
      "category",
      category.id,
      `Updated category "${category.name}"`
    );

    return NextResponse.json(category);
  } catch (error) {
    console.error("Update category error:", error);
    return NextResponse.json({ error: "Failed to update category" }, { status: 500 });
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

  if (session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }

  const { id } = await params;

  try {
    const category = await prisma.category.findUnique({
      where: { id },
      include: { _count: { select: { items: true } } },
    });

    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    if (category._count.items > 0) {
      return NextResponse.json(
        { error: "Cannot delete category with existing items" },
        { status: 400 }
      );
    }

    await prisma.category.delete({ where: { id } });

    await logActivity(
      session.user.id,
      "deleted",
      "category",
      id,
      `Deleted category "${category.name}"`
    );

    return NextResponse.json({ message: "Category deleted" });
  } catch (error) {
    console.error("Delete category error:", error);
    return NextResponse.json({ error: "Failed to delete category" }, { status: 500 });
  }
}
