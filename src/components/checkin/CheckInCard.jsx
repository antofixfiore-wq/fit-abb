import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Copy, RotateCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function CheckInCard({ accessPass, onRegenerate, isLoading }) {
  const [timeLeft, setTimeLeft] = useState(null);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    if (!accessPass?.expires_at) return;

    const calculateTimeLeft = () => {
      const now = new Date();
      const expiry = new Date(accessPass.expires_at);
      const diff = expiry - now;

      if (diff <= 0) {
        setIsExpired(true);
        setTimeLeft(null);
        return;
      }

      const minutes = Math.floor(diff / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      setTimeLeft({ minutes, seconds });
      setIsExpired(false);
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(interval);
  }, [accessPass?.expires_at]);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Codice copiato!');
  };

  if (isExpired) {
    return (
      <Card className="bg-red-50 border-red-200">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
            <div>
              <h3 className="font-semibold text-red-900 text-lg">QR Scaduto</h3>
              <p className="text-red-700 text-sm mt-1">
                Genera un nuovo codice per accedere
              </p>
            </div>
            <Button
              onClick={onRegenerate}
              disabled={isLoading}
              className="w-full bg-red-600 hover:bg-red-700"
            >
              <RotateCw className="w-4 h-4 mr-2" />
              Genera nuovo QR
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-green-50 to-blue-50 border-green-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-green-900">✅ Accesso Valido</CardTitle>
            <p className="text-sm text-green-700 mt-1">Sei autorizzato a questa palestra</p>
          </div>
          {timeLeft && (
            <Badge variant="outline" className="bg-white text-green-700 border-green-300">
              ⏱️ {timeLeft.minutes}:{timeLeft.seconds.toString().padStart(2, '0')}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Info cliente */}
        <div className="bg-white rounded-lg p-4">
          <div className="flex items-start gap-3">
            {accessPass.client_photo_url && (
              <img
                src={accessPass.client_photo_url}
                alt={accessPass.client_name}
                className="w-12 h-12 rounded-full object-cover"
              />
            )}
            <div className="flex-1">
              <p className="font-semibold text-gray-900">{accessPass.client_name}</p>
              <p className="text-sm text-gray-600">Piano: {accessPass.subscription_type.toUpperCase()}</p>
              <p className="text-sm text-gray-600">{accessPass.gym_name}</p>
            </div>
          </div>
        </div>

        {/* QR Code - solo display simulato per MVP */}
        <div className="bg-white rounded-lg p-6 flex flex-col items-center space-y-3">
          <div className="bg-gray-100 w-40 h-40 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
            <div className="text-center">
              <p className="text-xs text-gray-500 mb-2">QR CODE</p>
              <p className="text-xs text-gray-400 font-mono">{accessPass.token.substring(0, 8)}</p>
            </div>
          </div>
          <p className="text-xs text-gray-600">Mostra questo QR alla reception</p>
        </div>

        {/* Codice numerico */}
        <div className="bg-white rounded-lg p-4">
          <p className="text-xs text-gray-600 mb-2">CODICE TEMPORANEO (alternativa QR)</p>
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <p className="text-2xl font-mono font-bold text-blue-600 tracking-widest">
                {accessPass.numeric_code}
              </p>
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => copyToClipboard(accessPass.numeric_code)}
              className="shrink-0"
            >
              <Copy className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-xs text-gray-600 mt-2">
            Comunica questo codice alla reception se non puoi mostrare il QR
          </p>
        </div>

        {/* Messaggio finale */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-sm text-blue-900 font-medium">
            📱 Mostra il QR oppure comunica il codice a 6 cifre alla reception
          </p>
        </div>

        {/* Pulsante rigenerare */}
        <Button
          variant="outline"
          className="w-full"
          onClick={onRegenerate}
          disabled={isLoading}
        >
          <RotateCw className="w-4 h-4 mr-2" />
          Rigenera codice
        </Button>
      </CardContent>
    </Card>
  );
}