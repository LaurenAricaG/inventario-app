import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { authConfig } from "./auth.config";
import { verifyUserCredentials } from "./db-auth";
import { z } from "zod";

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
});
