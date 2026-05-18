import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertCircle, ArrowLeft, Dumbbell, Check } from "lucide-react";
import { motion } from "framer-motion";

const subscriptionDetails = {
  gold: {
    name: "Gold",
    price: 40,
    period: "mese",
    color: "from-yellow-400 to-yellow-600",
    benefits: [
      "Accesso a palestre Gold",
      "Tracking allenamenti e progressi",
      "AI Workout Planner",
      "Community e badge",
      "Eventi esclusivi",
      "+ €2,99 costo di servizio per accesso"
    ]
  },
  annuale_gold: {
    name: "Gold Annuale",
    price: 365,
    period: "anno",
    priceNote: "= 1€ al giorno",
    color: "from-yellow-400 to-yellow-600",
    benefits: [
      "Accesso a tutte le palestre Gold",
      "Ingressi illimitati H24",
      "AI Workout Planner",
      "Tracking allenamenti e progressi",
      "Community e badge",
      "+ €2,99 costo di servizio per accesso"
    ]
  },
  annuale_plus: {
    name: "Plus Annuale",
    price: 650,
    period: "anno",
    priceNote: "= 1,78€ al giorno",
    color: "from-[#E8FF00] to-yellow-400",
    benefits: [
      "Ingressi illimitati H24",
      "Accesso a tutte le palestre convenzionate",
      "Palestre Gold + Platinum",
      "AI Workout Planner",
      "Community e badge",
      "+ €3,99 costo di servizio per accesso"
    ]
  },
  plus: {
    name: "Plus",
    price: 70,
    period: "mese",
    color: "from-[#E8FF00] to-yellow-400",
    benefits: [
      "Accesso a palestre Gold e Platinum",
      "Tracking allenamenti e progressi",
      "AI Workout Planner",
      "Community e badge",
      "Eventi esclusivi",
      "+ €3,99 costo di servizio per accesso"
    ]
  },
  premium: {
    name: "Platinum",
    price: 99.99,
    period: "mese",
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
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await base44.auth.me();
      setUser(userData);

      const urlParams = new URLSearchParams(window.location.search);
      const planType = urlParams.get("plan");
      
      if (planType && subscriptionDetails[planType]) {
        setSelectedPlan(subscriptionDetails[planType]);
      } else {
        navigate(createPageUrl("Home"));
      }
    } catch (error) {
      base44.auth.redirectToLogin(window.location.href);
    }
  };

  const handleConfirmSubscription = async () => {
    setProcessing(true);
    setError(null);

    try {
      if (!user.id_document_url || !user.medical_certificate_url) {
        setError("Devi caricare tutti i documenti richiesti prima di attivare l'abbonamento");
        setProcessing(false);
        return;
      }

      const startDate = new Date();
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 1);

      await base44.auth.updateMe({
        subscription_type: Object.keys(subscriptionDetails).find(
          key => subscriptionDetails[key].name === selectedPlan.name
        ),
        subscription_start_date: startDate.toISOString().split('T')[0],
        subscription_end_date: endDate.toISOString().split('T')[0]
      });

      navigate(createPageUrl("Profile"));
    } catch (error) {
      setError("Errore durante l'attivazione dell'abbonamento. Riprova.");
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
                <div className="flex justify-between items-center mb-1">
                  <span className="text-gray-600">Totale {selectedPlan.period === "anno" ? "annuale" : "mensile"}:</span>
                  <span className="text-2xl font-bold">€{selectedPlan.price}</span>
                </div>
                {selectedPlan.priceNote && (
                  <p className="text-sm text-green-600 font-medium mb-2">{selectedPlan.priceNote}</p>
                )}
                <p className="text-sm text-gray-500">
                  L'abbonamento si rinnova automaticamente ogni {selectedPlan.period === "anno" ? "anno" : "mese"}
                </p>
              </div>

              <Button
                className={`w-full ${documentsComplete ? 'bg-gradient-to-r from-blue-600 to-orange-600 hover:from-blue-700 hover:to-orange-700' : ''}`}
                size="lg"
                onClick={handleConfirmSubscription}
                disabled={!documentsComplete || processing}
              >
                {processing ? "Elaborazione..." : "Conferma e Attiva Abbonamento"}
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}