import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const muscleGroup = searchParams.get("muscleGroup");

  const where: Record<string, unknown> = {};
  if (category) where.category = category;
  if (muscleGroup) where.muscleGroup = muscleGroup;

  const exercises = await prisma.exercise.findMany({
    where,
    orderBy: [{ category: "asc" }, { muscleGroup: "asc" }, { name: "asc" }],
  });

  return NextResponse.json({ data: exercises });
}
