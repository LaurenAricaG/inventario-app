import { prisma } from "../src/lib/prisma";
import bcrypt from "bcryptjs";

const permissionsData = [
  // Usuarios
  {
    code: "users:create",
    name: "Crear Usuarios",
    description: "Permite registrar nuevos usuarios en el sistema",
  },
  {
    code: "users:read",
    name: "Ver Usuarios",
    description: "Permite ver el listado de usuarios registrados",
  },
  {
    code: "users:update",
    name: "Editar Usuarios",
    description: "Permite modificar datos de los usuarios",
  },
  {
    code: "users:delete",
    name: "Suspender Usuarios",
    description: "Permite suspender (desactivar) cuentas de usuarios",
  },
  {
    code: "users:restore",
    name: "Restaurar Usuarios",
    description: "Permite reactivar (restaurar) cuentas de usuarios suspendidos",
  },

  // Clientes
  {
    code: "clients:create",
    name: "Registrar Clientes",
    description: "Permite añadir nuevos clientes",
  },
  {
    code: "clients:read",
    name: "Ver Clientes",
    description: "Permite visualizar el listado y detalles de los clientes",
  },
  {
    code: "clients:update",
    name: "Editar Clientes",
    description: "Permite actualizar la información de los clientes",
  },
  {
    code: "clients:delete",
    name: "Eliminar Clientes",
    description: "Permite remover clientes del sistema",
  },

  // Inventario y Productos
  {
    code: "products:create",
    name: "Crear Productos",
    description: "Permite añadir productos nuevos al catálogo",
  },
  {
    code: "products:read",
    name: "Ver Productos",
    description:
      "Permite consultar el catálogo de productos y su stock disponible",
  },
  {
    code: "products:update",
    name: "Editar Productos",
    description: "Permite modificar información de los productos",
  },
  {
    code: "products:delete",
    name: "Eliminar Productos",
    description: "Permite quitar productos del sistema",
  },
  {
    code: "products:cost-read",
    name: "Ver Precio de Costo",
    description:
      "Permite visualizar los precios de costo de los productos (información restringida)",
  },
  {
    code: "inventory:read",
    name: "Ver Kardex de Inventario",
    description: "Permite visualizar el historial de movimientos de stock",
  },
  {
    code: "inventory:adjust",
    name: "Registrar Ajustes de Stock",
    description: "Permite registrar ingresos, salidas manuales y ajustes en el Kardex",
  },

  // Pedidos de Campaña
  {
    code: "orders:create",
    name: "Crear Pedidos",
    description: "Permite registrar pedidos de campaña para los clientes",
  },
  {
    code: "orders:read",
    name: "Ver Pedidos",
    description: "Permite ver el listado y el estado de los pedidos de campaña",
  },
  {
    code: "orders:update",
    name: "Editar Pedidos",
    description: "Permite actualizar items o datos de los pedidos de campaña",
  },
  {
    code: "orders:delete",
    name: "Eliminar Pedidos",
    description: "Permite eliminar pedidos de campaña",
  },
  {
    code: "orders:receive",
    name: "Recibir Productos",
    description:
      "Permite marcar la llegada y verificación de los productos del pedido",
  },

  // Ventas Directas
  {
    code: "sales:create",
    name: "Registrar Ventas Directas",
    description: "Permite registrar ventas directas de productos en stock",
  },
  {
    code: "sales:read",
    name: "Ver Ventas Directas",
    description: "Permite visualizar el histórico de ventas directas",
  },
  {
    code: "sales:update",
    name: "Editar Ventas Directas",
    description: "Permite modificar o anular ventas directas",
  },
  {
    code: "sales:delete",
    name: "Eliminar Ventas Directas",
    description: "Permite remover registros de ventas directas",
  },

  // Deudas y Pagos
  {
    code: "debts:create",
    name: "Registrar Deudas",
    description: "Permite añadir deudas externas o saldos iniciales a clientes",
  },
  {
    code: "debts:read",
    name: "Ver Deudas",
    description: "Permite consultar el estado de las deudas de los clientes",
  },
  {
    code: "payments:create",
    name: "Registrar Pagos",
    description: "Permite registrar abonos y pagos de deudas de clientes",
  },
  {
    code: "payments:read",
    name: "Ver Pagos",
    description: "Permite visualizar el historial de abonos y pagos recibidos",
  },

  // Campañas y Catálogos
  {
    code: "campaigns:create",
    name: "Crear Campañas",
    description: "Permite crear nuevas campañas",
  },
  {
    code: "campaigns:read",
    name: "Ver Campañas",
    description: "Permite ver la lista de campañas registradas",
  },
  {
    code: "campaigns:update",
    name: "Editar Campañas",
    description: "Permite abrir, cerrar o modificar campañas",
  },
  {
    code: "campaigns:delete",
    name: "Eliminar Campañas",
    description: "Permite eliminar campañas del sistema",
  },
  {
    code: "catalogs:upload",
    name: "Subir Catálogos PDF",
    description:
      "Permite subir archivos PDF de catálogos asociados a las marcas",
  },
];

async function main() {
  console.log("Starting seeding...");

  // 1. Seed System Configuration
  await prisma.systemConfig.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      lock: true,
      systemName: "Mi empresa",
      whatsappNumber: "51987654321",
      showPricePublic: true,
      showStockPublic: true,
      showCatalogsPublic: true,
    },
  });
  console.log("System configuration seeded successfully.");

  // 2. Seed Admin Role
  const adminRole = await prisma.role.upsert({
    where: { name: "ADMIN" },
    update: { description: "Administrador del sistema con acceso total" },
    create: {
      name: "ADMIN",
      description: "Administrador del sistema con acceso total",
    },
  });
  console.log("Admin role seeded successfully.");

  // 3. Seed Permissions & Assign to ADMIN
  const dbPermissions = [];
  for (const perm of permissionsData) {
    const dbPerm = await prisma.permission.upsert({
      where: { code: perm.code },
      update: { name: perm.name, description: perm.description },
      create: perm,
    });
    dbPermissions.push(dbPerm);
  }

  await prisma.rolePermission.deleteMany({
    where: { roleId: adminRole.id },
  });

  await prisma.rolePermission.createMany({
    data: dbPermissions.map((perm) => ({
      roleId: adminRole.id,
      permissionId: perm.id,
    })),
  });
  console.log("Admin permissions associated successfully.");

  // 4. Seed default Admin User
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash("admin123", salt);

  const defaultAdmin = await prisma.user.upsert({
    where: { email: "[EMAIL_ADDRESS]" },
    update: {
      name: "Usuario",
      username: "admin",
      roleId: adminRole.id,
    },
    create: {
      name: "Usuario",
      username: "admin",
      email: "admin@example.com",
      passwordHash,
      roleId: adminRole.id,
    },
  });

  console.log(`Default admin user seeded: ${defaultAdmin.email}`);
  console.log("Seeding finished successfully.");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
