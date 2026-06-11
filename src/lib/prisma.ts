import { PrismaClient } from "@prisma/client";

let client: PrismaClient;

function get(): PrismaClient {
  if (!client) client = new PrismaClient({ log: ["error"] });
  return client;
}

// 懒初始化包装器 — 和直接 import { prisma } 用法完全兼容
export const prisma = {
  get user() { return get().user; },
  get team() { return get().team; },
  get teamMember() { return get().teamMember; },
  get exercise() { return get().exercise; },
  get plan() { return get().plan; },
  get planDay() { return get().planDay; },
  get planExercise() { return get().planExercise; },
  get planSet() { return get().planSet; },
  get workoutSession() { return get().workoutSession; },
  get workoutSet() { return get().workoutSet; },
  get personalRecord() { return get().personalRecord; },
  get notification() { return get().notification; },
  get userAchievement() { return get().userAchievement; },
  get $transaction() { return get().$transaction.bind(get()); },
  get $queryRaw() { return get().$queryRaw.bind(get()); },
  get $queryRawUnsafe() { return get().$queryRawUnsafe.bind(get()); },
  get $executeRaw() { return get().$executeRaw.bind(get()); },
  get $executeRawUnsafe() { return get().$executeRawUnsafe.bind(get()); },
  get $disconnect() { return get().$disconnect.bind(get()); },
  get $connect() { return get().$connect.bind(get()); },
  $on(event: any, cb: any) { return get().$on(event, cb); },
};

export function getPrisma() { return get(); }
export default prisma;
