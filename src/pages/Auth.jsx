import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { motion } from "framer-motion";
import { User, Mail, Phone, MapPin, ArrowRight, ArrowLeft, AlertCircle, Loader2, CheckCircle, Building2, Dumbbell } from "lucide-react";

export default function Auth() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const mode = searchParams.get("mode") || "login";
  const type = searchParams.get("type") || "client";

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    full_name: "",
    phone: "",
    address: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  useEffect(() => {
    // Se l'utente è già loggato, redirect
    const checkAuth = async () => {
      try {
        const user = await base44.auth.me();
        if (user) {
          if (type === "gym") {
            navigate("/GymDashboard");
          } else {
            navigate(createPageUrl("ClientDashboard"));
          }
        }
      } catch {
        // Non loggato, ok
      }
    };
    checkAuth();
  }, [navigate, type]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Login tramite base44
      await base44.auth.login(formData.email, formData.password);
      
      // Redirect in base al tipo
      if (type === "gym") {
        const gyms = await base44.entities.Gym.list();
        const hasGym = gyms.some(g => g.manager_email === formData.email);
        navigate(hasGym ? "/GymDashboard" : "/GymOnboarding");
      } else {
        navigate(createPageUrl("ClientDashboard"));
      }
    } catch (err) {
      setError("Email o password non validi");
    } finally {
      setLoading(false);
    }
  };

  const handleStep1 = () => {
    if (!formData.email || !formData.password) {
      setError("Inserisci email e password");
      return;
    }
    setError("");
    setStep(2);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Registrazione utente
      await base44.auth.register(formData.email, formData.password, formData.full_name);
      
      // Aggiorna dati aggiuntivi se presenti
      if (formData.phone || formData.address) {
        await base44.auth.updateMe({
          phone: formData.phone,
          address: formData.address,
        });
      }

      // Redirect a CompleteProfile per completare i dati
      navigate(createPageUrl("CompleteProfile"));
    } catch (err) {
      setError(err.message || "Errore nella registrazione");
    } finally {
      setLoading(false);
    }
  };

  const inputCls = "bg-white/5 border-white/10 text-white placeholder:text-gray-600 h-11";

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <img
            src="https://media.base44.com/images/public/6900e246d71384c10b97f155/49b0b5056_6cb7a69af_generated_image.png"
            alt="Fit ABB"
            className="w-16 h-16 object-contain rounded-2xl"
          />
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-white mb-2">
            {mode === "login" ? "Bentornato" : "Crea Account"}
          </h1>
          <p className="text-gray-500 text-sm">
            {type === "gym" 
              ? mode === "login" 
                ? "Accedi alla dashboard della tua palestra" 
                : "Registra la tua palestra in 2 minuti"
              : mode === "login"
                ? "Accedi al tuo profilo fitness"
                : "Inizia il tuo percorso fitness"
            }
          </p>
        </div>

        {error && (
          <Alert className="mb-6 bg-red-900/20 border-red-500/30">
            <AlertCircle className="h-4 w-4 text-red-400" />
            <AlertDescription className="text-red-300">{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-6 bg-green-900/20 border-green-500/30">
            <CheckCircle className="h-4 w-4 text-green-400" />
            <AlertDescription className="text-green-300">{success}</AlertDescription>
          </Alert>
        )}

        {mode === "login" ? (
          /* ─── LOGIN FORM ─── */
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            onSubmit={handleLogin}
            className="space-y-4"
          >
            <div>
              <Label className="text-gray-400 text-xs">Email</Label>
              <Input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="tua@email.com"
                className={inputCls}
                required
              />
            </div>
            <div>
              <Label className="text-gray-400 text-xs">Password</Label>
              <Input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className={inputCls}
                required
              />
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 font-bold"
              style={{ background: "#E8FF00", color: "#000" }}
            >
              {loading ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Accesso...</>
              ) : (
                <><User className="w-4 h-4 mr-2" /> Accedi</>
              )}
            </Button>
          </motion.form>
        ) : (
          /* ─── REGISTRAZIONE FORM ─── */
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            onSubmit={handleRegister}
            className="space-y-4"
          >
            {step === 1 && (
              <>
                <div className="bg-[#E8FF00]/5 border border-[#E8FF00]/20 rounded-xl p-4 mb-4">
                  <p className="text-[#E8FF00] text-xs font-semibold mb-1">⚡ Solo 2 step!</p>
                  <p className="text-gray-400 text-xs">
                    Step 1: Email e password<br />
                    Step 2: Dati base (nome, telefono, indirizzo)
                  </p>
                </div>

                <div>
                  <Label className="text-gray-400 text-xs">Email *</Label>
                  <Input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="tua@email.com"
                    className={inputCls}
                    required
                  />
                </div>
                <div>
                  <Label className="text-gray-400 text-xs">Password *</Label>
                  <Input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Almeno 8 caratteri"
                    className={inputCls}
                    required
                    minLength={8}
                  />
                </div>
                <Button
                  type="button"
                  onClick={handleStep1}
                  className="w-full h-11 font-bold"
                  style={{ background: "#E8FF00", color: "#000" }}
                >
                  Avanti <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </>
            )}

            {step === 2 && (
              <>
                <div className="flex items-center gap-2 mb-4">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-gray-400 hover:text-white"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <h3 className="text-white font-semibold text-sm">Completa il profilo</h3>
                </div>

                <div>
                  <Label className="text-gray-400 text-xs">Nome e Cognome *</Label>
                  <Input
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleChange}
                    placeholder="Mario Rossi"
                    className={inputCls}
                    required
                  />
                </div>
                <div>
                  <Label className="text-gray-400 text-xs">Telefono</Label>
                  <Input
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+39 123 456 7890"
                    className={inputCls}
                  />
                </div>
                <div>
                  <Label className="text-gray-400 text-xs">Indirizzo</Label>
                  <Input
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Via Roma 1, Milano"
                    className={inputCls}
                  />
                </div>

                <div className="bg-blue-900/20 border border-blue-500/20 rounded-xl p-3">
                  <p className="text-blue-300 text-xs">
                    💡 Potrai completare il profilo dopo. Ora bastano questi dati per iniziare!
                  </p>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 font-bold"
                  style={{ background: "#E8FF00", color: "#000" }}
                >
                  {loading ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Creazione account...</>
                  ) : (
                    <><CheckCircle className="w-4 h-4 mr-2" /> Crea Account</>
                  )}
                </Button>
              </>
            )}
          </motion.form>
        )}

        {/* Footer links */}
        <div className="mt-8 text-center space-y-3">
          <p className="text-gray-500 text-sm">
            {mode === "login" ? "Non hai un account?" : "Hai già un account?"}{" "}
            <a
              href={createPageUrl("Auth") + `?mode=${mode === "login" ? "register" : "login"}&type=${type}`}
              className="text-[#E8FF00] hover:underline font-medium"
            >
              {mode === "login" ? "Registrati" : "Accedi"}
            </a>
          </p>
          <div className="flex justify-center gap-4 text-xs text-gray-600">
            <a href="/privacy" className="hover:text-gray-400">Privacy</a>
            <span>•</span>
            <a href="/terms" className="hover:text-gray-400">Termini</a>
          </div>
        </div>
      </div>
    </div>
  );
}