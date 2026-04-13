"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { writeFile } from "fs/promises";
import { join } from "path";

// 포스트 생성 (식단/운동 인증)
export async function createPost(formData: FormData) {
  const userId = formData.get("userId") as string;
  const content = formData.get("content") as string;
  const category = formData.get("category") as string;
  const imageFile = formData.get("imageFile") as File;

  if (!userId || !category) return { error: "필수 정보가 누락되었습니다." };

  let imageUrl = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&q=80";

  try {
    if (imageFile && imageFile.size > 0) {
      const bytes = await imageFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const fileName = `${Date.now()}_${imageFile.name.replace(/\s+/g, '_')}`;
      const path = join(process.cwd(), "public", "uploads", fileName);
      try {
        await writeFile(path, buffer);
        imageUrl = `/uploads/${fileName}`;
      } catch (e) {
        console.error("파일 시스템 저장 실패 (Vercel 환경일 수 있음):", e);
        // Vercel 등 읽기 전용 환경에서는 기본 이미지 사용 혹은 외부 스토리지 필요
      }
    }

    await prisma.post.create({
      data: { userId, content, imageUrl, category },
    });

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Upload error:", error);
    return { error: "저장 중 오류가 발생했습니다." };
  }
}

// 신규 멤버 등록 (친구 스스로 가입)
export async function joinSquad(formData: FormData) {
  const name = formData.get("name") as string;
  const workoutTarget = parseInt(formData.get("workoutTarget") as string) || 3;
  const dietTarget = parseInt(formData.get("dietTarget") as string) || 5;

  if (!name) return { error: "이름을 입력해주세요!" };

  try {
    // 중복 이름 체크
    const existing = await prisma.user.findUnique({ where: { name } });
    if (existing) return { error: "이미 존재하는 이름입니다!" };

    // 사용자 생성
    const user = await prisma.user.create({
      data: {
        name,
        totalDemerits: 0,
      },
    });

    // 이번 주 목표 설정
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const days = Math.floor((now.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000));
    const week = Math.ceil((days + startOfYear.getDay() + 1) / 7);

    await prisma.weeklyGoal.create({
      data: {
        userId: user.id,
        year: now.getFullYear(),
        week: week,
        workoutTarget,
        dietTarget,
      },
    });

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Join error:", error);
    return { error: "멤버 등록 중 오류가 발생했습니다." };
  }
}
