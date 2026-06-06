import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ProfileClient } from "./client";
import { redirect } from "next/navigation";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const userId = session.user.id;

  let user;
  try {
    user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        bio: true,
        bodyWeight: true,
        createdAt: true,
      },
    });
  } catch {
    // Supabase 超时，用 session 里的基本信息兜底
    user = null;
  }

  if (!user) {
    // 用 session 基本信息渲染
    user = {
      id: userId,
      name: session.user.name || "用户",
      email: session.user.email || "",
      avatar: session.user.image || null,
      bio: null,
      bodyWeight: null,
      createdAt: new Date().toISOString(),
    };
  }

  // 获取未读通知数
  let unreadCount = 0;
  try {
    unreadCount = await prisma.notification.count({
      where: { userId, read: false },
    });
  } catch { /* ignore */ }

  return (
    <ProfileClient
      user={JSON.parse(JSON.stringify(user))}
      initialUnreadCount={unreadCount}
    />
  );
}
