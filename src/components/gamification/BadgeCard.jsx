import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Trophy, 
  Flame, 
  Calendar, 
  Users, 
  MessageCircle, 
  Sparkles, 
  Dumbbell,
  Target
} from "lucide-react";

export default function BadgeCard({ achievement, locked = false }) {
  const getBadgeIcon = (type) => {
    const icons = {
      first_workout: Dumbbell,
      workout_master: Trophy,
      streak_3: Flame,
      streak_7: Flame,
      streak_30: Flame,
      event_participant: Calendar,
      social_butterfly: MessageCircle,
      ai_explorer: Sparkles,
      gym_enthusiast: Target
    };
    const Icon = icons[type] || Trophy;
    return Icon;
  };

  const getBadgeColor = (type) => {
    const colors = {
      first_workout: "from-green-400 to-emerald-500",
      workout_master: "from-yellow-400 to-orange-500",
      streak_3: "from-orange-400 to-red-500",
      streak_7: "from-red-400 to-pink-500",
      streak_30: "from-purple-400 to-purple-600",
      event_participant: "from-blue-400 to-blue-600",
      social_butterfly: "from-pink-400 to-pink-600",
      ai_explorer: "from-indigo-400 to-purple-500",
      gym_enthusiast: "from-cyan-400 to-blue-500"
    };
    return colors[type] || "from-gray-400 to-gray-600";
  };

  const Icon = getBadgeIcon(achievement.badge_type);
  const color = getBadgeColor(achievement.badge_type);

  return (
    <Card className={`hover:shadow-lg transition-all ${locked ? 'opacity-50 grayscale' : ''}`}>
      <CardContent className="p-4 text-center">
        <div className={`w-16 h-16 mx-auto mb-3 rounded-full bg-gradient-to-br ${color} flex items-center justify-center ${locked ? '' : 'animate-pulse'}`}>
          <Icon className="w-8 h-8 text-white" />
        </div>
        <h4 className="font-bold text-sm mb-1">{achievement.badge_name}</h4>
        <p className="text-xs text-gray-600 mb-2">{achievement.badge_description}</p>
        <Badge variant={locked ? "outline" : "default"} className={locked ? "" : `bg-gradient-to-r ${color} text-white border-0`}>
          +{achievement.points_earned} punti
        </Badge>
        {!locked && achievement.unlocked_date && (
          <p className="text-xs text-gray-500 mt-2">
            {new Date(achievement.unlocked_date).toLocaleDateString('it-IT')}
          </p>
        )}
      </CardContent>
    </Card>
  );
}