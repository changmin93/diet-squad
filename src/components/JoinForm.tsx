"use client";

import { joinSquad } from "@/app/actions/post";
import { UserPlus, Target, X } from "lucide-react";
import { useState } from "react";

export default function JoinForm() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    const res = await joinSquad(formData);
    if (res.success) {
      alert("다이어트 군단 합류 완료! 🎉");
      setIsOpen(false);
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
            <input
              type="number"
              name="workoutTarget"
              defaultValue="3"
              min="1"
              max="7"
              required
              className="w-full bg-zinc-50 dark:bg-zinc-800 px-4 py-3 rounded-xl border border-zinc-100 dark:border-zinc-800 text-sm outline-none focus:ring-2 ring-zinc-900 dark:ring-zinc-100 transition-all"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider ml-1">주간 식단 목표</label>
            <input
              type="number"
              name="dietTarget"
              defaultValue="5"
              min="1"
              max="21"
              required
              className="w-full bg-zinc-50 dark:bg-zinc-800 px-4 py-3 rounded-xl border border-zinc-100 dark:border-zinc-800 text-sm outline-none focus:ring-2 ring-zinc-900 dark:ring-zinc-100 transition-all"
            />
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
