import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Mail, CheckCircle, AlertCircle, Loader2, Link as LinkIcon } from "lucide-react";

const PLANS = [
  { value: "gold", label: "Gold - €40/mese" },
  { value: "plus", label: "Plus - €70/mese" },
  { value: "annuale_gold", label: "Gold Annuale - €480/anno" },
  { value: "annuale_plus", label: "Plus Annuale - €840/anno" }
];

export default function SendPaymentLinks() {
  const [email, setEmail] = useState("");
  const [planType, setPlanType] = useState("");
  const [customMessage, setCustomMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);
  const [generatedLink, setGeneratedLink] = useState(null);

  const handleSend = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    setGeneratedLink(null);

    try {
      const response = await base44.functions.invoke('sendPaymentLink', {
        email,
        plan_type: planType,
        custom_message: customMessage
      });

      if (response.data?.success) {
        setSuccess('Email inviata con successo!');
        setGeneratedLink(response.data.payment_link);
        setEmail("");
        setPlanType("");
        setCustomMessage("");
      } else {
        setError(response.data?.error || 'Errore nell\'invio');
      }
    } catch (err) {
      setError('Errore di connessione. Riprova.');
    } finally {
      setLoading(false);
    }
  };

  const copyLink = () => {
    if (generatedLink) {
      navigator.clipboard.writeText(generatedLink);
      setSuccess('Link copiato negli appunti!');
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] p-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Invia Link di Pagamento</h1>
          <p className="text-gray-400">Genera e invia link di pagamento personalizzati via email</p>
        </div>

        {success && (
          <Alert className="mb-6 bg-green-500/10 border-green-500/30">
            <CheckCircle className="h-4 w-4 text-green-400" />
            <AlertDescription className="text-green-300">{success}</AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Card className="bg-[#1a1a1a] border-white/10 mb-6">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Nuovo Link di Pagamento
            </CardTitle>
            <CardDescription className="text-gray-400">
              Compila i campi per inviare un link di pagamento personalizzato
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSend} className="space-y-4">
              <div>
                <Label htmlFor="email" className="text-gray-300">Email del cliente</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="cliente@email.com"
                  required
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>

              <div>
                <Label htmlFor="plan" className="text-gray-300">Piano di abbonamento</Label>
                <Select value={planType} onValueChange={setPlanType} required>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white">
                    <SelectValue placeholder="Seleziona piano" />
                  </SelectTrigger>
                  <SelectContent>
                    {PLANS.map((plan) => (
                      <SelectItem key={plan.value} value={plan.value}>
                        {plan.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="message" className="text-gray-300">Messaggio personalizzato (opzionale)</Label>
                <Textarea
                  id="message"
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  placeholder="Aggiungi un messaggio personale..."
                  className="bg-white/5 border-white/10 text-white min-h-[100px]"
                />
              </div>

              <Button
                type="submit"
                disabled={loading || !email || !planType}
                className="w-full"
                style={{ background: "#E8FF00", color: "#000" }}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Invio in corso...
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4 mr-2" />
                    Invia Link di Pagamento
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {generatedLink && (
          <Card className="bg-[#1a1a1a] border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <LinkIcon className="w-5 h-5" />
                Link Generato
              </CardTitle>
              <CardDescription className="text-gray-400">
                Copia il link per condividerlo manualmente
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                <code className="text-xs text-gray-300 break-all">{generatedLink}</code>
              </div>
              <Button
                onClick={copyLink}
                variant="outline"
                className="w-full border-white/20 text-white hover:bg-white/5"
              >
                Copia Link
              </Button>
              <p className="text-xs text-gray-500 text-center">
                Il link scadrà tra 7 giorni dalla generazione
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}