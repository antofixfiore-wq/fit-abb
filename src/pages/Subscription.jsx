import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertCircle, ArrowLeft, Dumbbell, Check, CreditCard } from "lucide-react";
import { motion } from "framer-motion";

const subscriptionDetails = {
  gold: {
    name: "Gold",
    price: 40,
    period: "mese",
    serviceFee: 2.99,
    color: "from-yellow-400 to-yellow-600",
    benefits: [
      "Accesso a palestre Gold",
      "Tracking allenamenti e progressi",
      "AI Workout Planner",
      "Community e badge",
      "Eventi esclusivi",
    ]
  },
  annuale_gold: {
    name: "Gold Annuale",
    price: 365,
    period: "anno",
    priceNote: "= 1€ al giorno",
    serviceFee: 2.99,
    color: "from-yellow-400 to-yellow-600",
    benefits: [
      "Accesso a tutte le palestre Gold",
      "Ingressi illimitati H24",
      "AI Workout Planner",
      "Tracking allenamenti e progressi",
      "Community e badge",
    ]
  },
  annuale_plus: {
    name: "Plus Annuale",
    price: 650,
    period: "anno",
    priceNote: "= 1,78€ al giorno",
    serviceFee: 3.99,
    color: "from-[#E8FF00] to-yellow-400",
    benefits: [
      "Ingressi illimitati H24",
      "Accesso a tutte le palestre convenzionate",
      "Palestre Gold + Platinum",
      "AI Workout Planner",
      "Community e badge",
    ]
  },
  plus: {
    name: "Plus",
    price: 70,
    period: "mese",
    serviceFee: 3.99,
    color: "from-[#E8FF00] to-yellow-400",
    benefits: [
      "Accesso a palestre Gold e Platinum",
      "Tracking allenamenti e progressi",
      "AI Workout Planner",
      "Community e badge",
      "Eventi esclusivi",
    ]
  },
  premium: {
    name: "Platinum",
    price: 99.99,
    period: "mese",
    serviceFee: null,
    color: "from-blue-500 to-orange-500",
    benefits: [
      "Accesso a tutte le palestre partner",
      "Tracking avanzato",
      "AI Workout Planner avanzato",
      "Supporto prioritario 24/7",
      "Coaching personalizzato 1-1",
      "Eventi esclusivi VIP"
    ]
  }
};

export default function Subscription() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [planType, setPlanType] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const pt = urlParams.get("plan");

    // Se torna da Stripe con success=true, mostra conferma
    if (urlParams.get("success") === "true") {
      navigate(createPageUrl("Profile"));
      return;
    }

    if (pt && subscriptionDetails[pt]) {
      setPlanType(pt);
      setSelectedPlan(subscriptionDetails[pt]);
    } else {
      navigate(createPageUrl("Home"));
    }

    base44.auth.me().then(setUser).catch(() => {
      base44.auth.redirectToLogin(window.location.href);
    });
  }, []);

  const handleConfirmSubscription = async () => {
    // Blocca se siamo in iframe (preview Base44)
    if (window.self !== window.top) {
      setError("Il pagamento è disponibile solo dall'app pubblicata, non dall'anteprima.");
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      if (!user.id_document_url || !user.medical_certificate_url) {
        setError("Devi caricare tutti i documenti richiesti prima di attivare l'abbonamento");
        setProcessing(false);
        return;
      }

      const response = await base44.functions.invoke('manageSubscription', {
        action: 'create_checkout',
        plan_type: planType,
        success_url: `${window.location.origin}/Subscription?plan=${planType}&success=true`,
        cancel_url: `${window.location.origin}/Subscription?plan=${planType}`,
      });

      if (response.data?.checkout_url) {
        window.location.href = response.data.checkout_url;
      } else {
        setError("Errore nella creazione della sessione di pagamento.");
      }
    } catch (error) {
      console.error(error);
      setError("Errore durante il pagamento. Riprova.");
    }
    setProcessing(false);
  };

  if (!selectedPlan || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const documentsComplete = user.id_document_url && user.medical_certificate_url;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Sticky header mobile */}
      <div className="sticky top-0 z-20 bg-[#0a0a0a]/95 backdrop-blur-xl border-b border-white/10 px-4 py-3 flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(createPageUrl("Home"))}
          className="text-white hover:bg-white/10 shrink-0"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1 min-w-0">
          <h1 className="text-base font-bold text-white truncate">Conferma Abbonamento</h1>
          <p className="text-xs text-gray-400">Rivedi i dettagli prima di procedere</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 pb-32 pt-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="hidden">{/* spacer */}</div>

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Card className="mb-6 bg-[#141414] border-white/10">
            <div className={`h-1.5 bg-gradient-to-r ${selectedPlan.color} rounded-t-lg`}></div>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${selectedPlan.color} flex items-center justify-center shrink-0`}>
                    <Dumbbell className="w-5 h-5 text-white" />
                  </div>
                  <CardTitle className="text-lg text-white">Piano {selectedPlan.name}</CardTitle>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-2xl font-black text-white">€{selectedPlan.price}</div>
                  <div className="text-xs text-gray-500">/{selectedPlan.period}</div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Benefici */}
              <div>
                <h3 className="font-semibold mb-3 text-sm text-gray-300 uppercase tracking-wider">Cosa include</h3>
                <ul className="space-y-2">
                  {selectedPlan.benefits.map((benefit, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full bg-gradient-to-br ${selectedPlan.color} flex items-center justify-center flex-shrink-0`}>
                        <Check className="w-3 h-3 text-white" />
                      </div>
                      <span className="text-gray-200 text-sm">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Documenti */}
              <div className="border-t border-white/10 pt-4">
                <h3 className="font-semibold mb-3 text-sm text-gray-300 uppercase tracking-wider">Documenti richiesti</h3>
                <div className="space-y-2">
                  {[
                    { label: "Documento d'identità", ok: !!user.id_document_url },
                    { label: "Certificato medico", ok: !!user.medical_certificate_url },
                  ].map(({ label, ok }) => (
                    <div key={label} className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                      <span className="text-gray-300 text-sm">{label}</span>
                      {ok ? (
                        <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">✓ OK</Badge>
                      ) : (
                        <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-xs">Mancante</Badge>
                      )}
                    </div>
                  ))}
                </div>
                {!documentsComplete && (
                  <div className="mt-3 p-3 bg-orange-500/10 border border-orange-500/30 rounded-xl">
                    <p className="text-orange-300 text-xs">Carica i documenti nel profilo per procedere.</p>
                    <Button variant="link" className="p-0 h-auto text-[#E8FF00] text-xs mt-1" onClick={() => navigate(createPageUrl("Profile"))}>
                      Vai al profilo →
                    </Button>
                  </div>
                )}
              </div>

              {/* Riepilogo costi */}
              <div className="border-t border-white/10 pt-4">
                <h3 className="font-semibold mb-3 text-sm text-gray-300 uppercase tracking-wider">Riepilogo costi</h3>
                <div className="bg-white/5 rounded-xl p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">Abbonamento {selectedPlan.period === "anno" ? "annuale" : "mensile"}</span>
                    <div className="text-right">
                      <span className="font-black text-white text-lg">€{selectedPlan.price}</span>
                      <span className="text-xs text-gray-500 ml-1">/{selectedPlan.period}</span>
                    </div>
                  </div>
                  {selectedPlan.priceNote && (
                    <p className="text-xs text-[#E8FF00] font-semibold">{selectedPlan.priceNote}</p>
                  )}
                  {selectedPlan.serviceFee && (
                    <div className="border-t border-white/10 pt-3 flex justify-between items-start">
                      <div>
                        <span className="text-gray-400 text-sm">Costo per ingresso</span>
                        <p className="text-xs text-gray-600 mt-0.5">Solo quando accedi in palestra</p>
                      </div>
                      <span className="font-bold text-white text-sm">€{selectedPlan.serviceFee.toFixed(2)}</span>
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-600 mt-2">
                  Rinnovo automatico ogni {selectedPlan.period === "anno" ? "anno" : "mese"}. Disdici quando vuoi.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Sticky bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-[#0a0a0a]/98 backdrop-blur-xl border-t border-white/10 p-4 safe-bottom">
        <Button
          className={`w-full h-14 text-base font-black rounded-2xl ${documentsComplete ? '' : 'opacity-50'}`}
          style={documentsComplete ? { background: "#E8FF00", color: "#000" } : {}}
          onClick={handleConfirmSubscription}
          disabled={!documentsComplete || processing}
        >
          {processing ? (
            <span className="flex items-center gap-2"><div className="w-4 h-4 border-2 border-black/40 border-t-black rounded-full animate-spin" /> Reindirizzamento...</span>
          ) : (
            <span className="flex items-center gap-2"><CreditCard className="w-5 h-5" /> Procedi al Pagamento</span>
          )}
        </Button>
        <p className="text-xs text-center text-gray-600 mt-2">Pagamento sicuro via Stripe · SSL</p>
      </div>
    </div>
  );
}