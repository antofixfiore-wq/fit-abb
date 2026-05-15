import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight, User, LogIn, ChevronLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Step: "splash" | "choice" | "register"
export default function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState("splash");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Dopo 2s splash → choice
  React.useEffect(() => {
    if (step === "splash") {
      const t = setTimeout(() => setStep("choice"), 2200);
      return () => clearTimeout(t);
    }
  }, [step]);

  const handleGuest = () => {
    navigate(createPageUrl("Home") + "?guest=true");
  };

  const handleRegister = () => {
    // Redirect alla pagina di login/registrazione della piattaforma
    base44.auth.redirectToLogin(createPageUrl("ClientDashboard"));
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center overflow-hidden relative">
      {/* Background glow */}
      <div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(232,255,0,0.10) 0%, transparent 70%)" }}
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
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-center"
            >
              <h1 className="text-4xl font-black text-white tracking-tight">Fit ABB</h1>
              <p className="text-gray-500 mt-2 text-sm">Allena Italia</p>
            </motion.div>
            {/* Loading bar */}
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

        {/* ── CHOICE ── */}
        {step === "choice" && (
          <motion.div
            key="choice"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-sm px-6 flex flex-col items-center"
          >
            {/* Logo small */}
            <img
              src="https://media.base44.com/images/public/6900e246d71384c10b97f155/49b0b5056_6cb7a69af_generated_image.png"
              alt="Fit ABB"
              className="w-16 h-16 object-contain rounded-2xl mb-8 drop-shadow-xl"
            />

            <div className="text-center mb-10">
              <h2 className="text-3xl font-black text-white leading-tight">
                Benvenuto su<br />
                <span style={{ color: "#E8FF00" }}>Fit ABB</span>
              </h2>
              <p className="text-gray-500 text-sm mt-3">
                Dove vuoi, come vuoi, quando vuoi.
              </p>
            </div>

            <div className="w-full space-y-4">
              {/* REGISTRATI */}
              <Button
                size="lg"
                className="w-full text-black font-bold text-base py-7 rounded-2xl shadow-xl hover:opacity-90 transition-all"
                style={{ background: "#E8FF00" }}
                onClick={handleRegister}
              >
                <User className="w-5 h-5 mr-2" />
                Registrati
                <ArrowRight className="w-5 h-5 ml-auto" />
              </Button>

              {/* OSPITE */}
              <Button
                size="lg"
                variant="outline"
                className="w-full border-white/15 text-white hover:bg-white/5 text-base py-7 rounded-2xl"
                onClick={handleGuest}
              >
                <LogIn className="w-5 h-5 mr-2" />
                Continua come ospite
              </Button>
            </div>

            <p className="text-gray-600 text-xs mt-8 text-center leading-relaxed">
              Continuando accetti i nostri{" "}
              <span className="text-gray-400 underline cursor-pointer">Termini di Servizio</span>{" "}
              e la{" "}
              <span className="text-gray-400 underline cursor-pointer">Privacy Policy</span>
            </p>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}