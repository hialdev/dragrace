"use client";

import { useEffect, useState } from "react";
import pb from "@/lib/pb";

interface StatItem {
  label: string;
  count: number;
  icon: string;
  color: string;
}

export default function ContentOverviewPage() {
  const [stats, setStats] = useState<StatItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true);
      try {
        const collections = [
          { name: "race_class", label: "Race Class", icon: "category", color: "text-blue-400" },
          { name: "race_category", label: "Race Category", icon: "sports_motorsports", color: "text-indigo-400" },
          { name: "race_pit", label: "Race Pit", icon: "garage", color: "text-purple-400" },
          { name: "star_guest", label: "Star Guest", icon: "star", color: "text-yellow-400" },
          { name: "partner", label: "Partner", icon: "handshake", color: "text-green-400" },
          { name: "timeline", label: "Timeline", icon: "calendar_month", color: "text-orange-400" },
          { name: "values", label: "Values", icon: "diamond", color: "text-teal-400" },
          { name: "prize_winner", label: "Prize Winner", icon: "military_tech", color: "text-pink-400" },
          { name: "payments", label: "Payments", icon: "payments", color: "text-emerald-400" },
        ];

        const promises = collections.map(async (c) => {
          try {
            const list = await pb.collection(c.name).getList(1, 1, { $autoCancel: false });
            return { label: c.label, count: list.totalItems, icon: c.icon, color: c.color };
          } catch (error) {
             return { label: c.label, count: 0, icon: c.icon, color: c.color };
          }
        });

        const results = await Promise.all(promises);
        setStats(results);
      } catch (err) {
        console.error("Failed to load stats", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-headline font-semibold text-white">Overview</h1>
        <p className="text-white/40 text-sm">Ringkasan data konten website.</p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <span className="w-8 h-8 border-4 border-white/20 border-t-[#b80014] rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {stats.map((stat, idx) => (
            <div key={idx} className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-white/10 transition-colors">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-white/50 text-xs uppercase tracking-wider font-medium mb-1">{stat.label}</p>
                  <p className="text-3xl font-headline font-bold text-white">{stat.count}</p>
                </div>
                <div className={`w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center ${stat.color}`}>
                  <span className="material-symbols-outlined">{stat.icon}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
