import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { ArrowRight, User, LogIn, Building2, ChevronLeft, Dumbbell, Gift } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import PromoPopup from "@/components/promo/PromoPopup";

// step: "splash" | "choice" | "who"
export default function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState("splash");
  const [showPromo, setShowPromo] = useState(false);

  React.useEffect(() => {
    if (step === "splash") {
      const t = setTimeout(() => setStep("choice"), 2200);
      return () => clearTimeout(t);
    }
  }, [step]);

  const handleClientLogin = () => {
    navigate(createPageUrl("Auth") + "?mode=login&type=client");
  };

  const handleGymLogin = () => {
    navigate(createPageUrl("Auth") + "?mode=login&type=gym");
  };

  const handleClientRegister = () => {
    navigate(createPageUrl("Auth") + "?mode=register&type=client");
  };

  const handleGymRegister = () => {
    navigate(createPageUrl("Auth") + "?mode=register&type=gym");
  };

  const handleGuest = () => {
    setShowPromo(true);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] relative">
      {showPromo && <PromoPopup onClose={() => setShowPromo(false)} />}
      <div className="min-h-screen flex flex-col items-center justify-center overflow-hidden relative px-6">
      {/* Background glow */}
      <div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(232,255,0,0.08) 0%, transparent 70%)" }}
      />

      <AnimatePresence mode="wait">

        {/* ── SPLASH ── */}
        {step === "splash" && (
          <motion.div
            key="splash"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col items-center gap-6"
          >
            <img
              src="https://media.base44.com/images/public/6900e246d71384c10b97f155/49b0b5056_6cb7a69af_generated_image.png"
              alt="Fit ABB"
              className="w-32 h-32 object-contain rounded-3xl drop-shadow-2xl"
            />
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="text-center">
              <h1 className="text-4xl font-black text-white tracking-tight">Fit ABB</h1>
              <p className="text-gray-500 mt-2 text-sm">Allena Italia</p>
            </motion.div>
            <motion.div className="w-48 h-0.5 bg-white/10 rounded-full overflow-hidden mt-4">
              <motion.div
                className="h-full rounded-full"
                style={{ background: "#E8FF00" }}
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 1.8, ease: "easeInOut" }}
              />
            </motion.div>
          </motion.div>
        )}

        {/* ── CHOICE: Accedi / Registrati / Ospite ── */}
        {step === "choice" && (
          <motion.div
            key="choice"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-sm flex flex-col items-center"
          >
            <img
              src="https://media.base44.com/images/public/6900e246d71384c10b97f155/49b0b5056_6cb7a69af_generated_image.png"
              alt="Fit ABB"
              className="w-16 h-16 object-contain rounded-2xl mb-8 drop-shadow-xl"
            />
            <div className="text-center mb-8">
              <h2 className="text-3xl font-black text-white leading-tight">
                Benvenuto su<br />
                <span style={{ color: "#E8FF00" }}>Fit ABB</span>
              </h2>
              <p className="text-gray-500 text-sm mt-3">Dove vuoi, come vuoi, quando vuoi.</p>
            </div>

            <div className="w-full space-y-3">
              {/* REGISTRATI */}
              <Button
                size="lg"
                className="w-full text-black font-bold text-base py-7 rounded-2xl shadow-xl hover:opacity-90 transition-all"
                style={{ background: "#E8FF00" }}
                onClick={() => setStep("who-register")}
              >
                <User className="w-5 h-5 mr-2" />
                Registrati
                <ArrowRight className="w-5 h-5 ml-auto" />
              </Button>

              {/* ACCEDI */}
              <Button
                size="lg"
                variant="outline"
                className="w-full border-white/20 text-white hover:bg-white/5 text-base py-7 rounded-2xl font-semibold"
                onClick={() => setStep("who-login")}
              >
                <LogIn className="w-5 h-5 mr-2" />
                Accedi
                <ArrowRight className="w-5 h-5 ml-auto" />
              </Button>

              {/* OSPITE */}
              <button
                onClick={handleGuest}
                className="w-full text-gray-500 text-sm py-3 hover:text-gray-300 transition-colors"
              >
                Continua come ospite →
              </button>
            </div>
          </motion.div>
        )}

        {/* ── CHI SEI? REGISTRAZIONE ── */}
        {step === "who-register" && (
          <motion.div
            key="who-register"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.35 }}
            className="w-full max-w-sm flex flex-col items-center"
          >
            <button
              onClick={() => setStep("choice")}
              className="self-start flex items-center gap-1 text-gray-500 hover:text-white mb-6 text-sm transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Indietro
            </button>

            <div className="text-center mb-8">
              <h2 className="text-2xl font-black text-white">Registrati come...</h2>
              <p className="text-gray-500 text-sm mt-2">Scegli la tua tipologia di account</p>
            </div>

            <div className="w-full space-y-4">
              {/* CLIENTE */}
              <button
                onClick={handleClientRegister}
                className="w-full bg-white/5 border border-white/10 hover:border-[#E8FF00]/40 rounded-2xl p-5 text-left transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#E8FF00]/10 flex items-center justify-center group-hover:bg-[#E8FF00]/20 transition-colors">
                    <Dumbbell className="w-6 h-6 text-[#E8FF00]" />
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-bold text-base">Cliente</p>
                    <p className="text-gray-500 text-xs mt-0.5">Accedi a centinaia di palestre con un solo abbonamento</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-600 group-hover:text-[#E8FF00] transition-colors" />
                </div>
              </button>

              {/* PALESTRA */}
              <button
                onClick={handleGymRegister}
                className="w-full bg-white/5 border border-white/10 hover:border-[#E8FF00]/40 rounded-2xl p-5 text-left transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                    <Building2 className="w-6 h-6 text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-bold text-base">Gestore Palestra</p>
                    <p className="text-gray-500 text-xs mt-0.5">Porta la tua struttura nel circuito Fit ABB</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-600 group-hover:text-blue-400 transition-colors" />
                </div>
              </button>
            </div>
          </motion.div>
        )}

        {/* ── CHI SEI? LOGIN ── */}
        {step === "who-login" && (
          <motion.div
            key="who-login"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.35 }}
            className="w-full max-w-sm flex flex-col items-center"
          >
            <button
              onClick={() => setStep("choice")}
              className="self-start flex items-center gap-1 text-gray-500 hover:text-white mb-6 text-sm transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Indietro
            </button>

            <div className="text-center mb-8">
              <h2 className="text-2xl font-black text-white">Accedi come...</h2>
              <p className="text-gray-500 text-sm mt-2">Scegli la tua tipologia di account</p>
            </div>

            <div className="w-full space-y-4">
              {/* CLIENTE */}
              <button
                onClick={handleClientLogin}
                className="w-full bg-white/5 border border-white/10 hover:border-[#E8FF00]/40 rounded-2xl p-5 text-left transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#E8FF00]/10 flex items-center justify-center group-hover:bg-[#E8FF00]/20 transition-colors">
                    <Dumbbell className="w-6 h-6 text-[#E8FF00]" />
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-bold text-base">Cliente</p>
                    <p className="text-gray-500 text-xs mt-0.5">Accedi alla tua area fitness personale</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-600 group-hover:text-[#E8FF00] transition-colors" />
                </div>
              </button>

              {/* PALESTRA */}
              <button
                onClick={handleGymLogin}
                className="w-full bg-white/5 border border-white/10 hover:border-[#E8FF00]/40 rounded-2xl p-5 text-left transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                    <Building2 className="w-6 h-6 text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-bold text-base">Gestore Palestra</p>
                    <p className="text-gray-500 text-xs mt-0.5">Accedi alla dashboard della tua struttura</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-600 group-hover:text-blue-400 transition-colors" />
                </div>
              </button>
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
    </div>
  );
}