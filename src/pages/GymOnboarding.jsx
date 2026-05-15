import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2, FileText, Upload, CheckCircle, X,
  ArrowRight, ArrowLeft, AlertCircle, Loader2,
  Zap, TrendingUp, Users, ShieldCheck, Euro
} from "lucide-react";

// step 0 = presentazione, step 1..N = form
const FORM_STEPS = [
  { id: 1, label: "La tua struttura" },
  { id: 2, label: "Dati fiscali" },
  { id: 3, label: "Documenti" },
];

export default function GymOnboarding() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [step, setStep] = useState(0); // 0 = pitch screen
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  // Step 1 — dati struttura
  const [gymData, setGymData] = useState({
    name: "", address: "", city: "", region: "", phone: "", email: "", description: "",
  });

  // Step 2 — dati fiscali
  const [fiscalData, setFiscalData] = useState({
    piva: "", iban: "", billing_name: "", billing_address: "", billing_city: "", billing_zip: "",
  });

  // Step 3 — documenti
  const [visuraFile, setVisuraFile] = useState(null);
  const [visuraUrl, setVisuraUrl] = useState("");

  useEffect(() => {
    const init = async () => {
      try {
        const u = await base44.auth.me();
        setUser(u);
        const gyms = await base44.entities.Gym.list();
        const existing = gyms.find(g => g.manager_email === u.email);
        if (existing) { navigate("/GymDashboard"); return; }
      } catch {
        base44.auth.redirectToLogin("/GymOnboarding");
        return;
      }
      setLoading(false);
    };
    init();
  }, [navigate]);

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

  const validate = () => {
    setError("");
    if (step === 1) {
      if (!gymData.name || !gymData.address || !gymData.city || !gymData.email)
        return setError("Compila nome, indirizzo, città ed email.") || false;
    }
    if (step === 2) {
      if (!fiscalData.piva || !fiscalData.billing_name || !fiscalData.iban)
        return setError("Compila Partita IVA, ragione sociale e IBAN.") || false;
    }
    if (step === 3) {
      if (!visuraUrl)
        return setError("Carica la visura camerale per procedere.") || false;
    }
    return true;
  };

  const handleNext = () => {
    if (!validate()) return;
    setStep(s => s + 1);
    window.scrollTo(0, 0);
  };

  const handleBack = () => { setError(""); setStep(s => s - 1); window.scrollTo(0, 0); };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSaving(true);
    setError("");
    try {
      await base44.entities.Gym.create({
        ...gymData,
        manager_email: user.email,
        iban: fiscalData.iban,
        piva: fiscalData.piva,
        billing_name: fiscalData.billing_name,
        billing_address: fiscalData.billing_address,
        billing_city: fiscalData.billing_city,
        billing_zip: fiscalData.billing_zip,
        visura_url: visuraUrl,
        visura_status: "pending",
        is_partner: false,
        available_for_silver: true,
        available_for_gold: true,
        available_for_premium: true,
        payout_method: "both",
      });
      navigate("/GymDashboard");
    } catch {
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
      <div className="max-w-xl mx-auto">

        {/* Logo */}
        <div className="flex justify-center mb-8">
          <img
            src="https://media.base44.com/images/public/6900e246d71384c10b97f155/49b0b5056_6cb7a69af_generated_image.png"
            alt="Fit ABB"
            className="w-12 h-12 object-contain rounded-2xl"
          />
        </div>

        {/* Step indicator (solo nei form step) */}
        {step > 0 && (
          <div className="flex items-center justify-center gap-2 mb-8">
            {FORM_STEPS.map((s, idx) => (
              <React.Fragment key={s.id}>
                <div className="flex flex-col items-center gap-1">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    step > s.id ? "bg-[#E8FF00] text-black" :
                    step === s.id ? "bg-[#E8FF00]/20 border-2 border-[#E8FF00] text-[#E8FF00]" :
                    "bg-white/5 border border-white/10 text-gray-600"
                  }`}>
                    {step > s.id ? <CheckCircle className="w-3.5 h-3.5" /> : s.id}
                  </div>
                  <span className={`text-xs hidden sm:block ${step === s.id ? "text-[#E8FF00]" : "text-gray-600"}`}>{s.label}</span>
                </div>
                {idx < FORM_STEPS.length - 1 && (
                  <div className={`flex-1 h-0.5 mb-4 ${step > s.id ? "bg-[#E8FF00]/40" : "bg-white/5"}`} />
                )}
              </React.Fragment>
            ))}
          </div>
        )}

        {/* Error */}
        {error && (
          <Alert className="mb-5 bg-red-900/20 border-red-500/30">
            <AlertCircle className="h-4 w-4 text-red-400" />
            <AlertDescription className="text-red-300">{error}</AlertDescription>
          </Alert>
        )}

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: step === 0 ? 0 : 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.3 }}
          >

            {/* ── STEP 0: Pitch screen ── */}
            {step === 0 && (
              <div className="text-center">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <div className="inline-flex items-center gap-2 bg-[#E8FF00]/10 border border-[#E8FF00]/20 rounded-full px-4 py-1.5 mb-6">
                    <Zap className="w-3.5 h-3.5 text-[#E8FF00]" />
                    <span className="text-[#E8FF00] text-xs font-semibold">Circuito Palestre Fit ABB</span>
                  </div>

                  <h1 className="text-3xl font-black text-white leading-tight mb-4">
                    La tua palestra,<br />
                    <span style={{ color: "#E8FF00" }}>migliaia di nuovi clienti.</span>
                  </h1>
                  <p className="text-gray-400 text-sm leading-relaxed mb-10 max-w-sm mx-auto">
                    Fit ABB è il circuito che connette le palestre italiane con utenti che pagano un abbonamento mensile
                    e possono allenarsi ovunque. Tu incassi ogni volta che qualcuno varca la tua porta.
                  </p>
                </motion.div>

                {/* Feature cards */}
                <div className="grid grid-cols-2 gap-3 mb-10">
                  {[
                    { icon: Users, color: "text-[#E8FF00]", bg: "bg-[#E8FF00]/10", title: "Nuovi clienti", desc: "Accedi a tutta la base utenti Fit ABB senza costi di acquisizione" },
                    { icon: TrendingUp, color: "text-green-400", bg: "bg-green-500/10", title: "Guadagni certi", desc: "Incassi proporzionalmente agli accessi. Più entrano, più guadagni" },
                    { icon: Euro, color: "text-blue-400", bg: "bg-blue-500/10", title: "Fondo Comunion", desc: "Ricevi anche la quota degli abbonati inattivi distribuita alla rete" },
                    { icon: ShieldCheck, color: "text-purple-400", bg: "bg-purple-500/10", title: "Zero rischi", desc: "Nessun costo fisso. Paghi solo una piccola commissione sul guadagnato" },
                  ].map((f, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 + i * 0.1 }}
                      className="bg-white/5 border border-white/10 rounded-xl p-4 text-left"
                    >
                      <div className={`w-8 h-8 ${f.bg} rounded-lg flex items-center justify-center mb-3`}>
                        <f.icon className={`w-4 h-4 ${f.color}`} />
                      </div>
                      <p className="text-white font-semibold text-sm mb-1">{f.title}</p>
                      <p className="text-gray-500 text-xs leading-relaxed">{f.desc}</p>
                    </motion.div>
                  ))}
                </div>

                {/* How it works */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-5 text-left mb-8">
                  <p className="text-white font-bold text-sm mb-4">Come funziona in 3 passi</p>
                  {[
                    { n: "1", text: "Registri la tua palestra e carichi i documenti" },
                    { n: "2", text: "Il team Fit ABB verifica e approva entro 24h" },
                    { n: "3", text: "Appari nel circuito e inizi a incassare ogni mese" },
                  ].map(item => (
                    <div key={item.n} className="flex items-center gap-3 mb-3 last:mb-0">
                      <div className="w-6 h-6 rounded-full bg-[#E8FF00] flex items-center justify-center shrink-0">
                        <span className="text-black text-xs font-black">{item.n}</span>
                      </div>
                      <p className="text-gray-300 text-sm">{item.text}</p>
                    </div>
                  ))}
                </div>

                <Button
                  size="lg"
                  onClick={() => setStep(1)}
                  className="w-full text-black font-bold text-base py-7 rounded-2xl"
                  style={{ background: "#E8FF00" }}
                >
                  Inizia la registrazione
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <p className="text-gray-600 text-xs mt-4">Registrazione gratuita • Nessun vincolo</p>
              </div>
            )}

            {/* ── STEP 1: Dati struttura ── */}
            {step === 1 && (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-9 h-9 rounded-xl bg-[#E8FF00]/10 flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-[#E8FF00]" />
                  </div>
                  <h2 className="text-white font-bold text-lg">Dati della struttura</h2>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <Label className="text-gray-400 text-xs">Nome Palestra *</Label>
                    <Input value={gymData.name} onChange={e => setGymData({ ...gymData, name: e.target.value })}
                      placeholder="es. Fitness Center Milano" className="bg-white/5 border-white/10 text-white mt-1" />
                  </div>
                  <div className="sm:col-span-2">
                    <Label className="text-gray-400 text-xs">Indirizzo *</Label>
                    <Input value={gymData.address} onChange={e => setGymData({ ...gymData, address: e.target.value })}
                      placeholder="Via Roma 1" className="bg-white/5 border-white/10 text-white mt-1" />
                  </div>
                  <div>
                    <Label className="text-gray-400 text-xs">Città *</Label>
                    <Input value={gymData.city} onChange={e => setGymData({ ...gymData, city: e.target.value })}
                      placeholder="Milano" className="bg-white/5 border-white/10 text-white mt-1" />
                  </div>
                  <div>
                    <Label className="text-gray-400 text-xs">Regione</Label>
                    <Input value={gymData.region} onChange={e => setGymData({ ...gymData, region: e.target.value })}
                      placeholder="Lombardia" className="bg-white/5 border-white/10 text-white mt-1" />
                  </div>
                  <div>
                    <Label className="text-gray-400 text-xs">Telefono</Label>
                    <Input value={gymData.phone} onChange={e => setGymData({ ...gymData, phone: e.target.value })}
                      placeholder="+39 02 1234567" className="bg-white/5 border-white/10 text-white mt-1" />
                  </div>
                  <div>
                    <Label className="text-gray-400 text-xs">Email Contatto *</Label>
                    <Input type="email" value={gymData.email} onChange={e => setGymData({ ...gymData, email: e.target.value })}
                      placeholder="info@palestra.it" className="bg-white/5 border-white/10 text-white mt-1" />
                  </div>
                  <div className="sm:col-span-2">
                    <Label className="text-gray-400 text-xs">Descrizione</Label>
                    <Textarea value={gymData.description} onChange={e => setGymData({ ...gymData, description: e.target.value })}
                      placeholder="Racconta la tua palestra..." rows={3}
                      className="bg-white/5 border-white/10 text-white mt-1 resize-none" />
                  </div>
                </div>
              </div>
            )}

            {/* ── STEP 2: Dati fiscali ── */}
            {step === 2 && (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-9 h-9 rounded-xl bg-[#E8FF00]/10 flex items-center justify-center">
                    <Euro className="w-5 h-5 text-[#E8FF00]" />
                  </div>
                  <h2 className="text-white font-bold text-lg">Dati fiscali & pagamenti</h2>
                </div>

                <div className="bg-blue-900/20 border border-blue-500/20 rounded-xl p-4 mb-5">
                  <p className="text-blue-300 text-xs leading-relaxed">
                    🔒 I tuoi dati fiscali sono protetti e usati esclusivamente per l'emissione dei pagamenti mensili.
                  </p>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-400 text-xs">Partita IVA *</Label>
                    <Input value={fiscalData.piva} onChange={e => setFiscalData({ ...fiscalData, piva: e.target.value })}
                      placeholder="IT12345678901" className="bg-white/5 border-white/10 text-white mt-1" />
                  </div>
                  <div>
                    <Label className="text-gray-400 text-xs">IBAN *</Label>
                    <Input value={fiscalData.iban} onChange={e => setFiscalData({ ...fiscalData, iban: e.target.value })}
                      placeholder="IT60X0542811101000000123456" className="bg-white/5 border-white/10 text-white mt-1" />
                  </div>
                  <div className="sm:col-span-2">
                    <Label className="text-gray-400 text-xs">Ragione Sociale / Nome Titolare *</Label>
                    <Input value={fiscalData.billing_name} onChange={e => setFiscalData({ ...fiscalData, billing_name: e.target.value })}
                      placeholder="es. Fitness SRL o Mario Rossi" className="bg-white/5 border-white/10 text-white mt-1" />
                  </div>
                  <div className="sm:col-span-2">
                    <Label className="text-gray-400 text-xs">Indirizzo di Fatturazione</Label>
                    <Input value={fiscalData.billing_address} onChange={e => setFiscalData({ ...fiscalData, billing_address: e.target.value })}
                      placeholder="Via della Fatturazione 1" className="bg-white/5 border-white/10 text-white mt-1" />
                  </div>
                  <div>
                    <Label className="text-gray-400 text-xs">Città Fatturazione</Label>
                    <Input value={fiscalData.billing_city} onChange={e => setFiscalData({ ...fiscalData, billing_city: e.target.value })}
                      placeholder="Milano" className="bg-white/5 border-white/10 text-white mt-1" />
                  </div>
                  <div>
                    <Label className="text-gray-400 text-xs">CAP</Label>
                    <Input value={fiscalData.billing_zip} onChange={e => setFiscalData({ ...fiscalData, billing_zip: e.target.value })}
                      placeholder="20100" className="bg-white/5 border-white/10 text-white mt-1" />
                  </div>
                </div>
              </div>
            )}

            {/* ── STEP 3: Documenti ── */}
            {step === 3 && (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-5">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-9 h-9 rounded-xl bg-[#E8FF00]/10 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-[#E8FF00]" />
                  </div>
                  <h2 className="text-white font-bold text-lg">Documenti</h2>
                </div>

                <div className="bg-blue-900/20 border border-blue-500/20 rounded-xl p-4">
                  <p className="text-blue-300 text-sm font-semibold mb-1">📋 Perché servono i documenti?</p>
                  <p className="text-gray-400 text-xs leading-relaxed">
                    Verifichiamo ogni struttura prima di renderla visibile agli utenti.
                    La tua visura camerale verrà esaminata entro 24–48 ore dalla registrazione.
                  </p>
                </div>

                <div>
                  <Label className="text-gray-300 font-semibold text-sm">Visura Camerale *</Label>
                  <p className="text-gray-500 text-xs mb-3">PDF o immagine del documento Camera di Commercio</p>

                  {visuraUrl ? (
                    <div className="flex items-center gap-3 bg-green-900/20 border border-green-500/30 rounded-xl p-4">
                      <CheckCircle className="w-5 h-5 text-green-400 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-green-300 text-sm font-medium">Documento caricato ✓</p>
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
                          <Upload className="w-8 h-8 text-gray-500" />
                          <span className="text-gray-400 text-sm">Carica Visura Camerale</span>
                          <span className="text-gray-600 text-xs">PDF, JPG, PNG</span>
                        </div>
                      )}
                      <input type="file" accept=".pdf,image/*" className="hidden" disabled={uploading}
                        onChange={e => e.target.files[0] && handleVisuraUpload(e.target.files[0])} />
                    </label>
                  )}
                </div>

                <div className="bg-[#E8FF00]/5 border border-[#E8FF00]/20 rounded-xl p-4">
                  <p className="text-[#E8FF00] text-xs font-semibold mb-1">⚡ Ci siamo quasi!</p>
                  <p className="text-gray-400 text-xs leading-relaxed">
                    Dopo l'invio accederai subito alla dashboard. La palestra apparirà nel circuito
                    appena il nostro team avrà verificato i documenti (entro 24–48h).
                  </p>
                </div>
              </div>
            )}

          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        {step > 0 && (
          <div className="flex gap-3 mt-6">
            <Button variant="outline" onClick={handleBack} className="flex-1 border-white/10 text-white hover:bg-white/5">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Indietro
            </Button>
            {step < FORM_STEPS.length ? (
              <Button onClick={handleNext} className="flex-1 font-bold text-black" style={{ background: "#E8FF00" }}>
                Avanti <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={saving} className="flex-1 font-bold text-black" style={{ background: "#E8FF00" }}>
                {saving
                  ? <><Loader2 className="w-4 h-4 mr-2 animate-spin text-black" />Registrazione...</>
                  : <><CheckCircle className="w-4 h-4 mr-2" />Completa Registrazione</>
                }
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}