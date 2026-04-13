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

  if (!userId || !category) return { error: "정보가 부족합니다." };

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
    return { error: "게시물 저장 실패" };
  }
}

// 2. 게시물 삭제 (완벽 복구)
export async function deletePost(postId: string) {
  try {
    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) return { error: "이미 삭제된 게시물입니다." };
    
    if (post.imageUrl && post.imageUrl.includes("vercel-storage.com")) {
      await del(post.imageUrl);
    }
    await prisma.post.delete({ where: { id: postId } });
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Delete error:", error);
    return { error: "삭제 중 서버 오류가 발생했습니다." };
  }
}

// 3. 멤버 가입
export async function joinSquad(formData: FormData) {
  const name = formData.get("name") as string;
  const workoutTarget = parseInt(formData.get("workoutTarget") as string) || 3;
  const dietTarget = parseInt(formData.get("dietTarget") as string) || 5;
  const profileFile = formData.get("profileImage") as File;

  if (!name) return { error: "이름을 입력해주세요!" };

  try {
    let profileImage = null;
    if (profileFile && profileFile.size > 0) {
      const blob = await put(`profiles/${Date.now()}_${profileFile.name}`, profileFile, { access: 'public' });
      profileImage = blob.url;
    }

    const user = await prisma.user.create({ data: { name, profileImage, totalDemerits: 0 } });
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
    return { error: "가입 실패 (이미 사용중인 이름일 수 있습니다)" };
  }
}

// 4. 멤버 정보 수정 (이름/사진)
export async function updateProfile(formData: FormData) {
  const userId = formData.get("userId") as string;
  const newName = formData.get("newName") as string;
  const profileFile = formData.get("profileImage") as File;

  if (!userId) return { error: "수정할 멤버를 선택해주세요." };

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

// 5. 멤버 삭제 기능 (데이터 정리 포함)
export async function deleteUser(userId: string) {
  try {
    // 유저가 올린 게시물들의 이미지들 삭제
    const posts = await prisma.post.findMany({ where: { userId } });
    for (const post of posts) {
      if (post.imageUrl.includes("vercel-storage.com")) await del(post.imageUrl);
    }

    // 유저 데이터베이스 삭제 (연결된 목표, 게시물, 정산내역 자동 삭제)
    await prisma.user.delete({ where: { id: userId } });
    
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    return { error: "멤버 삭제 실패" };
  }
}

// 6. 응원(좋아요)
export async function likePost(postId: string) {
  try {
    await prisma.post.update({ where: { id: postId }, data: { likes: { increment: 1 } } });
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    return { error: "실패" };
  }
}

// 7. 정산
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
        posts: { where: { createdAt: { gte: new Date(new Date().setDate(now.getDate() - 7)) } } }
      }
    });

    for (const user of users) {
      const goal = user.goals[0] || { workoutTarget: 3, dietTarget: 5 };
      const workoutCount = user.posts.filter(p => p.category === "WORKOUT").length;
      const dietCount = user.posts.filter(p => p.category === "DIET").length;
      let p = 0;
      if (workoutCount < goal.workoutTarget) p += (goal.workoutTarget - workoutCount);
      if (dietCount < goal.dietTarget) p += (goal.dietTarget - dietCount);
      if (p > 0) await prisma.user.update({ where: { id: user.id }, data: { totalDemerits: { increment: p } } });
    }
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    return { error: "실패" };
  }
}
