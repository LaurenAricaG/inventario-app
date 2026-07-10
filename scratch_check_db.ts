import { prisma } from "./src/lib/prisma";

async function main() {
  try {
    const userCount = await prisma.user.count();
    const clientCount = await prisma.client.count();
    console.log("Database connection successful!");
    console.log("Users in database:", userCount);
    console.log("Clients in database:", clientCount);
  } catch (error) {
    console.error("Database connection failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
