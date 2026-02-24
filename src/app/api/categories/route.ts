import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logActivity } from "@/lib/activity";

export async function GET() {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const categories = await prisma.category.findMany({
    include: {
      _count: { select: { items: true } },
    },
    orderBy: { name: "asc" },
  });

  return NextResponse.json(categories);
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }

  try {
    const { name, description } = await request.json();

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const existing = await prisma.category.findUnique({ where: { name } });
    if (existing) {
      return NextResponse.json(
        { error: "Category already exists" },
        { status: 409 }
      );
    }

    const category = await prisma.category.create({
      data: { name, description: description || null },
    });

    await logActivity(
      session.user.id,
      "created",
      "category",
      category.id,
      `Created category "${category.name}"`
    );

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error("Create category error:", error);
    return NextResponse.json({ error: "Failed to create category" }, { status: 500 });
  }
}
