import { prisma } from "@/lib/prisma";
import { Trophy, AlertCircle, Dumbbell, Utensils, PlusCircle } from "lucide-react";
import Image from "next/image";
import PostForm from "@/components/PostForm";

export default async function Home() {
  // 실제 DB에서 사용자 및 게시물 데이터 가져오기
  const users = await prisma.user.findMany({
    orderBy: { totalDemerits: "desc" },
    take: 5,
  });

  const posts = await prisma.post.findMany({
    include: { user: true },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  const allUsers = await prisma.user.findMany({ select: { id: true, name: true } });

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans pb-20">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 px-4 h-14 flex items-center justify-between">
        <h1 className="text-xl font-bold tracking-tight">Diet Squad</h1>
        <div className="flex gap-2">
           <button className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors">
            <PlusCircle className="w-6 h-6" />
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 p-4">
        {/* Sidebar: Ranking & Profile */}
        <aside className="lg:col-span-4 space-y-6 order-2 lg:order-1">
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
            <h2 className="text-sm font-semibold text-zinc-500 mb-4 flex items-center gap-2 uppercase tracking-wider">
              <Trophy className="w-4 h-4" /> Penalty Leaderboard
            </h2>
            <div className="space-y-4">
              {users.length > 0 ? users.map((user, idx) => (
                <div key={user.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center font-bold text-sm">
                      {idx + 1}
                    </div>
                    <span className="font-medium">{user.name}</span>
                  </div>
                  <div className="flex items-center gap-1 text-red-500 font-bold">
                    <AlertCircle className="w-4 h-4" /> {user.totalDemerits}
                  </div>
                </div>
              )) : (
                <p className="text-zinc-500 text-sm">아직 등록된 사용자가 없습니다.</p>
              )}
            </div>
          </div>

          <div className="bg-zinc-900 text-white p-6 rounded-2xl border border-zinc-800 shadow-sm">
            <h3 className="font-bold text-lg mb-2">벌점 피하는 법 💡</h3>
            <p className="text-sm text-zinc-400 leading-relaxed">
              매주 일요일 자정까지 설정한 목표 횟수를 채우지 못하면, 부족한 횟수만큼 벌점이 자동으로 추가됩니다!
            </p>
          </div>
        </aside>

        {/* Main: Feed */}
        <section className="lg:col-span-8 space-y-6 order-1 lg:order-2">
          {/* Post Form 추가 */}
          <PostForm users={allUsers} />

          {/* Feed List */}
          <div className="space-y-6">
            {posts.length > 0 ? posts.map((post) => (
              <div key={post.id} className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm">
                <div className="p-4 flex items-center gap-3 border-b border-zinc-100 dark:border-zinc-800">
                  <div className="w-10 h-10 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden relative">
                    {post.user.profileImage && (
                      <Image src={post.user.profileImage} alt={post.user.name} fill className="object-cover" />
                    )}
                  </div>
                  <div>
                    <div className="font-bold text-sm">{post.user.name}</div>
                    <div className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest flex items-center gap-1">
                      {post.category === "DIET" ? <Utensils className="w-3 h-3" /> : <Dumbbell className="w-3 h-3" />}
                      {post.category} · {new Date(post.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                {post.imageUrl && (
                  <div className="aspect-square relative bg-zinc-100 dark:bg-zinc-800">
                    <Image src={post.imageUrl} alt="certification" fill className="object-cover" />
                  </div>
                )}
                <div className="p-4">
                  <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed whitespace-pre-wrap">
                    {post.content}
                  </p>
                </div>
              </div>
            )) : (
              <div className="text-center py-20 text-zinc-500">
                <div className="text-4xl mb-4">🥗</div>
                <p>아직 올라온 인증이 없습니다.<br/>첫 인증을 남겨보세요!</p>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
