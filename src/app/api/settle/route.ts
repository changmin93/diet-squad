import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // 현재 날짜 기준 주차 계산 (단순화된 방식)
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const days = Math.floor((now.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000));
    const week = Math.ceil((days + startOfYear.getDay() + 1) / 7);
    const year = now.getFullYear();

    const users = await prisma.user.findMany({
      include: {
        goals: {
          where: { year, week }
        },
        posts: {
          where: {
            createdAt: {
              // 이번 주 월요일부터 일요일까지 (단순화)
              gte: new Date(now.setDate(now.getDate() - now.getDay() + 1))
            }
          }
        }
      }
    });

    const results = [];

    for (const user of users) {
      const goal = user.goals[0] || { workoutTarget: 3, dietTarget: 5 }; // 기본 목표
      const workoutCount = user.posts.filter(p => p.category === "WORKOUT").length;
      const dietCount = user.posts.filter(p => p.category === "DIET").length;

      let penaltyPoints = 0;
      let reason = "";

      if (workoutCount < goal.workoutTarget) {
        const diff = goal.workoutTarget - workoutCount;
        penaltyPoints += diff;
        reason += `운동 미달(${diff}회) `;
      }

      if (dietCount < goal.dietTarget) {
        const diff = goal.dietTarget - dietCount;
        penaltyPoints += diff;
        reason += `식단 미달(${diff}회) `;
      }

      if (penaltyPoints > 0) {
        await prisma.$transaction([
          prisma.user.update({
            where: { id: user.id },
            data: { totalDemerits: { increment: penaltyPoints } }
          }),
          prisma.penaltyHistory.create({
            data: {
              userId: user.id,
              year,
              week,
              points: penaltyPoints,
              reason: reason.trim()
            }
          })
        ]);
        results.push({ name: user.name, penaltyPoints, reason });
      }
    }

    return NextResponse.json({ success: true, settled: results });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: "정산 중 오류 발생" }, { status: 500 });
  }
}
