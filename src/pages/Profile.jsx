import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, CheckCircle, CheckCircle2, AlertCircle, Calendar, Mail, Phone, Award, FileText, Trophy, Building2, CreditCard, X, RefreshCw, LogOut } from "lucide-react";
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
    // Mostra messaggio successo se si torna dal checkout Stripe
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('subscription') === 'success') {
      setSuccess('🎉 Abbonamento attivato con successo! Il rinnovo è automatico.');
      window.history.replaceState({}, '', window.location.pathname);
    }
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

  const handleCancelPlatformSubscription = async () => {
    if (!confirm("Sei sicuro? Manterrai l'accesso fino alla fine del periodo già pagato, poi l'abbonamento non si rinnoverà.")) return;
    
    setError(null);
    setSuccess(null);
    
    try {
      const response = await base44.functions.invoke('manageSubscription', { action: 'cancel_subscription' });
      if (response.data?.success) {
        await loadUser();
        setSuccess("Abbonamento impostato per la cancellazione a fine periodo. Mantieni l'accesso fino alla scadenza.");
      } else {
        setError(response.data?.error || "Errore nella cancellazione");
      }
    } catch (error) {
      setError("Errore nella cancellazione dell'abbonamento");
    }
  };

  const handleReactivatePlatformSubscription = async () => {
    setError(null);
    setSuccess(null);
    
    try {
      const response = await base44.functions.invoke('manageSubscription', { action: 'reactivate_subscription' });
      if (response.data?.success) {
        await loadUser();
        setSuccess("Abbonamento riattivato con successo! Si rinnoverà automaticamente.");
      } else {
        setError(response.data?.error || "Errore nella riattivazione");
      }
    } catch (error) {
      setError("Errore nella riattivazione dell'abbonamento");
    }
  };

  const handleCancelSubscription = async (subscription) => {
    if (!confirm("Sei sicuro di voler cancellare questo abbonamento palestra?")) return;
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
      if (!membership) { setError("Piano abbonamento non trovato"); return; }
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
      gold: { bg: "bg-yellow-50", text: "text-yellow-800", gradient: "from-yellow-400 to-yellow-600" },
      plus: { bg: "bg-lime-50", text: "text-lime-800", gradient: "from-[#E8FF00] to-yellow-400" },
      premium: { bg: "bg-blue-50", text: "text-blue-800", gradient: "from-blue-500 to-orange-500" }
    };

    const prices = { gold: "€40/mese", plus: "€70/mese", premium: "€99,99/mese" };
    const names = { gold: "Gold", plus: "Plus", premium: "Platinum" };
    const style = colors[user.subscription_type] || colors.gold;

    const isCancellingAtPeriodEnd = user.subscription_cancel_at_period_end;
    const isPastDue = user.subscription_status === 'past_due';

    return (
      <Card className="overflow-hidden bg-[#1a1a1a] border-white/10">
        <div className={`h-2 bg-gradient-to-r ${style.gradient}`}></div>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-white">
              <Award className="w-6 h-6" />
              Il Tuo Abbonamento
            </CardTitle>
            <div className="flex flex-col items-end gap-1">
              <Badge className={`${style.bg} ${style.text} text-sm px-3 py-1`}>
                {names[user.subscription_type] || user.subscription_type.toUpperCase()}
              </Badge>
              {isCancellingAtPeriodEnd && (
                <Badge className="bg-orange-100 text-orange-800 text-xs">Disdetta a scadenza</Badge>
              )}
              {isPastDue && (
                <Badge variant="destructive" className="text-xs">Pagamento in attesa</Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Piano:</span>
            <span className="font-semibold text-white">{names[user.subscription_type] || user.subscription_type.toUpperCase()}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Prezzo:</span>
            <span className="font-semibold text-white">{prices[user.subscription_type]}</span>
          </div>
          {user.subscription_start_date && (
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Inizio:</span>
              <span className="font-medium text-white">{new Date(user.subscription_start_date).toLocaleDateString('it-IT')}</span>
            </div>
          )}
          {user.subscription_end_date && (
            <div className="flex justify-between items-center">
              <span className="text-gray-400">{isCancellingAtPeriodEnd ? "Accesso fino al:" : "Prossimo rinnovo:"}</span>
              <span className="font-medium text-white">{new Date(user.subscription_end_date).toLocaleDateString('it-IT')}</span>
            </div>
          )}

          <div className="pt-2 border-t border-white/10">
            {isCancellingAtPeriodEnd ? (
              <Button
                onClick={handleReactivatePlatformSubscription}
                size="sm"
                className="w-full bg-green-600 hover:bg-green-700 text-white"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Riattiva Rinnovo Automatico
              </Button>
            ) : (
              <Button
                onClick={handleCancelPlatformSubscription}
                size="sm"
                variant="outline"
                className="w-full border-red-500/50 text-red-400 hover:bg-red-500/10"
              >
                <X className="w-4 h-4 mr-2" />
                Disdici abbonamento
              </Button>
            )}
            {isCancellingAtPeriodEnd && (
              <p className="text-xs text-gray-500 mt-2 text-center">
                Manterrai l'accesso fino alla scadenza, poi l'abbonamento non si rinnoverà.
              </p>
            )}
          </div>
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
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Sticky mobile header */}
      <div className="sticky top-0 z-20 bg-[#0a0a0a]/95 backdrop-blur-xl border-b border-white/10 px-4 py-3 md:hidden">
        <h1 className="text-base font-bold text-white">Il Mio Profilo</h1>
        <p className="text-xs text-gray-400">Abbonamento, documenti e impostazioni</p>
      </div>

      <div className="max-w-4xl mx-auto px-4 pb-28 pt-4 md:px-6 md:pt-8">
        <h1 className="hidden md:block text-3xl font-bold text-white mb-2">Il Mio Profilo</h1>
        <p className="hidden md:block text-gray-400 mb-8">Gestisci le tue informazioni e documenti</p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >

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

          <div className="mb-5">
            <ProgressStats user={user} />
          </div>

          <Card className="mb-5 bg-[#1a1a1a] border-white/10">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-500" />
                <CardTitle className="text-white text-base">I Miei Risultati</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {achievements.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {achievements.map((achievement) => (
                    <BadgeCard key={achievement.id} achievement={achievement} />
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 py-6 text-sm">
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

          <div className="grid lg:grid-cols-2 gap-5 mb-5">
            {getSubscriptionInfo()}

            <Card className="bg-[#1a1a1a] border-white/10">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-white text-base">
                  <Mail className="w-5 h-5" />
                  Informazioni Personali
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUpdateProfile} className="space-y-3">
                  <div>
                    <Label className="text-gray-400 text-xs">Nome Completo</Label>
                    <Input value={user?.full_name || ""} disabled className="bg-white/5 border-white/10 text-gray-400 h-10" />
                  </div>
                  <div>
                    <Label className="text-gray-400 text-xs">Email</Label>
                    <Input value={user?.email || ""} disabled className="bg-white/5 border-white/10 text-gray-400 h-10" />
                  </div>
                  <div>
                    <Label htmlFor="phone" className="text-gray-300 text-xs">Telefono</Label>
                    <Input id="phone" type="tel" value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+39 123 456 7890"
                      className="bg-white/5 border-white/10 text-white h-10" />
                  </div>
                  <div>
                    <Label htmlFor="birth_date" className="text-gray-300 text-xs">Data di Nascita</Label>
                    <Input id="birth_date" type="date" value={formData.birth_date}
                      onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
                      className="bg-white/5 border-white/10 text-white h-10" />
                  </div>
                  <Button type="submit" className="w-full h-11 font-bold" style={{ background: "#E8FF00", color: "#000" }}>
                    Aggiorna Profilo
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-[#1a1a1a] border-white/10">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-white text-base">
                <FileText className="w-5 h-5" />
                Documenti Richiesti
              </CardTitle>
              <p className="text-xs text-gray-400 mt-1">
                Carica i documenti necessari per attivare il tuo abbonamento
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Documento identità */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-white text-sm">Documento d'Identità</h3>
                    <p className="text-xs text-gray-500">Carta d'identità o patente</p>
                  </div>
                  {user?.id_document_url && (
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs shrink-0">✓ OK</Badge>
                  )}
                </div>
                {user?.id_document_url && (
                  <a href={user.id_document_url} target="_blank" rel="noopener noreferrer"
                    className="text-[#E8FF00] text-xs flex items-center gap-1 mb-3 hover:underline">
                    <FileText className="w-3 h-3" /> Visualizza documento
                  </a>
                )}
                <Input type="file" accept="image/*,.pdf"
                  onChange={(e) => e.target.files[0] && handleFileUpload(e.target.files[0], "id")}
                  disabled={uploading.id}
                  className="cursor-pointer bg-white/5 border-white/10 text-white text-sm h-10" />
                {uploading.id && <p className="text-xs text-gray-400 mt-2">⏳ Caricamento...</p>}
              </div>

              {/* Certificato medico */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-white text-sm">Certificato Medico</h3>
                    <p className="text-xs text-gray-500">Per attività sportiva non agonistica</p>
                  </div>
                  {user?.medical_certificate_url && (
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs shrink-0">✓ OK</Badge>
                  )}
                </div>
                {user?.medical_certificate_url && (
                  <a href={user.medical_certificate_url} target="_blank" rel="noopener noreferrer"
                    className="text-[#E8FF00] text-xs flex items-center gap-1 mb-3 hover:underline">
                    <FileText className="w-3 h-3" /> Visualizza certificato
                  </a>
                )}
                <Input type="file" accept="image/*,.pdf"
                  onChange={(e) => e.target.files[0] && handleFileUpload(e.target.files[0], "medical")}
                  disabled={uploading.medical}
                  className="cursor-pointer bg-white/5 border-white/10 text-white text-sm h-10" />
                {uploading.medical && <p className="text-xs text-gray-400 mt-2">⏳ Caricamento...</p>}
              </div>

              {user?.documents_verified && (
                <Alert className="bg-green-500/10 border-green-500/30">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                  <AlertDescription className="text-green-300 text-sm">
                    Documenti verificati e approvati!
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Sezione Associazione ASI */}
          <Card className="bg-[#1a1a1a] border-[#E8FF00]/20">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-[#E8FF00]" />
                <CardTitle className="text-white text-base">Associazione ASI</CardTitle>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Ottieni la tua tessera ASI gratuita con l'abbonamento
              </p>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="bg-[#E8FF00]/10 border border-[#E8FF00]/30 rounded-xl p-4">
                <p className="text-sm text-white mb-2">
                  <strong className="text-[#E8FF00]">Gratis!</strong> Con il tuo abbonamento FitAbb hai diritto alla tessera ASI
                </p>
                <ul className="text-xs text-gray-300 space-y-1 mb-3">
                  <li>✓ Copertura assicurativa sportiva</li>
                  <li>✓ Accesso a eventi e gare ASI</li>
                  <li>✓ Tesseramento valido su tutto il territorio nazionale</li>
                </ul>
                {user?.asi_association_status === "completed" ? (
                  <Badge className="bg-[#E8FF00] text-black w-full justify-center">
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Associazione Completata
                  </Badge>
                ) : (
                  <Button
                    onClick={() => window.location.href = "/ASIAssociation"}
                    className="w-full bg-[#E8FF00] text-black hover:bg-[#E8FF00]/90"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Completa Associazione ASI
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Sezione Eliminazione Account */}
          <Card className="bg-[#1a1a1a] border-red-500/20">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <LogOut className="w-5 h-5 text-red-400" />
                <CardTitle className="text-white text-base">Zona Pericolosa</CardTitle>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Gestione account ed eliminazione
              </p>
            </CardHeader>
            <CardContent>
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-4">
                <p className="text-sm text-red-300">
                  <strong>Attenzione:</strong> L'eliminazione dell'account è permanente e irreversibile. 
                  Tutti i tuoi dati, progressi e abbonamenti verranno eliminati.
                </p>
              </div>
              <Button
                onClick={() => window.location.href = "/delete-account"}
                variant="destructive"
                className="w-full"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Richiedi Eliminazione Account
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}