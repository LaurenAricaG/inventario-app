import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { authConfig } from "./auth.config";
import { verifyUserCredentials } from "./db-auth";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createHash } from "crypto";

export const { auth, signIn, signOut, handlers } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        usernameOrEmail: { label: "Usuario o Correo", type: "text" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials) {
        const parsedCredentials = z
          .object({
            usernameOrEmail: z.string().min(1),
            password: z.string().min(6),
          })
          .safeParse(credentials);

        if (!parsedCredentials.success) {
          return null;
        }

        const { usernameOrEmail, password } = parsedCredentials.data;
        const user = await verifyUserCredentials(usernameOrEmail, password);

        if (!user) {
          return null;
        }

        return user;
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user, trigger, session }) {
      // 1. Ejecutar el callback JWT original (copia propiedades iniciales en el login)
      let updatedToken = token;
      if (authConfig.callbacks?.jwt) {
        updatedToken = await authConfig.callbacks.jwt({ token, user, trigger, session });
      }

      // 2. Si es una sesión existente y no es la fase de login (user está indefinido)
      if (updatedToken?.id && !user) {
        const isEdge = process.env.NEXT_RUNTIME === "edge";
        
        // Solo realizamos la validación contra la base de datos si estamos fuera de Edge (Middleware)
        if (!isEdge) {
          try {
            const dbUser = await prisma.user.findUnique({
              where: { id: Number(updatedToken.id) },
              select: { passwordHash: true, deletedAt: true },
            });

            // Si el usuario fue eliminado, suspendido, o no existe
            if (!dbUser || dbUser.deletedAt) {
              console.log(`Sesión invalidada para usuario ID ${updatedToken.id}: Usuario inactivo o eliminado.`);
              return null;
            }

            // Validar la versión de la contraseña
            const currentPasswordVersion = createHash("sha256")
              .update(dbUser.passwordHash)
              .digest("hex");

            if (currentPasswordVersion !== updatedToken.passwordVersion) {
              console.log(`Sesión invalidada para usuario ID ${updatedToken.id}: Contraseña modificada.`);
              return null; // Devuelve null para forzar logout
            }
          } catch (error) {
            console.error("Error en validación en caliente de credenciales:", error);
            // Si hay un error de conexión temporal a la BD, permitimos el token existente por resiliencia.
          }
        }
      }

      return updatedToken;
    },
  },
});
