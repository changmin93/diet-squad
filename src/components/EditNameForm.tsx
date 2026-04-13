"use client";

import { updateUserName } from "@/app/actions/post";
import { User, RefreshCw, X } from "lucide-react";
import { useState } from "react";

interface UserType {
  id: string;
  name: string;
}

export default function EditNameForm({ users }: { users: UserType[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    const res = await updateUserName(formData);
    if (res.success) {
      alert("이름 변경 완료! 이제 새로운 이름으로 달려보세요! 🚀");
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
        className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors mb-6"
      >
        <RefreshCw className="w-4 h-4" /> 내 이름 바꾸기
      </button>
    );
  }

  return (
    <div className="bg-white dark:bg-zinc-900 border-2 border-zinc-900 dark:border-zinc-100 rounded-2xl p-6 mb-6 shadow-xl animate-in fade-in slide-in-from-top duration-300">
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-zinc-100 dark:border-zinc-800">
        <h3 className="font-bold flex items-center gap-2">
          <RefreshCw className="w-4 h-4 text-blue-500" /> 이름 바꾸기
        </h3>
        <button onClick={() => setIsOpen(false)}>
          <X className="w-5 h-5 text-zinc-400" />
        </button>
      </div>

      <form action={handleSubmit} className="space-y-4">
        <div className="space-y-1">
          <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider ml-1">기존 이름 선택</label>
          <div className="flex items-center gap-2 bg-zinc-50 dark:bg-zinc-800 px-3 py-2 rounded-lg border border-zinc-100 dark:border-zinc-800">
            <User className="w-4 h-4 text-zinc-400" />
            <select name="userId" className="bg-transparent border-none outline-none text-sm w-full font-medium" required defaultValue="">
              {users.length > 0 ? (
                <>
                  <option value="" disabled>누구의 이름을 바꿀까요?</option>
                  {users.map(user => (
                    <option key={user.id} value={user.id}>{user.name}</option>
                  ))}
                </>
              ) : (
                <option value="" disabled>등록된 멤버가 없습니다. 먼저 가입해주세요!</option>
              )}
            </select>
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider ml-1">새로운 이름</label>
          <input
            type="text"
            name="newName"
            placeholder="새 닉네임 입력"
            required
            className="w-full bg-zinc-50 dark:bg-zinc-800 px-4 py-3 rounded-xl border border-zinc-100 dark:border-zinc-800 text-sm outline-none focus:ring-2 ring-blue-500 transition-all"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full h-12 bg-blue-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-blue-600 disabled:opacity-50 transition-colors"
        >
          {loading ? "변경 중..." : "이름 변경하기"}
        </button>
      </form>
    </div>
  );
}
