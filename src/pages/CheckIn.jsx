import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import CheckInCard from '@/components/checkin/CheckInCard';
import { toast } from 'sonner';

export default function CheckIn() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const gymId = searchParams.get('gym_id');

  const [user, setUser] = useState(null);
  const [gym, setGym] = useState(null);
  const [accessPass, setAccessPass] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Carica dati iniziali
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const userData = await base44.auth.me();
        setUser(userData);

        if (gymId) {
          const gymData = await base44.asServiceRole.entities.Gym.get(gymId);
          setGym(gymData);
        }
      } catch (err) {
        console.error('Error loading data:', err);
        setError('Errore nel caricamento dei dati');
      }
    };

    loadInitialData();
  }, [gymId]);

  // Genera AccessPass
  const generateAccessPass = async () => {
    if (!gymId) {
      setError('ID palestra non valido');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await base44.functions.invoke('generateAccessPass', {
        gym_id: gymId
      });

      if (response.data.error) {
        setError(response.data.error);
        toast.error(response.data.error);
        return;
      }

      setAccessPass(response.data);
      toast.success('QR e codice generati con successo!');
    } catch (err) {
      console.error('Error generating access pass:', err);
      const errorMsg = err.response?.data?.error || 'Errore nella generazione del codice';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  // Se non c'è ancora il pass, mostra bottone per generare
  if (!accessPass) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-4">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <Button
              variant="ghost"
              onClick={() => navigate('/Gyms')}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Indietro
            </Button>
          </div>

          {/* Card */}
          <Card className="p-8">
            <div className="space-y-6 text-center">
              <h1 className="text-3xl font-bold text-gray-900">Allenati</h1>
              {gym && (
                <div className="space-y-2">
                  <p className="text-lg font-semibold text-gray-800">{gym.name}</p>
                  {gym.photos?.[0] && (
                    <img
                      src={gym.photos[0]}
                      alt={gym.name}
                      className="w-32 h-32 rounded-lg object-cover mx-auto"
                    />
                  )}
                </div>
              )}

              {user && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Accesso come</p>
                  <p className="font-semibold text-gray-900">{user.full_name}</p>
                  <p className="text-sm text-gray-600 mt-2">
                    Piano: <span className={`font-semibold ${(!user.subscription_type || user.subscription_type === 'none') ? 'text-red-500' : 'text-green-600'}`}>
                      {user.subscription_type && user.subscription_type !== 'none' ? user.subscription_type.toUpperCase() : 'Non attivo'}
                    </span>
                  </p>
                  {user.subscription_end_date && user.subscription_type && user.subscription_type !== 'none' && (
                    <p className="text-xs text-gray-500 mt-1">
                      Valido fino al: {new Date(user.subscription_end_date).toLocaleDateString('it-IT')}
                      {new Date(user.subscription_end_date) < new Date() && (
                        <span className="text-red-500 ml-1">(SCADUTO)</span>
                      )}
                    </p>
                  )}
                </div>
              )}

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                  <div className="text-left">
                    <p className="font-semibold text-red-900">Accesso non consentito</p>
                    <p className="text-sm text-red-800 mt-1">{error}</p>
                  </div>
                </div>
              )}

              {!error && (
                <Button
                  onClick={generateAccessPass}
                  disabled={isLoading || !user?.subscription_type || user.subscription_type === 'none'}
                  size="lg"
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                >
                  {isLoading ? 'Generazione in corso...' : 'Genera QR e Codice'}
                </Button>
              )}

              {!user?.subscription_type || user.subscription_type === 'none' && !error && (
                <p className="text-sm text-orange-600">
                  ⚠️ Devi attivare un abbonamento per accedere
                </p>
              )}
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // Se il pass è generato, mostra CheckInCard
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/Gyms')}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Indietro
          </Button>
        </div>

        {/* CheckIn Card */}
        <CheckInCard
          accessPass={accessPass}
          onRegenerate={() => {
            setAccessPass(null);
            setError(null);
          }}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}