import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2, MapPin, Phone, Mail, FileText, Upload,
  CheckCircle, Plus, X, ArrowRight, ArrowLeft, Dumbbell,
  Clock, Camera, AlertCircle, Loader2
} from "lucide-react";

const STEPS = [
  { id: 1, label: "Struttura", icon: Building2 },
  { id: 2, label: "Orari & Servizi", icon: Clock },
  { id: 3, label: "Foto", icon: Camera },
  { id: 4, label: "Documenti", icon: FileText },
  { id: 5, label: "Abbonamenti", icon: Dumbbell },
];

const AMENITY_OPTIONS = [
  "Parcheggio", "Spogliatoi", "Docce", "Sauna", "Piscina",
  "Solarium", "Sala Cardio", "Sala Pesi", "Corsi Collettivi",
  "Personal Trainer", "Spinning", "Pilates", "Yoga", "Boxe",
  "Crossfit", "Nuoto", "Paddle", "Squash", "Wi-Fi", "Bar/Cafeteria"
];

const DAYS = ["Lunedì", "Martedì", "Mercoledì", "Giovedì", "Venerdì", "Sabato", "Domenica"];

export default function GymOnboarding() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [gymId, setGymId] = useState(null);

  // Step 1: Dati struttura
  const [gymData, setGymData] = useState({
    name: "", address: "", city: "", region: "",
    phone: "", email: "", description: "",
  });

  // Step 2: Orari & servizi
  const [amenities, setAmenities] = useState([]);
  const [openingHours, setOpeningHours] = useState(
    DAYS.reduce((acc, d) => ({ ...acc, [d]: { open: "07:00", close: "22:00", closed: false } }), {})
  );

  // Step 3: Foto
  const [photos, setPhotos] = useState([]);

  // Step 4: Documenti
  const [visuraFile, setVisuraFile] = useState(null);
  const [visuraUrl, setVisuraUrl] = useState("");

  // Step 5: Abbonamenti
  const [memberships, setMemberships] = useState([
    { name: "Mensile", duration_days: 30, price: 49, description: "", benefits: [] }
  ]);

  useEffect(() => {
    const init = async () => {
      try {
        const u = await base44.auth.me();
        setUser(u);
        // Controlla se ha già una palestra
        const gyms = await base44.entities.Gym.list();
        const existing = gyms.find(g => g.manager_email === u.email);
        if (existing) {
          // Già registrato, vai alla dashboard
          navigate("/GymDashboard");
          return;
        }
      } catch (e) {
        base44.auth.redirectToLogin("/GymOnboarding");
        return;
      }
      setLoading(false);
    };
    init();
  }, [navigate]);

  const toggleAmenity = (a) => {
    setAmenities(prev =>
      prev.includes(a) ? prev.filter(x => x !== a) : [...prev, a]
    );
  };

  const handlePhotoUpload = async (files) => {
    if (!files?.length) return;
    setUploading(true);
    setError("");
    try {
      const results = await Promise.all(
        Array.from(files).map(f => base44.integrations.Core.UploadFile({ file: f }))
      );
      setPhotos(prev => [...prev, ...results.map(r => r.file_url)]);
    } catch {
      setError("Errore nel caricamento delle foto");
    }
    setUploading(false);
  };

  const handleVisuraUpload = async (file) => {
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setVisuraUrl(file_url);
      setVisuraFile(file);
    } catch {
      setError("Errore nel caricamento del documento");
    }
    setUploading(false);
  };

  const addMembership = () => {
    setMemberships(prev => [...prev, { name: "", duration_days: 30, price: 0, description: "", benefits: [] }]);
  };

  const updateMembership = (i, field, value) => {
    setMemberships(prev => prev.map((m, idx) => idx === i ? { ...m, [field]: value } : m));
  };

  const removeMembership = (i) => {
    setMemberships(prev => prev.filter((_, idx) => idx !== i));
  };

  const addBenefit = (i, benefit) => {
    if (!benefit.trim()) return;
    setMemberships(prev => prev.map((m, idx) =>
      idx === i ? { ...m, benefits: [...(m.benefits || []), benefit] } : m
    ));
  };

  const removeBenefit = (mi, bi) => {
    setMemberships(prev => prev.map((m, idx) =>
      idx === mi ? { ...m, benefits: m.benefits.filter((_, i) => i !== bi) } : m
    ));
  };

  const validateStep = () => {
    setError("");
    if (step === 1) {
      if (!gymData.name || !gymData.address || !gymData.city || !gymData.email) {
        setError("Compila tutti i campi obbligatori: nome, indirizzo, città e email.");
        return false;
      }
    }
    if (step === 4) {
      if (!visuraUrl) {
        setError("Carica la visura camerale per procedere.");
        return false;
      }
    }
    if (step === 5) {
      if (memberships.length === 0 || memberships.some(m => !m.name || !m.price)) {
        setError("Aggiungi almeno un abbonamento con nome e prezzo.");
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (!validateStep()) return;
    setStep(s => s + 1);
    window.scrollTo(0, 0);
  };

  const handleBack = () => {
    setError("");
    setStep(s => s - 1);
    window.scrollTo(0, 0);
  };

  const handleSubmit = async () => {
    if (!validateStep()) return;
    setSaving(true);
    setError("");
    try {
      // 1. Crea la palestra
      const gym = await base44.entities.Gym.create({
        ...gymData,
        manager_email: user.email,
        amenities,
        opening_hours: openingHours,
        photos,
        visura_url: visuraUrl,
        visura_status: "pending",
        is_partner: false,
        available_for_silver: true,
        available_for_gold: true,
        available_for_premium: true,
        payout_method: "both",
      });

      // 2. Crea gli abbonamenti
      await Promise.all(
        memberships.map(m =>
          base44.entities.GymMembership.create({ ...m, gym_id: gym.id, is_active: true })
        )
      );

      // Redirect alla dashboard
      navigate("/GymDashboard");
    } catch (e) {
      setError("Errore nel salvataggio. Riprova.");
    }
    setSaving(false);
  };

  if (loading) return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
      <Loader2 className="w-10 h-10 text-[#E8FF00] animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0a0a] py-8 px-4">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <Building2 className="w-7 h-7 text-[#E8FF00]" />
            <h1 className="text-2xl font-black text-white">Registra la tua Palestra</h1>
          </div>
          <p className="text-gray-500 text-sm">Completa tutti i passaggi per entrare nel circuito Fit ABB</p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-between mb-8 px-2">
          {STEPS.map((s, idx) => {
            const Icon = s.icon;
            const isActive = step === s.id;
            const isDone = step > s.id;
            return (
              <React.Fragment key={s.id}>
                <div className="flex flex-col items-center gap-1">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                    isDone ? "bg-[#E8FF00]" : isActive ? "bg-[#E8FF00]/20 border-2 border-[#E8FF00]" : "bg-white/5 border border-white/10"
                  }`}>
                    {isDone
                      ? <CheckCircle className="w-5 h-5 text-black" />
                      : <Icon className={`w-4 h-4 ${isActive ? "text-[#E8FF00]" : "text-gray-600"}`} />
                    }
                  </div>
                  <span className={`text-xs hidden sm:block ${isActive ? "text-[#E8FF00]" : isDone ? "text-gray-400" : "text-gray-600"}`}>
                    {s.label}
                  </span>
                </div>
                {idx < STEPS.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-1 ${step > s.id ? "bg-[#E8FF00]/40" : "bg-white/5"}`} />
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Error */}
        {error && (
          <Alert className="mb-6 bg-red-900/20 border-red-500/30">
            <AlertCircle className="h-4 w-4 text-red-400" />
            <AlertDescription className="text-red-300">{error}</AlertDescription>
          </Alert>
        )}

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.25 }}
          >

            {/* ── STEP 1: Dati struttura ── */}
            {step === 1 && (
              <StepCard title="Dati della Struttura" icon={Building2}>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <Label className="text-gray-300">Nome Palestra *</Label>
                    <Input
                      value={gymData.name}
                      onChange={e => setGymData({ ...gymData, name: e.target.value })}
                      placeholder="es. Fitness Center Milano"
                      className="bg-white/5 border-white/10 text-white mt-1"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <Label className="text-gray-300">Indirizzo *</Label>
                    <Input
                      value={gymData.address}
                      onChange={e => setGymData({ ...gymData, address: e.target.value })}
                      placeholder="Via Roma 1"
                      className="bg-white/5 border-white/10 text-white mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-300">Città *</Label>
                    <Input
                      value={gymData.city}
                      onChange={e => setGymData({ ...gymData, city: e.target.value })}
                      placeholder="Milano"
                      className="bg-white/5 border-white/10 text-white mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-300">Regione</Label>
                    <Input
                      value={gymData.region}
                      onChange={e => setGymData({ ...gymData, region: e.target.value })}
                      placeholder="Lombardia"
                      className="bg-white/5 border-white/10 text-white mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-300">Telefono</Label>
                    <Input
                      value={gymData.phone}
                      onChange={e => setGymData({ ...gymData, phone: e.target.value })}
                      placeholder="+39 02 1234567"
                      className="bg-white/5 border-white/10 text-white mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-300">Email Contatto *</Label>
                    <Input
                      type="email"
                      value={gymData.email}
                      onChange={e => setGymData({ ...gymData, email: e.target.value })}
                      placeholder="info@palestra.it"
                      className="bg-white/5 border-white/10 text-white mt-1"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <Label className="text-gray-300">Descrizione</Label>
                    <Textarea
                      value={gymData.description}
                      onChange={e => setGymData({ ...gymData, description: e.target.value })}
                      placeholder="Racconta la tua palestra..."
                      rows={3}
                      className="bg-white/5 border-white/10 text-white mt-1 resize-none"
                    />
                  </div>
                </div>
              </StepCard>
            )}

            {/* ── STEP 2: Orari & Servizi ── */}
            {step === 2 && (
              <StepCard title="Orari & Servizi" icon={Clock}>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-white font-semibold mb-3">Orari di Apertura</h3>
                    <div className="space-y-2">
                      {DAYS.map(day => (
                        <div key={day} className="flex items-center gap-3">
                          <span className="text-gray-400 text-sm w-24 shrink-0">{day}</span>
                          {openingHours[day].closed ? (
                            <span className="text-red-400 text-sm">Chiuso</span>
                          ) : (
                            <>
                              <Input
                                type="time"
                                value={openingHours[day].open}
                                onChange={e => setOpeningHours(h => ({ ...h, [day]: { ...h[day], open: e.target.value } }))}
                                className="bg-white/5 border-white/10 text-white text-sm h-8 w-24"
                              />
                              <span className="text-gray-600 text-xs">→</span>
                              <Input
                                type="time"
                                value={openingHours[day].close}
                                onChange={e => setOpeningHours(h => ({ ...h, [day]: { ...h[day], close: e.target.value } }))}
                                className="bg-white/5 border-white/10 text-white text-sm h-8 w-24"
                              />
                            </>
                          )}
                          <button
                            onClick={() => setOpeningHours(h => ({ ...h, [day]: { ...h[day], closed: !h[day].closed } }))}
                            className={`ml-auto text-xs px-2 py-1 rounded ${openingHours[day].closed ? "bg-white/10 text-gray-400" : "bg-red-900/20 text-red-400"}`}
                          >
                            {openingHours[day].closed ? "Apri" : "Chiudi"}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-white font-semibold mb-3">Servizi Disponibili</h3>
                    <div className="flex flex-wrap gap-2">
                      {AMENITY_OPTIONS.map(a => (
                        <button
                          key={a}
                          onClick={() => toggleAmenity(a)}
                          className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                            amenities.includes(a)
                              ? "bg-[#E8FF00] text-black font-semibold"
                              : "bg-white/5 text-gray-400 border border-white/10 hover:border-[#E8FF00]/30"
                          }`}
                        >
                          {a}
                        </button>
                      ))}
                    </div>
                    {amenities.length > 0 && (
                      <p className="text-gray-500 text-xs mt-2">{amenities.length} servizi selezionati</p>
                    )}
                  </div>
                </div>
              </StepCard>
            )}

            {/* ── STEP 3: Foto ── */}
            {step === 3 && (
              <StepCard title="Foto della Palestra" icon={Camera}>
                <p className="text-gray-500 text-sm mb-4">
                  Carica foto della tua struttura per attirare più utenti. Consigliamo almeno 3-5 foto.
                </p>
                <label className={`block w-full border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                  uploading ? "border-[#E8FF00]/50 bg-[#E8FF00]/5" : "border-white/10 hover:border-[#E8FF00]/30"
                }`}>
                  {uploading ? (
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 className="w-8 h-8 text-[#E8FF00] animate-spin" />
                      <span className="text-gray-400 text-sm">Caricamento in corso...</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <Upload className="w-8 h-8 text-gray-500" />
                      <span className="text-gray-400 text-sm">Clicca per caricare foto</span>
                      <span className="text-gray-600 text-xs">JPG, PNG, WebP — max 10MB ciascuna</span>
                    </div>
                  )}
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    disabled={uploading}
                    onChange={e => handlePhotoUpload(e.target.files)}
                  />
                </label>

                {photos.length > 0 && (
                  <div className="mt-4 grid grid-cols-3 gap-3">
                    {photos.map((url, i) => (
                      <div key={i} className="relative group aspect-square">
                        <img src={url} alt="" className="w-full h-full object-cover rounded-lg" />
                        <button
                          onClick={() => setPhotos(p => p.filter((_, idx) => idx !== i))}
                          className="absolute top-1 right-1 bg-black/70 rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3 text-white" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <p className="text-gray-600 text-xs mt-3 text-center">
                  Puoi aggiungere altre foto anche in seguito dalla dashboard
                </p>
              </StepCard>
            )}

            {/* ── STEP 4: Documenti ── */}
            {step === 4 && (
              <StepCard title="Documenti Necessari" icon={FileText}>
                <div className="space-y-4">
                  <div className="bg-blue-900/20 border border-blue-500/20 rounded-xl p-4">
                    <p className="text-blue-300 text-sm font-semibold mb-1">📋 Perché servono i documenti?</p>
                    <p className="text-gray-400 text-xs leading-relaxed">
                      Per garantire la qualità del circuito Fit ABB, verifichiamo la legittimità di ogni struttura
                      prima di renderla visibile agli utenti. La visura camerale verrà esaminata entro 24–48 ore.
                    </p>
                  </div>

                  <div>
                    <Label className="text-gray-300 font-semibold">Visura Camerale *</Label>
                    <p className="text-gray-500 text-xs mb-3">PDF o immagine del documento della Camera di Commercio</p>

                    {visuraUrl ? (
                      <div className="flex items-center gap-3 bg-green-900/20 border border-green-500/30 rounded-xl p-4">
                        <CheckCircle className="w-5 h-5 text-green-400 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-green-300 text-sm font-medium">Documento caricato</p>
                          <p className="text-gray-500 text-xs truncate">{visuraFile?.name}</p>
                        </div>
                        <button onClick={() => { setVisuraUrl(""); setVisuraFile(null); }}>
                          <X className="w-4 h-4 text-gray-500 hover:text-white" />
                        </button>
                      </div>
                    ) : (
                      <label className={`block w-full border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                        uploading ? "border-[#E8FF00]/50 bg-[#E8FF00]/5" : "border-white/10 hover:border-[#E8FF00]/30"
                      }`}>
                        {uploading ? (
                          <div className="flex flex-col items-center gap-2">
                            <Loader2 className="w-8 h-8 text-[#E8FF00] animate-spin" />
                            <span className="text-gray-400 text-sm">Caricamento...</span>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center gap-2">
                            <FileText className="w-8 h-8 text-gray-500" />
                            <span className="text-gray-400 text-sm">Carica Visura Camerale</span>
                            <span className="text-gray-600 text-xs">PDF, JPG, PNG</span>
                          </div>
                        )}
                        <input
                          type="file"
                          accept=".pdf,image/*"
                          className="hidden"
                          disabled={uploading}
                          onChange={e => e.target.files[0] && handleVisuraUpload(e.target.files[0])}
                        />
                      </label>
                    )}
                  </div>

                  <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                    <p className="text-gray-400 text-xs leading-relaxed">
                      ⚡ La palestra sarà visibile nel circuito solo dopo approvazione dei documenti.
                      Potrai accedere alla dashboard subito, ma gli utenti non potranno vederla fino alla verifica.
                    </p>
                  </div>
                </div>
              </StepCard>
            )}

            {/* ── STEP 5: Abbonamenti ── */}
            {step === 5 && (
              <StepCard title="Definisci i Tuoi Abbonamenti" icon={Dumbbell}>
                <p className="text-gray-500 text-sm mb-4">
                  Configura i piani di abbonamento locali della tua palestra (separati dall'abbonamento Fit ABB).
                </p>

                <div className="space-y-4">
                  {memberships.map((m, i) => (
                    <MembershipForm
                      key={i}
                      index={i}
                      membership={m}
                      onUpdate={updateMembership}
                      onRemove={memberships.length > 1 ? removeMembership : null}
                      onAddBenefit={addBenefit}
                      onRemoveBenefit={removeBenefit}
                    />
                  ))}
                </div>

                <button
                  onClick={addMembership}
                  className="mt-4 w-full py-3 border-2 border-dashed border-white/10 rounded-xl text-gray-500 hover:border-[#E8FF00]/30 hover:text-[#E8FF00] transition-all flex items-center justify-center gap-2 text-sm"
                >
                  <Plus className="w-4 h-4" />
                  Aggiungi Abbonamento
                </button>

                <div className="mt-6 bg-[#E8FF00]/5 border border-[#E8FF00]/20 rounded-xl p-4">
                  <p className="text-[#E8FF00] text-xs font-semibold mb-1">✅ Quasi finito!</p>
                  <p className="text-gray-400 text-xs leading-relaxed">
                    Dopo l'invio, il tuo account sarà attivo. Riceverai una notifica via email quando
                    i documenti saranno verificati e la palestra sarà live nel circuito.
                  </p>
                </div>
              </StepCard>
            )}

          </motion.div>
        </AnimatePresence>

        {/* Navigation buttons */}
        <div className="flex gap-3 mt-6">
          {step > 1 && (
            <Button
              variant="outline"
              onClick={handleBack}
              className="flex-1 border-white/10 text-white hover:bg-white/5"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Indietro
            </Button>
          )}
          {step < STEPS.length ? (
            <Button
              onClick={handleNext}
              className="flex-1 font-bold text-black"
              style={{ background: "#E8FF00" }}
            >
              Avanti
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={saving}
              className="flex-1 font-bold text-black"
              style={{ background: "#E8FF00" }}
            >
              {saving ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin text-black" />Registrazione...</>
              ) : (
                <><CheckCircle className="w-4 h-4 mr-2" />Completa Registrazione</>
              )}
            </Button>
          )}
        </div>

        {step === 3 && (
          <p className="text-center text-gray-600 text-xs mt-3 cursor-pointer hover:text-gray-400" onClick={handleNext}>
            Salta questo passaggio →
          </p>
        )}
      </div>
    </div>
  );
}

function StepCard({ title, icon: Icon, children }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 rounded-xl bg-[#E8FF00]/10 flex items-center justify-center">
          <Icon className="w-5 h-5 text-[#E8FF00]" />
        </div>
        <h2 className="text-white font-bold text-lg">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function MembershipForm({ index, membership, onUpdate, onRemove, onAddBenefit, onRemoveBenefit }) {
  const [newBenefit, setNewBenefit] = useState("");

  const handleAddBenefit = () => {
    onAddBenefit(index, newBenefit);
    setNewBenefit("");
  };

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Abbonamento {index + 1}</span>
        {onRemove && (
          <button onClick={() => onRemove(index)} className="text-gray-600 hover:text-red-400">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
      <div className="grid sm:grid-cols-3 gap-3">
        <div className="sm:col-span-1">
          <Label className="text-gray-400 text-xs">Nome *</Label>
          <Input
            value={membership.name}
            onChange={e => onUpdate(index, "name", e.target.value)}
            placeholder="es. Mensile"
            className="bg-white/5 border-white/10 text-white mt-1 h-8 text-sm"
          />
        </div>
        <div>
          <Label className="text-gray-400 text-xs">Durata (giorni)</Label>
          <Input
            type="number"
            value={membership.duration_days}
            onChange={e => onUpdate(index, "duration_days", parseInt(e.target.value) || 30)}
            className="bg-white/5 border-white/10 text-white mt-1 h-8 text-sm"
          />
        </div>
        <div>
          <Label className="text-gray-400 text-xs">Prezzo (€) *</Label>
          <Input
            type="number"
            step="0.01"
            value={membership.price}
            onChange={e => onUpdate(index, "price", parseFloat(e.target.value) || 0)}
            className="bg-white/5 border-white/10 text-white mt-1 h-8 text-sm"
          />
        </div>
      </div>
      <div>
        <Label className="text-gray-400 text-xs">Descrizione</Label>
        <Input
          value={membership.description}
          onChange={e => onUpdate(index, "description", e.target.value)}
          placeholder="Breve descrizione..."
          className="bg-white/5 border-white/10 text-white mt-1 h-8 text-sm"
        />
      </div>
      <div>
        <Label className="text-gray-400 text-xs">Benefici inclusi</Label>
        <div className="flex gap-2 mt-1">
          <Input
            value={newBenefit}
            onChange={e => setNewBenefit(e.target.value)}
            placeholder="es. Accesso illimitato"
            className="bg-white/5 border-white/10 text-white h-8 text-sm"
            onKeyDown={e => e.key === "Enter" && (e.preventDefault(), handleAddBenefit())}
          />
          <Button size="sm" variant="outline" onClick={handleAddBenefit} className="border-white/10 text-white hover:bg-white/10 h-8 px-3">
            <Plus className="w-3 h-3" />
          </Button>
        </div>
        {membership.benefits?.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {membership.benefits.map((b, bi) => (
              <Badge key={bi} className="bg-white/10 text-gray-300 text-xs gap-1">
                {b}
                <button onClick={() => onRemoveBenefit(index, bi)}><X className="w-2.5 h-2.5" /></button>
              </Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}