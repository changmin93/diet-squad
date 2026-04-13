"use client";

import { deletePost } from "@/app/actions/post";
import { Trash2 } from "lucide-react";
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
      className="p-1 text-zinc-300 hover:text-red-500 transition-colors disabled:opacity-50"
      title="삭제하기"
    >
      <Trash2 className="w-4 h-4" />
    </button>
  );
}
