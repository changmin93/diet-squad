"use client";

import { updateUserName } from "@/app/actions/post";
import { User, RefreshCw, X, Camera } from "lucide-react";
import { useState, useRef } from "react";
import Image from "next/image";

interface UserType {
  id: string;
  name: string;
  profileImage?: string | null;
}

export default function EditNameForm({ users }: { users: UserType[] }) {
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
    const res = await updateUserName(formData);
    if (res.success) {
      alert("프로필 정보 변경 완료! ✨");
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
        className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors mb-6"
      >
        <RefreshCw className="w-4 h-4" /> 정보 수정하기 (이름/사진)
      </button>
    );
  }

  return (
    <div className="bg-white dark:bg-zinc-900 border-2 border-zinc-900 dark:border-zinc-100 rounded-2xl p-6 mb-6 shadow-xl animate-in fade-in slide-in-from-top duration-300">
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-zinc-100 dark:border-zinc-800">
        <h3 className="font-bold flex items-center gap-2">
          <RefreshCw className="w-4 h-4 text-blue-500" /> 프로필 수정
        </h3>
        <button onClick={() => { setIsOpen(false); setPreview(null); }}>
          <X className="w-5 h-5 text-zinc-400" />
        </button>
      </div>

      <form action={handleSubmit} className="space-y-4">
        <div className="space-y-1">
          <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider ml-1">수정할 멤버 선택</label>
          <div className="flex items-center gap-2 bg-zinc-50 dark:bg-zinc-800 px-3 py-2 rounded-lg border border-zinc-100 dark:border-zinc-800">
            <User className="w-4 h-4 text-zinc-400" />
            <select name="userId" className="bg-transparent border-none outline-none text-sm w-full font-medium" required defaultValue="">
              <option value="" disabled>대상 선택</option>
              {users.map(user => (
                <option key={user.id} value={user.id}>{user.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* 프로필 이미지 변경 */}
        <div className="flex flex-col items-center gap-2 py-2">
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-full border border-zinc-200 dark:border-zinc-700 flex items-center justify-center overflow-hidden cursor-pointer relative group"
          >
            {preview ? (
              <Image src={preview} alt="Profile" fill className="object-cover" />
            ) : (
              <Camera className="w-5 h-5 text-zinc-400" />
            )}
          </div>
          <span className="text-[10px] font-bold text-zinc-400">사진 변경 (선택)</span>
          <input type="file" name="profileImage" ref={fileInputRef} accept="image/*" className="hidden" onChange={handleImageChange} />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider ml-1">새로운 이름 (선택)</label>
          <input
            type="text"
            name="newName"
            placeholder="변경할 이름 입력"
            className="w-full bg-zinc-50 dark:bg-zinc-800 px-4 py-3 rounded-xl border border-zinc-100 dark:border-zinc-800 text-sm outline-none transition-all"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full h-12 bg-blue-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-blue-600 disabled:opacity-50 transition-colors"
        >
          {loading ? "수정 중..." : "수정 완료"}
        </button>
      </form>
    </div>
  );
}
