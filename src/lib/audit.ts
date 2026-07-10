import { prisma } from "@/lib/prisma";

export async function logActivity({
  userId,
  action,
  entity,
  entityId,
  details,
}: {
  userId: number | null;
  action: "CREATE" | "UPDATE" | "DELETE";
  entity: string;
  entityId: number;
  details?: Record<string, any>;
}) {
  try {
    await prisma.auditLog.create({
      data: {
        userId,
        action,
        entity,
        entityId,
        details: details || {},
      },
    });
  } catch (error) {
    console.error("Fallo al escribir en la bitácora de auditoría:", error);
  }
}
