import { prisma } from "@/lib/prisma";

export async function logActivity(
  userId: string,
  action: string,
  entityType: string,
  entityId?: string,
  details?: string
) {
  await prisma.activityLog.create({
    data: {
      userId,
      action,
      entityType,
      entityId,
      details,
    },
  });
}
