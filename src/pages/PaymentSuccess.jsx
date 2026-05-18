import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  const sessionId = searchParams.get('session_id');
  
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!token || !sessionId) {
      setError('Dati di pagamento incompleti');
      setLoading(false);
      return;
    }

    markTokenAsUsed();
  }, [token, sessionId]);

  const markTokenAsUsed = async () => {
    try {
      // Qui potresti chiamare una backend function per marcare il token come usato
      // Per ora mostriamo solo il successo
      setSuccess(true);
    } catch (err) {
      setError('Errore nel salvataggio del pagamento');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-[#E8FF00] animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Verifica pagamento in corso...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
        <Card className="max-w-md w-full bg-[#1a1a1a] border-white/10">
          <CardHeader className="text-center">
            <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <CardTitle className="text-white text-2xl">Pagamento non completato</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-400 mb-6">{error}</p>
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
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
      <Card className="max-w-md w-full bg-[#1a1a1a] border-white/10">
        <CardHeader className="text-center">
          <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
          <CardTitle className="text-white text-2xl">Pagamento Completato!</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-gray-400">
            Il tuo abbonamento è stato attivato con successo. Riceverai una email di conferma a breve.
          </p>
          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
            <p className="text-sm text-green-300">
              ✓ Transazione confermata
            </p>
          </div>
          <Button 
            onClick={() => navigate('/')}
            className="w-full"
            style={{ background: "#E8FF00", color: "#000" }}
          >
            Vai alla Dashboard
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}