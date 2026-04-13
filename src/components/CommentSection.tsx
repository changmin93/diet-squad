"use client";

import { addComment } from "@/app/actions/post";
import { MessageSquare, Send } from "lucide-react";
import { useState } from "react";

interface CommentType {
  id: string;
  content: string;
  user: { name: string };
  createdAt: Date;
}

export default function CommentSection({ 
  postId, 
  comments, 
  users 
}: { 
  postId: string, 
  comments: CommentType[],
  users: { id: string, name: string }[] 
}) {
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    const res = await addComment(formData);
    if (!res.success) alert(res.error);
    setLoading(false);
    (document.getElementById(`comment-form-${postId}`) as HTMLFormElement).reset();
  }

  return (
    <div className="mt-4 pt-4 border-t border-zinc-50 dark:border-zinc-800/50 space-y-4">
      <div className="flex items-center gap-2 text-zinc-400">
        <MessageSquare className="w-3.5 h-3.5" />
        <span className="text-[10px] font-black uppercase tracking-widest">Comments ({comments.length})</span>
      </div>

      {/* 댓글 리스트 */}
      <div className="space-y-3">
        {comments.map((comment) => (
          <div key={comment.id} className="flex flex-col gap-0.5">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-black">{comment.user.name}</span>
              <span className="text-[9px] text-zinc-400">{new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 font-medium">{comment.content}</p>
          </div>
        ))}
      </div>

      {/* 댓글 입력 폼 */}
      <form id={`comment-form-${postId}`} action={handleSubmit} className="flex flex-col gap-2 mt-2">
        <div className="flex gap-2">
          <select name="userId" required className="bg-zinc-50 dark:bg-zinc-800 border-none outline-none text-[10px] font-bold rounded-lg px-2 py-1 max-w-[100px]">
            <option value="" disabled selected>누구?</option>
            {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
          </select>
          <input 
            name="content" 
            placeholder="댓글을 남겨보세요..." 
            required 
            className="flex-1 bg-zinc-50 dark:bg-zinc-800 border-none outline-none text-xs rounded-lg px-3 py-2 font-medium"
          />
          <input type="hidden" name="postId" value={postId} />
          <button 
            type="submit" 
            disabled={loading}
            className="bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 p-2 rounded-lg hover:opacity-80 transition-opacity"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </form>
    </div>
  );
}
