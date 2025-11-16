import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Trophy, Flame, Calendar, Dumbbell } from "lucide-react";

export default function ProgressStats({ user }) {
  const stats = [
    {
      icon: Trophy,
      label: "Punti Totali",
      value: user?.total_points || 0,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50"
    },
    {
      icon: Flame,
      label: "Streak Corrente",
      value: `${user?.current_streak || 0} giorni`,
      color: "text-orange-600",
      bgColor: "bg-orange-50"
    },
    {
      icon: Dumbbell,
      label: "Allenamenti",
      value: user?.completed_workouts || 0,
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      icon: Calendar,
      label: "Eventi",
      value: user?.events_attended || 0,
      color: "text-green-600",
      bgColor: "bg-green-50"
    }
  ];

  const levelProgress = ((user?.total_points || 0) % 1000) / 10;
  const currentLevel = Math.floor((user?.total_points || 0) / 1000) + 1;

  return (
    <Card className="bg-gradient-to-br from-blue-50 to-orange-50">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Livello {currentLevel}</h3>
            <p className="text-sm text-gray-600">
              {user?.total_points || 0} / {currentLevel * 1000} punti
            </p>
          </div>
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-orange-500 flex items-center justify-center">
            <Trophy className="w-8 h-8 text-white" />
          </div>
        </div>
        <Progress value={levelProgress} className="h-2 mb-6" />
        
        <div className="grid grid-cols-2 gap-3">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className={`${stat.bgColor} rounded-lg p-3`}>
                <div className="flex items-center gap-2 mb-1">
                  <Icon className={`w-4 h-4 ${stat.color}`} />
                  <span className="text-xs text-gray-600">{stat.label}</span>
                </div>
                <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}