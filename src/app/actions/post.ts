"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { writeFile } from "fs/promises";
import { join } from "path";

export async function createPost(formData: FormData) {
  const userId = formData.get("userId") as string;
  const content = formData.get("content") as string;
  const category = formData.get("category") as string;
  const imageFile = formData.get("imageFile") as File;

  if (!userId || !category) return { error: "필수 정보가 누락되었습니다." };

  let imageUrl = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&q=80"; // 기본값

  try {
    // 이미지가 있는 경우 서버에 저장
    if (imageFile && imageFile.size > 0) {
      const bytes = await imageFile.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // 고유 파일명 생성 (타임스탬프 + 파일명)
      const fileName = `${Date.now()}_${imageFile.name.replace(/\s+/g, '_')}`;
      const path = join(process.cwd(), "public", "uploads", fileName);
      
      await writeFile(path, buffer);
      imageUrl = `/uploads/${fileName}`;
    }

    await prisma.post.create({
      data: {
        userId,
        content,
        imageUrl,
        category,
      },
    });

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Upload error:", error);
    return { error: "이미지 저장 중 오류가 발생했습니다." };
  }
}
