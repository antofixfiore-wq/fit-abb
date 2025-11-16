
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Sparkles,
  Dumbbell,
  Clock,
  Repeat,
  ChevronRight,
  Save,
  AlertCircle,
  CheckCircle,
  Trash2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function WorkoutPlanner() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [savedPlans, setSavedPlans] = useState([]);
  const [generatedPlan, setGeneratedPlan] = useState(null);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);
  
  const [formData, setFormData] = useState({
    goal: "",
    fitness_level: "intermedio",
    equipment: [],
    days_per_week: 3,
    duration_weeks: 4
  });

  const equipmentOptions = [
    "Bilanciere",
    "Manubri",
    "Panca",
    "Kettlebell",
    "Elastici",
    "Macchine",
    "Pull-up bar",
    "Corpo libero"
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const userData = await base44.auth.me();
      setUser(userData);
      
      const plans = await base44.entities.WorkoutPlan.filter(
        { user_email: userData.email },
        "-created_date"
      );
      setSavedPlans(plans);
    } catch (error) {
      console.error("Error loading data:", error);
    }
    setLoading(false);
  };

  const toggleEquipment = (equipment) => {
    setFormData(prev => ({
      ...prev,
      equipment: prev.equipment.includes(equipment)
        ? prev.equipment.filter(e => e !== equipment)
        : [...prev.equipment, equipment]
    }));
  };

  const handleGeneratePlan = async (e) => {
    e.preventDefault();
    setGenerating(true);
    setError(null);
    setSuccess(null);
    setGeneratedPlan(null);

    try {
      const prompt = `Crea un piano di allenamento personalizzato in italiano per un utente con le seguenti caratteristiche:
- Obiettivo: ${formData.goal}
- Livello di fitness: ${formData.fitness_level}
- Attrezzatura disponibile: ${formData.equipment.join(", ") || "Corpo libero"}
- Giorni a settimana: ${formData.days_per_week}
- Durata: ${formData.duration_weeks} settimane

Genera un programma completo con esercizi specifici, serie, ripetizioni e tempi di recupero. Assicurati che sia bilanciato e progressivo.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: prompt,
        response_json_schema: {
          type: "object",
          properties: {
            name: {
              type: "string",
              description: "Nome del piano di allenamento"
            },
            description: {
              type: "string",
              description: "Breve descrizione del piano"
            },
            exercises: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  sets: { type: "number" },
                  reps: { type: "string" },
                  rest_seconds: { type: "number" },
                  notes: { type: "string" }
                }
              }
            }
          }
        }
      });

      setGeneratedPlan(response);
      setSuccess("Piano di allenamento generato con successo!");
    } catch (error) {
      setError("Errore nella generazione del piano. Riprova.");
      console.error("Error generating plan:", error);
    }
    setGenerating(false);
  };

  const handleSavePlan = async () => {
    if (!generatedPlan) return;

    try {
      await base44.entities.WorkoutPlan.create({
        user_email: user.email,
        name: generatedPlan.name,
        goal: formData.goal,
        fitness_level: formData.fitness_level,
        equipment: formData.equipment,
        exercises: generatedPlan.exercises,
        duration_weeks: formData.duration_weeks,
        days_per_week: formData.days_per_week
      });

      await base44.entities.FeedPost.create({
        user_email: user.email,
        user_name: user.full_name,
        type: "workout",
        title: `Nuovo piano: ${generatedPlan.name}`,
        description: generatedPlan.description || `Piano personalizzato per ${formData.goal}`
      });

      const existingAchievements = await base44.entities.UserAchievement.filter({
        user_email: user.email,
        badge_type: "ai_explorer"
      });

      if (existingAchievements.length === 0) {
        await base44.entities.UserAchievement.create({
          user_email: user.email,
          badge_type: "ai_explorer",
          badge_name: "Esploratore AI",
          badge_description: "Hai generato il tuo primo piano AI",
          points_earned: 100,
          unlocked_date: new Date().toISOString().split('T')[0]
        });

        await base44.auth.updateMe({
          total_points: (user.total_points || 0) + 100
        });
      }

      await loadData();
      setGeneratedPlan(null);
      setFormData({
        goal: "",
        fitness_level: "intermedio",
        equipment: [],
        days_per_week: 3,
        duration_weeks: 4
      });
      setSuccess("Piano salvato e condiviso nel feed!");
    } catch (error) {
      setError("Errore nel salvataggio del piano");
      console.error("Error saving plan:", error);
    }
  };

  const handleDeletePlan = async (planId) => {
    if (!confirm("Sei sicuro di voler eliminare questo piano?")) return;
    
    try {
      await base44.entities.WorkoutPlan.delete(planId);
      await loadData();
      setSuccess("Piano eliminato");
    } catch (error) {
      setError("Errore nell'eliminazione");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900">AI Workout Planner</h1>
            </div>
            <p className="text-gray-600">Genera piani di allenamento personalizzati con l'intelligenza artificiale</p>
          </div>

          {success && (
            <Alert className="mb-6 bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">{success}</AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Generator Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Dumbbell className="w-5 h-5" />
                  Genera Nuovo Piano
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleGeneratePlan} className="space-y-6">
                  <div>
                    <Label htmlFor="goal">Obiettivo</Label>
                    <Textarea
                      id="goal"
                      placeholder="Es. Perdere peso, aumentare massa muscolare, migliorare resistenza..."
                      value={formData.goal}
                      onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
                      required
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label>Livello di Fitness</Label>
                    <Select
                      value={formData.fitness_level}
                      onValueChange={(value) => setFormData({ ...formData, fitness_level: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="principiante">Principiante</SelectItem>
                        <SelectItem value="intermedio">Intermedio</SelectItem>
                        <SelectItem value="avanzato">Avanzato</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="mb-3 block">Attrezzatura Disponibile</Label>
                    <div className="grid grid-cols-2 gap-3">
                      {equipmentOptions.map((equipment) => (
                        <div key={equipment} className="flex items-center space-x-2">
                          <Checkbox
                            id={equipment}
                            checked={formData.equipment.includes(equipment)}
                            onCheckedChange={() => toggleEquipment(equipment)}
                          />
                          <Label htmlFor={equipment} className="text-sm font-normal cursor-pointer">
                            {equipment}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Giorni/Settimana</Label>
                      <Input
                        type="number"
                        min="1"
                        max="7"
                        value={formData.days_per_week}
                        onChange={(e) => setFormData({ ...formData, days_per_week: parseInt(e.target.value) })}
                      />
                    </div>
                    <div>
                      <Label>Durata (Settimane)</Label>
                      <Input
                        type="number"
                        min="1"
                        max="12"
                        value={formData.duration_weeks}
                        onChange={(e) => setFormData({ ...formData, duration_weeks: parseInt(e.target.value) })}
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                    disabled={generating}
                    size="lg"
                  >
                    {generating ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Generazione in corso...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5 mr-2" />
                        Genera Piano AI
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Generated Plan */}
            <div className="space-y-6">
              <AnimatePresence>
                {generatedPlan && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                  >
                    <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-purple-900">{generatedPlan.name}</CardTitle>
                            {generatedPlan.description && (
                              <p className="text-sm text-purple-700 mt-2">{generatedPlan.description}</p>
                            )}
                          </div>
                          <Badge className="bg-purple-600 text-white">Nuovo</Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-3">
                          {generatedPlan.exercises?.map((exercise, index) => (
                            <div key={index} className="bg-white rounded-lg p-4 shadow-sm">
                              <div className="flex items-start justify-between mb-2">
                                <h4 className="font-semibold text-gray-900">{exercise.name}</h4>
                                <Badge variant="outline">{index + 1}</Badge>
                              </div>
                              <div className="grid grid-cols-3 gap-3 text-sm mb-2">
                                <div className="flex items-center gap-1 text-gray-600">
                                  <Repeat className="w-4 h-4" />
                                  <span>{exercise.sets} serie</span>
                                </div>
                                <div className="flex items-center gap-1 text-gray-600">
                                  <ChevronRight className="w-4 h-4" />
                                  <span>{exercise.reps} rip</span>
                                </div>
                                <div className="flex items-center gap-1 text-gray-600">
                                  <Clock className="w-4 h-4" />
                                  <span>{exercise.rest_seconds}s</span>
                                </div>
                              </div>
                              {exercise.notes && (
                                <p className="text-sm text-gray-600 italic">{exercise.notes}</p>
                              )}
                            </div>
                          ))}
                        </div>

                        <Button
                          onClick={handleSavePlan}
                          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                          size="lg"
                        >
                          <Save className="w-5 h-5 mr-2" />
                          Salva e Condividi
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Saved Plans */}
              {savedPlans.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>I Miei Piani ({savedPlans.length})</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {savedPlans.map((plan) => (
                      <div key={plan.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="font-semibold text-gray-900">{plan.name}</h4>
                            <div className="flex gap-2 mt-2">
                              <Badge variant="outline">{plan.fitness_level}</Badge>
                              <Badge variant="outline">{plan.days_per_week} giorni/sett</Badge>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeletePlan(plan.id)}
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </Button>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          <strong>Obiettivo:</strong> {plan.goal}
                        </p>
                        <p className="text-sm text-gray-500">
                          {plan.exercises?.length || 0} esercizi
                        </p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
