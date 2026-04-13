import { prisma } from "@/lib/prisma";
import { Trophy, AlertCircle, Dumbbell, Utensils, Flame, Heart, Target, User } from "lucide-react";
import Image from "next/image";
import PostForm from "@/components/PostForm";
import JoinForm from "@/components/JoinForm";
import DeleteButton from "@/components/DeleteButton";
import EditNameForm from "@/components/EditNameForm";
import LikeButton from "@/components/LikeButton";
import SettleButton from "@/components/SettleButton";

export default async function Home() {
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

    posts = await prisma.post.findMany({
      include: { user: true },
      orderBy: { createdAt: "desc" },
      take: 30,
    });

    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans pb-20 overflow-x-hidden">
        <header className="sticky top-0 z-20 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center">
              <Flame className="w-5 h-5 text-white fill-white" />
            </div>
            <h1 className="text-lg font-black tracking-tight uppercase italic text-red-500">Diet Squad</h1>
          </div>
          <div className="text-[10px] font-bold bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded-full uppercase tracking-tighter">Week {currentWeek}</div>
        </header>

        <main className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 p-4">
          <aside className="lg:col-span-4 space-y-6 order-2 lg:order-1">
            <JoinForm />
            <EditNameForm users={usersWithProgress} />

            <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-xl p-6 overflow-hidden">
              <h2 className="text-xs font-black text-zinc-400 mb-6 flex items-center gap-2 uppercase tracking-[0.2em]">
                <Trophy className="w-3.5 h-3.5" /> Squad Status
              </h2>
              <div className="space-y-6">
                {usersWithProgress.length > 0 ? usersWithProgress.map((user, idx) => (
                  <div key={user.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center overflow-hidden border border-zinc-200 dark:border-zinc-700">
                          {user.profileImage ? (
                            <Image src={user.profileImage} alt={user.name} width={32} height={32} className="object-cover" />
                          ) : (
                            <User className="w-4 h-4 text-zinc-400" />
                          )}
                        </div>
                        <span className="font-bold text-sm">{user.name}</span>
                      </div>
                      <div className="flex items-center gap-1 text-red-500 font-black text-sm">
                        <AlertCircle className="w-3.5 h-3.5" /> {user.totalDemerits}
                      </div>
                    </div>
                    <div className="relative h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                      <div className={`absolute h-full transition-all duration-1000 ease-out rounded-full ${user.progress >= 100 ? "bg-green-500" : "bg-red-500"}`} style={{ width: `${user.progress}%` }}></div>
                    </div>
                    <div className="flex justify-between text-[9px] font-black text-zinc-400 uppercase">
                      <span>Work {user.workoutCount}/{user.goal.workoutTarget}</span>
                      <span>Diet {user.dietCount}/{user.goal.dietTarget}</span>
                    </div>
                  </div>
                )) : <p className="text-zinc-500 text-sm py-4 text-center">No members yet.</p>}
              </div>
              <SettleButton />
            </div>
          </aside>

          <section className="lg:col-span-8 space-y-6 order-1 lg:order-2">
            <PostForm users={usersWithProgress} />
            <div className="space-y-8">
              {posts.length > 0 ? posts.map((post) => (
                <div key={post.id} className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm group">
                  <div className="p-4 flex items-center justify-between border-b border-zinc-50 dark:border-zinc-800">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-zinc-100 dark:bg-zinc-800 rounded-2xl flex items-center justify-center overflow-hidden border border-zinc-200 dark:border-zinc-700">
                        {post.user.profileImage ? (
                          <Image src={post.user.profileImage} alt={post.user.name} width={40} height={40} className="object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-zinc-50 dark:bg-zinc-800 font-bold text-zinc-400 text-xs">?</div>
                        )}
                      </div>
                      <div>
                        <div className="font-black text-sm">{post.user.name}</div>
                        <div className="text-[10px] text-zinc-400 uppercase font-black tracking-widest">{post.category} · {new Date(post.createdAt).toLocaleDateString()}</div>
                      </div>
                    </div>
                    {/* 삭제 버튼 복구! */}
                    <div className="flex items-center gap-2">
                       <DeleteButton postId={post.id} />
                    </div>
                  </div>
                  {post.imageUrl && (
                    <div className="aspect-[4/5] relative bg-zinc-100 dark:bg-zinc-800">
                      <Image src={post.imageUrl} alt="certification" fill className="object-cover" />
                    </div>
                  )}
                  <div className="p-5 space-y-4">
                    <p className="text-sm text-zinc-700 dark:text-zinc-300 font-medium leading-relaxed whitespace-pre-wrap">{post.content}</p>
                    <div className="pt-2 border-t border-zinc-50 dark:border-zinc-800/50 flex justify-between items-center">
                       <LikeButton postId={post.id} initialLikes={post.likes} />
                    </div>
                  </div>
                </div>
              )) : <div className="text-center py-32 font-black text-zinc-300 uppercase tracking-widest">Waiting for logs...</div>}
            </div>
          </section>
        </main>
      </div>
    );
  } catch (error) {
    return <div className="p-20 text-center font-black">SYSTEM ERROR. RELOAD SOON.</div>;
  }
}
