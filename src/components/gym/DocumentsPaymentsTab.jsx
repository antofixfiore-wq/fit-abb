import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  FileText,
  Upload,
  CheckCircle,
  Clock,
  AlertCircle,
  CreditCard,
  ExternalLink,
  Building2,
  ShieldCheck
} from "lucide-react";

export default function DocumentsPaymentsTab({ gym, onUpdate }) {
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);
  const [iban, setIban] = useState(gym?.iban || "");
  const [savingIban, setSavingIban] = useState(false);

  const handleVisuraUpload = async (file) => {
    if (!file) return;
    setUploading(true);
    setError(null);
    setSuccess(null);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    await base44.entities.Gym.update(gym.id, {
      visura_url: file_url,
      visura_status: "pending"
    });
    setSuccess("Visura camerale caricata! Sarà verificata dall'amministratore.");
    setUploading(false);
    onUpdate();
  };

  const handleSaveIban = async () => {
    setSavingIban(true);
    setError(null);
    await base44.entities.Gym.update(gym.id, { iban });
    setSuccess("IBAN salvato con successo!");
    setSavingIban(false);
    onUpdate();
  };

  const handleStripeOnboarding = async () => {
    // Placeholder: quando Stripe sarà integrato, questo chiamerà la funzione backend
    setError("Stripe Connect non ancora configurato. Sarà disponibile a breve.");
  };

  const getVisuraStatus = () => {
    if (!gym?.visura_url) return null;
    const map = {
      pending: { label: "In verifica", icon: <Clock className="w-4 h-4 text-yellow-400" />, className: "bg-yellow-900/30 text-yellow-300 border-yellow-500/30" },
      approved: { label: "Approvata", icon: <CheckCircle className="w-4 h-4 text-green-400" />, className: "bg-green-900/30 text-green-300 border-green-500/30" },
      rejected: { label: "Rifiutata", icon: <AlertCircle className="w-4 h-4 text-red-400" />, className: "bg-red-900/30 text-red-300 border-red-500/30" }
    };
    return map[gym.visura_status] || map.pending;
  };

  const visuraStatus = getVisuraStatus();

  const steps = [
    {
      num: 1,
      title: "Visura Camerale",
      description: "Carica la visura camerale della tua palestra per verificare la tua attività.",
      done: !!gym?.visura_url,
      status: visuraStatus
    },
    {
      num: 2,
      title: "IBAN Bancario",
      description: "Inserisci l'IBAN del conto corrente della palestra (usato come backup).",
      done: !!gym?.iban
    },
    {
      num: 3,
      title: "Stripe Connect Express",
      description: "Collega il conto bancario tramite Stripe per ricevere i pagamenti automatici.",
      done: gym?.stripe_onboarding_complete
    }
  ];

  return (
    <div className="space-y-6">
      {/* Progress Steps */}
      <Card className="bg-black/40 border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#E8FF00]" />
            Configurazione Pagamenti
          </CardTitle>
          <p className="text-sm text-gray-400">Completa tutti i passaggi per ricevere i pagamenti automatici</p>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {steps.map((step) => (
              <div key={step.num} className={`flex items-center gap-4 p-3 rounded-lg border ${step.done ? 'border-green-500/30 bg-green-900/10' : 'border-white/10'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 ${step.done ? 'bg-green-500 text-black' : 'bg-white/10 text-gray-400'}`}>
                  {step.done ? <CheckCircle className="w-4 h-4" /> : step.num}
                </div>
                <div className="flex-1">
                  <p className={`font-medium text-sm ${step.done ? 'text-green-400' : 'text-white'}`}>{step.title}</p>
                  <p className="text-xs text-gray-500">{step.description}</p>
                </div>
                {step.status && (
                  <Badge className={`text-xs ${step.status.className}`}>
                    {step.status.icon}
                    <span className="ml-1">{step.status.label}</span>
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {success && (
        <Alert className="bg-green-900/20 border-green-500/30">
          <CheckCircle className="h-4 w-4 text-green-400" />
          <AlertDescription className="text-green-300">{success}</AlertDescription>
        </Alert>
      )}
      {error && (
        <Alert className="bg-red-900/20 border-red-500/30">
          <AlertCircle className="h-4 w-4 text-red-400" />
          <AlertDescription className="text-red-300">{error}</AlertDescription>
        </Alert>
      )}

      {/* Step 1: Visura */}
      <Card className="bg-black/40 border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#E8FF00]" />
            1. Visura Camerale
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {gym?.visura_url ? (
            <div className="space-y-3">
              <div className={`flex items-center gap-3 p-3 rounded-lg border ${visuraStatus?.className}`}>
                {visuraStatus?.icon}
                <div>
                  <p className="text-sm font-medium">Documento caricato</p>
                  <p className="text-xs opacity-70">Stato: {visuraStatus?.label}</p>
                </div>
                <a
                  href={gym.visura_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-auto"
                >
                  <Button variant="outline" size="sm" className="border-white/20 text-white hover:bg-white/10 text-xs">
                    <ExternalLink className="w-3 h-3 mr-1" />
                    Visualizza
                  </Button>
                </a>
              </div>
              {gym.visura_status === "rejected" && (
                <label className="flex items-center gap-2 cursor-pointer">
                  <Button variant="outline" size="sm" className="border-[#E8FF00]/30 text-[#E8FF00]" asChild>
                    <span>
                      <Upload className="w-4 h-4 mr-1" />
                      Ricarica documento
                    </span>
                  </Button>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    className="hidden"
                    onChange={(e) => e.target.files[0] && handleVisuraUpload(e.target.files[0])}
                    disabled={uploading}
                  />
                </label>
              )}
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center border-2 border-dashed border-white/20 rounded-lg p-8 cursor-pointer hover:border-[#E8FF00]/40 transition-colors">
              <Upload className="w-10 h-10 text-gray-500 mb-3" />
              <p className="text-sm text-gray-400 text-center">
                {uploading ? "Caricamento in corso..." : "Clicca per caricare la visura camerale"}
              </p>
              <p className="text-xs text-gray-600 mt-1">PDF, JPG, PNG — max 10MB</p>
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                className="hidden"
                onChange={(e) => e.target.files[0] && handleVisuraUpload(e.target.files[0])}
                disabled={uploading}
              />
            </label>
          )}
        </CardContent>
      </Card>

      {/* Step 2: IBAN */}
      <Card className="bg-black/40 border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Building2 className="w-5 h-5 text-[#E8FF00]" />
            2. IBAN Bancario
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-400">
            Inserisci l'IBAN del conto corrente intestato alla palestra. Verrà usato come riferimento di backup.
          </p>
          <div className="flex gap-3">
            <div className="flex-1">
              <Label className="text-gray-300">IBAN</Label>
              <Input
                value={iban}
                onChange={(e) => setIban(e.target.value.toUpperCase())}
                placeholder="IT60 X054 2811 1010 0000 0123 456"
                className="bg-white/5 border-white/20 text-white placeholder:text-gray-600 font-mono"
              />
            </div>
            <div className="flex items-end">
              <Button
                onClick={handleSaveIban}
                disabled={savingIban || !iban}
                className="bg-[#E8FF00] text-black hover:bg-[#E8FF00]/90"
              >
                {savingIban ? "Salvo..." : "Salva"}
              </Button>
            </div>
          </div>
          {gym?.iban && (
            <p className="text-xs text-green-400 flex items-center gap-1">
              <CheckCircle className="w-3 h-3" />
              IBAN salvato: {gym.iban}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Step 3: Stripe Connect */}
      <Card className="bg-black/40 border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-[#E8FF00]" />
            3. Stripe Connect Express
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {gym?.stripe_onboarding_complete ? (
            <div className="flex items-center gap-3 p-4 rounded-lg bg-green-900/20 border border-green-500/30">
              <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0" />
              <div>
                <p className="text-green-400 font-medium">Account Stripe collegato!</p>
                <p className="text-xs text-green-500 mt-0.5">ID: {gym.stripe_account_id}</p>
                <p className="text-xs text-green-500">I pagamenti verranno trasferiti automaticamente ogni mese.</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                <p className="text-sm text-gray-300 mb-2">
                  Stripe Connect Express ti permette di ricevere i pagamenti direttamente sul tuo conto bancario in modo sicuro e automatico.
                </p>
                <ul className="text-xs text-gray-500 space-y-1">
                  <li>✓ Configurazione in 5 minuti</li>
                  <li>✓ Trasferimenti automatici mensili</li>
                  <li>✓ Dashboard Stripe dedicata</li>
                  <li>✓ Sicurezza bancaria garantita</li>
                </ul>
              </div>

              {gym?.stripe_onboarding_url ? (
                <a href={gym.stripe_onboarding_url} target="_blank" rel="noopener noreferrer">
                  <Button className="w-full bg-[#635BFF] hover:bg-[#635BFF]/90 text-white">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Completa Registrazione Stripe
                  </Button>
                </a>
              ) : (
                <Button
                  onClick={handleStripeOnboarding}
                  className="w-full bg-[#635BFF] hover:bg-[#635BFF]/90 text-white"
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  Avvia Configurazione Stripe Connect
                </Button>
              )}
              <p className="text-xs text-gray-600 text-center">
                Stripe Connect sarà attivato a breve dall'amministratore
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}