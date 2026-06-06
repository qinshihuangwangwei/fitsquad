import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// 格式化重量 (KG)
export function formatWeight(kg: number): string {
  if (kg === 0) return "—";
  return `${kg.toFixed(1)} KG`;
}

// 格式化日期
export function formatDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

// 相对时间
export function timeAgo(date: Date | string): string {
  const now = new Date();
  const d = new Date(date);
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHour = Math.floor(diffMs / 3600000);
  const diffDay = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return "刚刚";
  if (diffMin < 60) return `${diffMin} 分钟前`;
  if (diffHour < 24) return `${diffHour} 小时前`;
  if (diffDay < 30) return `${diffDay} 天前`;
  return formatDate(date);
}

// 计算训练容量 (总重量 KG)
export function calculateVolume(
  sets: { reps: number; weight: number }[]
): number {
  return sets.reduce((total, set) => total + set.reps * set.weight, 0);
}

// 获取成就信息
export function getAchievementInfo(type: string): {
  title: string;
  description: string;
  icon: string;
} {
  const map: Record<string, { title: string; description: string; icon: string }> = {
    STREAK_3: { title: "初露锋芒", description: "连续 3 天打卡训练", icon: "🔥" },
    STREAK_7: { title: "坚持不懈", description: "连续 7 天打卡训练", icon: "💪" },
    STREAK_30: { title: "钢铁意志", description: "连续 30 天打卡训练", icon: "🏆" },
    VOLUME_1000: { title: "千斤之力", description: "单次训练容量突破 1,000KG", icon: "⚡" },
    VOLUME_5000: { title: "万斤巨兽", description: "单次训练容量突破 5,000KG", icon: "🦍" },
    VOLUME_10000: { title: "人间起重机", description: "单次训练容量突破 10,000KG", icon: "🏗️" },
    FIRST_RECORD: { title: "纪录缔造者", description: "创下首个个人纪录", icon: "📜" },
    TEAM_PLAYER: { title: "团队玩家", description: "首次加入健身团队", icon: "🤝" },
    PLAN_CREATOR: { title: "训练设计师", description: "创建首个训练计划", icon: "📋" },
  };
  return map[type] ?? { title: type, description: "", icon: "🎖️" };
}
