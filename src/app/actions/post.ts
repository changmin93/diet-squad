"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { put, del } from "@vercel/blob";

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
      const blob = await put(imageFile.name, imageFile, {
        access: 'public',
      });
      imageUrl = blob.url;
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

// 포스트 삭제
export async function deletePost(postId: string) {
  try {
    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) return { error: "게시물을 찾을 수 없습니다." };
    if (post.imageUrl && post.imageUrl.includes("vercel-storage.com")) {
      await del(post.imageUrl);
    }
    await prisma.post.delete({ where: { id: postId } });
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    return { error: "삭제 중 오류가 발생했습니다." };
  }
}

// 이름 변경 기능 추가
export async function updateUserName(formData: FormData) {
  const userId = formData.get("userId") as string;
  const newName = formData.get("newName") as string;

  if (!userId || !newName) return { error: "필요한 정보가 부족합니다." };

  try {
    // 새 이름 중복 체크
    const existing = await prisma.user.findUnique({ where: { name: newName } });
    if (existing) return { error: "이미 사용 중인 이름입니다!" };

    await prisma.user.update({
      where: { id: userId },
      data: { name: newName }
    });

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    return { error: "이름 변경 중 오류가 발생했습니다." };
  }
}

// 신규 멤버 등록
export async function joinSquad(formData: FormData) {
  const name = formData.get("name") as string;
  const workoutTarget = parseInt(formData.get("workoutTarget") as string) || 3;
  const dietTarget = parseInt(formData.get("dietTarget") as string) || 5;

  if (!name) return { error: "이름을 입력해주세요!" };

  try {
    const existing = await prisma.user.findUnique({ where: { name } });
    if (existing) return { error: "이미 존재하는 이름입니다!" };

    const user = await prisma.user.create({
      data: { name, totalDemerits: 0 },
    });

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
    return { error: "멤버 등록 중 오류가 발생했습니다." };
  }
}
