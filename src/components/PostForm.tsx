"use client";

import { createPost } from "@/app/actions/post";
import { User, Utensils, Dumbbell, Send, Camera, X } from "lucide-react";
import { useState, useRef } from "react";
import Image from "next/image";

interface UserType {
  id: string;
  name: string;
}

export default function PostForm({ users }: { users: UserType[] }) {
  const [category, setCategory] = useState<"DIET" | "WORKOUT" | null>(null);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 이미지 파일 선택 시 미리보기 생성
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    const res = await createPost(formData);
    if (res.success) {
      alert("인증 성공! 🎉");
      setCategory(null);
      setPreview(null);
    } else {
      alert(res.error);
    }
    setLoading(false);
  }

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4 shadow-sm mb-6 transition-all duration-300">
      {!category ? (
        <div className="flex gap-4">
          <button
            onClick={() => setCategory("DIET")}
            className="flex-1 flex items-center justify-center gap-2 h-14 bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400 font-bold rounded-xl border border-green-100 dark:border-green-900/50 hover:bg-green-100 dark:hover:bg-green-900/50 transition-colors"
          >
            <Utensils className="w-5 h-5" /> 식단 인증
          </button>
          <button
            onClick={() => setCategory("WORKOUT")}
            className="flex-1 flex items-center justify-center gap-2 h-14 bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 font-bold rounded-xl border border-blue-100 dark:border-blue-900/50 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
          >
            <Dumbbell className="w-5 h-5" /> 운동 인증
          </button>
        </div>
      ) : (
        <form action={handleSubmit} className="space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-2 mb-2">
             <span className="font-bold text-sm flex items-center gap-2">
               {category === "DIET" ? <Utensils className="w-4 h-4 text-green-500" /> : <Dumbbell className="w-4 h-4 text-blue-500" />}
               {category === "DIET" ? "식단" : "운동"} 인증하기
             </span>
             <button type="button" onClick={() => { setCategory(null); setPreview(null); }} className="text-zinc-400 text-xs hover:text-zinc-600">취소</button>
          </div>
          
          <input type="hidden" name="category" value={category} />

          <div className="space-y-3">
            {/* 사용자 선택 */}
            <div className="flex items-center gap-2 bg-zinc-50 dark:bg-zinc-800 px-3 py-2 rounded-lg border border-zinc-100 dark:border-zinc-800">
              <User className="w-4 h-4 text-zinc-400" />
              <select name="userId" className="bg-transparent border-none outline-none text-sm w-full font-medium" required defaultValue="">
                <option value="" disabled>인증할 사람 선택</option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>{user.name}</option>
                ))}
              </select>
            </div>

            {/* 사진 업로드 영역 */}
            <div className="relative">
              {!preview ? (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full aspect-video bg-zinc-50 dark:bg-zinc-800 border-2 border-dashed border-zinc-200 dark:border-zinc-700 rounded-xl flex flex-col items-center justify-center gap-2 text-zinc-400 hover:text-zinc-600 hover:border-zinc-300 transition-all"
                >
                  <Camera className="w-8 h-8" />
                  <span className="text-xs font-medium">사진 찍기 또는 갤러리 선택</span>
                </button>
              ) : (
                <div className="relative aspect-video rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-800">
                  <Image src={preview} alt="Preview" fill className="object-cover" />
                  <button
                    type="button"
                    onClick={() => setPreview(null)}
                    className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
              <input
                type="file"
                name="imageFile"
                ref={fileInputRef}
                accept="image/*"
                capture="environment" // 모바일에서 카메라 바로 연결 시도
                className="hidden"
                onChange={handleImageChange}
              />
            </div>

            <textarea
              name="content"
              rows={3}
              placeholder="오늘의 다이어트 일기를 작성해주세요..."
              className="w-full bg-zinc-50 dark:bg-zinc-800 px-3 py-2 rounded-lg border border-zinc-100 dark:border-zinc-800 text-sm outline-none resize-none"
              required
            ></textarea>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-bold rounded-xl flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            <Send className="w-4 h-4" /> {loading ? "저장 중..." : "인증 게시하기"}
          </button>
        </form>
      )}
    </div>
  );
}
