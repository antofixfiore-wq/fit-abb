import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, AlertCircle, Loader2, CreditCard, Shield, Calendar } from "lucide-react";
import { motion } from "framer-motion";

const PLANS = {
  gold: { 
    name: 'Gold', 
    price: '€40/mese', 
    features: ['Accesso illimitato a palestre Gold', 'Check-in illimitati', 'Supporto base'],
    color: 'from-yellow-400 to-yellow-600',
    badge: 'bg-yellow-500'
  },
  plus: { 
    name: 'Plus', 
    price: '€70/mese', 
    features: ['Accesso a palestre Gold + Plus', 'Check-in illimitati', 'Supporto prioritario', 'Contenuti premium'],
    color: 'from-[#E8FF00] to-yellow-400',
    badge: 'bg-[#E8FF00]'
  },
  annuale_gold: { 
    name: 'Gold Annuale', 
    price: '€480/anno', 
    features: ['Tutti i benefit Gold', 'Risparmio del 20%', 'Pagamento unico'],
    color: 'from-yellow-400 to-yellow-600',
    badge: 'bg-yellow-500'
  },
  annuale_plus: { 
    name: 'Plus Annuale', 
    price: '€840/anno', 
    features: ['Tutti i benefit Plus', 'Risparmio del 20%', 'Pagamento unico'],
    color: 'from-[#E8FF00] to-yellow-400',
    badge: 'bg-[#E8FF00]'
  }
};

export default function PaymentPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  
  const [loading, setLoading] = useState(true);
  const [validating, setValidating] = useState(false);
  const [error, setError] = useState(null);
  const [tokenData, setTokenData] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);

  useEffect(() => {
    if (!token) {
      setError('Link di pagamento non valido. Contatta il supporto.');
      setLoading(false);
      return;
    }

    validateToken();
  }, [token]);

  const validateToken = async () => {
    try {
      setValidating(true);
      const response = await base44.functions.invoke('createPaymentSession', {});
      
      if (response.data?.error) {
        setError(response.data.error);
      } else {
        // Token valido, mostra i piani
        setTokenData({ email: 'utente' }); // Placeholder
      }
    } catch (err) {
      setError('Errore di connessione. Riprova più tardi.');
    } finally {
      setValidating(false);
      setLoading(false);
    }
  };

  const handleCheckout = async (planType) => {
    setSelectedPlan(planType);
    setError(null);

    try {
      const response = await base44.functions.invoke('createPaymentSession', {
        action: 'create_checkout',
        plan_type: planType
      });

      if (response.data?.checkout_url) {
        // Controlla se siamo in iframe
        if (window !== window.top) {
          setError('Il pagamento deve essere completato in una nuova finestra. Clicca qui sotto per aprire il checkout.');
          // Mostra bottone per aprire in nuova finestra
          window.open(response.data.checkout_url, '_blank');
        } else {
          window.location.href = response.data.checkout_url;
        }
      } else {
        setError(response.data?.error || 'Errore nella creazione del pagamento');
      }
    } catch (err) {
      setError('Errore durante il pagamento. Riprova.');
    } finally {
      setSelectedPlan(null);
    }
  };

  if (loading || validating) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-[#E8FF00] animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Verifica del link in corso...</p>
        </div>
      </div>
    );
  }

  if (error && !tokenData) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
        <Card className="max-w-md w-full bg-[#1a1a1a] border-white/10">
          <CardHeader className="text-center">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
            <CardTitle className="text-white text-xl">Link non valido</CardTitle>
            <CardDescription className="text-gray-400">{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => navigate('/')}
              className="w-full"
              style={{ background: "#E8FF00", color: "#000" }}
            >
              Torna alla home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] py-12 px-4">
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-8 text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <img
            src="https://media.base44.com/images/public/6900e246d71384c10b97f155/49b0b5056_6cb7a69af_generated_image.png"
            alt="Fit ABB"
            className="w-12 h-12 object-contain"
          />
          <h1 className="text-3xl font-black text-white">Fit ABB</h1>
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Completa il tuo abbonamento</h2>
        <p className="text-gray-400">Scegli il piano perfetto per le tue esigenze</p>
      </div>

      {/* Alert sicurezza */}
      <div className="max-w-4xl mx-auto mb-8">
        <Alert className="bg-green-500/10 border-green-500/30">
          <Shield className="h-4 w-4 text-green-400" />
          <AlertDescription className="text-green-300 text-sm">
            Link di pagamento sicuro e personale. Completamento richiesto entro 7 giorni.
          </AlertDescription>
        </Alert>
      </div>

      {/* Piani */}
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-6">
        {Object.entries(PLANS).map(([planType, plan]) => (
          <motion.div
            key={planType}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className={`bg-[#1a1a1a] border-white/10 hover:border-[#E8FF00]/40 transition-all ${
              planType.includes('annuale') ? 'md:col-span-1' : ''
            }`}>
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <CardTitle className="text-white text-xl">{plan.name}</CardTitle>
                  <span className={`text-xs text-white px-2 py-1 rounded-full ${plan.badge}`}>
                    {planType.includes('annuale') ? 'ANNUALE' : 'MONTHLY'}
                  </span>
                </div>
                <CardDescription className="text-3xl font-bold text-white">
                  {plan.price}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 mb-6">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-gray-300">
                      <CheckCircle className="w-4 h-4 text-[#E8FF00] mt-0.5 shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                
                {error && selectedPlan === planType && (
                  <Alert variant="destructive" className="mb-4">
                    <AlertDescription className="text-xs">{error}</AlertDescription>
                  </Alert>
                )}

                <Button
                  onClick={() => handleCheckout(planType)}
                  disabled={selectedPlan === planType && !error}
                  className="w-full h-12 font-bold"
                  style={{ 
                    background: planType.includes('plus') ? '#E8FF00' : '#fbbf24',
                    color: '#000'
                  }}
                >
                  {selectedPlan === planType ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Apertura checkout...
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4 mr-2" />
                      Scegli {plan.name}
                    </>
                  )}
                </Button>

                <p className="text-xs text-gray-500 text-center mt-3">
                  <Calendar className="w-3 h-3 inline mr-1" />
                  Cancellazione gratuita in qualsiasi momento
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Footer */}
      <div className="max-w-4xl mx-auto mt-12 text-center text-gray-500 text-sm">
        <p>Pagamento sicuro gestito da Stripe®</p>
        <p className="mt-2">
          Hai bisogno di aiuto? <a href="mailto:supporto@fit-abb.com" className="text-[#E8FF00] hover:underline">supporto@fit-abb.com</a>
        </p>
      </div>
    </div>
  );
}