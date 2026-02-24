import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "30");
  const entityType = searchParams.get("entityType") || "";

  const where: Record<string, unknown> = {};
  if (entityType) {
    where.entityType = entityType;
  }

  const [logs, total] = await Promise.all([
    prisma.activityLog.findMany({
      where,
      include: {
        user: { select: { name: true, email: true, image: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.activityLog.count({ where }),
  ]);

  return NextResponse.json({
    logs,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  });
}
