import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "邮箱", type: "email" },
        password: { label: "密码", type: "password" },
      },
      async authorize(credentials) {
        const email = (credentials.email as string).toLowerCase().trim();
        const password = credentials.password as string;

        const { PrismaClient } = await import("@prisma/client");
        const bcrypt = await import("bcryptjs").then((m: any) => m.default || m);
        const prisma = new PrismaClient();

        try {
          const user = await prisma.user.findUnique({ where: { email } });
          if (!user) throw new Error("邮箱或密码错误");

          const valid = await bcrypt.compare(password, user.passwordHash);
          if (!valid) throw new Error("邮箱或密码错误");

          return { id: user.id, email: user.email, name: user.name };
        } finally {
          await prisma.$disconnect();
        }
      },
    }),
  ],
  pages: { signIn: "/login" },
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  callbacks: {
    async jwt({ token, user }) {
      if (user) { token.id = user.id; token.email = user.email; token.name = user.name; }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
      }
      return session;
    },
  },
});
