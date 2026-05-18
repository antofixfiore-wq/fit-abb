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
      <div className="min-h-screen bg-[#0a0a0a] flex flex-col">
        {/* Sticky header */}
        <div className="sticky top-0 z-20 bg-[#0a0a0a]/95 backdrop-blur-xl border-b border-white/10 px-4 py-3 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/Gyms')} className="text-white hover:bg-white/10">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <span className="text-white font-semibold">Check-in Palestra</span>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center px-4 py-8 gap-6">
          {/* Gym info */}
          {gym && (
            <div className="w-full max-w-sm text-center">
              {gym.photos?.[0] && (
                <img src={gym.photos[0]} alt={gym.name} className="w-24 h-24 rounded-2xl object-cover mx-auto mb-3 border-2 border-white/10" />
              )}
              <h2 className="text-xl font-bold text-white">{gym.name}</h2>
              {gym.city && <p className="text-gray-400 text-sm mt-1">{gym.city}</p>}
            </div>
          )}

          {/* User info */}
          {user && (
            <div className="w-full max-w-sm bg-white/5 border border-white/10 rounded-2xl p-5">
              <p className="text-xs text-gray-500 mb-1 uppercase tracking-wider">Accesso come</p>
              <p className="font-bold text-white text-lg">{user.full_name}</p>
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/10">
                <span className="text-gray-400 text-sm">Piano attivo</span>
                <span className={`font-bold text-sm px-3 py-1 rounded-full ${
                  (!user.subscription_type || user.subscription_type === 'none')
                    ? 'bg-red-500/20 text-red-400'
                    : 'bg-[#E8FF00]/20 text-[#E8FF00]'
                }`}>
                  {user.subscription_type && user.subscription_type !== 'none'
                    ? user.subscription_type.toUpperCase()
                    : 'Non attivo'}
                </span>
              </div>
              {user.subscription_end_date && user.subscription_type && user.subscription_type !== 'none' && (
                <p className="text-xs text-gray-500 mt-2">
                  Valido fino al: {new Date(user.subscription_end_date).toLocaleDateString('it-IT')}
                  {new Date(user.subscription_end_date) < new Date() && (
                    <span className="text-red-400 ml-1 font-semibold">(SCADUTO)</span>
                  )}
                </p>
              )}
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="w-full max-w-sm bg-red-500/10 border border-red-500/30 rounded-2xl p-4 flex gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-red-300 text-sm">Accesso non consentito</p>
                <p className="text-sm text-red-400/80 mt-0.5">{error}</p>
              </div>
            </div>
          )}

          {/* CTA */}
          <div className="w-full max-w-sm space-y-3">
            {!error && (
              <Button
                onClick={generateAccessPass}
                disabled={isLoading || !user?.subscription_type || user.subscription_type === 'none'}
                size="lg"
                className="w-full h-14 text-base font-bold rounded-2xl"
                style={{ background: "#E8FF00", color: "#000" }}
              >
                {isLoading ? 'Generazione in corso...' : '⚡ Genera QR e Codice'}
              </Button>
            )}
            {(!user?.subscription_type || user.subscription_type === 'none') && (
              <Button
                size="lg"
                variant="outline"
                className="w-full h-12 border-[#E8FF00]/40 text-[#E8FF00] hover:bg-[#E8FF00]/10 rounded-2xl"
                onClick={() => navigate('/')}
              >
                Attiva un abbonamento
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Se il pass è generato, mostra CheckInCard
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col">
      <div className="sticky top-0 z-20 bg-[#0a0a0a]/95 backdrop-blur-xl border-b border-white/10 px-4 py-3 flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate('/Gyms')} className="text-white hover:bg-white/10">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <span className="text-white font-semibold">Il tuo pass</span>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-6">
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