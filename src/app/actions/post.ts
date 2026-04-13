"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { put, del } from "@vercel/blob";

// 1. 게시물 생성
export async function createPost(formData: FormData) {
  const userId = formData.get("userId") as string;
  const content = formData.get("content") as string;
  const category = formData.get("category") as string;
  const imageFile = formData.get("imageFile") as File;

  if (!userId || !category) return { error: "정보 부족" };

  try {
    let imageUrl = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&q=80";
    if (imageFile && imageFile.size > 0) {
      const blob = await put(`posts/${Date.now()}_${imageFile.name}`, imageFile, { access: 'public' });
      imageUrl = blob.url;
    }
    await prisma.post.create({ data: { userId, content, imageUrl, category } });
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    return { error: "저장 실패" };
  }
}

// 2. 리액션 기능 (종류별)
export async function reactToPost(postId: string, type: 'likes' | 'fire' | 'strong') {
  try {
    const updateData: any = {};
    updateData[type] = { increment: 1 };
    await prisma.post.update({
      where: { id: postId },
      data: updateData
    });
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    return { error: "리액션 실패" };
  }
}

// 3. 댓글 작성
export async function addComment(formData: FormData) {
  const postId = formData.get("postId") as string;
  const userId = formData.get("userId") as string;
  const content = formData.get("content") as string;

  if (!postId || !userId || !content) return { error: "내용을 입력해주세요." };

  try {
    await prisma.comment.create({
      data: { postId, userId, content }
    });
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    return { error: "댓글 작성 실패" };
  }
}

// 4. 주간 정산 (히스토리 기록 강화)
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
            createdAt: {
              gte: new Date(new Date().setDate(now.getDate() - 7))
            }
          }
        }
      }
    });

    for (const user of users) {
      const goal = user.goals[0] || { workoutTarget: 3, dietTarget: 5 };
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
        // 이미 해당 주차에 정산 기록이 있는지 확인 (중복 정산 방지)
        const existing = await prisma.penaltyHistory.findFirst({
          where: { userId: user.id, year, week }
        });

        if (!existing) {
          await prisma.$transaction([
            prisma.user.update({
              where: { id: user.id },
              data: { totalDemerits: { increment: penaltyPoints } }
            }),
            prisma.penaltyHistory.create({
              data: { userId: user.id, year, week, points: penaltyPoints, reason: reason.trim() }
            })
          ]);
        }
      }
    }
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    return { error: "정산 실패" };
  }
}

// 5. 유저 삭제
export async function deleteUser(userId: string) {
  try {
    const posts = await prisma.post.findMany({ where: { userId } });
    for (const post of posts) {
      if (post.imageUrl.includes("vercel-storage.com")) await del(post.imageUrl);
    }
    await prisma.user.delete({ where: { id: userId } });
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    return { error: "삭제 실패" };
  }
}

// 6. 게시물 삭제
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

// 7. 멤버 정보 수정
export async function updateProfile(formData: FormData) {
  const userId = formData.get("userId") as string;
  const newName = formData.get("newName") as string;
  const profileFile = formData.get("profileImage") as File;

  if (!userId) return { error: "대상 선택 필수" };

  try {
    const updateData: any = {};
    if (newName) updateData.name = newName;
    if (profileFile && profileFile.size > 0) {
      const blob = await put(`profiles/${Date.now()}_${profileFile.name}`, profileFile, { access: 'public' });
      updateData.profileImage = blob.url;
    }
    await prisma.user.update({ where: { id: userId }, data: updateData });
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    return { error: "수정 실패" };
  }
}

// 8. 가입
export async function joinSquad(formData: FormData) {
  const name = formData.get("name") as string;
  const workoutTarget = parseInt(formData.get("workoutTarget") as string) || 3;
  const dietTarget = parseInt(formData.get("dietTarget") as string) || 5;
  const profileFile = formData.get("profileImage") as File;

  if (!name) return { error: "이름 필수" };

  try {
    let profileImage = null;
    if (profileFile && profileFile.size > 0) {
      const blob = await put(`profiles/${Date.now()}_${profileFile.name}`, profileFile, { access: 'public' });
      profileImage = blob.url;
    }
    const user = await prisma.user.create({ data: { name, profileImage, totalDemerits: 0 } });
    const now = new Date();
    const week = Math.ceil((Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 1).getTime()) / 86400000) + new Date(now.getFullYear(), 0, 1).getDay() + 1) / 7);
    await prisma.weeklyGoal.create({ data: { userId: user.id, year: now.getFullYear(), week, workoutTarget, dietTarget } });
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    return { error: "가입 실패" };
  }
}
