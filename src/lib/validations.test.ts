import { describe, it, expect } from "vitest";
import {
  passwordSchema,
  emailSchema,
  registerSchema,
  loginSchema,
  createTeamSchema,
  createPlanSchema,
  startSessionSchema,
  completeSetSchema,
} from "./validations";

describe("passwordSchema", () => {
  it("should validate valid password", () => {
    expect(passwordSchema.safeParse("Password123").success).toBe(true);
    expect(passwordSchema.safeParse("MyPass99").success).toBe(true);
  });

  it("should reject passwords without uppercase", () => {
    const result = passwordSchema.safeParse("password123");
    expect(result.success).toBe(false);
    expect(result.error?.errors[0].message).toBe("密码必须包含至少一个大写字母");
  });

  it("should reject passwords without lowercase", () => {
    const result = passwordSchema.safeParse("PASSWORD123");
    expect(result.success).toBe(false);
    expect(result.error?.errors[0].message).toBe("密码必须包含至少一个小写字母");
  });

  it("should reject passwords without numbers", () => {
    const result = passwordSchema.safeParse("Password");
    expect(result.success).toBe(false);
    expect(result.error?.errors[0].message).toBe("密码必须包含至少一个数字");
  });

  it("should reject short passwords", () => {
    const result = passwordSchema.safeParse("Pass1");
    expect(result.success).toBe(false);
    expect(result.error?.errors[0].message).toBe("密码至少需要 8 个字符");
  });
});

describe("emailSchema", () => {
  it("should validate valid email", () => {
    expect(emailSchema.safeParse("test@example.com").success).toBe(true);
    expect(emailSchema.safeParse("user.name@domain.co").success).toBe(true);
  });

  it("should reject invalid email", () => {
    const result = emailSchema.safeParse("invalid-email");
    expect(result.success).toBe(false);
    expect(result.error?.errors[0].message).toBe("请输入有效的邮箱地址");
  });
});

describe("registerSchema", () => {
  it("should validate valid registration data", () => {
    const result = registerSchema.safeParse({
      email: "test@example.com",
      password: "Password123",
      name: "张三",
    });
    expect(result.success).toBe(true);
  });

  it("should reject invalid name", () => {
    const result = registerSchema.safeParse({
      email: "test@example.com",
      password: "Password123",
      name: "A",
    });
    expect(result.success).toBe(false);
    expect(result.error?.errors[0].message).toBe("姓名至少需要 2 个字符");
  });
});

describe("loginSchema", () => {
  it("should validate valid login data", () => {
    expect(loginSchema.safeParse({ email: "test@example.com", password: "any" }).success).toBe(true);
  });

  it("should reject empty password", () => {
    const result = loginSchema.safeParse({ email: "test@example.com", password: "" });
    expect(result.success).toBe(false);
    expect(result.error?.errors[0].message).toBe("请输入密码");
  });
});

describe("createTeamSchema", () => {
  it("should validate valid team data", () => {
    expect(createTeamSchema.safeParse({ name: "健身小队" }).success).toBe(true);
    expect(createTeamSchema.safeParse({ name: "Team", description: "description" }).success).toBe(true);
  });

  it("should reject short team name", () => {
    const result = createTeamSchema.safeParse({ name: "A" });
    expect(result.success).toBe(false);
    expect(result.error?.errors[0].message).toBe("团队名称至少 2 个字符");
  });
});

describe("createPlanSchema", () => {
  it("should validate valid plan data", () => {
    const result = createPlanSchema.safeParse({
      name: "增肌计划",
      days: [
        {
          dayName: "周一",
          sortOrder: 0,
          exercises: [
            {
              exerciseId: "ex1",
              sets: 3,
              reps: 10,
              weight: 20,
              restTime: 60,
              sortOrder: 0,
            },
          ],
        },
      ],
    });
    expect(result.success).toBe(true);
  });

  it("should reject plan without days", () => {
    const result = createPlanSchema.safeParse({ name: "Plan", days: [] });
    expect(result.success).toBe(false);
    expect(result.error?.errors[0].message).toBe("至少需要一个训练日");
  });

  it("should reject plan without name", () => {
    const result = createPlanSchema.safeParse({ name: "", days: [{ dayName: "Day 1", sortOrder: 0, exercises: [] }] });
    expect(result.success).toBe(false);
    expect(result.error?.errors[0].message).toBe("计划名称不能为空");
  });
});

describe("startSessionSchema", () => {
  it("should validate with planId", () => {
    expect(startSessionSchema.safeParse({ planId: "plan1" }).success).toBe(true);
  });

  it("should validate with exercises", () => {
    const result = startSessionSchema.safeParse({
      exercises: [
        { exerciseId: "ex1", sets: 3, reps: 10, weight: 20 },
      ],
    });
    expect(result.success).toBe(true);
  });
});

describe("completeSetSchema", () => {
  it("should validate valid set completion", () => {
    const result = completeSetSchema.safeParse({
      exerciseId: "ex1",
      setNumber: 1,
      reps: 10,
      weight: 20,
    });
    expect(result.success).toBe(true);
  });

  it("should reject negative reps", () => {
    const result = completeSetSchema.safeParse({
      exerciseId: "ex1",
      setNumber: 1,
      reps: -1,
      weight: 20,
    });
    expect(result.success).toBe(false);
    expect(result.error?.errors[0].message).toBe("次数不能为负");
  });

  it("should reject negative weight", () => {
    const result = completeSetSchema.safeParse({
      exerciseId: "ex1",
      setNumber: 1,
      reps: 10,
      weight: -5,
    });
    expect(result.success).toBe(false);
    expect(result.error?.errors[0].message).toBe("重量不能为负 (KG)");
  });
});
