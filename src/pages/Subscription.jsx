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

      const response = await base44.functions.invoke('createCheckoutSession', {
        plan_type: planType,
        success_url: `${window.location.origin}/Subscription?plan=${planType}&success=true`,
        cancel_url: `${window.location.origin}/Subscription?plan=${planType}`,
      });

      if (response.data?.url) {
        window.location.href = response.data.url;
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
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto">
        <Button
          variant="outline"
          onClick={() => navigate(createPageUrl("Home"))}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Torna Indietro
        </Button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Conferma Abbonamento</h1>
          <p className="text-gray-600 mb-8">Rivedi i dettagli prima di procedere</p>

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Card className="mb-6">
            <div className={`h-2 bg-gradient-to-r ${selectedPlan.color}`}></div>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${selectedPlan.color} flex items-center justify-center`}>
                    <Dumbbell className="w-6 h-6 text-white" />
                  </div>
                  Piano {selectedPlan.name}
                </CardTitle>
                <div>
                  <div className="text-3xl font-bold">€{selectedPlan.price}</div>
                  <div className="text-sm text-gray-500 text-right">/mese</div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-semibold mb-3 text-lg">Cosa include:</h3>
                <ul className="space-y-3">
                  {selectedPlan.benefits.map((benefit, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <div className={`w-5 h-5 rounded-full bg-gradient-to-br ${selectedPlan.color} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                        <Check className="w-3 h-3 text-white" />
                      </div>
                      <span className="text-gray-700">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="border-t pt-6">
                <h3 className="font-semibold mb-3 text-lg">Stato Documenti</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                    <span>Documento d'identità</span>
                    {user.id_document_url ? (
                      <Badge className="bg-green-100 text-green-800">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Caricato
                      </Badge>
                    ) : (
                      <Badge variant="destructive">Mancante</Badge>
                    )}
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                    <span>Certificato medico</span>
                    {user.medical_certificate_url ? (
                      <Badge className="bg-green-100 text-green-800">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Caricato
                      </Badge>
                    ) : (
                      <Badge variant="destructive">Mancante</Badge>
                    )}
                  </div>
                </div>
              </div>

              {!documentsComplete && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Devi caricare tutti i documenti richiesti prima di attivare l'abbonamento.
                    <Button
                      variant="link"
                      className="p-0 h-auto ml-1"
                      onClick={() => navigate(createPageUrl("Profile"))}
                    >
                      Vai al profilo
                    </Button>
                  </AlertDescription>
                </Alert>
              )}

              <div className="border-t pt-6">
                <h3 className="font-semibold mb-4 text-lg">Riepilogo costi</h3>
                <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Abbonamento {selectedPlan.period === "anno" ? "annuale" : "mensile"}</span>
                    <div className="text-right">
                      <span className="font-bold text-gray-900">€{selectedPlan.price}</span>
                      <span className="text-xs text-gray-400 ml-1">/{selectedPlan.period}</span>
                    </div>
                  </div>
                  {selectedPlan.priceNote && (
                    <p className="text-sm text-green-600 font-medium">{selectedPlan.priceNote}</p>
                  )}
                  {selectedPlan.serviceFee && (
                    <>
                      <div className="border-t border-gray-200 pt-3 flex justify-between items-start">
                        <div>
                          <span className="text-gray-600 text-sm">Costo di servizio per accesso</span>
                          <p className="text-xs text-gray-400 mt-0.5">Addebitato ad ogni ingresso in palestra</p>
                        </div>
                        <span className="font-semibold text-gray-900">€{selectedPlan.serviceFee.toFixed(2)}</span>
                      </div>
                      <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-xs text-blue-700">
                        💡 Il costo di servizio è separato dall'abbonamento e viene applicato solo quando accedi fisicamente a una palestra.
                      </div>
                    </>
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-3">
                  L'abbonamento si rinnova automaticamente ogni {selectedPlan.period === "anno" ? "anno" : "mese"}. Puoi disdire in qualsiasi momento.
                </p>
              </div>

              <Button
                className={`w-full ${documentsComplete ? 'bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-black font-bold' : ''}`}
                size="lg"
                onClick={handleConfirmSubscription}
                disabled={!documentsComplete || processing}
              >
                {processing ? (
                  "Reindirizzamento al pagamento..."
                ) : (
                  <span className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    Procedi al Pagamento
                  </span>
                )}
              </Button>
              <p className="text-xs text-center text-gray-400">
                Pagamento sicuro tramite Stripe · SSL encrypted
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}