import type { NextAuthConfig } from "next-auth";

export const authConfig: NextAuthConfig = {
  providers: [],
  pages: {
    signIn: "/login",
  },
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
        token.role = (user as { role?: string }).role ?? "customer";
        token.phone = (user as { phone?: string }).phone ?? "";
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
        session.user.role = (token.role as "admin" | "customer") ?? "customer";
        session.user.phone = (token.phone as string) ?? "";
      }
      return session;
    },
  },
  trustHost: true,
};
