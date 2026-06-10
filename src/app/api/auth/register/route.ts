import { NextResponse } from "next/server";
import { registerSchema } from "@/lib/validations";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
    }

    const { email, password, name } = parsed.data;
    const normalizedEmail = email.toLowerCase().trim();

    const { PrismaClient } = await import("@prisma/client");
    const bcrypt = await import("bcryptjs").then((m: any) => m.default || m);
    const prisma = new PrismaClient();

    try {
      const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
      if (existing) {
        return NextResponse.json({ error: "该邮箱已被注册" }, { status: 409 });
      }

      const passwordHash = await bcrypt.hash(password, 12);
      const user = await prisma.user.create({
        data: { email: normalizedEmail, passwordHash, name },
      });

      return NextResponse.json(
        { id: user.id, email: user.email, name: user.name, createdAt: user.createdAt },
        { status: 201 }
      );
    } finally {
      await prisma.$disconnect();
    }
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json({ error: "注册失败" }, { status: 500 });
  }
}
