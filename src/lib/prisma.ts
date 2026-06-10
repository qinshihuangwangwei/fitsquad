import { PrismaClient } from "@prisma/client";

let _prisma: PrismaClient | null = null;

export function getPrisma() {
  if (!_prisma) _prisma = new PrismaClient();
  return _prisma;
}

// 向后兼容：Proxy 自动创建
export const prisma = new Proxy({} as PrismaClient, {
  get(_, prop) { return (getPrisma() as any)[prop]; },
});
