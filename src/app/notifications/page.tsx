import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NotificationList } from "./list";
import { redirect } from "next/navigation";

export default async function NotificationsPage({
  searchParams: searchParamsPromise,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const searchParams = await searchParamsPromise;
  const filterType = searchParams.type || "";

  const where: Record<string, unknown> = { userId: session.user.id };
  if (filterType && ["TEAM_INVITE", "TEAM_JOINED", "RECORD_BROKEN", "WORKOUT_COMPLETED", "ACHIEVEMENT", "SYSTEM"].includes(filterType)) {
    where.type = filterType;
  }

  const [initialNotifications, unreadCount, totalCount] = await Promise.all([
    prisma.notification.findMany({
      where,
      orderBy: [{ read: "asc" }, { createdAt: "desc" }],
      take: 20,
    }),
    prisma.notification.count({ where: { userId: session.user.id, read: false } }),
    prisma.notification.count({ where }),
  ]);

  return (
    <NotificationList
      initialData={JSON.parse(JSON.stringify(initialNotifications))}
      initialUnreadCount={unreadCount}
      initialTotalCount={totalCount}
      filterType={filterType}
    />
  );
}
