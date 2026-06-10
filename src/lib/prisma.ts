import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// 延迟初始化，只在首次查询时连接数据库
function createPrismaClient() {
  return new PrismaClient({
    log: ["error"],
    errorFormat: "minimal",
  });
}

let _prisma: PrismaClient | undefined;

export const prisma = new Proxy({} as PrismaClient, {
  get(_, prop) {
    if (!_prisma) {
      _prisma = globalForPrisma.prisma ?? createPrismaClient();
      if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = _prisma;
    }
    const value = (_prisma as any)[prop];
    if (typeof value === "function") {
      return value.bind(_prisma);
    }
    return value;
  },
});

export default prisma;
