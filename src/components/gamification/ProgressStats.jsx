import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Trophy, Flame, Calendar, Dumbbell } from "lucide-react";
import { motion } from "framer-motion";

export default function ProgressStats({ user }) {
  const totalPoints = user?.total_points || 0;
  const currentLevel = user?.level || 1;
  
  // Sistema di livelli esponenziale - richiede più punti per ogni livello
  const getPointsForLevel = (level) => {
    const basePoints = 500;
    return Math.floor(basePoints * Math.pow(1.5, level - 1));
  };
  
  const pointsForCurrentLevel = currentLevel > 1 ? getPointsForLevel(currentLevel - 1) : 0;
  const pointsForNextLevel = getPointsForLevel(currentLevel);
  const pointsNeededForNextLevel = pointsForNextLevel - pointsForCurrentLevel;
  const pointsInCurrentLevel = totalPoints - pointsForCurrentLevel;
  const progressPercentage = Math.min((pointsInCurrentLevel / pointsNeededForNextLevel) * 100, 100);

  const getLevelTitle = (level) => {
    const titles = [
      "Principiante", "Novizio", "Allievo", "Esperto", "Veterano",
      "Elite", "Maestro", "Leggenda", "Campione", "Icona"
    ];
    return titles[Math.min(level - 1, 9)] || "Icona";
  };

  const stats = [
    {
      icon: Trophy,
      label: "Punti Totali",
      value: totalPoints,
      color: "text-yellow-500",
      bgColor: "bg-yellow-500/10"
    },
    {
      icon: Flame,
      label: "Streak Corrente",
      value: `${user?.current_streak || 0} giorni`,
      color: "text-orange-500",
      bgColor: "bg-orange-500/10"
    },
    {
      icon: Dumbbell,
      label: "Allenamenti",
      value: user?.completed_workouts || 0,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10"
    },
    {
      icon: Calendar,
      label: "Eventi",
      value: user?.events_attended || 0,
      color: "text-green-500",
      bgColor: "bg-green-500/10"
    }
  ];

  return (
    <Card className="bg-gradient-to-r from-blue-600 to-orange-600 text-white overflow-hidden relative">
      <div className="absolute inset-0 bg-black/10"></div>
      <CardContent className="p-6 relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-sm opacity-90 mb-1">Livello {currentLevel}</div>
            <div className="text-4xl font-black mb-1">{getLevelTitle(currentLevel)}</div>
            <div className="text-xs opacity-80">{totalPoints.toLocaleString()} Punti Totali</div>
          </div>
          <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border-4 border-white/30">
            <span className="text-3xl font-black">{currentLevel}</span>
          </div>
        </div>
        
        <div className="space-y-2 mb-6">
          <div className="flex justify-between text-sm">
            <span>Progresso verso Livello {currentLevel + 1}</span>
            <span>{pointsInCurrentLevel} / {pointsNeededForNextLevel}</span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-4 overflow-hidden backdrop-blur-sm">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="h-full bg-white rounded-full shadow-lg"
            />
          </div>
          {currentLevel < 10 && (
            <div className="text-xs opacity-80 text-right">
              {pointsNeededForNextLevel - pointsInCurrentLevel} punti al prossimo livello
            </div>
          )}
          {currentLevel === 10 && (
            <div className="text-sm font-bold text-center mt-2">
              🏆 Livello Massimo Raggiunto! 🏆
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Icon className="w-4 h-4 text-white" />
                  <span className="text-xs opacity-80">{stat.label}</span>
                </div>
                <p className="text-xl font-bold text-white">{stat.value}</p>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}