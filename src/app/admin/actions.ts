"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";

export async function seedMockDataAction() {
  try {
    // 1. Fetch Roles
    const adminRole = await prisma.role.findUnique({
      where: { name: "ADMIN" },
    });
    const sellerRole = await prisma.role.findUnique({
      where: { name: "SELLER" },
    });

    if (!adminRole || !sellerRole) {
      return {
        success: false,
        message:
          "Roles no configurados. Ejecuta el script de semilla principal primero.",
      };
    }

    // 2. Fetch or create a default Admin User
    let defaultAdmin = await prisma.user.findFirst({
      where: { roleId: adminRole.id },
    });

    if (!defaultAdmin) {
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash("admin123", salt);
      defaultAdmin = await prisma.user.create({
        data: {
          name: "Lauren Arica",
          username: "lauren",
          email: "lauren@example.com",
          passwordHash,
          roleId: adminRole.id,
        },
      });
    }

    // 3. Seed Mock Users (12 users)
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash("password123", salt);

    const mockUsersData = [
      {
        name: "Juan Pérez",
        username: "juan.perez",
        email: "juan.perez@example.com",
        roleId: sellerRole.id,
      },
      {
        name: "María Rodríguez",
        username: "maria.rod",
        email: "maria.rod@example.com",
        roleId: sellerRole.id,
      },
      {
        name: "Carlos Gómez",
        username: "carlos.g",
        email: "carlos.g@example.com",
        roleId: sellerRole.id,
      },
      {
        name: "Ana Martínez",
        username: "ana.m",
        email: "ana.m@example.com",
        roleId: sellerRole.id,
      },
      {
        name: "Luis Hernández",
        username: "luis.h",
        email: "luis.h@example.com",
        roleId: sellerRole.id,
      },
      {
        name: "Carmen Díaz",
        username: "carmen.d",
        email: "carmen.d@example.com",
        roleId: sellerRole.id,
      },
      {
        name: "Jorge Flores",
        username: "jorge.f",
        email: "jorge.f@example.com",
        roleId: sellerRole.id,
      },
      {
        name: "Sofía Torres",
        username: "sofia.t",
        email: "sofia.t@example.com",
        roleId: sellerRole.id,
      },
      {
        name: "Andrés Silva",
        username: "andres.s",
        email: "andres.s@example.com",
        roleId: sellerRole.id,
      },
      {
        name: "Laura Castro",
        username: "laura.c",
        email: "laura.c@example.com",
        roleId: adminRole.id,
      },
      {
        name: "David Ruiz",
        username: "david.r",
        email: "david.r@example.com",
        roleId: sellerRole.id,
      },
      {
        name: "Elena Morales",
        username: "elena.m",
        email: "elena.m@example.com",
        roleId: sellerRole.id,
      },
    ];

    for (const user of mockUsersData) {
      await prisma.user.upsert({
        where: { email: user.email },
        update: {
          name: user.name,
          username: user.username,
          roleId: user.roleId,
        },
        create: {
          ...user,
          passwordHash,
        },
      });
    }

    // 4. Seed Mock Clients (25 clients)
    const mockClientsData = [
      {
        name: "Alexandra Guerrero",
        phone: "987654321",
        address: "Av. Larco 123, Miraflores",
        notes: "Prefiere fragancias florales Avon",
      },
      {
        name: "Beatriz Valdivia",
        phone: "987654322",
        address: "Calle San Martín 456, San Isidro",
        notes: "Compra maquillaje Natura Una",
      },
      {
        name: "Camila Sánchez",
        phone: "987654323",
        address: "Jr. Ayacucho 789, Surco",
        notes: "Suele pedir cremas Tododia",
      },
      {
        name: "Diana Rojas",
        phone: "987654324",
        address: "Av. Arequipa 1011, Lince",
        notes: "Cliente frecuente de Natura Homem",
      },
      {
        name: "Estefanía Quispe",
        phone: "987654325",
        address: "Calle Las Flores 202, San Borja",
        notes: "Prefiere productos en stock",
      },
      {
        name: "Fabiola Mendoza",
        phone: "987654326",
        address: "Av. Javier Prado 1500, La Molina",
        notes: "Interesada en ofertas de catálogo",
      },
      {
        name: "Gabriela Torres",
        phone: "987654327",
        address: "Jr. Huallaga 303, Cercado de Lima",
        notes: "Deuda pendiente por cobrar",
      },
      {
        name: "Helena Vargas",
        phone: "987654328",
        address: "Calle Grau 404, Barranco",
        notes: "Paga siempre con Yape",
      },
      {
        name: "Isabel Castro",
        phone: "987654329",
        address: "Av. Brasil 1800, Pueblo Libre",
        notes: "Pide repuestos de jabones Ekos",
      },
      {
        name: "Jacqueline Paredes",
        phone: "987654330",
        address: "Jr. Trujillo 505, Rímac",
        notes: "Cliente nueva",
      },
      {
        name: "Karen Espinoza",
        phone: "987654331",
        address: "Av. La Marina 2200, San Miguel",
        notes: "Le interesan protectores solares Avon Care",
      },
      {
        name: "Liliana Soto",
        phone: "987654332",
        address: "Calle Bolognesi 606, Magdalena",
        notes: "Paga puntual en efectivo",
      },
      {
        name: "Mónica Palomino",
        phone: "987654333",
        address: "Jr. Junín 707, Chorrillos",
        notes: "Compra fragancias infantiles Naturé",
      },
      {
        name: "Natalia Benitez",
        phone: "987654334",
        address: "Av. Angamos 909, Surquillo",
        notes: "Prefiere catálogo digital Avon",
      },
      {
        name: "Olga Medina",
        phone: "987654335",
        address: "Calle Arica 808, Breña",
        notes: "Le gustan cremas hidratantes Ekos",
      },
      {
        name: "Patricia Ramos",
        phone: "987654336",
        address: "Jr. Carabaya 910, Cercado",
        notes: "Familiar de la consultora",
      },
      {
        name: "Raquel Farfán",
        phone: "987654337",
        address: "Av. Primavera 1200, Surco",
        notes: "Compra regalos para su oficina",
      },
      {
        name: "Silvia Guzmán",
        phone: "987654338",
        address: "Calle Tarapacá 111, Callao",
        notes: "Compra productos de cuidado del cabello Lumina",
      },
      {
        name: "Teresa Delgado",
        phone: "987654339",
        address: "Jr. Ica 222, Cercado de Lima",
        notes: "Paga con Plin",
      },
      {
        name: "Ursula Miranda",
        phone: "987654340",
        address: "Av. Universitaria 3400, Los Olivos",
        notes: "Le gusta Natura Chronos para el rostro",
      },
      {
        name: "Valeria Alva",
        phone: "987654341",
        address: "Calle Los Cedros 333, San Isidro",
        notes: "Compra perfumes de alta gama Una",
      },
      {
        name: "Wendy Cáceres",
        phone: "987654342",
        address: "Jr. Tacna 444, Barranco",
        notes: "Pide Avon Anew Clinical",
      },
      {
        name: "Ximena Vega",
        phone: "987654343",
        address: "Av. Pershing 600, Jesús María",
        notes: "Prefiere retirar los productos en tienda",
      },
      {
        name: "Yolanda Salas",
        phone: "987654344",
        address: "Calle Schell 555, Miraflores",
        notes: "Le gustan fragancias Kaiak",
      },
      {
        name: "Zoila Ortiz",
        phone: "987654345",
        address: "Jr. Lampa 666, Cercado",
        notes: "Prefiere contacto por WhatsApp",
      },
    ];

    for (const client of mockClientsData) {
      const existing = await prisma.client.findFirst({
        where: { name: client.name },
      });

      if (existing) {
        await prisma.client.update({
          where: { id: existing.id },
          data: {
            phone: client.phone,
            address: client.address,
            notes: client.notes,
          },
        });
      } else {
        await prisma.client.create({
          data: {
            name: client.name,
            phone: client.phone,
            address: client.address,
            notes: client.notes,
            createdById: defaultAdmin.id,
          },
        });
      }
    }

    revalidatePath("/admin/clientes");
    revalidatePath("/admin/usuarios");

    return { success: true, message: "Datos simulados creados con éxito." };
  } catch (error) {
    console.error("Error al sembrar datos de simulación:", error);
    return { success: false, message: "Error interno al sembrar datos." };
  }
}

export async function regenerateClientShareToken(clientId: number) {
  try {
    const { auth } = await import("@/lib/auth");
    const session = await auth();

    if (session?.user?.role !== "ADMIN") {
      return {
        success: false,
        message:
          "No autorizado. Solo los administradores pueden realizar esta acción.",
      };
    }

    const { randomBytes } = await import("crypto");
    const newToken = "c" + randomBytes(12).toString("hex");

    await prisma.client.update({
      where: { id: clientId },
      data: { shareToken: newToken },
    });

    revalidatePath("/admin/clientes");
    return {
      success: true,
      message: "Enlace del cliente regenerado con éxito.",
    };
  } catch (error) {
    console.error("Error al regenerar enlace del cliente:", error);
    return { success: false, message: "No se pudo regenerar el enlace." };
  }
}
