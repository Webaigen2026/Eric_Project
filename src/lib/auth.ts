import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";
import { authConfig } from "./auth.config";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        role: { label: "Role", type: "text" },
      },
      async authorize(credentials) {
        const email = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;
        const role = (credentials?.role as string | undefined) || "customer";
        if (!email || !password) return null;

        if (role === "admin") {
          const user = await prisma.adminUser.findUnique({ where: { email } });
          if (!user) return null;
          const valid = await bcrypt.compare(password, user.passwordHash);
          if (!valid) return null;
          return {
            id: user.id,
            email: user.email,
            name: user.name ?? "Admin",
            role: "admin" as const,
            phone: "",
          };
        }

        const customer = await prisma.customer.findUnique({ where: { email } });
        if (!customer) return null;
        if (!customer.emailVerified) return null;
        const valid = await bcrypt.compare(password, customer.passwordHash);
        if (!valid) return null;
        return {
          id: customer.id,
          email: customer.email,
          name: customer.name,
          role: "customer" as const,
          phone: customer.phone,
        };
      },
    }),
  ],
});
