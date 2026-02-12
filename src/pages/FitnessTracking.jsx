import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Activity, 
  Flame, 
  Footprints, 
  Heart, 
  Clock, 
  Droplets, 
  Moon,
  Scale,
  TrendingUp,
  TrendingDown,
  Plus,
  StickyNote,
  Dumbbell,
  Watch,
  FileText
} from "lucide-react";
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { motion } from "framer-motion";

export default function FitnessTracking() {
  const [user, setUser] = useState(null);
  const [metrics, setMetrics] = useState([]);
  const [notes, setNotes] = useState([]);
  const [workoutPlans, setWorkoutPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddMetric, setShowAddMetric] = useState(false);
  const [showAddNote, setShowAddNote] = useState(false);
  
  const [newMetric, setNewMetric] = useState({
    date: new Date().toISOString().split('T')[0],
    weight: "",
    calories_burned: "",
    steps: "",
    heart_rate_avg: "",
    workout_duration: "",
    water_intake: "",
    sleep_hours: "",
    notes: ""
  });

  const [newNote, setNewNote] = useState({
    title: "",
    content: "",
    exercise_name: "",
    tags: []
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const userData = await base44.auth.me();
      setUser(userData);

      const [metricsData, notesData, plansData] = await Promise.all([
        base44.entities.FitnessMetric.filter({ user_email: userData.email }, "-date", 30),
        base44.entities.WorkoutNote.filter({ user_email: userData.email }, "-created_date"),
        base44.entities.WorkoutPlan.filter({ user_email: userData.email }, "-created_date")
      ]);

      setMetrics(metricsData);
      setNotes(notesData);
      setWorkoutPlans(plansData);
    } catch (error) {
      console.error("Error loading data:", error);
    }
    setLoading(false);
  };

  const handleAddMetric = async (e) => {
    e.preventDefault();
    
    const metricData = {
      user_email: user.email,
      date: newMetric.date,
      ...(newMetric.weight && { weight: parseFloat(newMetric.weight) }),
      ...(newMetric.calories_burned && { calories_burned: parseFloat(newMetric.calories_burned) }),
      ...(newMetric.steps && { steps: parseInt(newMetric.steps) }),
      ...(newMetric.heart_rate_avg && { heart_rate_avg: parseFloat(newMetric.heart_rate_avg) }),
      ...(newMetric.workout_duration && { workout_duration: parseFloat(newMetric.workout_duration) }),
      ...(newMetric.water_intake && { water_intake: parseFloat(newMetric.water_intake) }),
      ...(newMetric.sleep_hours && { sleep_hours: parseFloat(newMetric.sleep_hours) }),
      ...(newMetric.notes && { notes: newMetric.notes })
    };

    await base44.entities.FitnessMetric.create(metricData);
    
    setNewMetric({
      date: new Date().toISOString().split('T')[0],
      weight: "",
      calories_burned: "",
      steps: "",
      heart_rate_avg: "",
      workout_duration: "",
      water_intake: "",
      sleep_hours: "",
      notes: ""
    });
    setShowAddMetric(false);
    await loadData();
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    
    await base44.entities.WorkoutNote.create({
      ...newNote,
      user_email: user.email
    });
    
    setNewNote({
      title: "",
      content: "",
      exercise_name: "",
      tags: []
    });
    setShowAddNote(false);
    await loadData();
  };

  const getLatestMetric = () => {
    if (metrics.length === 0) return null;
    return metrics[0];
  };

  const getWeightChange = () => {
    if (metrics.length < 2) return null;
    const latest = metrics[0]?.weight;
    const previous = metrics[1]?.weight;
    if (!latest || !previous) return null;
    return (latest - previous).toFixed(1);
  };

  const getChartData = () => {
    return metrics.slice().reverse().map(m => ({
      date: new Date(m.date).toLocaleDateString('it-IT', { day: 'numeric', month: 'short' }),
      peso: m.weight || null,
      calorie: m.calories_burned || null,
      passi: m.steps ? m.steps / 1000 : null
    }));
  };

  const latestMetric = getLatestMetric();
  const weightChange = getWeightChange();

  const statsCards = [
    {
      icon: Scale,
      label: "Peso Attuale",
      value: latestMetric?.weight ? `${latestMetric.weight} kg` : "-",
      change: weightChange,
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: Flame,
      label: "Calorie Bruciate",
      value: latestMetric?.calories_burned || "-",
      subtext: "oggi",
      color: "from-orange-500 to-red-500"
    },
    {
      icon: Footprints,
      label: "Passi",
      value: latestMetric?.steps || "-",
      subtext: "oggi",
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: Heart,
      label: "Battito Medio",
      value: latestMetric?.heart_rate_avg ? `${latestMetric.heart_rate_avg} bpm` : "-",
      color: "from-red-500 to-pink-500"
    },
    {
      icon: Clock,
      label: "Allenamento",
      value: latestMetric?.workout_duration ? `${latestMetric.workout_duration} min` : "-",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: Droplets,
      label: "Acqua",
      value: latestMetric?.water_intake ? `${latestMetric.water_intake} L` : "-",
      color: "from-cyan-500 to-blue-500"
    },
    {
      icon: Moon,
      label: "Sonno",
      value: latestMetric?.sleep_hours ? `${latestMetric.sleep_hours} h` : "-",
      color: "from-indigo-500 to-purple-500"
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0a0a0a]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] p-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-black text-white mb-2">I Miei Dati</h1>
              <p className="text-gray-400">Monitora i tuoi progressi fitness</p>
            </div>
            <Badge className="bg-white/10 text-white border-white/20 flex items-center gap-2 px-4 py-2">
              <Watch className="w-4 h-4" />
              Sincronizza Smartwatch
            </Badge>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
            {statsCards.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <Card className="bg-[#1a1a1a] border-white/10 hover:bg-[#222] transition-all">
                    <CardContent className="p-4">
                      <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center mb-3`}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                      <div className="text-xs text-gray-400">{stat.label}</div>
                      {stat.subtext && <div className="text-xs text-gray-500 mt-1">{stat.subtext}</div>}
                      {stat.change && (
                        <div className={`flex items-center gap-1 mt-2 text-xs ${parseFloat(stat.change) > 0 ? 'text-red-400' : 'text-green-400'}`}>
                          {parseFloat(stat.change) > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                          {Math.abs(parseFloat(stat.change))} kg
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          <Tabs defaultValue="metrics" className="space-y-6">
            <TabsList className="bg-[#1a1a1a] border border-white/10">
              <TabsTrigger value="metrics" className="data-[state=active]:bg-white data-[state=active]:text-black">
                <Activity className="w-4 h-4 mr-2" />
                Metriche
              </TabsTrigger>
              <TabsTrigger value="plans" className="data-[state=active]:bg-white data-[state=active]:text-black">
                <Dumbbell className="w-4 h-4 mr-2" />
                Schede
              </TabsTrigger>
              <TabsTrigger value="notes" className="data-[state=active]:bg-white data-[state=active]:text-black">
                <StickyNote className="w-4 h-4 mr-2" />
                Appunti
              </TabsTrigger>
            </TabsList>

            {/* Metrics Tab */}
            <TabsContent value="metrics" className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white">Andamento</h2>
                <Button
                  onClick={() => setShowAddMetric(!showAddMetric)}
                  className="bg-white text-black hover:bg-gray-200 rounded-full"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Aggiungi Dati
                </Button>
              </div>

              {showAddMetric && (
                <Card className="bg-[#1a1a1a] border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white">Nuova Misurazione</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleAddMetric} className="space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label className="text-white">Data</Label>
                          <Input
                            type="date"
                            value={newMetric.date}
                            onChange={(e) => setNewMetric({...newMetric, date: e.target.value})}
                            className="bg-white/5 border-white/10 text-white"
                            required
                          />
                        </div>
                        <div>
                          <Label className="text-white">Peso (kg)</Label>
                          <Input
                            type="number"
                            step="0.1"
                            value={newMetric.weight}
                            onChange={(e) => setNewMetric({...newMetric, weight: e.target.value})}
                            className="bg-white/5 border-white/10 text-white"
                          />
                        </div>
                        <div>
                          <Label className="text-white">Calorie Bruciate</Label>
                          <Input
                            type="number"
                            value={newMetric.calories_burned}
                            onChange={(e) => setNewMetric({...newMetric, calories_burned: e.target.value})}
                            className="bg-white/5 border-white/10 text-white"
                          />
                        </div>
                        <div>
                          <Label className="text-white">Passi</Label>
                          <Input
                            type="number"
                            value={newMetric.steps}
                            onChange={(e) => setNewMetric({...newMetric, steps: e.target.value})}
                            className="bg-white/5 border-white/10 text-white"
                          />
                        </div>
                        <div>
                          <Label className="text-white">Battito Medio (bpm)</Label>
                          <Input
                            type="number"
                            value={newMetric.heart_rate_avg}
                            onChange={(e) => setNewMetric({...newMetric, heart_rate_avg: e.target.value})}
                            className="bg-white/5 border-white/10 text-white"
                          />
                        </div>
                        <div>
                          <Label className="text-white">Minuti Allenamento</Label>
                          <Input
                            type="number"
                            value={newMetric.workout_duration}
                            onChange={(e) => setNewMetric({...newMetric, workout_duration: e.target.value})}
                            className="bg-white/5 border-white/10 text-white"
                          />
                        </div>
                        <div>
                          <Label className="text-white">Acqua (L)</Label>
                          <Input
                            type="number"
                            step="0.1"
                            value={newMetric.water_intake}
                            onChange={(e) => setNewMetric({...newMetric, water_intake: e.target.value})}
                            className="bg-white/5 border-white/10 text-white"
                          />
                        </div>
                        <div>
                          <Label className="text-white">Ore di Sonno</Label>
                          <Input
                            type="number"
                            step="0.5"
                            value={newMetric.sleep_hours}
                            onChange={(e) => setNewMetric({...newMetric, sleep_hours: e.target.value})}
                            className="bg-white/5 border-white/10 text-white"
                          />
                        </div>
                      </div>
                      <div>
                        <Label className="text-white">Note Giornaliere</Label>
                        <Textarea
                          value={newMetric.notes}
                          onChange={(e) => setNewMetric({...newMetric, notes: e.target.value})}
                          className="bg-white/5 border-white/10 text-white"
                          rows={3}
                        />
                      </div>
                      <Button type="submit" className="w-full bg-white text-black hover:bg-gray-200 rounded-full">
                        Salva Misurazione
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              )}

              {/* Charts */}
              {metrics.length > 0 && (
                <div className="grid md:grid-cols-2 gap-6">
                  <Card className="bg-[#1a1a1a] border-white/10">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <Scale className="w-5 h-5" />
                        Peso nel Tempo
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={250}>
                        <LineChart data={getChartData()}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                          <XAxis dataKey="date" stroke="#666" />
                          <YAxis stroke="#666" />
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '8px' }}
                            labelStyle={{ color: '#fff' }}
                          />
                          <Line type="monotone" dataKey="peso" stroke="#a855f7" strokeWidth={3} dot={{ fill: '#a855f7' }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  <Card className="bg-[#1a1a1a] border-white/10">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <Flame className="w-5 h-5" />
                        Calorie Bruciate
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={250}>
                        <AreaChart data={getChartData()}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                          <XAxis dataKey="date" stroke="#666" />
                          <YAxis stroke="#666" />
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '8px' }}
                            labelStyle={{ color: '#fff' }}
                          />
                          <Area type="monotone" dataKey="calorie" stroke="#f97316" fill="#f97316" fillOpacity={0.3} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>
              )}
            </TabsContent>

            {/* Workout Plans Tab */}
            <TabsContent value="plans" className="space-y-6">
              <h2 className="text-2xl font-bold text-white">Le Mie Schede</h2>
              {workoutPlans.length > 0 ? (
                <div className="grid md:grid-cols-2 gap-6">
                  {workoutPlans.map((plan) => (
                    <Card key={plan.id} className="bg-[#1a1a1a] border-white/10 hover:bg-[#222] transition-all">
                      <CardHeader>
                        <CardTitle className="text-white flex items-center justify-between">
                          <span>{plan.name}</span>
                          <Badge className="bg-gradient-to-r from-blue-500 to-orange-500 text-white">
                            {plan.fitness_level}
                          </Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="text-gray-400 text-sm">
                          <strong>Obiettivo:</strong> {plan.goal}
                        </div>
                        <div className="text-gray-400 text-sm">
                          <strong>Durata:</strong> {plan.duration_weeks} settimane • {plan.days_per_week} giorni/settimana
                        </div>
                        {plan.exercises && plan.exercises.length > 0 && (
                          <div className="space-y-2">
                            <div className="text-white font-semibold text-sm">Esercizi:</div>
                            {plan.exercises.slice(0, 3).map((exercise, i) => (
                              <div key={i} className="bg-white/5 rounded-lg p-3">
                                <div className="text-white font-medium">{exercise.name}</div>
                                <div className="text-gray-400 text-sm">
                                  {exercise.sets} serie × {exercise.reps} rip • {exercise.rest_seconds}s riposo
                                </div>
                                {exercise.notes && (
                                  <div className="text-gray-500 text-xs mt-1">{exercise.notes}</div>
                                )}
                              </div>
                            ))}
                            {plan.exercises.length > 3 && (
                              <div className="text-gray-500 text-sm">
                                +{plan.exercises.length - 3} altri esercizi
                              </div>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="bg-[#1a1a1a] border-white/10 py-12">
                  <CardContent className="text-center">
                    <Dumbbell className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400">Nessuna scheda di allenamento ancora</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Notes Tab */}
            <TabsContent value="notes" className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white">Appunti Personali</h2>
                <Button
                  onClick={() => setShowAddNote(!showAddNote)}
                  className="bg-white text-black hover:bg-gray-200 rounded-full"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Nuovo Appunto
                </Button>
              </div>

              {showAddNote && (
                <Card className="bg-[#1a1a1a] border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white">Nuovo Appunto</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleAddNote} className="space-y-4">
                      <div>
                        <Label className="text-white">Titolo</Label>
                        <Input
                          value={newNote.title}
                          onChange={(e) => setNewNote({...newNote, title: e.target.value})}
                          className="bg-white/5 border-white/10 text-white"
                          required
                        />
                      </div>
                      <div>
                        <Label className="text-white">Esercizio (opzionale)</Label>
                        <Input
                          value={newNote.exercise_name}
                          onChange={(e) => setNewNote({...newNote, exercise_name: e.target.value})}
                          className="bg-white/5 border-white/10 text-white"
                        />
                      </div>
                      <div>
                        <Label className="text-white">Contenuto</Label>
                        <Textarea
                          value={newNote.content}
                          onChange={(e) => setNewNote({...newNote, content: e.target.value})}
                          className="bg-white/5 border-white/10 text-white"
                          rows={4}
                          required
                        />
                      </div>
                      <Button type="submit" className="w-full bg-white text-black hover:bg-gray-200 rounded-full">
                        Salva Appunto
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              )}

              {notes.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {notes.map((note) => (
                    <Card key={note.id} className="bg-[#1a1a1a] border-white/10 hover:bg-[#222] transition-all">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3 mb-3">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center flex-shrink-0">
                            <FileText className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-white truncate">{note.title}</h3>
                            {note.exercise_name && (
                              <div className="text-xs text-gray-400 mt-1">{note.exercise_name}</div>
                            )}
                          </div>
                        </div>
                        <p className="text-gray-300 text-sm line-clamp-3">{note.content}</p>
                        <div className="text-xs text-gray-500 mt-3">
                          {new Date(note.created_date).toLocaleDateString('it-IT')}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="bg-[#1a1a1a] border-white/10 py-12">
                  <CardContent className="text-center">
                    <StickyNote className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400">Nessun appunto ancora</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}