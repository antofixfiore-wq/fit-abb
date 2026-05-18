import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Building2,
  Upload,
  Plus,
  Trash2,
  Edit,
  CheckCircle,
  AlertCircle,
  Users,
  Euro,
  Calendar,
  Image as ImageIcon,
  Bell,
  X,
  FileText,
  BarChart3
} from "lucide-react";
import PayoutReportTab from "@/components/gym/PayoutReportTab";
import DocumentsPaymentsTab from "@/components/gym/DocumentsPaymentsTab";
import AccessValidationTab from "@/components/gym/AccessValidationTab";
import OnboardingChecklist from "@/components/gym/OnboardingChecklist";
import AdminPayouts from "@/pages/AdminPayouts";
import { motion } from "framer-motion";

export default function GymDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [gym, setGym] = useState(null);
  const [memberships, setMemberships] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [payoutReports, setPayoutReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);

  const [newMembership, setNewMembership] = useState({
    name: "",
    duration_days: 30,
    price: 0,
    description: "",
    benefits: []
  });
  const [newBenefit, setNewBenefit] = useState("");
  const [editingMembership, setEditingMembership] = useState(null);

  const [newPost, setNewPost] = useState({
    type: "update",
    title: "",
    content: "",
    image_url: "",
    valid_until: ""
  });

  const [activeTab, setActiveTab] = useState("access");

  const [gymInfo, setGymInfo] = useState({ description: "", opening_hours: {} });
  const [savingInfo, setSavingInfo] = useState(false);

  const DAYS = ["Lunedì","Martedì","Mercoledì","Giovedì","Venerdì","Sabato","Domenica"];
  const DAY_KEYS = ["monday","tuesday","wednesday","thursday","friday","saturday","sunday"];

  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    event_date: "",
    location: "",
    max_participants: 0,
    image_url: ""
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const userData = await base44.auth.me();
      setUser(userData);

      const gymsData = await base44.entities.Gym.list();
      const userGym = gymsData.find(g => g.manager_email === userData.email);

      if (!userGym) {
        setError("Non hai una palestra associata al tuo account");
        setLoading(false);
        return;
      }

      setGym(userGym);
      setGymInfo({
        description: userGym.description || "",
        opening_hours: userGym.opening_hours || {},
        available_for_gold: userGym.available_for_gold !== false,
        available_for_plus: userGym.available_for_plus === true,
        available_for_premium: userGym.available_for_premium === true,
      });

      const membershipsData = await base44.entities.GymMembership.filter({ gym_id: userGym.id });
      setMemberships(membershipsData);

      const subscriptionsData = await base44.entities.GymSubscription.filter({ gym_id: userGym.id }, "-created_date");
      setSubscriptions(subscriptionsData);

      const reportsData = await base44.entities.GymPayoutReport.filter({ gym_id: userGym.id });
      setPayoutReports(reportsData);
    } catch (error) {
      console.error("Error loading data:", error);
      setError("Errore nel caricamento dei dati");
    }
    setLoading(false);
  };

  const handlePhotoUpload = async (files) => {
    if (!files || files.length === 0) return;

    setUploading(true);
    setError(null);
    setSuccess(null);

    try {
      const uploadPromises = Array.from(files).map(file =>
        base44.integrations.Core.UploadFile({ file })
      );

      const results = await Promise.all(uploadPromises);
      const newPhotoUrls = results.map(r => r.file_url);

      const updatedPhotos = [...(gym.photos || []), ...newPhotoUrls];
      await base44.entities.Gym.update(gym.id, { photos: updatedPhotos });

      await loadData();
      setSuccess(`${newPhotoUrls.length} foto caricate con successo!`);
    } catch (error) {
      setError("Errore nel caricamento delle foto");
    }
    setUploading(false);
  };

  const handleDeletePhoto = async (photoUrl) => {
    try {
      const updatedPhotos = gym.photos.filter(p => p !== photoUrl);
      await base44.entities.Gym.update(gym.id, { photos: updatedPhotos });
      await loadData();
      setSuccess("Foto eliminata con successo!");
    } catch (error) {
      setError("Errore nell'eliminazione della foto");
    }
  };

  const handleCreateMembership = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      const membershipData = {
        ...newMembership,
        gym_id: gym.id
      };

      if (editingMembership) {
        await base44.entities.GymMembership.update(editingMembership.id, membershipData);
        setSuccess("Abbonamento aggiornato con successo!");
      } else {
        await base44.entities.GymMembership.create(membershipData);
        setSuccess("Abbonamento creato con successo!");
      }

      setNewMembership({ name: "", duration_days: 30, price: 0, description: "", benefits: [] });
      setEditingMembership(null);
      await loadData();
    } catch (error) {
      setError("Errore nella creazione dell'abbonamento");
    }
  };

  const handleEditMembership = (membership) => {
    setEditingMembership(membership);
    setNewMembership({
      name: membership.name,
      duration_days: membership.duration_days,
      price: membership.price,
      description: membership.description || "",
      benefits: membership.benefits || []
    });
  };

  const handleDeleteMembership = async (id) => {
    if (!confirm("Sei sicuro di voler eliminare questo abbonamento?")) return;

    try {
      await base44.entities.GymMembership.delete(id);
      await loadData();
      setSuccess("Abbonamento eliminato con successo!");
    } catch (error) {
      setError("Errore nell'eliminazione dell'abbonamento");
    }
  };

  const addBenefit = () => {
    if (!newBenefit.trim()) return;
    setNewMembership({
      ...newMembership,
      benefits: [...newMembership.benefits, newBenefit]
    });
    setNewBenefit("");
  };

  const removeBenefit = (index) => {
    setNewMembership({
      ...newMembership,
      benefits: newMembership.benefits.filter((_, i) => i !== index)
    });
  };

  const getActiveSubscriptionsCount = () => {
    return subscriptions.filter(s => s.status === "active").length;
  };

  const handleSaveInfo = async () => {
    setSavingInfo(true);
    try {
      await base44.entities.Gym.update(gym.id, {
        description: gymInfo.description,
        opening_hours: gymInfo.opening_hours,
        available_for_gold: gymInfo.available_for_gold,
        available_for_plus: gymInfo.available_for_plus,
        available_for_premium: gymInfo.available_for_premium,
      });
      await loadData();
      setSuccess("Informazioni aggiornate!");
    } catch {
      setError("Errore nel salvataggio");
    }
    setSavingInfo(false);
  };

  const setHour = (dayKey, field, value) => {
    setGymInfo(prev => ({
      ...prev,
      opening_hours: {
        ...prev.opening_hours,
        [dayKey]: { ...prev.opening_hours[dayKey], [field]: value },
      },
    }));
  };

  const toggleDay = (dayKey) => {
    setGymInfo(prev => {
      const current = prev.opening_hours[dayKey];
      if (current) {
        const { [dayKey]: _, ...rest } = prev.opening_hours;
        return { ...prev, opening_hours: rest };
      }
      return { ...prev, opening_hours: { ...prev.opening_hours, [dayKey]: { open: "09:00", close: "21:00" } } };
    });
  };

  const getEstimatedRevenue = () => {
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();
    const monthlyReports = payoutReports.filter(
      r => r.period_month === currentMonth && r.period_year === currentYear
    );
    return monthlyReports.reduce((sum, r) => sum + (r.total_amount || 0), 0);
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      await base44.entities.GymPost.create({
        ...newPost,
        gym_id: gym.id,
        gym_name: gym.name,
        valid_until: newPost.type === "promotion" && newPost.valid_until ? newPost.valid_until : undefined
      });

      setNewPost({ type: "update", title: "", content: "", image_url: "", valid_until: "" });
      setSuccess("Post pubblicato con successo!");
    } catch (error) {
      console.error("Error creating post:", error);
      setError("Errore nella pubblicazione del post");
    }
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      await base44.entities.GymEvent.create({
        ...newEvent,
        gym_id: gym.id,
        gym_name: gym.name,
        max_participants: newEvent.max_participants === 0 ? undefined : newEvent.max_participants
      });

      setNewEvent({ title: "", description: "", event_date: "", location: "", max_participants: 0, image_url: "" });
      setSuccess("Evento creato con successo!");
    } catch (error) {
      console.error("Error creating event:", error);
      setError("Errore nella creazione dell'evento");
    }
  };

  const handlePostImageUpload = async (file) => {
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setNewPost({ ...newPost, image_url: file_url });
      setSuccess("Immagine caricata con successo!");
    } catch (error) {
      console.error("Error uploading post image:", error);
      setError("Errore nel caricamento dell'immagine");
    }
    setUploading(false);
  };

  const handleEventImageUpload = async (file) => {
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setNewEvent({ ...newEvent, image_url: file_url });
      setSuccess("Immagine caricata con successo!");
    } catch (error) {
      console.error("Error uploading event image:", error);
      setError("Errore nel caricamento dell'immagine");
    }
    setUploading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!gym) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error || "Nessuna palestra trovata per questo account"}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-600 to-orange-600 flex items-center justify-center">
                <Building2 className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{gym.name}</h1>
                <p className="text-gray-600">{gym.city} - Dashboard Partner</p>
              </div>
            </div>

            {/* Stats */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Incasso Stimato (questo mese)</p>
                    <p className="text-3xl font-bold text-green-600">€{getEstimatedRevenue().toFixed(2)}</p>
                  </div>
                  <Euro className="w-10 h-10 text-green-600 opacity-20" />
                </div>
              </CardContent>
            </Card>
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

          {/* Onboarding checklist */}
          <OnboardingChecklist gym={gym} onTabChange={setActiveTab} />

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className={`grid w-full gap-1 ${user?.role === "admin" ? "grid-cols-4 md:grid-cols-9" : "grid-cols-4 md:grid-cols-8"}`}>
              <TabsTrigger value="access" className="text-xs">🎫 Check-in</TabsTrigger>
              {user?.role === "admin" && (
                <TabsTrigger value="admin" className="text-xs">🛡️ Admin</TabsTrigger>
              )}
              <TabsTrigger value="payouts" className="text-xs">💰 Guadagni</TabsTrigger>
              <TabsTrigger value="documents" className="text-xs">📄 Documenti</TabsTrigger>
              <TabsTrigger value="info" className="text-xs">📝 Info</TabsTrigger>
              <TabsTrigger value="photos" className="text-xs">📷 Foto</TabsTrigger>
              <TabsTrigger value="memberships" className="text-xs">Abbonamenti</TabsTrigger>
              <TabsTrigger value="subscriptions" className="text-xs">Clienti</TabsTrigger>
              <TabsTrigger value="posts" className="text-xs">Post</TabsTrigger>
              <TabsTrigger value="events" className="text-xs">Eventi</TabsTrigger>
            </TabsList>

            {/* Payouts Tab */}
            <TabsContent value="payouts" className="space-y-6">
              <PayoutReportTab gym={gym} />
            </TabsContent>

            {/* Documents & Payments Tab */}
            <TabsContent value="documents" className="space-y-6">
              <DocumentsPaymentsTab gym={gym} onUpdate={loadData} />
            </TabsContent>

            {/* Access Validation Tab */}
            <TabsContent value="access" className="space-y-6">
              <AccessValidationTab gymId={gym.id} />
            </TabsContent>

            {/* Info Tab */}
            <TabsContent value="info" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Descrizione</CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={gymInfo.description}
                    onChange={e => setGymInfo(p => ({ ...p, description: e.target.value }))}
                    placeholder="Racconta la tua palestra: attrezzature, atmosfera, specialità..."
                    rows={5}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Orari di apertura</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {DAY_KEYS.map((key, i) => {
                      const isOpen = !!gymInfo.opening_hours[key];
                      const hours = gymInfo.opening_hours[key] || {};
                      return (
                        <div key={key} className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => toggleDay(key)}
                            className={`w-24 text-xs font-semibold py-1.5 rounded-lg border transition-all ${
                              isOpen ? "bg-green-50 border-green-300 text-green-700" : "bg-gray-50 border-gray-200 text-gray-400"
                            }`}
                          >
                            {DAYS[i]}
                          </button>
                          {isOpen ? (
                            <div className="flex items-center gap-2 flex-1">
                              <Input
                                type="time"
                                value={hours.open || "09:00"}
                                onChange={e => setHour(key, "open", e.target.value)}
                                className="w-28 text-sm"
                              />
                              <span className="text-gray-400 text-sm">–</span>
                              <Input
                                type="time"
                                value={hours.close || "21:00"}
                                onChange={e => setHour(key, "close", e.target.value)}
                                className="w-28 text-sm"
                              />
                            </div>
                          ) : (
                            <span className="text-gray-400 text-sm">Chiuso</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Piani accettati */}
              <Card>
                <CardHeader>
                  <CardTitle>Piani abbonamento accettati</CardTitle>
                  <p className="text-sm text-gray-500">Scegli quali piani Fit ABB possono accedere alla tua struttura</p>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { key: "available_for_gold", label: "Gold", desc: "€40/mese", color: "text-yellow-600" },
                    { key: "available_for_plus", label: "Plus", desc: "€70/mese", color: "text-lime-600" },
                    { key: "available_for_premium", label: "Platinum", desc: "€99.99/mese", color: "text-blue-600" },
                  ].map(({ key, label, desc, color }) => (
                    <div key={key} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <span className={`font-semibold ${color}`}>{label}</span>
                        <span className="text-gray-500 text-sm ml-2">{desc}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setGymInfo(prev => ({ ...prev, [key]: !prev[key] }))}
                        className={`w-12 h-6 rounded-full transition-colors relative ${gymInfo[key] ? "bg-green-500" : "bg-gray-300"}`}
                      >
                        <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${gymInfo[key] ? "translate-x-6" : "translate-x-0.5"}`} />
                      </button>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Button
                onClick={handleSaveInfo}
                disabled={savingInfo}
                className="w-full bg-gradient-to-r from-blue-600 to-orange-600"
              >
                {savingInfo ? "Salvataggio..." : "Salva informazioni"}
              </Button>
            </TabsContent>

            {/* Photos Tab */}
            <TabsContent value="photos" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="w-5 h-5" />
                    Carica Nuove Foto
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => handlePhotoUpload(e.target.files)}
                    disabled={uploading}
                    className="cursor-pointer"
                  />
                  {uploading && (
                    <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                      Caricamento in corso...
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Galleria Foto ({gym.photos?.length || 0})</CardTitle>
                </CardHeader>
                <CardContent>
                  {gym.photos && gym.photos.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {gym.photos.map((photo, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={photo}
                            alt={`Foto ${index + 1}`}
                            className="w-full h-48 object-cover rounded-lg"
                          />
                          <Button
                            variant="destructive"
                            size="icon"
                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => handleDeletePhoto(photo)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-gray-500 py-8">Nessuna foto caricata</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Memberships Tab */}
            <TabsContent value="memberships" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plus className="w-5 h-5" />
                    {editingMembership ? "Modifica Abbonamento" : "Crea Nuovo Abbonamento"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleCreateMembership} className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">Nome Abbonamento</Label>
                        <Input
                          id="name"
                          value={newMembership.name}
                          onChange={(e) => setNewMembership({...newMembership, name: e.target.value})}
                          placeholder="es. Mensile, Trimestrale"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="duration">Durata (giorni)</Label>
                        <Input
                          id="duration"
                          type="number"
                          value={newMembership.duration_days}
                          onChange={(e) => setNewMembership({...newMembership, duration_days: parseInt(e.target.value)})}
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="price">Prezzo (€)</Label>
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
                        value={newMembership.price}
                        onChange={(e) => setNewMembership({...newMembership, price: parseFloat(e.target.value)})}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="description">Descrizione</Label>
                      <Textarea
                        id="description"
                        value={newMembership.description}
                        onChange={(e) => setNewMembership({...newMembership, description: e.target.value})}
                        placeholder="Descrivi l'abbonamento..."
                        rows={3}
                      />
                    </div>

                    <div>
                      <Label>Benefici</Label>
                      <div className="flex gap-2 mb-3">
                        <Input
                          value={newBenefit}
                          onChange={(e) => setNewBenefit(e.target.value)}
                          placeholder="Aggiungi beneficio..."
                          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addBenefit())}
                        />
                        <Button type="button" onClick={addBenefit}>
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {newMembership.benefits.map((benefit, i) => (
                          <Badge key={i} variant="secondary" className="gap-2">
                            {benefit}
                            <button onClick={() => removeBenefit(i)} className="hover:text-red-600">
                              ×
                            </button>
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <Button type="submit" className="bg-gradient-to-r from-blue-600 to-orange-600 hover:from-blue-700 hover:to-orange-700">
                        {editingMembership ? "Aggiorna" : "Crea"} Abbonamento
                      </Button>
                      {editingMembership && (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setEditingMembership(null);
                            setNewMembership({ name: "", duration_days: 30, price: 0, description: "", benefits: [] });
                          }}
                        >
                          Annulla
                        </Button>
                      )}
                    </div>
                  </form>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>I Tuoi Abbonamenti ({memberships.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  {memberships.length > 0 ? (
                    <div className="space-y-4">
                      {memberships.map((membership) => (
                        <div key={membership.id} className="border rounded-lg p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="font-bold text-lg">{membership.name}</h3>
                                <Badge className={membership.is_active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                                  {membership.is_active ? "Attivo" : "Non attivo"}
                                </Badge>
                              </div>
                              <div className="grid md:grid-cols-2 gap-4 mb-3">
                                <div className="text-sm text-gray-600">
                                  <span className="font-semibold">Durata:</span> {membership.duration_days} giorni
                                </div>
                                <div className="text-sm text-gray-600">
                                  <span className="font-semibold">Prezzo:</span> €{membership.price}
                                </div>
                              </div>
                              {membership.description && (
                                <p className="text-sm text-gray-700 mb-2">{membership.description}</p>
                              )}
                              {membership.benefits && membership.benefits.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                  {membership.benefits.map((benefit, i) => (
                                    <Badge key={i} variant="outline" className="text-xs">
                                      {benefit}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => handleEditMembership(membership)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="destructive"
                                size="icon"
                                onClick={() => handleDeleteMembership(membership.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-gray-500 py-8">Nessun abbonamento creato</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Subscriptions Tab */}
            <TabsContent value="subscriptions" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Clienti Abbonati ({subscriptions.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  {subscriptions.length > 0 ? (
                    <div className="space-y-3">
                      {subscriptions.map((subscription) => {
                        const membership = memberships.find(m => m.id === subscription.membership_id);
                        return (
                          <div key={subscription.id} className="border rounded-lg p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <span className="font-semibold">{subscription.created_by}</span>
                                  <Badge className={
                                    subscription.status === "active"
                                      ? "bg-green-100 text-green-800"
                                      : subscription.status === "expired"
                                      ? "bg-gray-100 text-gray-800"
                                      : "bg-red-100 text-red-800"
                                  }>
                                    {subscription.status === "active" ? "Attivo" : subscription.status === "expired" ? "Scaduto" : "Cancellato"}
                                  </Badge>
                                </div>
                                <div className="grid md:grid-cols-3 gap-3 text-sm text-gray-600">
                                  <div>
                                    <span className="font-semibold">Piano:</span> {membership?.name || "N/A"}
                                  </div>
                                  <div>
                                    <span className="font-semibold">Dal:</span> {new Date(subscription.start_date).toLocaleDateString('it-IT')}
                                  </div>
                                  <div>
                                    <span className="font-semibold">Al:</span> {new Date(subscription.end_date).toLocaleDateString('it-IT')}
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-lg font-bold text-gray-900">€{subscription.price_paid}</div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-center text-gray-500 py-8">Nessun cliente abbonato ancora</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Posts Tab */}
            <TabsContent value="posts" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="w-5 h-5" />
                    Crea Nuovo Post
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleCreatePost} className="space-y-4">
                    <div>
                      <Label htmlFor="post-type">Tipo di Post</Label>
                      <select
                        id="post-type"
                        className="w-full border rounded-lg p-2"
                        value={newPost.type}
                        onChange={(e) => setNewPost({ ...newPost, type: e.target.value, valid_until: "" })}
                      >
                        <option value="update">Aggiornamento</option>
                        <option value="promotion">Promozione</option>
                        <option value="schedule">Orario Speciale</option>
                        <option value="announcement">Comunicazione</option>
                      </select>
                    </div>

                    <div>
                      <Label htmlFor="post-title">Titolo</Label>
                      <Input
                        id="post-title"
                        value={newPost.title}
                        onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="post-content">Contenuto</Label>
                      <Textarea
                        id="post-content"
                        value={newPost.content}
                        onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                        rows={4}
                        required
                      />
                    </div>

                    {newPost.type === "promotion" && (
                      <div>
                        <Label htmlFor="valid-until">Valido fino a</Label>
                        <Input
                          id="valid-until"
                          type="date"
                          value={newPost.valid_until}
                          onChange={(e) => setNewPost({ ...newPost, valid_until: e.target.value })}
                        />
                      </div>
                    )}

                    <div className="border-2 border-dashed rounded-lg p-4">
                      {newPost.image_url ? (
                        <div className="relative">
                          <img
                            src={newPost.image_url}
                            alt="Preview"
                            className="w-full h-48 object-cover rounded-lg"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute top-2 right-2"
                            onClick={() => setNewPost({ ...newPost, image_url: "" })}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ) : (
                        <label className="flex flex-col items-center gap-2 cursor-pointer">
                          <Upload className="w-8 h-8 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            {uploading ? "Caricamento..." : "Aggiungi immagine (opzionale)"}
                          </span>
                          <Input
                            type="file"
                            accept="image/*"
                            onChange={(e) => e.target.files[0] && handlePostImageUpload(e.target.files[0])}
                            disabled={uploading}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-blue-600 to-orange-600 hover:from-blue-700 hover:to-orange-700"
                    >
                      Pubblica Post
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Admin Tab - solo per admin */}
            {user?.role === "admin" && (
              <TabsContent value="admin" className="space-y-6">
                <AdminPayouts embedded={true} />
              </TabsContent>
            )}

            {/* Events Tab */}
            <TabsContent value="events" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Crea Nuovo Evento
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleCreateEvent} className="space-y-4">
                    <div>
                      <Label htmlFor="event-title">Titolo Evento</Label>
                      <Input
                        id="event-title"
                        value={newEvent.title}
                        onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="event-description">Descrizione</Label>
                      <Textarea
                        id="event-description"
                        value={newEvent.description}
                        onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                        rows={3}
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="event-date">Data e Ora</Label>
                        <Input
                          id="event-date"
                          type="datetime-local"
                          value={newEvent.event_date}
                          onChange={(e) => setNewEvent({ ...newEvent, event_date: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="max-participants">Max Partecipanti</Label>
                        <Input
                          id="max-participants"
                          type="number"
                          value={newEvent.max_participants}
                          onChange={(e) => setNewEvent({ ...newEvent, max_participants: parseInt(e.target.value) || 0 })}
                          placeholder="0 = illimitato"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="event-location">Luogo</Label>
                      <Input
                        id="event-location"
                        value={newEvent.location}
                        onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                        placeholder="Indirizzo o nome del luogo"
                      />
                    </div>

                    <div className="border-2 border-dashed rounded-lg p-4">
                      {newEvent.image_url ? (
                        <div className="relative">
                          <img
                            src={newEvent.image_url}
                            alt="Preview"
                            className="w-full h-48 object-cover rounded-lg"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute top-2 right-2"
                            onClick={() => setNewEvent({ ...newEvent, image_url: "" })}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ) : (
                        <label className="flex flex-col items-center gap-2 cursor-pointer">
                          <Upload className="w-8 h-8 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            {uploading ? "Caricamento..." : "Aggiungi immagine evento (opzionale)"}
                          </span>
                          <Input
                            type="file"
                            accept="image/*"
                            onChange={(e) => e.target.files[0] && handleEventImageUpload(e.target.files[0])}
                            disabled={uploading}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-blue-600 to-orange-600 hover:from-blue-700 hover:to-orange-700"
                    >
                      Crea Evento
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}