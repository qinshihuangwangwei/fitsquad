import { PrismaClient, ExerciseCategory } from "@prisma/client";

const prisma = new PrismaClient();

const presetExercises = [
  { name: "杠铃卧推", category: "STRENGTH" as const, muscleGroup: "胸部", description: "经典胸部训练动作" },
  { name: "哑铃卧推", category: "STRENGTH" as const, muscleGroup: "胸部", description: "哑铃卧推可增加活动范围" },
  { name: "上斜杠铃卧推", category: "STRENGTH" as const, muscleGroup: "胸部", description: "针对上胸部" },
  { name: "哑铃飞鸟", category: "STRENGTH" as const, muscleGroup: "胸部", description: "孤立训练胸大肌" },
  { name: "绳索夹胸", category: "STRENGTH" as const, muscleGroup: "胸部", description: "龙门架夹胸" },
  { name: "俯卧撑", category: "BODYWEIGHT" as const, muscleGroup: "胸部", description: "自重胸部训练" },
  { name: "引体向上", category: "BODYWEIGHT" as const, muscleGroup: "背部", description: "自重背部训练黄金动作" },
  { name: "杠铃划船", category: "STRENGTH" as const, muscleGroup: "背部", description: "锻炼背阔肌" },
  { name: "哑铃单臂划船", category: "STRENGTH" as const, muscleGroup: "背部", description: "单侧背部训练" },
  { name: "高位下拉", category: "STRENGTH" as const, muscleGroup: "背部", description: "背阔肌宽度" },
  { name: "坐姿划船", category: "STRENGTH" as const, muscleGroup: "背部", description: "背部厚度" },
  { name: "硬拉", category: "STRENGTH" as const, muscleGroup: "背部", description: "全身复合动作" },
  { name: "杠铃深蹲", category: "STRENGTH" as const, muscleGroup: "腿部", description: "下肢训练之王" },
  { name: "腿举", category: "STRENGTH" as const, muscleGroup: "腿部", description: "大重量腿部训练" },
  { name: "罗马尼亚硬拉", category: "STRENGTH" as const, muscleGroup: "腿部", description: "腿后链训练" },
  { name: "腿弯举", category: "STRENGTH" as const, muscleGroup: "腿部", description: "孤立股二头肌" },
  { name: "腿伸展", category: "STRENGTH" as const, muscleGroup: "腿部", description: "孤立股四头肌" },
  { name: "保加利亚分腿蹲", category: "STRENGTH" as const, muscleGroup: "腿部", description: "单侧腿部训练" },
  { name: "负重箭步蹲", category: "STRENGTH" as const, muscleGroup: "腿部", description: "功能性腿部训练" },
  { name: "杠铃推举", category: "STRENGTH" as const, muscleGroup: "肩部", description: "肩部复合推举" },
  { name: "哑铃侧平举", category: "STRENGTH" as const, muscleGroup: "肩部", description: "三角肌中束" },
  { name: "哑铃前平举", category: "STRENGTH" as const, muscleGroup: "肩部", description: "三角肌前束" },
  { name: "俯身飞鸟", category: "STRENGTH" as const, muscleGroup: "肩部", description: "三角肌后束" },
  { name: "杠铃弯举", category: "STRENGTH" as const, muscleGroup: "手臂", description: "肱二头肌" },
  { name: "锤式弯举", category: "STRENGTH" as const, muscleGroup: "手臂", description: "肱桡肌" },
  { name: "三头臂屈伸", category: "BODYWEIGHT" as const, muscleGroup: "手臂", description: "自重肱三头肌" },
  { name: "绳索下压", category: "STRENGTH" as const, muscleGroup: "手臂", description: "龙门架肱三头肌" },
  { name: "窄距卧推", category: "STRENGTH" as const, muscleGroup: "手臂", description: "肱三头肌推举" },
  { name: "平板支撑", category: "BODYWEIGHT" as const, muscleGroup: "核心", description: "核心稳定性" },
  { name: "卷腹", category: "BODYWEIGHT" as const, muscleGroup: "核心", description: "腹直肌" },
  { name: "悬垂举腿", category: "BODYWEIGHT" as const, muscleGroup: "核心", description: "进阶腹肌" },
  { name: "俄罗斯转体", category: "BODYWEIGHT" as const, muscleGroup: "核心", description: "腹斜肌" },
  { name: "跑步", category: "CARDIO" as const, muscleGroup: "全身", description: "经典有氧" },
  { name: "跳绳", category: "CARDIO" as const, muscleGroup: "全身", description: "高效有氧" },
  { name: "划船机", category: "CARDIO" as const, muscleGroup: "全身", description: "全身性有氧" },
  { name: "动感单车", category: "CARDIO" as const, muscleGroup: "腿部", description: "室内有氧骑行" },
  { name: "波比跳", category: "CARDIO" as const, muscleGroup: "全身", description: "高强度全身有氧" },
];

const templatePlans = [
  {
    name: "推拉腿三分化 (PPL)",
    description: "经典推/拉/腿三分化，适合中高级训练者",
    days: [
      { dayName: "推日 (胸+肩+三头)", exercises: ["杠铃卧推", "上斜杠铃卧推", "哑铃侧平举", "杠铃推举", "绳索下压", "绳索夹胸"] },
      { dayName: "拉日 (背+二头)", exercises: ["硬拉", "引体向上", "杠铃划船", "高位下拉", "杠铃弯举", "锤式弯举"] },
      { dayName: "腿日 (腿+核心)", exercises: ["杠铃深蹲", "罗马尼亚硬拉", "腿举", "腿弯举", "保加利亚分腿蹲", "卷腹"] },
    ],
  },
  {
    name: "上下肢分化",
    description: "上肢/下肢交替训练，适合初级到中级",
    days: [
      { dayName: "上肢日 A", exercises: ["杠铃卧推", "杠铃划船", "哑铃侧平举", "杠铃弯举", "三头臂屈伸"] },
      { dayName: "下肢日 A", exercises: ["杠铃深蹲", "罗马尼亚硬拉", "腿弯举", "平板支撑"] },
      { dayName: "上肢日 B", exercises: ["哑铃卧推", "高位下拉", "杠铃推举", "锤式弯举", "绳索下压"] },
      { dayName: "下肢日 B", exercises: ["腿举", "负重箭步蹲", "腿伸展", "悬垂举腿"] },
    ],
  },
  {
    name: "全身训练 (新手入门)",
    description: "每次训练覆盖全身，适合初学者每周3次",
    days: [
      { dayName: "全身训练 A", exercises: ["杠铃深蹲", "杠铃卧推", "杠铃划船", "杠铃推举", "平板支撑"] },
      { dayName: "全身训练 B", exercises: ["硬拉", "哑铃卧推", "引体向上", "哑铃侧平举", "卷腹"] },
      { dayName: "全身训练 C", exercises: ["腿举", "上斜杠铃卧推", "坐姿划船", "杠铃弯举", "绳索下压"] },
    ],
  },
];

async function main() {
  console.log("🌱 Seeding...");

  await prisma.$transaction(async (tx) => {
    await tx.$executeRawUnsafe("SET LOCAL statement_timeout = '120000'");

    // 清空
    console.log("  Cleaning...");
    await tx.$executeRawUnsafe(`TRUNCATE TABLE user_achievements, notifications, personal_records, workout_sets, workout_sessions, plan_sets, plan_exercises, plan_days, plans, team_members, teams, exercises, users CASCADE`);

    // 系统用户
    const su = await tx.user.create({ data: { email: "system@fitsquad.local", passwordHash: "$2a$12$system", name: "FitSquad" } });

    // 动作
    console.log("  Exercises...");
    const emap: Record<string, string> = {};
    for (const ex of presetExercises) {
      const r = await tx.exercise.create({ data: ex });
      emap[r.name] = r.id;
    }
    console.log(`    ${presetExercises.length} done`);

    // 模板
    console.log("  Templates...");
    for (const plan of templatePlans) {
      const p = await tx.plan.create({ data: { name: plan.name, description: plan.description, isTemplate: true, createdById: su.id } });
      for (let i = 0; i < plan.days.length; i++) {
        const d = plan.days[i];
        const pd = await tx.planDay.create({ data: { planId: p.id, dayName: d.dayName, sortOrder: i } });
        for (let j = 0; j < d.exercises.length; j++) {
          const eid = emap[d.exercises[j]];
          if (eid) {
            await tx.planExercise.create({ data: { planDayId: pd.id, exerciseId: eid, sets: 3, reps: 10, weight: 20, restTime: 60, sortOrder: j, planSets: { create: [{ setNumber: 1, targetReps: 10, targetWeight: 20 }, { setNumber: 2, targetReps: 10, targetWeight: 22.5 }, { setNumber: 3, targetReps: 8, targetWeight: 25 }] } } });
          }
        }
      }
    }
    console.log(`    ${templatePlans.length} done`);
  }, { timeout: 180000 });

  console.log("✅ Done!");
}

main().catch((e) => { console.error("❌", e); process.exit(1); }).finally(() => prisma.$disconnect());
