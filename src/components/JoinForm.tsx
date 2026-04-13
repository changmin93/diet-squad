"use client";

import { joinSquad } from "@/app/actions/post";
import { UserPlus, Target, X, Camera } from "lucide-react";
import { useState, useRef } from "react";
import Image from "next/image";

export default function JoinForm() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    const res = await joinSquad(formData);
    if (res.success) {
      alert("다이어트 군단 합류 완료! 🎉");
      setIsOpen(false);
      setPreview(null);
    } else {
      alert(res.error);
    }
    setLoading(false);
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="w-full bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity mb-6"
      >
        <UserPlus className="w-5 h-5" /> 나도 참여하기 (이름 등록)
      </button>
    );
  }

  return (
    <div className="bg-white dark:bg-zinc-900 border-2 border-zinc-900 dark:border-zinc-100 rounded-2xl p-6 mb-6 shadow-xl animate-in fade-in zoom-in duration-300">
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-zinc-100 dark:border-zinc-800">
        <h3 className="font-bold flex items-center gap-2">
          <Target className="w-5 h-5 text-red-500" /> 멤버 등록하기
        </h3>
        <button onClick={() => setIsOpen(false)}>
          <X className="w-5 h-5 text-zinc-400" />
        </button>
      </div>

      <form action={handleSubmit} className="space-y-4">
        {/* 프로필 이미지 업로드 */}
        <div className="flex flex-col items-center gap-3 py-2">
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="w-20 h-20 bg-zinc-100 dark:bg-zinc-800 rounded-full border-2 border-dashed border-zinc-300 dark:border-zinc-700 flex items-center justify-center overflow-hidden cursor-pointer hover:border-zinc-500 transition-all relative group"
          >
            {preview ? (
              <Image src={preview} alt="Profile" fill className="object-cover" />
            ) : (
              <Camera className="w-6 h-6 text-zinc-400" />
            )}
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
               <Camera className="w-5 h-5 text-white" />
            </div>
          </div>
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">프로필 사진 (선택)</span>
          <input type="file" name="profileImage" ref={fileInputRef} accept="image/*" className="hidden" onChange={handleImageChange} />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider ml-1">내 이름</label>
          <input
            type="text"
            name="name"
            placeholder="친구들이 알아볼 수 있는 이름"
            required
            className="w-full bg-zinc-50 dark:bg-zinc-800 px-4 py-3 rounded-xl border border-zinc-100 dark:border-zinc-800 text-sm outline-none focus:ring-2 ring-zinc-900 dark:ring-zinc-100 transition-all"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider ml-1">주간 운동 목표</label>
            <input type="number" name="workoutTarget" defaultValue="3" min="1" max="7" required className="w-full bg-zinc-50 dark:bg-zinc-800 px-4 py-3 rounded-xl border border-zinc-100 dark:border-zinc-800 text-sm outline-none transition-all" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider ml-1">주간 식단 목표</label>
            <input type="number" name="dietTarget" defaultValue="5" min="1" max="21" required className="w-full bg-zinc-50 dark:bg-zinc-800 px-4 py-3 rounded-xl border border-zinc-100 dark:border-zinc-800 text-sm outline-none transition-all" />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full h-12 bg-red-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-red-600 disabled:opacity-50 transition-colors"
        >
          {loading ? "등록 중..." : "다이어트 군단 가입 완료!"}
        </button>
      </form>
    </div>
  );
}
