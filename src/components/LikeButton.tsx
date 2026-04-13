"use client";

import { likePost } from "@/app/actions/post";
import { Heart } from "lucide-react";
import { useState } from "react";

export default function LikeButton({ postId, initialLikes }: { postId: string, initialLikes: number }) {
  const [likes, setLikes] = useState(initialLikes);
  const [loading, setLoading] = useState(false);

  async function handleLike() {
    setLoading(true);
    const res = await likePost(postId);
    if (res.success) {
      setLikes(prev => prev + 1);
    }
    setLoading(false);
  }

  return (
    <button
      onClick={handleLike}
      disabled={loading}
      className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-50 dark:bg-zinc-800 hover:bg-red-50 dark:hover:bg-red-950/30 text-zinc-500 hover:text-red-500 rounded-full border border-zinc-100 dark:border-zinc-800 transition-all duration-200 group"
    >
      <Heart className={`w-4 h-4 ${likes > 0 ? "fill-red-500 text-red-500" : "group-hover:scale-110 transition-transform"}`} />
      <span className="text-xs font-bold">{likes}</span>
    </button>
  );
}
