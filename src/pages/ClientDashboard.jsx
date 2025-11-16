import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  TrendingUp, 
  Award, 
  Dumbbell,
  MapPin,
  Calendar,
  Trophy,
  Target,
  Flame
} from "lucide-react";
import { motion } from "framer-motion";

export default function ClientDashboard() {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    totalWorkouts: 0,
    activeSubscription: null,
    monthlyVisits: 0,
    streak: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const userData = await base44.auth.me();
      setUser(userData);
      
      // Mock stats - in produzione, questi verrebbero da un'entità CheckIn o simile
      setStats({
        totalWorkouts: 45,
        activeSubscription: userData.subscription_type,
        monthlyVisits: 12,
        streak: 5
      });
    } catch (error) {
      console.error("Error loading data:", error);
    }
    setLoading(false);
  };

  const feedItems = [
    {
      id: 1,
      type: "achievement",
      title: "Nuovo Traguardo Raggiunto! 🎉",
      description: "Hai completato 50 allenamenti questo mese!",
      icon: Trophy,
      color: "from-yellow-400 to-orange-500",
      timestamp: "2 ore fa",
      likes: 24,
      comments: 5
    },
    {
      id: 2,
      type: "checkin",
      title: "Check-in a Virgin Active Milano",
      description: "Sessione di cardio e pesi completata",
      icon: MapPin,
      color: "from-blue-500 to-blue-600",
      timestamp: "5 ore fa",
      likes: 18,
      comments: 3,
      gym: "Virgin Active Milano Mecenate"
    },
    {
      id: 3,
      type: "streak",
      title: "Striscia di 5 giorni! 🔥",
      description: "Continua così! Sei a un passo dalla striscia settimanale",
      icon: Flame,
      color: "from-red-500 to-orange-600",
      timestamp: "1 giorno fa",
      likes: 32,
      comments: 8
    },
    {
      id: 4,
      type: "goal",
      title: "Obiettivo settimanale completato ✅",
      description: "4 allenamenti su 4 completati questa settimana!",
      icon: Target,
      color: "from-green-500 to-emerald-600",
      timestamp: "2 giorni fa",
      likes: 21,
      comments: 4
    },
    {
      id: 5,
      type: "checkin",
      title: "Check-in a CrossFit Milano",
      description: "WOD completato: 150 burpees + 100 box jumps",
      icon: Dumbbell,
      color: "from-purple-500 to-purple-600",
      timestamp: "3 giorni fa",
      likes: 28,
      comments: 6,
      gym: "CrossFit Milano Centrale"
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Header Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="mb-6 overflow-hidden">
            <div className="h-32 bg-gradient-to-r from-blue-600 to-orange-600"></div>
            <CardContent className="pt-0 -mt-16 relative">
              <div className="flex flex-col md:flex-row md:items-end gap-4">
                <Avatar className="h-32 w-32 border-4 border-white shadow-lg">
                  <AvatarFallback className="text-3xl bg-gradient-to-br from-blue-500 to-orange-500 text-white">
                    {user?.full_name?.charAt(0).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 pb-4">
                  <h1 className="text-2xl font-bold text-gray-900">{user?.full_name}</h1>
                  {stats.activeSubscription && stats.activeSubscription !== "none" && (
                    <Badge className="mt-2 bg-gradient-to-r from-blue-600 to-orange-600 text-white">
                      {stats.activeSubscription.toUpperCase()}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{stats.totalWorkouts}</div>
                  <div className="text-sm text-gray-600">Allenamenti</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{stats.monthlyVisits}</div>
                  <div className="text-sm text-gray-600">Questo mese</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{stats.streak}</div>
                  <div className="text-sm text-gray-600">Giorni di fila</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">8</div>
                  <div className="text-sm text-gray-600">Traguardi</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Feed */}
        <div className="space-y-4">
          {feedItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${item.color} flex items-center justify-center`}>
                      <item.icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{item.title}</h3>
                      <p className="text-sm text-gray-500 flex items-center gap-2">
                        <Calendar className="w-3 h-3" />
                        {item.timestamp}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-700">{item.description}</p>
                  
                  {item.gym && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
                      <MapPin className="w-4 h-4 text-blue-600" />
                      <span>{item.gym}</span>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between pt-3 border-t">
                    <div className="flex items-center gap-6">
                      <button className="flex items-center gap-2 text-gray-600 hover:text-red-600 transition-colors">
                        <Heart className="w-5 h-5" />
                        <span className="text-sm font-medium">{item.likes}</span>
                      </button>
                      <button className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors">
                        <MessageCircle className="w-5 h-5" />
                        <span className="text-sm font-medium">{item.comments}</span>
                      </button>
                      <button className="flex items-center gap-2 text-gray-600 hover:text-green-600 transition-colors">
                        <Share2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Weekly Challenge Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-6"
        >
          <Card className="bg-gradient-to-r from-blue-600 to-orange-600 text-white">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Award className="w-8 h-8" />
                <div>
                  <h3 className="text-xl font-bold">Sfida Settimanale</h3>
                  <p className="text-blue-100 text-sm">Allenati 5 volte questa settimana</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Progresso</span>
                  <span className="font-semibold">3 / 5</span>
                </div>
                <div className="w-full bg-white/20 rounded-full h-3">
                  <div className="bg-white rounded-full h-3 transition-all duration-500" style={{ width: '60%' }}></div>
                </div>
                <p className="text-sm text-blue-100">Solo 2 allenamenti per completare la sfida! 💪</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}