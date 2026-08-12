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
    description:
      "Permite reactivar (restaurar) cuentas de usuarios suspendidos",
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
    description:
      "Permite registrar ingresos, salidas manuales y ajustes en el Kardex",
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
    code: "debts:delete",
    name: "Eliminar/Anular Deudas",
    description: "Permite remover o anular registros de deudas externas",
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
  {
    code: "payments:delete",
    name: "Eliminar/Anular Pagos",
    description: "Permite remover o anular registros de abonos y pagos",
  },

  // Roles y Permisos
  {
    code: "roles:create",
    name: "Crear Roles",
    description: "Permite crear nuevos roles de usuario",
  },
  {
    code: "roles:read",
    name: "Ver Roles",
    description: "Permite ver el listado de roles y sus permisos",
  },
  {
    code: "roles:update",
    name: "Editar Roles",
    description: "Permite modificar el nombre y permisos de los roles",
  },
  {
    code: "roles:delete",
    name: "Eliminar Roles",
    description: "Permite remover roles del sistema",
  },

  // Empresas
  {
    code: "companies:create",
    name: "Crear Empresas",
    description: "Permite registrar nuevas empresas",
  },
  {
    code: "companies:read",
    name: "Ver Empresas",
    description: "Permite consultar el listado de empresas",
  },
  {
    code: "companies:update",
    name: "Editar Empresas",
    description: "Permite actualizar datos de las empresas",
  },
  {
    code: "companies:delete",
    name: "Eliminar Empresas",
    description: "Permite remover empresas del sistema",
  },

  // Marcas
  {
    code: "brands:create",
    name: "Crear Marcas",
    description: "Permite registrar nuevas marcas",
  },
  {
    code: "brands:read",
    name: "Ver Marcas",
    description: "Permite consultar el listado de marcas",
  },
  {
    code: "brands:update",
    name: "Editar Marcas",
    description: "Permite actualizar datos de las marcas",
  },
  {
    code: "brands:delete",
    name: "Eliminar Marcas",
    description: "Permite remover marcas del sistema",
  },

  // Géneros
  {
    code: "genders:create",
    name: "Crear Géneros",
    description: "Permite registrar nuevos géneros/segmentos",
  },
  {
    code: "genders:read",
    name: "Ver Géneros",
    description: "Permite ver la lista de géneros registrados",
  },
  {
    code: "genders:update",
    name: "Editar Géneros",
    description: "Permite modificar géneros registrados",
  },
  {
    code: "genders:delete",
    name: "Eliminar Géneros",
    description: "Permite remover géneros del sistema",
  },

  // Categorías
  {
    code: "categories:create",
    name: "Crear Categorías",
    description: "Permite registrar nuevas categorías de productos",
  },
  {
    code: "categories:read",
    name: "Ver Categorías",
    description: "Permite ver el listado de categorías",
  },
  {
    code: "categories:update",
    name: "Editar Categorías",
    description: "Permite modificar categorías existentes",
  },
  {
    code: "categories:delete",
    name: "Eliminar Categorías",
    description: "Permite remover categorías del sistema",
  },

  // Movimientos (Kardex)
  {
    code: "transactions:read",
    name: "Ver Histórico de Movimientos",
    description:
      "Permite consultar el historial general de movimientos de inventario",
  },
  {
    code: "transactions:detail",
    name: "Ver Ficha de Movimientos de Cliente",
    description:
      "Permite visualizar el detalle y ficha completa de movimientos por cliente",
  },

  // Bitácora de Auditoría
  {
    code: "audit:read",
    name: "Ver Bitácora de Auditoría",
    description:
      "Permite consultar el registro de actividades y auditoría del sistema",
  },

  // Configuración del Sistema
  {
    code: "config:read",
    name: "Ver Configuración",
    description: "Permite acceder al módulo de configuración del sistema",
  },
  {
    code: "config:edit",
    name: "Editar Configuración",
    description:
      "Permite modificar los datos generales de la empresa y configuración",
  },
  {
    code: "config:show",
    name: "Configurar Visibilidad Pública",
    description:
      "Permite modificar las opciones de visibilidad pública (precios, stock, catálogos)",
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
    code: "catalogs:read",
    name: "Ver Catálogos PDF",
    description: "Permite ver la lista de catálogos PDF",
  },
  {
    code: "catalogs:upload",
    name: "Subir Catálogos PDF",
    description:
      "Permite subir archivos PDF de catálogos asociados a las marcas",
  },
  {
    code: "catalogs:update",
    name: "Editar Catálogos PDF",
    description:
      "Permite modificar o reemplazar archivos PDF de catálogos",
  },
  {
    code: "catalogs:delete",
    name: "Eliminar Catálogos PDF",
    description: "Permite eliminar catálogos PDF del sistema",
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

  // 5. Seed Base Gender Segments (Géneros)
  const genders = ["Femenino", "Masculino", "Unisex"];
  for (const genderName of genders) {
    await prisma.genderSegment.upsert({
      where: { name: genderName },
      update: {},
      create: {
        name: genderName,
        createdById: defaultAdmin.id,
      },
    });
  }
  console.log("Gender segments seeded successfully.");

  // 6. Seed Base Categories (Categorías)
  const categories = [
    "Labiales",
    "Bases y Correctores",
    "Rubor y Bronzer",
    "Sombras de Ojos",
    "Delineadores",
    "Máscaras de Pestañas",
    "Esmaltes de Uñas",
    "Brochas y Accesorios",

    "Perfumes",

    "Cuidado Facial",
    "Cuidado Corporal",
    "Protección Solar",

    "Shampoos",
    "Acondicionadores",
    "Tratamiento Capilar",
    "Desodorantes",

    "Moda y Accesorios",
    "Joyería",
    "Electrodomésticos",
    "Hogar y Cocina",
  ];

  for (const categoryName of categories) {
    await prisma.category.upsert({
      where: { name: categoryName },
      update: {},
      create: {
        name: categoryName,
        createdById: defaultAdmin.id,
      },
    });
  }
  console.log("Categories seeded successfully.");

  // 7. Seed Base Companies (Empresas)
  const companyNames = ["Belcorp", "Avon", "Yanbal"];
  const companyMap = new Map<string, number>();

  for (const companyName of companyNames) {
    const company = await prisma.company.upsert({
      where: { name: companyName },
      update: {},
      create: {
        name: companyName,
        createdById: defaultAdmin.id,
      },
    });
    companyMap.set(companyName, company.id);
  }
  console.log("Companies seeded successfully.");

  // 8. Seed Base Brands (Marcas)
  const brandsData = [
    // Belcorp
    { name: "Esika", companyName: "Belcorp" },
    { name: "Cyzone", companyName: "Belcorp" },
    { name: "L'Bel", companyName: "Belcorp" },
    // Avon
    { name: "Avon", companyName: "Avon" },
    // Yanbal
    { name: "Unique", companyName: "Yanbal" },
  ];

  for (const brandItem of brandsData) {
    const companyId = companyMap.get(brandItem.companyName);
    if (!companyId) continue;

    await prisma.brand.upsert({
      where: {
        companyId_name: {
          companyId,
          name: brandItem.name,
        },
      },
      update: {},
      create: {
        name: brandItem.name,
        companyId,
        createdById: defaultAdmin.id,
      },
    });
  }
  console.log("Brands seeded successfully.");

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
