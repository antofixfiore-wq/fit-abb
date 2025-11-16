import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, CheckCircle, AlertCircle, Calendar, Mail, Phone, Award, FileText, Trophy, Building2, CreditCard, X, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";
import ProgressStats from "../components/gamification/ProgressStats";
import BadgeCard from "../components/gamification/BadgeCard";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [achievements, setAchievements] = useState([]);
  const [gymSubscriptions, setGymSubscriptions] = useState([]);
  const [gyms, setGyms] = useState([]);
  const [memberships, setMemberships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState({ id: false, medical: false });
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    phone: "",
    birth_date: ""
  });

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await base44.auth.me();
      setUser(userData);
      setFormData({
        phone: userData.phone || "",
        birth_date: userData.birth_date || ""
      });

      const [userAchievements, userGymSubs, gymsData, membershipsData] = await Promise.all([
        base44.entities.UserAchievement.filter({ user_email: userData.email }, "-unlocked_date"),
        base44.entities.GymSubscription.filter({ user_id: userData.id }, "-created_date"),
        base44.entities.Gym.list(),
        base44.entities.GymMembership.list()
      ]);
      
      setAchievements(userAchievements);
      setGymSubscriptions(userGymSubs);
      setGyms(gymsData);
      setMemberships(membershipsData);
    } catch (error) {
      setError("Errore nel caricamento del profilo");
    }
    setLoading(false);
  };

  const handleCancelSubscription = async (subscription) => {
    if (!confirm("Sei sicuro di voler cancellare questo abbonamento?")) return;
    
    setError(null);
    setSuccess(null);
    
    try {
      await base44.entities.GymSubscription.update(subscription.id, { status: "cancelled" });
      await loadUser();
      setSuccess("Abbonamento cancellato con successo!");
    } catch (error) {
      setError("Errore nella cancellazione dell'abbonamento");
    }
  };

  const handleRenewSubscription = async (subscription) => {
    setError(null);
    setSuccess(null);
    
    try {
      const membership = memberships.find(m => m.id === subscription.membership_id);
      if (!membership) {
        setError("Piano abbonamento non trovato");
        return;
      }

      const newStartDate = new Date();
      const newEndDate = new Date();
      newEndDate.setDate(newEndDate.getDate() + membership.duration_days);

      await base44.entities.GymSubscription.create({
        user_id: user.id,
        gym_id: subscription.gym_id,
        membership_id: subscription.membership_id,
        start_date: newStartDate.toISOString().split('T')[0],
        end_date: newEndDate.toISOString().split('T')[0],
        status: "active",
        price_paid: membership.price
      });

      await loadUser();
      setSuccess("Abbonamento rinnovato con successo!");
    } catch (error) {
      setError("Errore nel rinnovo dell'abbonamento");
    }
  };

  const getGymName = (gymId) => {
    const gym = gyms.find(g => g.id === gymId);
    return gym?.name || "Palestra";
  };

  const getMembershipName = (membershipId) => {
    const membership = memberships.find(m => m.id === membershipId);
    return membership?.name || "Piano";
  };

  const getStatusColor = (status) => {
    const colors = {
      active: { bg: "bg-green-100", text: "text-green-800" },
      expired: { bg: "bg-gray-100", text: "text-gray-800" },
      cancelled: { bg: "bg-red-100", text: "text-red-800" }
    };
    return colors[status] || colors.expired;
  };

  const getStatusLabel = (status) => {
    const labels = {
      active: "Attivo",
      expired: "Scaduto",
      cancelled: "Cancellato"
    };
    return labels[status] || status;
  };

  const handleFileUpload = async (file, type) => {
    setUploading({ ...uploading, [type]: true });
    setError(null);
    setSuccess(null);

    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      
      const updateData = type === "id" 
        ? { id_document_url: file_url }
        : { medical_certificate_url: file_url };

      await base44.auth.updateMe(updateData);
      await loadUser();
      
      setSuccess(`${type === "id" ? "Documento d'identità" : "Certificato medico"} caricato con successo!`);
    } catch (error) {
      setError("Errore nel caricamento del file. Riprova.");
    }
    
    setUploading({ ...uploading, [type]: false });
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      await base44.auth.updateMe(formData);
      await loadUser();
      setSuccess("Profilo aggiornato con successo!");
    } catch (error) {
      setError("Errore nell'aggiornamento del profilo");
    }
  };

  const getSubscriptionInfo = () => {
    if (!user?.subscription_type || user.subscription_type === "none") {
      return null;
    }

    const colors = {
      silver: { bg: "bg-gray-100", text: "text-gray-800", gradient: "from-gray-400 to-gray-600" },
      gold: { bg: "bg-yellow-50", text: "text-yellow-800", gradient: "from-yellow-400 to-yellow-600" },
      premium: { bg: "bg-blue-50", text: "text-blue-800", gradient: "from-blue-500 to-orange-500" }
    };

    const prices = { silver: 29.99, gold: 39.99, premium: 99.99 };
    const style = colors[user.subscription_type];

    return (
      <Card className="overflow-hidden">
        <div className={`h-2 bg-gradient-to-r ${style.gradient}`}></div>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Award className="w-6 h-6" />
              Il Tuo Abbonamento
            </CardTitle>
            <Badge className={`${style.bg} ${style.text} text-sm px-3 py-1`}>
              {user.subscription_type.toUpperCase()}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Piano:</span>
            <span className="font-semibold text-lg">{user.subscription_type.toUpperCase()}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Prezzo:</span>
            <span className="font-semibold text-lg">€{prices[user.subscription_type]}/mese</span>
          </div>
          {user.subscription_start_date && (
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Inizio:</span>
              <span className="font-medium">{new Date(user.subscription_start_date).toLocaleDateString('it-IT')}</span>
            </div>
          )}
          {user.subscription_end_date && (
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Scadenza:</span>
              <span className="font-medium">{new Date(user.subscription_end_date).toLocaleDateString('it-IT')}</span>
            </div>
          )}
        </CardContent>
      </Card>
    );
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
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Il Mio Profilo</h1>
          <p className="text-gray-600 mb-8">Gestisci le tue informazioni e documenti</p>

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

          <div className="mb-6">
            <ProgressStats user={user} />
          </div>

          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Trophy className="w-6 h-6 text-yellow-600" />
                <CardTitle>I Miei Risultati</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {achievements.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {achievements.map((achievement) => (
                    <BadgeCard 
                      key={achievement.id}
                      achievement={achievement}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 py-8">
                  Inizia ad allenarti per sbloccare i tuoi primi badge!
                </p>
              )}
            </CardContent>
          </Card>

          {/* Gym Subscriptions Section - Turquoise Transparent Style */}
          {gymSubscriptions.length > 0 && (
            <div className="mb-6 relative">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-teal-500/10 rounded-xl"></div>
              <div className="relative backdrop-blur-sm bg-white/60 border border-cyan-300/50 rounded-xl p-6">
                <div className="flex items-center gap-2 mb-6">
                  <Building2 className="w-6 h-6 text-cyan-600" />
                  <h2 className="text-xl font-bold text-gray-900">Abbonamenti Palestre Attivi</h2>
                </div>
                <div className="space-y-4">
                  {gymSubscriptions.map((subscription) => {
                    const statusStyle = getStatusColor(subscription.status);
                    const isActive = subscription.status === "active";
                    const isExpired = subscription.status === "expired";
                    
                    return (
                      <div key={subscription.id} className="bg-white/80 backdrop-blur border border-cyan-200/50 rounded-lg p-4 hover:bg-white/90 transition-all shadow-sm">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-bold text-lg">{getGymName(subscription.gym_id)}</h3>
                              <Badge className={`${statusStyle.bg} ${statusStyle.text}`}>
                                {getStatusLabel(subscription.status)}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 mb-1">
                              <strong>Piano:</strong> {getMembershipName(subscription.membership_id)}
                            </p>
                            <p className="text-sm text-gray-600 mb-1">
                              <strong>Prezzo:</strong> €{subscription.price_paid}
                            </p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3 mb-3 text-sm">
                          <div className="flex items-center gap-2 text-gray-600">
                            <Calendar className="w-4 h-4" />
                            <div>
                              <div className="text-xs text-gray-500">Inizio</div>
                              <div className="font-medium">{new Date(subscription.start_date).toLocaleDateString('it-IT')}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-gray-600">
                            <Calendar className="w-4 h-4" />
                            <div>
                              <div className="text-xs text-gray-500">Scadenza</div>
                              <div className="font-medium">{new Date(subscription.end_date).toLocaleDateString('it-IT')}</div>
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-2 pt-3 border-t border-cyan-200/50">
                          {(isActive || isExpired) && (
                            <Button
                              onClick={() => handleRenewSubscription(subscription)}
                              size="sm"
                              className="bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-700 hover:to-teal-700"
                            >
                              <RefreshCw className="w-4 h-4 mr-2" />
                              Rinnova
                            </Button>
                          )}
                          {isActive && (
                            <Button
                              onClick={() => handleCancelSubscription(subscription)}
                              size="sm"
                              variant="destructive"
                            >
                              <X className="w-4 h-4 mr-2" />
                              Cancella
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          <div className="grid lg:grid-cols-2 gap-6 mb-6">
            {getSubscriptionInfo()}

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="w-6 h-6" />
                  Informazioni Personali
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div>
                    <Label>Nome Completo</Label>
                    <Input value={user?.full_name || ""} disabled className="bg-gray-50" />
                  </div>
                  <div>
                    <Label>Email</Label>
                    <Input value={user?.email || ""} disabled className="bg-gray-50" />
                  </div>
                  <div>
                    <Label htmlFor="phone">Telefono</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+39 123 456 7890"
                    />
                  </div>
                  <div>
                    <Label htmlFor="birth_date">Data di Nascita</Label>
                    <Input
                      id="birth_date"
                      type="date"
                      value={formData.birth_date}
                      onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
                    />
                  </div>
                  <Button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-orange-600 hover:from-blue-700 hover:to-orange-700">
                    Aggiorna Profilo
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-6 h-6" />
                Documenti Richiesti
              </CardTitle>
              <p className="text-sm text-gray-600 mt-2">
                Carica i documenti necessari per attivare il tuo abbonamento
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="border-2 border-dashed rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-lg">Documento d'Identità</h3>
                    <p className="text-sm text-gray-600">Carta d'identità o patente</p>
                  </div>
                  {user?.id_document_url && (
                    <Badge className="bg-green-100 text-green-800">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Caricato
                    </Badge>
                  )}
                </div>
                
                {user?.id_document_url ? (
                  <div className="space-y-3">
                    <a
                      href={user.id_document_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-600 hover:text-purple-700 text-sm flex items-center gap-2"
                    >
                      <FileText className="w-4 h-4" />
                      Visualizza documento
                    </a>
                    <Input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => e.target.files[0] && handleFileUpload(e.target.files[0], "id")}
                      disabled={uploading.id}
                      className="cursor-pointer"
                    />
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => e.target.files[0] && handleFileUpload(e.target.files[0], "id")}
                      disabled={uploading.id}
                      className="cursor-pointer"
                    />
                    {uploading.id && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
                        Caricamento in corso...
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="border-2 border-dashed rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-lg">Certificato Medico</h3>
                    <p className="text-sm text-gray-600">Certificato per attività sportiva non agonistica</p>
                  </div>
                  {user?.medical_certificate_url && (
                    <Badge className="bg-green-100 text-green-800">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Caricato
                    </Badge>
                  )}
                </div>
                
                {user?.medical_certificate_url ? (
                  <div className="space-y-3">
                    <a
                      href={user.medical_certificate_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-600 hover:text-purple-700 text-sm flex items-center gap-2"
                    >
                      <FileText className="w-4 h-4" />
                      Visualizza certificato
                    </a>
                    <Input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => e.target.files[0] && handleFileUpload(e.target.files[0], "medical")}
                      disabled={uploading.medical}
                      className="cursor-pointer"
                    />
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => e.target.files[0] && handleFileUpload(e.target.files[0], "medical")}
                      disabled={uploading.medical}
                      className="cursor-pointer"
                    />
                    {uploading.medical && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
                        Caricamento in corso...
                      </div>
                    )}
                  </div>
                )}
              </div>

              {user?.documents_verified && (
                <Alert className="bg-green-50 border-green-200">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    I tuoi documenti sono stati verificati e approvati!
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}