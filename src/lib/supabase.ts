// 轮询式实时更新（替代 Supabase Realtime，SQLite 兼容）
// 客户端通过 setInterval 轮询 API 获取最新数据

export const POLL_INTERVALS = {
  WORKOUT_SETS: 2000,       // 训练组更新：2 秒
  TEAM_FEED: 5000,          // 团队动态：5 秒
  NOTIFICATIONS: 10000,     // 通知：10 秒
} as const;

export const REALTIME_CHANNELS = {
  WORKOUT_SET: "workout-sets",
  TEAM_FEED: (teamId: string) => `team-feed-${teamId}`,
  USER_NOTIFICATIONS: (userId: string) => `user-notifications-${userId}`,
} as const;
