import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2, ArrowRight, ArrowLeft, AlertCircle, Loader2,
  Zap, TrendingUp, Users, ShieldCheck, Euro, CheckCircle
} from "lucide-react";

export default function GymOnboarding() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    city: "",
    address: "",
    phone: "",
    email: "",
    // Dati fiscali - da completare dopo
    piva: "",
    billing_name: "",
    iban: "",
  });

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

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

  const validate = () => {
    setError("");
    if (step === 1) {
      if (!form.name || !form.city || !form.address || !form.email)
        return setError("Compila nome, indirizzo, città ed email.") || false;
    }
    // Step 2 è opzionale - si può completare dopo
    return true;
  };

  const handleNext = () => { if (validate()) { setStep(s => s + 1); window.scrollTo(0, 0); } };
  const handleBack = () => { setError(""); setStep(s => s - 1); window.scrollTo(0, 0); };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSaving(true);
    setError("");
    try {
      const gymData = {
        name: form.name,
        city: form.city,
        address: form.address,
        phone: form.phone,
        email: form.email,
        manager_email: user.email,
        visura_status: "pending",
        is_partner: false,
        available_for_silver: true,
        available_for_gold: true,
        available_for_premium: true,
        payout_method: "both",
      };
      
      // Aggiungi dati fiscali se compilati
      if (form.piva) gymData.piva = form.piva;
      if (form.billing_name) gymData.billing_name = form.billing_name;
      if (form.iban) gymData.iban = form.iban;
      
      await base44.entities.Gym.create(gymData);
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

  const inputCls = "bg-white/5 border-white/10 text-white placeholder:text-gray-600 mt-1";

  return (
    <div className="min-h-screen bg-[#0a0a0a] py-8 px-4">
      <div className="max-w-lg mx-auto">

        <div className="flex justify-center mb-8">
          <img
            src="https://media.base44.com/images/public/6900e246d71384c10b97f155/49b0b5056_6cb7a69af_generated_image.png"
            alt="Fit ABB"
            className="w-12 h-12 object-contain rounded-2xl"
          />
        </div>

        {/* Step dots */}
        {step > 0 && (
          <div className="flex items-center justify-center gap-3 mb-8">
            {[1, 2].map(s => (
              <React.Fragment key={s}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  step > s ? "bg-[#E8FF00] text-black" :
                  step === s ? "border-2 border-[#E8FF00] text-[#E8FF00] bg-transparent" :
                  "bg-white/5 border border-white/10 text-gray-600"
                }`}>
                  {step > s ? <CheckCircle className="w-3.5 h-3.5" /> : s}
                </div>
                {s < 2 && <div className={`flex-1 h-0.5 max-w-[80px] ${step > s ? "bg-[#E8FF00]/40" : "bg-white/5"}`} />}
              </React.Fragment>
            ))}
          </div>
        )}

        {error && (
          <Alert className="mb-5 bg-red-900/20 border-red-500/30">
            <AlertCircle className="h-4 w-4 text-red-400" />
            <AlertDescription className="text-red-300">{error}</AlertDescription>
          </Alert>
        )}

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: step === 0 ? 0 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
          >

            {/* ── STEP 0: Pitch ── */}
            {step === 0 && (
              <div className="text-center">
                <div className="inline-flex items-center gap-2 bg-[#E8FF00]/10 border border-[#E8FF00]/20 rounded-full px-4 py-1.5 mb-6">
                  <Zap className="w-3.5 h-3.5 text-[#E8FF00]" />
                  <span className="text-[#E8FF00] text-xs font-semibold">Circuito Palestre Fit ABB</span>
                </div>

                <h1 className="text-3xl font-black text-white leading-tight mb-4">
                  La tua palestra,<br />
                  <span style={{ color: "#E8FF00" }}>migliaia di nuovi clienti.</span>
                </h1>
                <p className="text-gray-400 text-sm leading-relaxed mb-10 max-w-sm mx-auto">
                  Fit ABB connette le palestre italiane con abbonati che possono allenarsi ovunque.
                  Registrati in 2 minuti e accedi subito alla dashboard.
                </p>

                <div className="grid grid-cols-2 gap-3 mb-10">
                  {[
                    { icon: Users, color: "text-[#E8FF00]", bg: "bg-[#E8FF00]/10", title: "Nuovi clienti", desc: "Accedi a tutta la base utenti Fit ABB" },
                    { icon: TrendingUp, color: "text-green-400", bg: "bg-green-500/10", title: "Guadagni certi", desc: "Incassi proporzionalmente agli accessi" },
                    { icon: Euro, color: "text-blue-400", bg: "bg-blue-500/10", title: "Fondo Comunion", desc: "Ricevi anche la quota degli inattivi" },
                    { icon: ShieldCheck, color: "text-purple-400", bg: "bg-purple-500/10", title: "Zero rischi", desc: "Nessun costo fisso" },
                  ].map((f, i) => (
                    <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-4 text-left">
                      <div className={`w-8 h-8 ${f.bg} rounded-lg flex items-center justify-center mb-3`}>
                        <f.icon className={`w-4 h-4 ${f.color}`} />
                      </div>
                      <p className="text-white font-semibold text-sm mb-1">{f.title}</p>
                      <p className="text-gray-500 text-xs leading-relaxed">{f.desc}</p>
                    </div>
                  ))}
                </div>

                <div className="bg-[#E8FF00]/5 border border-[#E8FF00]/20 rounded-2xl p-5 text-left mb-8">
                  <p className="text-white font-bold text-sm mb-3">Registrazione in 2 passi</p>
                  {[
                    { n: "1", text: "Inserisci i dati della palestra e quelli fiscali" },
                    { n: "2", text: "Accedi subito alla dashboard e completa il profilo con foto, orari e documenti" },
                  ].map(item => (
                    <div key={item.n} className="flex items-center gap-3 mb-2 last:mb-0">
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
                  Inizia la registrazione <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <p className="text-gray-600 text-xs mt-4">Gratuita • Nessun vincolo</p>
              </div>
            )}

            {/* ── STEP 1: Dati struttura ── */}
            {step === 1 && (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-9 h-9 rounded-xl bg-[#E8FF00]/10 flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-[#E8FF00]" />
                  </div>
                  <div>
                    <h2 className="text-white font-bold text-lg">La tua palestra</h2>
                    <p className="text-gray-500 text-xs">Dati principali della struttura</p>
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <Label className="text-gray-400 text-xs">Nome Palestra *</Label>
                    <Input value={form.name} onChange={set("name")} placeholder="es. Power Gym Milano" className={inputCls} />
                  </div>
                  <div className="sm:col-span-2">
                    <Label className="text-gray-400 text-xs">Indirizzo *</Label>
                    <Input value={form.address} onChange={set("address")} placeholder="Via Roma 1" className={inputCls} />
                  </div>
                  <div>
                    <Label className="text-gray-400 text-xs">Città *</Label>
                    <Input value={form.city} onChange={set("city")} placeholder="Milano" className={inputCls} />
                  </div>
                  <div>
                    <Label className="text-gray-400 text-xs">Telefono</Label>
                    <Input value={form.phone} onChange={set("phone")} placeholder="+39 02 1234567" className={inputCls} />
                  </div>
                  <div className="sm:col-span-2">
                    <Label className="text-gray-400 text-xs">Email Contatto *</Label>
                    <Input type="email" value={form.email} onChange={set("email")} placeholder="info@palestra.it" className={inputCls} />
                  </div>
                </div>
              </div>
            )}

            {/* ── STEP 2: Dati fiscali (opzionali) ── */}
            {step === 2 && (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-9 h-9 rounded-xl bg-[#E8FF00]/10 flex items-center justify-center">
                    <Euro className="w-5 h-5 text-[#E8FF00]" />
                  </div>
                  <div>
                    <h2 className="text-white font-bold text-lg">Dati fiscali</h2>
                    <p className="text-gray-500 text-xs">Facoltativi - puoi completarli dopo</p>
                  </div>
                </div>

                <div className="bg-green-900/20 border border-green-500/20 rounded-xl p-3 mb-5">
                  <p className="text-green-300 text-xs font-semibold">✓ Step 1 completato!</p>
                  <p className="text-green-200 text-xs mt-1">La tua palestra è già registrata. Questi dati servono solo per i pagamenti.</p>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-400 text-xs">Partita IVA (opzionale)</Label>
                    <Input value={form.piva} onChange={set("piva")} placeholder="IT12345678901" className={inputCls} />
                  </div>
                  <div>
                    <Label className="text-gray-400 text-xs">IBAN (opzionale)</Label>
                    <Input value={form.iban} onChange={set("iban")} placeholder="IT60X0542811101..." className={inputCls} />
                  </div>
                  <div className="sm:col-span-2">
                    <Label className="text-gray-400 text-xs">Ragione Sociale (opzionale)</Label>
                    <Input value={form.billing_name} onChange={set("billing_name")} placeholder="Fitness SRL o Mario Rossi" className={inputCls} />
                  </div>
                </div>

                <div className="bg-[#E8FF00]/5 border border-[#E8FF00]/20 rounded-xl p-4 mt-5">
                  <p className="text-[#E8FF00] text-xs font-semibold mb-1">💡 Suggerimento</p>
                  <p className="text-gray-400 text-xs leading-relaxed">
                    Puoi saltare questo step e completare i dati fiscali dalla dashboard quando sei pronto ad accettare abbonamenti.
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
              <ArrowLeft className="w-4 h-4 mr-2" /> Indietro
            </Button>
            {step < 2 ? (
              <Button onClick={handleNext} className="flex-1 font-bold text-black" style={{ background: "#E8FF00" }}>
                Avanti <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <>
                <Button 
                  onClick={() => {
                    // Salta step 2 e vai diretto alla dashboard
                    handleSubmit();
                  }} 
                  className="flex-1 font-bold text-black" 
                  style={{ background: "#E8FF00" }}
                  disabled={saving}
                >
                  {saving
                    ? <><Loader2 className="w-4 h-4 mr-2 animate-spin text-black" />Salvataggio...</>
                    : <><CheckCircle className="w-4 h-4 mr-2" />Vai alla Dashboard</>
                  }
                </Button>
                <Button 
                  onClick={handleSubmit} 
                  variant="outline"
                  className="flex-1 border-white/10 text-white hover:bg-white/5"
                  disabled={saving}
                >
                  Compila dopo
                </Button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}