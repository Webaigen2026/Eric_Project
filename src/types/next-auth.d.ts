import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    role?: "admin" | "customer";
    phone?: string;
  }

  interface Session {
    user: {
      id: string;
      role: "admin" | "customer";
      phone: string;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: "admin" | "customer";
    phone?: string;
  }
}
