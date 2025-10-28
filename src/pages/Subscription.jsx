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
  silver: {
    name: "Silver",
    price: 29.99,
    color: "from-gray-400 to-gray-600",
    benefits: [
      "Accesso a palestre selezionate",
      "Orari limitati (6:00-14:00)",
      "Sala pesi e cardio",
      "App mobile"
    ]
  },
  gold: {
    name: "Gold",
    price: 39.99,
    color: "from-yellow-400 to-yellow-600",
    benefits: [
      "Accesso a tutte le palestre partner",
      "Orari estesi (6:00-22:00)",
      "Tutti i corsi di gruppo",
      "Sala pesi, cardio e funzionale",
      "1 sessione PT al mese"
    ]
  },
  premium: {
    name: "Premium",
    price: 99.99,
    color: "from-purple-500 to-pink-600",
    benefits: [
      "Accesso illimitato 24/7",
      "Tutte le palestre premium",
      "Tutti i corsi e classi esclusive",
      "4 sessioni PT al mese",
      "Spa e piscina incluse",
      "Programma nutrizionale personalizzato"
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
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
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Totale mensile:</span>
                  <span className="text-2xl font-bold">€{selectedPlan.price}</span>
                </div>
                <p className="text-sm text-gray-500">
                  L'abbonamento si rinnova automaticamente ogni mese
                </p>
              </div>

              <Button
                className={`w-full ${documentsComplete ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700' : ''}`}
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