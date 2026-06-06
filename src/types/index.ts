export type {
  User, Team, TeamMember, Exercise, Plan, PlanDay, PlanExercise,
  WorkoutSession, WorkoutSet, PersonalRecord, Notification, UserAchievement
} from "@prisma/client";

export {
  MemberRole, InviteStatus, ExerciseCategory, SessionStatus,
  NotificationType, AchievementType
} from "@prisma/client";

// ─── 扩展用户类型 ───
export interface UserWithProfile {
  id: string;
  email: string;
  name: string;
  avatar: string | null;
  bio: string | null;
  bodyWeight: number | null;
  createdAt: Date;
  achievements: { achievement: string; unlockedAt: Date }[];
  records: { exerciseId: string; exercise: { name: string }; weight: number; reps: number }[];
  _count?: { sessions: number };
}

// ─── 团队扩展类型 ───
export interface TeamWithMembers {
  id: string;
  name: string;
  description: string | null;
  avatar: string | null;
  captainId: string;
  captain: { id: string; name: string; avatar: string | null };
  members: (TeamMember & { user: { id: string; name: string; avatar: string | null } })[];
  _count: { members: number };
  createdAt: Date;
}

// ─── 计划扩展类型 ───
export interface PlanWithDays {
  id: string;
  name: string;
  description: string | null;
  isTemplate: boolean;
  createdById: string;
  teamId: string | null;
  days: (PlanDay & {
    exercises: (PlanExercise & {
      exercise: { id: string; name: string; category: string; muscleGroup: string };
    })[];
  })[];
  team?: { id: string; name: string } | null;
  createdAt: Date;
}

// ─── 训练会话扩展 ───
export interface SessionWithSets {
  id: string;
  userId: string;
  planId: string | null;
  teamId: string | null;
  status: string;
  startedAt: Date;
  endedAt: Date | null;
  sets: (WorkoutSet & {
    exercise: { id: string; name: string; muscleGroup: string };
  })[];
  plan?: { id: string; name: string } | null;
  team?: { id: string; name: string } | null;
}

// ─── 排行榜条目 ───
export interface LeaderboardEntry {
  userId: string;
  userName: string;
  userAvatar: string | null;
  weight: number;
  reps: number;
  achievedAt: Date;
}

// ─── 动态流条目 ───
export interface FeedItem {
  id: string;
  type: "workout_completed" | "record_broken" | "team_joined" | "achievement_unlocked";
  message: string;
  userName: string;
  userAvatar: string | null;
  createdAt: Date;
  metadata?: Record<string, unknown>;
}

// ─── 成就 ───
export interface AchievementInfo {
  type: string;
  title: string;
  description: string;
  icon: string;
}

// ─── API 响应 ───
export interface ApiResponse<T = unknown> {
  error?: string;
  data?: T;
}

// ─── 训练统计 ───
export interface TrainingStats {
  totalSessions: number;
  totalSets: number;
  totalVolume: number;
  streakDays: number;
  currentWeekActivity: number[];
}
