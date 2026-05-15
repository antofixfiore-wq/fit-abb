import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle2, XCircle, QrCode, Hash } from 'lucide-react';
import { toast } from 'sonner';

export default function AccessValidationTab({ gymId }) {
  const [activeTab, setActiveTab] = useState('qr');
  const [qrToken, setQrToken] = useState('');
  const [numericCode, setNumericCode] = useState('');
  const [validationResult, setValidationResult] = useState(null);
  const [isValidating, setIsValidating] = useState(false);
  const [todayAccess, setTodayAccess] = useState([]);
  const [allAccess, setAllAccess] = useState([]);

  // Carica ingressi
  useEffect(() => {
    loadAccessLogs();
    const interval = setInterval(loadAccessLogs, 30000); // Refresh ogni 30 secondi
    return () => clearInterval(interval);
  }, [gymId]);

  const loadAccessLogs = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const logs = await base44.asServiceRole.entities.GymAccess.filter({
        gym_id: gymId
      }, '-access_date');

      setAllAccess(logs);
      setTodayAccess(logs.filter(log => log.access_date.startsWith(today)));
    } catch (err) {
      console.error('Error loading access logs:', err);
    }
  };

  const validateAccessPass = async () => {
    if (!qrToken && !numericCode) {
      toast.error('Inserisci un codice');
      return;
    }

    setIsValidating(true);
    setValidationResult(null);

    try {
      const response = await base44.functions.invoke('validateAccessPass', {
        token: qrToken || undefined,
        numeric_code: numericCode || undefined,
        gym_id: gymId
      });

      setValidationResult(response.data);

      if (response.data.validation_status === 'accepted') {
        toast.success('✅ Accesso consentito!');
        setQrToken('');
        setNumericCode('');
        // Reload access logs
        setTimeout(loadAccessLogs, 1000);
      } else {
        toast.error('❌ Accesso negato');
      }
    } catch (err) {
      console.error('Error validating:', err);
      toast.error('Errore nella validazione');
    } finally {
      setIsValidating(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      validateAccessPass();
    }
  };

  return (
    <div className="space-y-6">
      {/* Validation Panel */}
      <Card>
        <CardHeader>
          <CardTitle>Validazione Accessi</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="qr" className="gap-2">
                <QrCode className="w-4 h-4" />
                Scansiona QR
              </TabsTrigger>
              <TabsTrigger value="code" className="gap-2">
                <Hash className="w-4 h-4" />
                Codice Manuale
              </TabsTrigger>
            </TabsList>

            {/* QR Tab */}
            <TabsContent value="qr" className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Scansiona il QR del cliente
                </label>
                <Input
                  type="text"
                  placeholder="Il QR verrà letto qui..."
                  value={qrToken}
                  onChange={(e) => setQrToken(e.target.value)}
                  onKeyPress={handleKeyPress}
                  autoFocus
                  className="font-mono"
                />
                <p className="text-xs text-gray-500 mt-2">
                  Usa uno scanner per leggere il QR del cliente
                </p>
              </div>
            </TabsContent>

            {/* Code Tab */}
            <TabsContent value="code" className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Inserisci il codice a 6 cifre
                </label>
                <Input
                  type="text"
                  placeholder="000000"
                  value={numericCode}
                  onChange={(e) => setNumericCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  onKeyPress={handleKeyPress}
                  maxLength="6"
                  className="text-2xl font-mono text-center tracking-widest"
                />
                <p className="text-xs text-gray-500 mt-2">
                  Il cliente ti comunica il codice a 6 cifre
                </p>
              </div>
            </TabsContent>
          </Tabs>

          <Button
            onClick={validateAccessPass}
            disabled={isValidating || (!qrToken && !numericCode)}
            className="w-full mt-4 bg-green-600 hover:bg-green-700"
          >
            {isValidating ? 'Validazione in corso...' : 'Valida Accesso'}
          </Button>
        </CardContent>
      </Card>

      {/* Validation Result */}
      {validationResult && (
        <Card className={`border-2 ${
          validationResult.validation_status === 'accepted'
            ? 'border-green-200 bg-green-50'
            : 'border-red-200 bg-red-50'
        }`}>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {validationResult.validation_status === 'accepted' ? (
                <>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-8 h-8 text-green-600" />
                    <h3 className="text-2xl font-bold text-green-900">ACCESSO CONSENTITO</h3>
                  </div>

                  <div className="bg-white rounded-lg p-4 space-y-3">
                    <div className="flex items-center gap-3">
                      {validationResult.client_photo_url && (
                        <img
                          src={validationResult.client_photo_url}
                          alt="Client"
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      )}
                      <div>
                        <p className="font-semibold text-gray-900">{validationResult.client_name}</p>
                        <p className="text-sm text-gray-600">{validationResult.gym_name}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-gray-600">Piano</p>
                        <p className="font-semibold text-gray-900">{validationResult.subscription_type.toUpperCase()}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Ora Check-in</p>
                        <p className="font-semibold text-gray-900">
                          {new Date(validationResult.validated_at).toLocaleTimeString('it-IT', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>

                    <div className="bg-gray-100 rounded p-3 font-mono text-center">
                      <p className="text-xs text-gray-600 mb-1">Codice Check-in</p>
                      <p className="text-lg font-bold text-gray-900">{validationResult.check_in_code}</p>
                    </div>
                  </div>

                  <Button className="w-full bg-green-600 hover:bg-green-700">
                    ✓ Ingresso Registrato
                  </Button>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-3">
                    <XCircle className="w-8 h-8 text-red-600" />
                    <h3 className="text-2xl font-bold text-red-900">ACCESSO NEGATO</h3>
                  </div>

                  <div className="bg-white rounded-lg p-4">
                    <div className="flex items-center gap-2 text-red-700">
                      <AlertCircle className="w-5 h-5" />
                      <div>
                        <p className="font-semibold">Motivo:</p>
                        <p className="text-sm mt-1">{getDenialReasonText(validationResult.denial_reason)}</p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Today's Access */}
      <Card>
        <CardHeader>
          <CardTitle>Ingressi di Oggi ({todayAccess.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {todayAccess.length > 0 ? (
            <div className="space-y-2">
              {todayAccess.map((log) => (
                <div key={log.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                  <div>
                    <p className="font-semibold text-gray-900">{log.user_email}</p>
                    <p className="text-sm text-gray-600">
                      {new Date(log.access_date).toLocaleTimeString('it-IT', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <Badge className="bg-green-100 text-green-800">
                    {log.subscription_type?.toUpperCase() || 'N/A'}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-8">Nessun ingresso oggi</p>
          )}
        </CardContent>
      </Card>

      {/* All Access History */}
      <Card>
        <CardHeader>
          <CardTitle>Storico Ingressi</CardTitle>
        </CardHeader>
        <CardContent>
          {allAccess.length > 0 ? (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {allAccess.slice(0, 50).map((log) => (
                <div key={log.id} className="flex items-center justify-between border-b pb-2 last:border-0 text-sm">
                  <div>
                    <p className="font-medium text-gray-900">{log.user_email}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(log.access_date).toLocaleDateString('it-IT')} {new Date(log.access_date).toLocaleTimeString('it-IT', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {log.subscription_type?.toUpperCase() || 'N/A'}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-8">Nessun ingresso registrato</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function getDenialReasonText(reason) {
  const reasons = {
    'codice_errato': 'Codice o QR non trovato nel sistema',
    'codice_gia_utilizzato': 'Questo codice è stato già utilizzato',
    'codice_scaduto': 'Il codice è scaduto (validità 5 minuti)',
    'palestra_non_corrisponde': 'Questo pass non è valido per questa palestra',
    'abbonamento_non_attivo': 'L\'abbonamento del cliente non è attivo',
    'piano_non_valido_palestra': 'Il piano del cliente non è valido per questa palestra',
    'piano_non_valido_orario': 'Il piano non è valido in questa fascia oraria'
  };
  return reasons[reason] || 'Accesso non autorizzato';
}