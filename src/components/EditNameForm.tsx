"use client";

import { updateProfile, deleteUser } from "@/app/actions/post";
import { User, RefreshCw, X, Camera, Trash2, AlertTriangle } from "lucide-react";
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
  const [selectedUserId, setSelectedUserId] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  async function handleUpdate(formData: FormData) {
    setLoading(true);
    const res = await updateProfile(formData);
    if (res.success) {
      alert("프로필 정보가 성공적으로 수정되었습니다! ✨");
      setIsOpen(false);
      setPreview(null);
    } else {
      alert(res.error);
    }
    setLoading(false);
  }

  async function handleDelete() {
    if (!selectedUserId) {
      alert("삭제할 멤버를 먼저 선택해주세요.");
      return;
    }
    
    if (confirm("⚠️ 정말로 이 멤버를 삭제할까요? 작성한 모든 게시물과 기록이 사라지며 복구할 수 없습니다.")) {
      setLoading(true);
      const res = await deleteUser(selectedUserId);
      if (res.success) {
        alert("멤버가 성공적으로 삭제되었습니다.");
        setIsOpen(false);
        setSelectedUserId("");
      } else {
        alert(res.error);
      }
      setLoading(false);
    }
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors mb-6"
      >
        <RefreshCw className="w-4 h-4" /> 정보 수정 / 멤버 삭제
      </button>
    );
  }

  return (
    <div className="bg-white dark:bg-zinc-900 border-2 border-zinc-900 dark:border-zinc-100 rounded-3xl p-6 mb-6 shadow-2xl animate-in fade-in slide-in-from-top duration-300">
      <div className="flex items-center justify-between mb-6 pb-2 border-b border-zinc-100 dark:border-zinc-800">
        <h3 className="font-black text-sm uppercase tracking-tighter flex items-center gap-2">
          <RefreshCw className="w-4 h-4 text-blue-500" /> Profile Manage
        </h3>
        <button onClick={() => { setIsOpen(false); setPreview(null); }}>
          <X className="w-5 h-5 text-zinc-400" />
        </button>
      </div>

      <form action={handleUpdate} className="space-y-5">
        <div className="space-y-1">
          <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">대상 선택</label>
          <div className="flex items-center gap-2 bg-zinc-50 dark:bg-zinc-800 px-3 py-2 rounded-xl border border-zinc-100 dark:border-zinc-800">
            <User className="w-4 h-4 text-zinc-400" />
            <select 
              name="userId" 
              className="bg-transparent border-none outline-none text-sm w-full font-bold" 
              required 
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
            >
              <option value="" disabled>수정/삭제할 멤버 선택</option>
              {users.map(user => (
                <option key={user.id} value={user.id}>{user.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* 프로필 이미지 변경 */}
        <div className="flex flex-col items-center gap-3 py-2">
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="w-20 h-20 bg-zinc-100 dark:bg-zinc-800 rounded-full border-2 border-dashed border-zinc-300 dark:border-zinc-700 flex items-center justify-center overflow-hidden cursor-pointer relative group"
          >
            {preview ? (
              <Image src={preview} alt="Profile" fill className="object-cover" />
            ) : (
              <Camera className="w-6 h-6 text-zinc-400" />
            )}
          </div>
          <span className="text-[10px] font-black text-zinc-400 uppercase">사진 변경 (선택)</span>
          <input type="file" name="profileImage" ref={fileInputRef} accept="image/*" className="hidden" onChange={handleImageChange} />
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">새 이름 (선택)</label>
          <input
            type="text"
            name="newName"
            placeholder="변경할 이름 입력"
            className="w-full bg-zinc-50 dark:bg-zinc-800 px-4 py-3 rounded-xl border border-zinc-100 dark:border-zinc-800 text-sm outline-none font-bold"
          />
        </div>

        <div className="flex gap-2 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 h-12 bg-blue-500 text-white font-black rounded-xl text-xs uppercase tracking-widest hover:bg-blue-600 disabled:opacity-50 transition-all shadow-lg shadow-blue-500/20"
          >
            {loading ? "Saving..." : "정보 수정 완료"}
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={loading || !selectedUserId}
            className="w-12 h-12 bg-zinc-100 dark:bg-zinc-800 text-zinc-400 hover:text-red-500 rounded-xl flex items-center justify-center transition-all hover:bg-red-50 dark:hover:bg-red-950/30"
            title="멤버 삭제"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </form>
      
      {selectedUserId && (
        <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-950/20 rounded-xl border border-amber-100 dark:border-amber-900/30 flex items-start gap-2 animate-in fade-in slide-in-from-bottom duration-500">
          <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <p className="text-[10px] text-amber-700 dark:text-amber-400 font-bold leading-relaxed">
            주의: 이름 변경 시 이전에 작성한 글들의 이름도 모두 함께 바뀝니다. 멤버 삭제는 신중히 결정해주세요!
          </p>
        </div>
      )}
    </div>
  );
}
