"use client";

import { reactToPost } from "@/app/actions/post";
import { Heart, Flame, Dumbbell } from "lucide-react";
import { useState } from "react";

export default function ReactionButtons({ 
  postId, 
  initialLikes, 
  initialFire, 
  initialStrong 
}: { 
  postId: string, 
  initialLikes: number,
  initialFire: number,
  initialStrong: number
}) {
  const [stats, setStats] = useState({ likes: initialLikes, fire: initialFire, strong: initialStrong });
  const [loading, setLoading] = useState(false);

  async function handleReact(type: 'likes' | 'fire' | 'strong') {
    setLoading(true);
    const res = await reactToPost(postId, type);
    if (res.success) {
      setStats(prev => ({ ...prev, [type]: prev[type] + 1 }));
    }
    setLoading(false);
  }

  return (
    <div className="flex gap-2">
      <button
        onClick={() => handleReact('likes')}
        disabled={loading}
        className="flex items-center gap-1.5 px-2.5 py-1.5 bg-zinc-50 dark:bg-zinc-800 hover:bg-red-50 dark:hover:bg-red-950/30 text-zinc-500 hover:text-red-500 rounded-full border border-zinc-100 dark:border-zinc-800 transition-all group"
      >
        <Heart className={`w-3.5 h-3.5 ${stats.likes > 0 ? "fill-red-500 text-red-500" : ""}`} />
        <span className="text-[10px] font-black">{stats.likes}</span>
      </button>

      <button
        onClick={() => handleReact('fire')}
        disabled={loading}
        className="flex items-center gap-1.5 px-2.5 py-1.5 bg-zinc-50 dark:bg-zinc-800 hover:bg-orange-50 dark:hover:bg-orange-950/30 text-zinc-500 hover:text-orange-500 rounded-full border border-zinc-100 dark:border-zinc-800 transition-all group"
      >
        <Flame className={`w-3.5 h-3.5 ${stats.fire > 0 ? "fill-orange-500 text-orange-500" : ""}`} />
        <span className="text-[10px] font-black">{stats.fire}</span>
      </button>

      <button
        onClick={() => handleReact('strong')}
        disabled={loading}
        className="flex items-center gap-1.5 px-2.5 py-1.5 bg-zinc-50 dark:bg-zinc-800 hover:bg-blue-50 dark:hover:bg-blue-950/30 text-zinc-500 hover:text-blue-500 rounded-full border border-zinc-100 dark:border-zinc-800 transition-all group"
      >
        <Dumbbell className={`w-3.5 h-3.5 ${stats.strong > 0 ? "fill-blue-500 text-blue-500" : ""}`} />
        <span className="text-[10px] font-black">{stats.strong}</span>
      </button>
    </div>
  );
}
