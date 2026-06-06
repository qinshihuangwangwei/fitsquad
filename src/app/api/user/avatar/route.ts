import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

const MAX_SIZE = 2 * 1024 * 1024; // 2MB
const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif"];

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("avatar") as File | null;

    if (!file) {
      return NextResponse.json({ error: "请选择图片" }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "仅支持 PNG / JPEG / WebP / GIF 格式" },
        { status: 400 }
      );
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "图片不能超过 2MB" }, { status: 400 });
    }

    const ext = file.type.split("/")[1] || "png";
    const filename = `${session.user.id}-${Date.now()}.${ext}`;
    const avatarDir = path.join(process.cwd(), "public", "avatars");

    await mkdir(avatarDir, { recursive: true });

    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(path.join(avatarDir, filename), buffer);

    const avatarPath = `/avatars/${filename}`;

    // 更新用户头像
    await prisma.user.update({
      where: { id: session.user.id },
      data: { avatar: avatarPath },
    });

    return NextResponse.json({ data: { avatar: avatarPath } });
  } catch {
    return NextResponse.json({ error: "上传失败" }, { status: 500 });
  }
}
