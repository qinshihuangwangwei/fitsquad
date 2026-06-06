import { PrismaClient, ExerciseCategory } from "@prisma/client";

const prisma = new PrismaClient();

const presetExercises = [
  // ─── 胸部 ───
  { name: "杠铃卧推", category: "STRENGTH" as const, muscleGroup: "胸部", description: "经典胸部训练动作，主要锻炼胸大肌" },
  { name: "哑铃卧推", category: "STRENGTH" as const, muscleGroup: "胸部", description: "哑铃卧推可增加活动范围" },
  { name: "上斜杠铃卧推", category: "STRENGTH" as const, muscleGroup: "胸部", description: "针对上胸部的推举动作" },
  { name: "哑铃飞鸟", category: "STRENGTH" as const, muscleGroup: "胸部", description: "孤立训练胸大肌的拉伸动作" },
  { name: "绳索夹胸", category: "STRENGTH" as const, muscleGroup: "胸部", description: "使用龙门架进行夹胸训练" },
  { name: "俯卧撑", category: "BODYWEIGHT" as const, muscleGroup: "胸部", description: "自重胸部训练基础动作" },

  // ─── 背部 ───
  { name: "引体向上", category: "BODYWEIGHT" as const, muscleGroup: "背部", description: "自重背部训练黄金动作" },
  { name: "杠铃划船", category: "STRENGTH" as const, muscleGroup: "背部", description: "主要锻炼背阔肌的复合动作" },
  { name: "哑铃单臂划船", category: "STRENGTH" as const, muscleGroup: "背部", description: "单侧背部训练，改善不平衡" },
  { name: "高位下拉", category: "STRENGTH" as const, muscleGroup: "背部", description: "使用器械训练背阔肌宽度" },
  { name: "坐姿划船", category: "STRENGTH" as const, muscleGroup: "背部", description: "器械训练背部厚度" },
  { name: "硬拉", category: "STRENGTH" as const, muscleGroup: "背部", description: "全身复合动作，主要锻炼下背和腿后链" },

  // ─── 腿部 ───
  { name: "杠铃深蹲", category: "STRENGTH" as const, muscleGroup: "腿部", description: "下肢训练之王，锻炼股四头肌、臀大肌" },
  { name: "腿举", category: "STRENGTH" as const, muscleGroup: "腿部", description: "使用腿举机进行大重量腿部训练" },
  { name: "罗马尼亚硬拉", category: "STRENGTH" as const, muscleGroup: "腿部", description: "针对腿后链的训练动作" },
  { name: "腿弯举", category: "STRENGTH" as const, muscleGroup: "腿部", description: "孤立训练股二头肌" },
  { name: "腿伸展", category: "STRENGTH" as const, muscleGroup: "腿部", description: "孤立训练股四头肌" },
  { name: "保加利亚分腿蹲", category: "STRENGTH" as const, muscleGroup: "腿部", description: "单侧腿部训练，改善平衡和力量" },
  { name: "负重箭步蹲", category: "STRENGTH" as const, muscleGroup: "腿部", description: "功能性腿部训练动作" },

  // ─── 肩部 ───
  { name: "杠铃推举", category: "STRENGTH" as const, muscleGroup: "肩部", description: "肩部复合推举动作" },
  { name: "哑铃侧平举", category: "STRENGTH" as const, muscleGroup: "肩部", description: "孤立训练三角肌中束" },
  { name: "哑铃前平举", category: "STRENGTH" as const, muscleGroup: "肩部", description: "孤立训练三角肌前束" },
  { name: "俯身飞鸟", category: "STRENGTH" as const, muscleGroup: "肩部", description: "训练三角肌后束" },
  { name: "阿诺德推举", category: "STRENGTH" as const, muscleGroup: "肩部", description: "旋转推举，全面刺激三角肌" },

  // ─── 手臂 ───
  { name: "杠铃弯举", category: "STRENGTH" as const, muscleGroup: "手臂", description: "经典肱二头肌训练动作" },
  { name: "锤式弯举", category: "STRENGTH" as const, muscleGroup: "手臂", description: "训练肱二头肌和肱桡肌" },
  { name: "三头臂屈伸", category: "BODYWEIGHT" as const, muscleGroup: "手臂", description: "自重肱三头肌训练" },
  { name: "绳索下压", category: "STRENGTH" as const, muscleGroup: "手臂", description: "使用龙门架训练肱三头肌" },
  { name: "窄距卧推", category: "STRENGTH" as const, muscleGroup: "手臂", description: "主要锻炼肱三头肌的推举动作" },

  // ─── 核心 ───
  { name: "平板支撑", category: "BODYWEIGHT" as const, muscleGroup: "核心", description: "核心稳定性训练基础动作" },
  { name: "卷腹", category: "BODYWEIGHT" as const, muscleGroup: "核心", description: "腹直肌孤立训练" },
  { name: "悬垂举腿", category: "BODYWEIGHT" as const, muscleGroup: "核心", description: "进阶腹肌训练动作" },
  { name: "俄罗斯转体", category: "BODYWEIGHT" as const, muscleGroup: "核心", description: "训练腹斜肌的旋转动作" },

  // ─── 有氧 ───
  { name: "跑步", category: "CARDIO" as const, muscleGroup: "全身", description: "经典有氧运动，提升心肺功能" },
  { name: "跳绳", category: "CARDIO" as const, muscleGroup: "全身", description: "高效有氧训练，锻炼协调性" },
  { name: "划船机", category: "CARDIO" as const, muscleGroup: "全身", description: "全身性有氧训练" },
  { name: "动感单车", category: "CARDIO" as const, muscleGroup: "腿部", description: "室内有氧骑行训练" },
  { name: "波比跳", category: "CARDIO" as const, muscleGroup: "全身", description: "高强度全身有氧训练" },
];

const templatePlans = [
  {
    name: "推拉腿三分化 (PPL)",
    description: "经典的推/拉/腿三分化训练，适合中高级训练者",
    days: [
      {
        dayName: "推日 (胸+肩+三头)",
        exercises: ["杠铃卧推", "上斜哑铃卧推", "哑铃侧平举", "杠铃推举", "绳索下压", "绳索夹胸"],
      },
      {
        dayName: "拉日 (背+二头)",
        exercises: ["硬拉", "引体向上", "杠铃划船", "高位下拉", "杠铃弯举", "锤式弯举"],
      },
      {
        dayName: "腿日 (腿+核心)",
        exercises: ["杠铃深蹲", "罗马尼亚硬拉", "腿举", "腿弯举", "保加利亚分腿蹲", "卷腹"],
      },
    ],
  },
  {
    name: "上下肢分化",
    description: "上肢/下肢交替训练，适合初级到中级训练者",
    days: [
      {
        dayName: "上肢日 A",
        exercises: ["杠铃卧推", "杠铃划船", "哑铃侧平举", "哑铃弯举", "三头臂屈伸"],
      },
      {
        dayName: "下肢日 A",
        exercises: ["杠铃深蹲", "罗马尼亚硬拉", "腿弯举", "平板支撑"],
      },
      {
        dayName: "上肢日 B",
        exercises: ["哑铃卧推", "高位下拉", "杠铃推举", "锤式弯举", "绳索下压"],
      },
      {
        dayName: "下肢日 B",
        exercises: ["腿举", "负重箭步蹲", "腿伸展", "悬垂举腿"],
      },
    ],
  },
  {
    name: "全身训练 (新手入门)",
    description: "每次训练覆盖全身，适合初学者每周3次",
    days: [
      {
        dayName: "全身训练 A",
        exercises: ["杠铃深蹲", "杠铃卧推", "杠铃划船", "杠铃推举", "平板支撑"],
      },
      {
        dayName: "全身训练 B",
        exercises: ["硬拉", "哑铃卧推", "引体向上", "哑铃侧平举", "卷腹"],
      },
      {
        dayName: "全身训练 C",
        exercises: ["腿举", "上斜杠铃卧推", "坐姿划船", "杠铃弯举", "绳索下压"],
      },
    ],
  },
];

async function main() {
  console.log("🌱 Seeding database...");

  // 清空现有数据（保留系统用户）
  await prisma.userAchievement.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.personalRecord.deleteMany();
  await prisma.workoutSet.deleteMany();
  await prisma.workoutSession.deleteMany();
  await prisma.planExercise.deleteMany();
  await prisma.planDay.deleteMany();
  await prisma.plan.deleteMany();
  await prisma.teamMember.deleteMany();
  await prisma.team.deleteMany();
  await prisma.exercise.deleteMany();
  await prisma.user.deleteMany();

  // 创建系统用户（用于模板计划关联）
  const systemUser = await prisma.user.create({
    data: {
      email: "system@fitsquad.local",
      passwordHash: "$2a$12$system", // 占位，不可登录
      name: "FitSquad 系统",
    },
  });

  // 创建预设动作
  console.log("📋 Creating preset exercises...");
  const exerciseMap: Record<string, string> = {};
  for (const ex of presetExercises) {
    const created = await prisma.exercise.create({ data: ex });
    exerciseMap[created.name] = created.id;
  }
  console.log(`  ✓ ${presetExercises.length} exercises created`);

  // 创建模板计划
  console.log("📋 Creating template plans...");
  for (const plan of templatePlans) {
    // 模板计划不需要关联用户，使用一个系统占位
    const createdPlan = await prisma.plan.create({
      data: {
        name: plan.name,
        description: plan.description,
        isTemplate: true,
        createdById: systemUser.id, // 模板计划
      },
    });

    for (let i = 0; i < plan.days.length; i++) {
      const day = plan.days[i];
      const createdDay = await prisma.planDay.create({
        data: {
          planId: createdPlan.id,
          dayName: day.dayName,
          sortOrder: i,
        },
      });

      for (let j = 0; j < day.exercises.length; j++) {
        const exName = day.exercises[j];
        const exId = exerciseMap[exName];
        if (exId) {
          await prisma.planExercise.create({
            data: {
              planDayId: createdDay.id,
              exerciseId: exId,
              sets: 3,
              reps: 10,
              weight: 20, // KG
              restTime: 60,
              sortOrder: j,
              planSets: {
                create: [
                  { setNumber: 1, targetReps: 10, targetWeight: 20 },
                  { setNumber: 2, targetReps: 10, targetWeight: 22.5 },
                  { setNumber: 3, targetReps: 8, targetWeight: 25 },
                ],
              },
            },
          });
        }
      }
    }
  }
  console.log(`  ✓ ${templatePlans.length} template plans created`);

  console.log("✅ Seeding completed!");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
