import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, AlertTriangle, CheckCircle, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function DeleteAccount() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [confirm, setConfirm] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await base44.auth.me();
        setUser(userData);
      } catch (err) {
        // Utente non autenticato
        navigate("/Onboarding");
      }
    };
    loadUser();
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (confirm !== "ELIMINA") return;
    setLoading(true);
    setError(null);
    
    try {
      await base44.functions.invoke("deleteAccountRequest", {
        confirmation_text: confirm
      });
      setSubmitted(true);
    } catch (err) {
      setError(err.message || "Errore durante l'invio della richiesta");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#E8FF00] animate-spin" />
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-green-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">Richiesta inviata</h2>
          <p className="text-gray-400 leading-relaxed">
            Abbiamo ricevuto la tua richiesta di eliminazione account. Il nostro team elaborerà
            la richiesta entro <strong className="text-white">30 giorni</strong> e riceverai
            una conferma via email a <strong className="text-white">{user.email}</strong>.
          </p>
          <p className="text-gray-500 text-sm mt-4">
            Per qualsiasi dubbio contatta:{" "}
            <a href="mailto:supporto@fit-abb.com" className="text-[#E8FF00] hover:underline">
              supporto@fit-abb.com
            </a>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="max-w-lg mx-auto px-6 py-12">
        {/* Header */}
        <div className="flex items-center gap-3 mb-10">
          <img
            src="https://media.base44.com/images/public/6900e246d71384c10b97f155/49b0b5056_6cb7a69af_generated_image.png"
            alt="Fit ABB"
            className="w-10 h-10 object-contain"
          />
          <span className="text-[#E8FF00] font-bold text-xl">Fit ABB</span>
        </div>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center">
            <Trash2 className="w-6 h-6 text-red-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Elimina account</h1>
            <p className="text-gray-400 text-sm">Questa azione è irreversibile</p>
          </div>
        </div>

        {/* Warning */}
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-8 flex gap-3">
          <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-red-300 space-y-1">
            <p className="font-semibold text-red-200">Cosa verrà eliminato:</p>
            <ul className="list-disc list-inside space-y-1 text-red-300/80">
              <li>Il tuo account e credenziali di accesso</li>
              <li>Tutti i dati fitness e progressi</li>
              <li>Storico accessi alle palestre</li>
              <li>Abbonamento attivo (non rimborsabile)</li>
              <li>Post e contenuti pubblicati</li>
            </ul>
          </div>
        </div>

        {/* Email utente (sola lettura) */}
        <div className="mb-6 p-4 bg-white/5 border border-white/10 rounded-xl">
          <p className="text-sm text-gray-400 mb-1">Account associato:</p>
          <p className="text-lg font-semibold text-white">{user.email}</p>
          <p className="text-xs text-gray-500 mt-1">Nome: {user.full_name || 'Non specificato'}</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6">
            <p className="text-sm text-red-300">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Scrivi <strong className="text-red-400">ELIMINA</strong> per confermare
            </label>
            <Input
              type="text"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="ELIMINA"
              className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
              required
            />
            <p className="text-xs text-gray-500 mt-2">
              Digita esattamente "ELIMINA" (maiuscolo) per procedere
            </p>
          </div>

          <Button
            type="submit"
            disabled={confirm !== "ELIMINA" || loading}
            className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Invio richiesta...
              </span>
            ) : (
              "Richiedi eliminazione account"
            )}
          </Button>
        </form>

        <p className="text-center text-gray-500 text-sm mt-6">
          Hai ripensamenti?{" "}
          <a href="/" className="text-[#E8FF00] hover:underline">
            Torna all'app
          </a>
          {" "}oppure scrivi a{" "}
          <a href="mailto:supporto@fit-abb.com" className="text-[#E8FF00] hover:underline">
            supporto@fit-abb.com
          </a>
        </p>
      </div>
    </div>
  );
}