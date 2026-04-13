import { prisma } from "@/lib/prisma";
import { Trophy, AlertCircle, Dumbbell, Utensils, Flame, Heart, Target } from "lucide-react";
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
        {/* Header */}
        <header className="sticky top-0 z-20 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center">
              <Flame className="w-5 h-5 text-white fill-white" />
            </div>
            <h1 className="text-lg font-black tracking-tight uppercase italic">Diet Squad</h1>
          </div>
          <div className="flex items-center gap-3">
             <div className="text-[10px] font-bold bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded-full uppercase tracking-tighter">
               Week {currentWeek}
             </div>
          </div>
        </header>

        <main className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 p-4">
          {/* Sidebar: Progress & Ranking */}
          <aside className="lg:col-span-4 space-y-6 order-2 lg:order-1">
            <JoinForm />
            <EditNameForm users={usersWithProgress} />

            {/* Leaderboard Card */}
            <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-xl overflow-hidden">
              <div className="p-6 pb-2">
                <h2 className="text-xs font-black text-zinc-400 mb-4 flex items-center gap-2 uppercase tracking-[0.2em]">
                  <Trophy className="w-3.5 h-3.5" /> Squad Status
                </h2>
                <div className="space-y-6">
                  {usersWithProgress.length > 0 ? usersWithProgress.map((user, idx) => (
                    <div key={user.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center font-black text-[10px] ${idx === 0 && user.totalDemerits > 0 ? "bg-red-500 text-white" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500"}`}>
                            {idx + 1}
                          </div>
                          <span className="font-bold text-sm">{user.name}</span>
                          {user.progress >= 100 && <span className="text-[10px] bg-green-500 text-white px-1.5 rounded-md font-bold">TOP</span>}
                        </div>
                        <div className="flex items-center gap-1.5 text-red-500 font-black text-sm">
                          <AlertCircle className="w-3.5 h-3.5" /> {user.totalDemerits}
                        </div>
                      </div>
                      {/* Progress Bar */}
                      <div className="relative h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                        <div 
                          className={`absolute h-full transition-all duration-1000 ease-out rounded-full ${user.progress >= 100 ? "bg-green-500" : user.progress > 50 ? "bg-blue-500" : "bg-zinc-400"}`}
                          style={{ width: `${user.progress}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-[10px] font-bold text-zinc-400 tracking-tighter">
                        <span>운동 {user.workoutCount}/{user.goal.workoutTarget}</span>
                        <span>식단 {user.dietCount}/{user.goal.dietTarget}</span>
                        <span className={`${user.progress >= 100 ? "text-green-500" : ""}`}>{user.progress}%</span>
                      </div>
                    </div>
                  )) : (
                    <p className="text-zinc-500 text-sm py-4 text-center">아직 멤버가 없습니다.</p>
                  )}
                </div>
              </div>
              <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 mt-4">
                 <SettleButton />
              </div>
            </div>

            <div className="bg-zinc-900 text-white p-6 rounded-3xl border border-zinc-800 shadow-xl">
              <h3 className="font-black text-sm mb-2 uppercase tracking-wider flex items-center gap-2 text-red-500">
                <Flame className="w-4 h-4" /> Penalty Rule
              </h3>
              <p className="text-[11px] text-zinc-400 leading-relaxed font-medium">
                일요일 자정까지 목표를 달성하지 못하면,<br/>
                미달 횟수 1회당 벌점 <span className="text-white font-bold">1점</span>이 추가됩니다.
              </p>
            </div>
          </aside>

          {/* Main Feed */}
          <section className="lg:col-span-8 space-y-6 order-1 lg:order-2">
            <PostForm users={usersWithProgress} />

            <div className="space-y-8">
              {posts.length > 0 ? posts.map((post) => (
                <div key={post.id} className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-md group transition-all hover:shadow-xl">
                  <div className="p-4 flex items-center justify-between border-b border-zinc-50 dark:border-zinc-800">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-zinc-100 dark:bg-zinc-800 rounded-2xl flex items-center justify-center ring-2 ring-zinc-50 dark:ring-zinc-800">
                        {post.category === "DIET" ? <Utensils className="w-5 h-5 text-green-500" /> : <Dumbbell className="w-5 h-5 text-blue-500" />}
                      </div>
                      <div>
                        <div className="font-black text-sm">{post.user.name}</div>
                        <div className="text-[10px] text-zinc-400 uppercase font-black tracking-widest">
                          {post.category} · {new Date(post.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <DeleteButton postId={post.id} />
                  </div>
                  
                  {post.imageUrl && (
                    <div className="aspect-[4/5] relative bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                      <Image 
                        src={post.imageUrl} 
                        alt="certification" 
                        fill 
                        className="object-cover group-hover:scale-105 transition-transform duration-700" 
                      />
                    </div>
                  )}

                  <div className="p-5 space-y-4">
                    <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed font-medium whitespace-pre-wrap">
                      {post.content}
                    </p>
                    <div className="flex items-center justify-between pt-2 border-t border-zinc-50 dark:border-zinc-800/50">
                       <LikeButton postId={post.id} initialLikes={post.likes} />
                       <div className="flex gap-1">
                          <span className="w-1.5 h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-full"></span>
                          <span className="w-1.5 h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-full"></span>
                          <span className="w-1.5 h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-full"></span>
                       </div>
                    </div>
                  </div>
                </div>
              )) : (
                <div className="text-center py-32 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 border-dashed">
                  <div className="text-5xl mb-6 grayscale opacity-50 animate-bounce">🥗</div>
                  <p className="font-black text-zinc-400 uppercase tracking-widest text-sm">Waiting for the first log...</p>
                </div>
              )}
            </div>
          </section>
        </main>
      </div>
    );
  } catch (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-10 text-center">
        <div className="space-y-4">
          <div className="text-4xl">🛠️</div>
          <h2 className="font-black text-lg">System Maintenance</h2>
          <p className="text-zinc-500 text-sm">데이터베이스 연결을 확인 중입니다.<br/>1분 뒤에 새로고침 해주세요!</p>
        </div>
      </div>
    );
  }
}
