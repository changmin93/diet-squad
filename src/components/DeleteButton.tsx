"use client";

import { deletePost } from "@/app/actions/post";
import { Trash2 } from "lucide-react";
import { useState } from "react";

export default function DeleteButton({ postId }: { postId: string }) {
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (confirm("정말로 이 기록을 삭제할까요?")) {
      setLoading(true);
      try {
        const res = await deletePost(postId);
        if (res.success) {
          // 성공 시 별도 알림 없이 서버 액션의 revalidatePath로 자동 갱신됨
        } else {
          alert(res.error || "삭제에 실패했습니다.");
          setLoading(false);
        }
      } catch (err) {
        alert("통신 오류가 발생했습니다.");
        setLoading(false);
      }
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="p-2 text-zinc-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-all disabled:opacity-50"
      title="삭제하기"
    >
      {loading ? (
        <span className="text-[10px] animate-pulse">...</span>
      ) : (
        <Trash2 className="w-4 h-4" />
      )}
    </button>
  );
}
