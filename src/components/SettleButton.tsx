"use client";

import { settlePenalties } from "@/app/actions/post";
import { Calculator } from "lucide-react";
import { useState } from "react";

export default function SettleButton() {
  const [loading, setLoading] = useState(false);

  async function handleSettle() {
    if (confirm("정말로 지금 주간 벌점을 정산할까요? 부족한 횟수만큼 벌점이 즉시 추가됩니다!")) {
      setLoading(true);
      const res = await settlePenalties();
      if (res.success) {
        alert("벌점 정산 완료! 리더보드를 확인하세요! 🏁");
      } else {
        alert(res.error);
      }
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleSettle}
      disabled={loading}
      className="w-full mt-4 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors border border-zinc-200 dark:border-zinc-700"
    >
      <Calculator className="w-3.5 h-3.5" /> 주간 벌점 수동 정산하기
    </button>
  );
}
