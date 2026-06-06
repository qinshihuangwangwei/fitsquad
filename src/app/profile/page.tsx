import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ProfileClient } from "./client";
import { redirect } from "next/navigation";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
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

  if (!user) redirect("/login");

  // 获取未读通知数
  const unreadCount = await prisma.notification.count({
    where: { userId: session.user.id, read: false },
  });

  return (
    <ProfileClient
      user={JSON.parse(JSON.stringify(user))}
      initialUnreadCount={unreadCount}
    />
  );
}
