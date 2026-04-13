import { prisma } from "@/lib/prisma";
import { Trophy, AlertCircle, Dumbbell, Utensils, Flame, User, LayoutGrid } from "lucide-react";
import Image from "next/image";
import PostForm from "@/components/PostForm";
import JoinForm from "@/components/JoinForm";
import DeleteButton from "@/components/DeleteButton";
import EditNameForm from "@/components/EditNameForm";
import ReactionButtons from "@/components/ReactionButtons";
import SettleButton from "@/components/SettleButton";
import CommentSection from "@/components/CommentSection";
import PenaltyHistoryView from "@/components/PenaltyHistory";
import Link from "next/link";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const params = await searchParams;
  const categoryFilter = params.category; // "DIET" or "WORKOUT"

  let usersWithProgress = [];
  let posts = [];

  try {
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const days = Math.floor((now.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000));
    const currentWeek = Math.ceil((days + startOfYear.getDay() + 1) / 7);
    const currentYear = now.getFullYear();

    const users = await prisma.user.findMany({
      include: {
        goals: { where: { year: currentYear, week: currentWeek } },
        posts: {
          where: {
            createdAt: {
              gte: new Date(new Date().setDate(now.getDate() - now.getDay() + 1))
            }
          }
        }
      },
      orderBy: { totalDemerits: "desc" }
    });

    usersWithProgress = users.map(user => {
      const goal = user.goals[0] || { workoutTarget: 3, dietTarget: 5 };
      const workoutCount = user.posts.filter(p => p.category === "WORKOUT").length;
      const dietCount = user.posts.filter(p => p.category === "DIET").length;
      const totalGoal = goal.workoutTarget + goal.dietTarget;
      const totalDone = workoutCount + dietCount;
      const progress = Math.min(Math.round((totalDone / totalGoal) * 100), 100);
      return { ...user, workoutCount, dietCount, goal, progress };
    });

    // 카테고리 필터 적용하여 포스트 가져오기
    posts = await prisma.post.findMany({
      where: categoryFilter ? { category: categoryFilter } : {},
      include: { 
        user: true,
        comments: {
          include: { user: true },
          orderBy: { createdAt: "asc" }
        }
      },
      orderBy: { createdAt: "desc" },
      take: 30,
    });

    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans pb-20 overflow-x-hidden">
        <header className="sticky top-0 z-20 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center shadow-lg shadow-red-500/20">
              <Flame className="w-5 h-5 text-white fill-white" />
            </div>
            <h1 className="text-lg font-black tracking-tighter uppercase italic text-red-500">Diet Squad</h1>
          </div>
          <div className="text-[10px] font-black bg-zinc-100 dark:bg-zinc-800 px-3 py-1 rounded-full uppercase tracking-widest text-zinc-500">Week {currentWeek}</div>
        </header>

        <main className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 p-4">
          <aside className="lg:col-span-4 space-y-6 order-2 lg:order-1">
            <JoinForm />
            <EditNameForm users={usersWithProgress} />

            <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-xl p-6 overflow-hidden">
              <h2 className="text-xs font-black text-zinc-400 mb-6 flex items-center gap-2 uppercase tracking-[0.2em]">
                <Trophy className="w-3.5 h-3.5" /> Ranking & Progress
              </h2>
              <div className="space-y-6">
                {usersWithProgress.map((user, idx) => (
                  <div key={user.id} className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center overflow-hidden border border-zinc-200 dark:border-zinc-700 ring-2 ring-zinc-50 dark:ring-zinc-800">
                          {user.profileImage ? <Image src={user.profileImage} alt={user.name} width={32} height={32} className="object-cover" /> : <User className="w-4 h-4 text-zinc-400" />}
                        </div>
                        <span className="font-bold text-sm tracking-tight">{user.name}</span>
                      </div>
                      <div className="flex items-center gap-1 text-red-500 font-black text-sm">
                        <AlertCircle className="w-3.5 h-3.5" /> {user.totalDemerits}
                      </div>
                    </div>
                    <div className="relative h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                      <div className={`absolute h-full transition-all duration-1000 ease-out rounded-full ${user.progress >= 100 ? "bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]" : "bg-red-500"}`} style={{ width: `${user.progress}%` }}></div>
                    </div>
                    <div className="flex justify-between text-[9px] font-black text-zinc-400 uppercase tracking-tighter">
                      <span>W {user.workoutCount}/{user.goal.workoutTarget}</span>
                      <span>D {user.dietCount}/{user.goal.dietTarget}</span>
                      <span className={user.progress >= 100 ? "text-green-500" : ""}>{user.progress}%</span>
                    </div>
                  </div>
                ))}
              </div>
              <SettleButton />
            </div>

            <PenaltyHistoryView />
          </aside>

          <section className="lg:col-span-8 space-y-6 order-1 lg:order-2">
            <PostForm users={usersWithProgress} />

            {/* Category Filter Tabs */}
            <div className="flex gap-2 p-1 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm sticky top-[4.5rem] z-10 backdrop-blur-sm bg-opacity-90">
              <Link 
                href="/"
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${!categoryFilter ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-lg shadow-zinc-900/20" : "text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800"}`}
              >
                <LayoutGrid className="w-3.5 h-3.5" /> All
              </Link>
              <Link 
                href="/?category=DIET"
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${categoryFilter === "DIET" ? "bg-green-500 text-white shadow-lg shadow-green-500/20" : "text-zinc-400 hover:bg-green-50 dark:hover:bg-green-950/20"}`}
              >
                <Utensils className="w-3.5 h-3.5" /> Diet
              </Link>
              <Link 
                href="/?category=WORKOUT"
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${categoryFilter === "WORKOUT" ? "bg-blue-500 text-white shadow-lg shadow-blue-500/20" : "text-zinc-400 hover:bg-blue-50 dark:hover:bg-blue-950/20"}`}
              >
                <Dumbbell className="w-3.5 h-3.5" /> Work
              </Link>
            </div>

            <div className="space-y-8 mt-4">
              {posts.map((post) => (
                <div key={post.id} className="bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm group transition-all hover:shadow-2xl">
                  <div className="p-5 flex items-center justify-between border-b border-zinc-50 dark:border-zinc-800/50">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 bg-zinc-100 dark:bg-zinc-800 rounded-2xl flex items-center justify-center overflow-hidden border border-zinc-200 dark:border-zinc-700">
                        {post.user.profileImage ? <Image src={post.user.profileImage} alt={post.user.name} width={44} height={44} className="object-cover" /> : <div className="w-full h-full flex items-center justify-center bg-zinc-100 dark:bg-zinc-800 font-black text-zinc-400 text-xs">?</div>}
                      </div>
                      <div>
                        <div className="font-black text-[15px] tracking-tight">{post.user.name}</div>
                        <div className="text-[10px] text-zinc-400 uppercase font-black tracking-widest flex items-center gap-1.5">
                          {post.category === "DIET" ? <Utensils className="w-3 h-3 text-green-500" /> : <Dumbbell className="w-3 h-3 text-blue-500" />}
                          {post.category} · {new Date(post.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <DeleteButton postId={post.id} />
                  </div>
                  {post.imageUrl && (
                    <div className="aspect-[4/5] relative bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                      <Image src={post.imageUrl} alt="post" fill className="object-cover group-hover:scale-105 transition-transform duration-1000" />
                    </div>
                  )}
                  <div className="p-6 space-y-5">
                    <p className="text-[15px] text-zinc-700 dark:text-zinc-300 font-medium leading-relaxed whitespace-pre-wrap">{post.content}</p>
                    
                    <div className="flex flex-col gap-4">
                      <div className="flex items-center justify-between border-t border-zinc-50 dark:border-zinc-800/50 pt-4">
                        <ReactionButtons 
                          postId={post.id} 
                          initialLikes={post.likes} 
                          initialFire={post.fire} 
                          initialStrong={post.strong} 
                        />
                      </div>
                      
                      <CommentSection 
                        postId={post.id} 
                        comments={post.comments} 
                        users={usersWithProgress} 
                      />
                    </div>
                  </div>
                </div>
              ))}
              {posts.length === 0 && (
                <div className="text-center py-32 bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 border-dashed">
                  <div className="text-5xl mb-6 grayscale opacity-50">🥗</div>
                  <p className="font-black text-zinc-400 uppercase tracking-widest text-sm">No {categoryFilter} logs yet.</p>
                </div>
              )}
            </div>
          </section>
        </main>
      </div>
    );
  } catch (error) {
    return <div className="min-h-screen flex items-center justify-center font-black uppercase tracking-widest text-red-500">System Error. Refresh Soon.</div>;
  }
}
