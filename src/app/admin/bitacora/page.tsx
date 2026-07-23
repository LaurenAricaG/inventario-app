import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Logs from "@/components/logs";

export const metadata = {
  title: "Logs",
};

interface BitacoraPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function BitacoraPage(props: BitacoraPageProps) {
  const session = await auth();
  const permissions = session?.user?.permissions ?? [];

  // Validar permiso de lectura
  if (!permissions.includes("audit:read")) {
    redirect("/admin");
  }

  const searchParams = await props.searchParams;
  const page = Number(searchParams.page) || 1;
  const search = typeof searchParams.search === "string" ? searchParams.search : "";
  const action = typeof searchParams.action === "string" ? searchParams.action : "ALL";
  const entity = typeof searchParams.entity === "string" ? searchParams.entity : "ALL";

  const limit = 15; // Mostrar 15 registros por página en la bitácora
  const skip = (page - 1) * limit;

  // Construir clausula WHERE para los filtros
  const whereClause: any = {};

  if (action && action !== "ALL") {
    whereClause.action = action;
  }

  if (entity && entity !== "ALL") {
    whereClause.entity = entity;
  }

  if (search) {
    const searchConditions: any[] = [
      {
        user: {
          name: { contains: search, mode: "insensitive" as const },
        },
      },
      {
        user: {
          username: { contains: search, mode: "insensitive" as const },
        },
      },
      {
        entity: { contains: search, mode: "insensitive" as const },
      },
    ];

    // Intentar buscar por ID de entidad si el término es numérico
    const searchNum = Number(search);
    if (!isNaN(searchNum)) {
      searchConditions.push({
        entityId: searchNum,
      });
    }

    whereClause.OR = searchConditions;
  }

  // Ejecutar consultas concurrentes
  const [logs, totalItems, overallCount, distinctEntities] = await Promise.all([
    // Obtener los logs de auditoría
    prisma.auditLog.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
      skip: skip,
    }),
    // Total de items filtrados
    prisma.auditLog.count({
      where: whereClause,
    }),
    // Total general en la tabla para saber si está vacía
    prisma.auditLog.count(),
    // Obtener las entidades distintas registradas para el filtro dinámico
    prisma.auditLog.findMany({
      select: {
        entity: true,
      },
      distinct: ["entity"],
      orderBy: {
        entity: "asc",
      },
    }),
  ]);

  const totalPages = Math.ceil(totalItems / limit);

  // Serializar fechas y datos antes de pasarlos al componente cliente
  const serializedLogs = logs.map((log) => ({
    id: log.id,
    userId: log.userId,
    action: log.action,
    entity: log.entity,
    entityId: log.entityId,
    details: log.details,
    createdAt: log.createdAt.toISOString(),
    user: log.user
      ? {
        id: log.user.id,
        name: log.user.name,
        username: log.user.username,
        email: log.user.email,
      }
      : null,
  }));

  const entityOptions = distinctEntities
    .map((e) => e.entity)
    .filter(Boolean);

  return (
    <Logs
      initialLogs={serializedLogs}
      entityOptions={entityOptions}
      overallCount={overallCount}
      totalItems={totalItems}
      totalPages={totalPages}
      currentPage={page}
      itemsPerPage={limit}
      search={search}
      actionFilter={action}
      entityFilter={entity}
    />
  );
}
