import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { QrCode, CheckCircle, XCircle, Scan } from "lucide-react";
import { motion } from "framer-motion";

export default function QRScanner() {
  const navigate = useNavigate();
  const [qrCode, setQrCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleScan = async () => {
    if (!qrCode.trim()) return;

    setLoading(true);
    setResult(null);

    try {
      const user = await base44.auth.me();
      
      // Trova la palestra con questo QR code
      const gyms = await base44.entities.Gym.filter({ qr_code: qrCode.trim() });
      
      if (gyms.length === 0) {
        setResult({
          success: false,
          message: "QR Code non valido",
          gymName: null
        });
        setLoading(false);
        return;
      }

      const gym = gyms[0];

      // Verifica se l'utente ha un abbonamento attivo
      const hasActiveSubscription = user.subscription_type && user.subscription_type !== "none";
      
      if (!hasActiveSubscription) {
        // Registra accesso negato
        await base44.entities.GymAccess.create({
          user_email: user.email,
          gym_id: gym.id,
          gym_name: gym.name,
          access_date: new Date().toISOString(),
          subscription_type: user.subscription_type || "none",
          access_granted: false
        });

        setResult({
          success: false,
          message: "Abbonamento non attivo",
          gymName: gym.name,
          userName: user.full_name
        });
        setLoading(false);
        return;
      }

      // Verifica se la palestra è disponibile per il tipo di abbonamento
      const subscriptionKey = `available_for_${user.subscription_type}`;
      if (!gym[subscriptionKey]) {
        await base44.entities.GymAccess.create({
          user_email: user.email,
          gym_id: gym.id,
          gym_name: gym.name,
          access_date: new Date().toISOString(),
          subscription_type: user.subscription_type,
          access_granted: false
        });

        setResult({
          success: false,
          message: `Palestra non disponibile per abbonamento ${user.subscription_type.toUpperCase()}`,
          gymName: gym.name,
          userName: user.full_name
        });
        setLoading(false);
        return;
      }

      // Accesso concesso
      await base44.entities.GymAccess.create({
        user_email: user.email,
        gym_id: gym.id,
        gym_name: gym.name,
        access_date: new Date().toISOString(),
        subscription_type: user.subscription_type,
        access_granted: true
      });

      setResult({
        success: true,
        message: "Accesso consentito",
        gymName: gym.name,
        userName: user.full_name,
        subscriptionType: user.subscription_type
      });

    } catch (error) {
      setResult({
        success: false,
        message: "Errore durante la verifica",
        gymName: null
      });
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <QrCode className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Scanner QR</h1>
            <p className="text-gray-600">Scansiona il QR code della palestra per entrare</p>
          </div>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scan className="w-5 h-5" />
                Inserisci il Codice
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="qr-code">Codice QR della Palestra</Label>
                <Input
                  id="qr-code"
                  placeholder="Es: GYM-ABC-123"
                  value={qrCode}
                  onChange={(e) => setQrCode(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleScan();
                    }
                  }}
                />
              </div>
              <Button
                onClick={handleScan}
                disabled={!qrCode.trim() || loading}
                className="w-full bg-gradient-to-r from-blue-600 to-orange-600 hover:from-blue-700 hover:to-orange-700"
                size="lg"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Verifica in corso...
                  </>
                ) : (
                  <>
                    <Scan className="w-5 h-5 mr-2" />
                    Verifica Accesso
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Result Display */}
          {result && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <Card className={`border-4 ${result.success ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'}`}>
                <CardContent className="pt-6">
                  <div className="text-center">
                    {result.success ? (
                      <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                        <CheckCircle className="w-12 h-12 text-white" />
                      </div>
                    ) : (
                      <div className="w-24 h-24 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                        <XCircle className="w-12 h-12 text-white" />
                      </div>
                    )}
                    <h2 className={`text-3xl font-bold mb-2 ${result.success ? 'text-green-800' : 'text-red-800'}`}>
                      {result.message}
                    </h2>
                    {result.userName && (
                      <p className="text-xl text-gray-700 mb-2">
                        <strong>{result.userName}</strong>
                      </p>
                    )}
                    {result.gymName && (
                      <p className="text-lg text-gray-600 mb-2">
                        {result.gymName}
                      </p>
                    )}
                    {result.subscriptionType && (
                      <div className="mt-4">
                        <span className="inline-block bg-gradient-to-r from-blue-600 to-orange-600 text-white px-4 py-2 rounded-full font-semibold">
                          Abbonamento {result.subscriptionType.toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {!result && !loading && (
            <Alert>
              <AlertDescription>
                Inserisci il codice QR della palestra nel campo sopra e clicca su "Verifica Accesso" per controllare l'accesso.
              </AlertDescription>
            </Alert>
          )}
        </motion.div>
      </div>
    </div>
  );
}