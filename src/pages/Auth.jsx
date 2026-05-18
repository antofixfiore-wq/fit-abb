import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, Mail, Lock, User, Eye, EyeOff, Dumbbell, Building2 } from "lucide-react";
import { motion } from "framer-motion";

// Mode: "login" | "register" | "select-type"
export default function Auth() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialMode = searchParams.get("mode") || "select-type";
  const userType = searchParams.get("type") || "client"; // "client" | "gym"
  
  const [mode, setMode] = useState(initialMode);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    full_name: "",
    confirm_password: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSelectType = (type) => {
    const redirectUrl = type === "client" ? createPageUrl("ClientDashboard") : "/GymDashboard";
    base44.auth.redirectToLogin(redirectUrl);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (formData.password !== formData.confirm_password) {
      setError("Le password non corrispondono");
      setLoading(false);
      return;
    }

    if (formData.password.length < 8) {
      setError("La password deve contenere almeno 8 caratteri");
      setLoading(false);
      return;
    }

    try {
      // Base44 non ha registrazione diretta via API - reindirizziamo al login
      // Questo è un fallback, in realtà usiamo il sistema nativo di Base44
      setError("Per registrarti, utilizza il sistema di registrazione nativo");
      setTimeout(() => {
        base44.auth.redirectToLogin(userType === "client" ? createPageUrl("ClientDashboard") : "/GymOnboarding");
      }, 2000);
    } catch (err) {
      setError("Errore durante la registrazione. Riprova.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      base44.auth.redirectToLogin(userType === "client" ? createPageUrl("ClientDashboard") : "/GymDashboard");
    } catch (err) {
      setError("Errore durante l'accesso. Riprova.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center px-4 py-8">
      {/* Background glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(232,255,0,0.08) 0%, transparent 70%)" }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Header con back button */}
        {mode !== "select-type" && (
          <button
            onClick={() => navigate(createPageUrl("Onboarding"))}
            className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Torna indietro
          </button>
        )}

        {/* Logo */}
        <div className="flex justify-center mb-6">
          <img
            src="https://media.base44.com/images/public/6900e246d71384c10b97f155/49b0b5056_6cb7a69af_generated_image.png"
            alt="Fit ABB"
            className="w-20 h-20 object-contain rounded-2xl drop-shadow-2xl"
          />
        </div>

        {/* SELEZIONE TIPO UTENTE */}
        {mode === "select-type" && (
          <>
            <div className="text-center mb-8">
              <h1 className="text-3xl font-black text-white mb-2">
                {userType === "client" ? "Cliente" : "Palestra"}
              </h1>
              <p className="text-gray-400 text-sm">
                {userType === "client" 
                  ? "Scegli come vuoi accedere" 
                  : "Gestisci la tua palestra"}
              </p>
            </div>

            <div className="space-y-3">
              <Button
                size="lg"
                className="w-full h-14 text-base font-bold"
                style={{ background: "#E8FF00", color: "#000" }}
                onClick={() => handleSelectType(userType)}
              >
                <Dumbbell className="w-5 h-5 mr-2" />
                {userType === "client" ? "Accedi o Registrati" : "Accedi alla Dashboard"}
              </Button>

              <Button
                size="lg"
                variant="outline"
                className="w-full h-14 border-white/20 text-white"
                onClick={() => navigate(createPageUrl("Onboarding"))}
              >
                Cambia tipologia
              </Button>
            </div>
          </>
        )}

        {/* FORM LOGIN/REGISTRAZIONE */}
        {(mode === "login" || mode === "register") && (
          <>
            <div className="text-center mb-6">
              <h1 className="text-2xl font-black text-white mb-1">
                {mode === "login" ? "Bentornato" : "Crea account"}
              </h1>
              <p className="text-gray-400 text-sm">
                {mode === "login" ? "Accedi al tuo account" : "Registrati gratuitamente"}
              </p>
            </div>

            {error && (
              <Alert variant="destructive" className="mb-6 bg-red-500/10 border-red-500/30">
                <AlertDescription className="text-red-300 text-sm">{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={mode === "login" ? handleLogin : handleRegister} className="space-y-4">
              {mode === "register" && (
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-gray-300 text-xs">Nome Completo</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <Input
                      id="name"
                      type="text"
                      value={formData.full_name}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                      className="pl-10 bg-white/5 border-white/10 text-white h-11"
                      placeholder="Mario Rossi"
                      required
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-300 text-xs">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="pl-10 bg-white/5 border-white/10 text-white h-11"
                    placeholder="nome@esempio.com"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-300 text-xs">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="pl-10 pr-10 bg-white/5 border-white/10 text-white h-11"
                    placeholder="••••••••"
                    required
                    minLength={8}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {mode === "register" && (
                <div className="space-y-2">
                  <Label htmlFor="confirm_password" className="text-gray-300 text-xs">Conferma Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <Input
                      id="confirm_password"
                      type="password"
                      value={formData.confirm_password}
                      onChange={(e) => setFormData({ ...formData, confirm_password: e.target.value })}
                      className="pl-10 bg-white/5 border-white/10 text-white h-11"
                      placeholder="••••••••"
                      required
                      minLength={8}
                    />
                  </div>
                </div>
              )}

              {mode === "login" && (
                <div className="text-right">
                  <button
                    type="button"
                    onClick={() => base44.auth.redirectToLogin()}
                    className="text-xs text-[#E8FF00] hover:underline"
                  >
                    Password dimenticata?
                  </button>
                </div>
              )}

              <Button
                type="submit"
                size="lg"
                className="w-full h-12 font-bold"
                style={{ background: "#E8FF00", color: "#000" }}
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-black/40 border-t-black rounded-full animate-spin" />
                    Attendere...
                  </span>
                ) : (
                  mode === "login" ? "Accedi" : "Registrati"
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <button
                onClick={() => setMode(mode === "login" ? "register" : "login")}
                className="text-sm text-gray-400 hover:text-white transition-colors"
              >
                {mode === "login" 
                  ? "Non hai un account? Registrati" 
                  : "Hai già un account? Accedi"}
              </button>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}