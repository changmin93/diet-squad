"use client";

import { deletePost } from "@/app/actions/post";
import { useState } from "react";

export default function DeleteButton({ postId }: { postId: string }) {
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (confirm("정말로 이 기록을 삭제할까요?")) {
      setLoading(true);
      const res = await deletePost(postId);
      if (!res.success) {
        alert(res.error);
        setLoading(false);
      }
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="text-[10px] font-bold text-red-400 hover:text-red-600 transition-colors disabled:opacity-50 border border-red-100 px-2 py-0.5 rounded uppercase tracking-wider"
    >
      {loading ? "지우는 중..." : "삭제"}
    </button>
  );
}
