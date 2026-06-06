import { z } from "zod";

// ─── 密码规则 ───
// 最少 8 个字符，必须包含大写字母、小写字母和数字
export const passwordSchema = z
  .string()
  .min(8, "密码至少需要 8 个字符")
  .regex(/[a-z]/, "密码必须包含至少一个小写字母")
  .regex(/[A-Z]/, "密码必须包含至少一个大写字母")
  .regex(/[0-9]/, "密码必须包含至少一个数字");

// ─── 邮箱格式 ───
export const emailSchema = z
  .string()
  .email("请输入有效的邮箱地址")
  .max(255, "邮箱地址不能超过 255 个字符");

// ─── 注册 ───
export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  name: z
    .string()
    .min(2, "姓名至少需要 2 个字符")
    .max(50, "姓名不能超过 50 个字符")
    .regex(/^[\u4e00-\u9fa5a-zA-Z0-9_\-\s]+$/, "姓名只能包含中文、英文、数字、下划线、连字符和空格"),
});

// ─── 登录 ───
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "请输入密码"),
});

// ─── 创建团队 ───
export const createTeamSchema = z.object({
  name: z.string().min(2, "团队名称至少 2 个字符").max(50, "团队名称不能超过 50 个字符"),
  description: z.string().max(500).optional(),
  avatar: z.string().url().optional(),
});

// ─── 邀请成员 ───
export const inviteMemberSchema = z.object({
  userId: z.string().min(1, "请提供用户 ID"),
});

// ─── 创建计划 ───
export const planSetSchema = z.object({
  setNumber: z.number().int().min(1),
  targetReps: z.number().int().min(1, "次数至少为 1").max(100).default(10),
  targetWeight: z.number().min(0, "重量不能为负 (KG)").max(999).default(20),
});

export const planExerciseSchema = z.object({
  exerciseId: z.string(),
  sets: z.number().int().min(1, "组数至少为 1").max(20),
  reps: z.number().int().min(1, "次数至少为 1").max(100).default(10),
  weight: z.number().min(0, "重量不能为负 (KG)").max(999).default(20),
  restTime: z.number().int().min(0).max(600).default(60),
  notes: z.string().max(200).optional(),
  sortOrder: z.number().int().min(0),
  planSets: z.array(planSetSchema).optional(),
});

export const planDaySchema = z.object({
  dayName: z.string().min(1).max(50),
  sortOrder: z.number().int().min(0),
  exercises: z.array(planExerciseSchema),
});

export const createPlanSchema = z.object({
  name: z.string().min(1, "计划名称不能为空").max(100),
  description: z.string().max(500).optional(),
  teamId: z.string().optional(),
  days: z.array(planDaySchema).min(1, "至少需要一个训练日"),
});

// ─── 开始训练 ───
export const startSessionSchema = z.object({
  planId: z.string().optional(),
  dayId: z.string().optional(), // 只练某一天
  teamId: z.string().optional(),
  exercises: z
    .array(
      z.object({
        exerciseId: z.string(),
        planExerciseId: z.string().optional(),
        sets: z.number().int().min(1).max(20),
        reps: z.number().int().min(1).max(100),
        weight: z.number().min(0).max(999),
      })
    )
    .optional(),
});

// ─── 完成一组 ───
export const completeSetSchema = z.object({
  exerciseId: z.string(),
  planExerciseId: z.string().optional(),
  setNumber: z.number().int().min(1),
  reps: z.number().int().min(0, "次数不能为负").max(100),
  weight: z.number().min(0, "重量不能为负 (KG)").max(999),
  notes: z.string().max(200).optional(),

  // 是否推送给队友
  broadcast: z.boolean().default(true),
});

// ─── 个人纪录 ───
export const createRecordSchema = z.object({
  exerciseId: z.string(),
  weight: z.number().min(0).max(999),
  reps: z.number().int().min(0).max(100),
});

// ─── 类型导出 ───
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateTeamInput = z.infer<typeof createTeamSchema>;
export type CreatePlanInput = z.infer<typeof createPlanSchema>;
export type StartSessionInput = z.infer<typeof startSessionSchema>;
export type CompleteSetInput = z.infer<typeof completeSetSchema>;
export type CreateRecordInput = z.infer<typeof createRecordSchema>;
