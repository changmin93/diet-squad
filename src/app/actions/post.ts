"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { put, del } from "@vercel/blob";

// 포스트 생성
export async function createPost(formData: FormData) {
  const userId = formData.get("userId") as string;
  const content = formData.get("content") as string;
  const category = formData.get("category") as string;
  const imageFile = formData.get("imageFile") as File;

  if (!userId || !category) return { error: "필수 정보가 누락되었습니다." };

  let imageUrl = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&q=80";

  try {
    if (imageFile && imageFile.size > 0) {
      const blob = await put(imageFile.name, imageFile, { access: 'public' });
      imageUrl = blob.url;
    }
    await prisma.post.create({ data: { userId, content, imageUrl, category } });
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    return { error: "저장 실패" };
  }
}

// 응원하기 (좋아요) 기능 추가
export async function likePost(postId: string) {
  try {
    await prisma.post.update({
      where: { id: postId },
      data: { likes: { increment: 1 } }
    });
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    return { error: "응원 실패" };
  }
}

// 수동 정산 (벌점 부여) 기능
export async function settlePenalties() {
  try {
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const days = Math.floor((now.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000));
    const week = Math.ceil((days + startOfYear.getDay() + 1) / 7);
    const year = now.getFullYear();

    const users = await prisma.user.findMany({
      include: {
        goals: { where: { year, week } },
        posts: {
          where: {
            createdAt: { gte: new Date(new Date().setDate(now.getDate() - 7)) } // 최근 7일간
          }
        }
      }
    });

    for (const user of users) {
      const goal = user.goals[0] || { workoutTarget: 3, dietTarget: 5 };
      const workoutCount = user.posts.filter(p => p.category === "WORKOUT").length;
      const dietCount = user.posts.filter(p => p.category === "DIET").length;

      let penaltyPoints = 0;
      if (workoutCount < goal.workoutTarget) penaltyPoints += (goal.workoutTarget - workoutCount);
      if (dietCount < goal.dietTarget) penaltyPoints += (goal.dietTarget - dietCount);

      if (penaltyPoints > 0) {
        await prisma.user.update({
          where: { id: user.id },
          data: { totalDemerits: { increment: penaltyPoints } }
        });
      }
    }
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    return { error: "정산 실패" };
  }
}

// 이름 변경
export async function updateUserName(formData: FormData) {
  const userId = formData.get("userId") as string;
  const newName = formData.get("newName") as string;
  if (!userId || !newName) return { error: "정보 부족" };
  try {
    const existing = await prisma.user.findUnique({ where: { name: newName } });
    if (existing) return { error: "이미 사용 중인 이름입니다!" };
    await prisma.user.update({ where: { id: userId }, data: { name: newName } });
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    return { error: "변경 실패" };
  }
}

// 신규 가입
export async function joinSquad(formData: FormData) {
  const name = formData.get("name") as string;
  const workoutTarget = parseInt(formData.get("workoutTarget") as string) || 3;
  const dietTarget = parseInt(formData.get("dietTarget") as string) || 5;
  if (!name) return { error: "이름 입력 필수" };
  try {
    const existing = await prisma.user.findUnique({ where: { name } });
    if (existing) return { error: "이미 존재" };
    const user = await prisma.user.create({ data: { name, totalDemerits: 0 } });
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const days = Math.floor((now.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000));
    const week = Math.ceil((days + startOfYear.getDay() + 1) / 7);
    await prisma.weeklyGoal.create({
      data: { userId: user.id, year: now.getFullYear(), week, workoutTarget, dietTarget }
    });
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    return { error: "가입 실패" };
  }
}

// 포스트 삭제
export async function deletePost(postId: string) {
  try {
    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (post?.imageUrl.includes("vercel-storage.com")) await del(post.imageUrl);
    await prisma.post.delete({ where: { id: postId } });
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    return { error: "삭제 실패" };
  }
}
