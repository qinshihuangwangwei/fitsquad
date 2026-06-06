import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

// 懒加载 prisma，避免模块初始化时连接数据库失败导致整个应用崩溃
async function getPrisma() {
  const { prisma } = await import("@/lib/prisma");
  return prisma;
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "邮箱", type: "email" },
        password: { label: "密码", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("请输入邮箱和密码");
        }

        const email = (credentials.email as string).toLowerCase().trim();
        const password = credentials.password as string;

        const prisma = await getPrisma();
        const user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user) {
          throw new Error("邮箱或密码错误");
        }

        const isValid = await bcrypt.compare(password, user.passwordHash);
        if (!isValid) {
          throw new Error("邮箱或密码错误");
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
        };
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user) {
        token.id = user.id;
      }
      if (trigger === "update" || !token.picture) {
        try {
          const prisma = await getPrisma();
          const dbUser = await prisma.user.findUnique({
            where: { id: token.id as string },
            select: { avatar: true },
          });
          if (dbUser?.avatar) token.picture = dbUser.avatar;
        } catch { /* 静默 */ }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.image = token.picture as string | null;
      }
      return session;
    },
  },
});
