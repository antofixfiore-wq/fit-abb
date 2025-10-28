import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, CheckCircle, AlertCircle, Calendar, Mail, Phone, Award, FileText } from "lucide-react";
import { motion } from "framer-motion";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState({ id: false, medical: false });
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    phone: "",
    birth_date: ""
  });

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await base44.auth.me();
      setUser(userData);
      setFormData({
        phone: userData.phone || "",
        birth_date: userData.birth_date || ""
      });
    } catch (error) {
      setError("Errore nel caricamento del profilo");
    }
    setLoading(false);
  };

  const handleFileUpload = async (file, type) => {
    setUploading({ ...uploading, [type]: true });
    setError(null);
    setSuccess(null);

    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      
      const updateData = type === "id" 
        ? { id_document_url: file_url }
        : { medical_certificate_url: file_url };

      await base44.auth.updateMe(updateData);
      await loadUser();
      
      setSuccess(`${type === "id" ? "Documento d'identità" : "Certificato medico"} caricato con successo!`);
    } catch (error) {
      setError("Errore nel caricamento del file. Riprova.");
    }
    
    setUploading({ ...uploading, [type]: false });
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      await base44.auth.updateMe(formData);
      await loadUser();
      setSuccess("Profilo aggiornato con successo!");
    } catch (error) {
      setError("Errore nell'aggiornamento del profilo");
    }
  };

  const getSubscriptionInfo = () => {
    if (!user?.subscription_type || user.subscription_type === "none") {
      return null;
    }

    const colors = {
      silver: { bg: "bg-gray-100", text: "text-gray-800", gradient: "from-gray-400 to-gray-600" },
      gold: { bg: "bg-yellow-50", text: "text-yellow-800", gradient: "from-yellow-400 to-yellow-600" },
      premium: { bg: "bg-purple-50", text: "text-purple-800", gradient: "from-purple-500 to-pink-600" }
    };

    const prices = { silver: 29.99, gold: 39.99, premium: 99.99 };
    const style = colors[user.subscription_type];

    return (
      <Card className="overflow-hidden">
        <div className={`h-2 bg-gradient-to-r ${style.gradient}`}></div>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Award className="w-6 h-6" />
              Il Tuo Abbonamento
            </CardTitle>
            <Badge className={`${style.bg} ${style.text} text-sm px-3 py-1`}>
              {user.subscription_type.toUpperCase()}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Piano:</span>
            <span className="font-semibold text-lg">{user.subscription_type.toUpperCase()}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Prezzo:</span>
            <span className="font-semibold text-lg">€{prices[user.subscription_type]}/mese</span>
          </div>
          {user.subscription_start_date && (
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Inizio:</span>
              <span className="font-medium">{new Date(user.subscription_start_date).toLocaleDateString('it-IT')}</span>
            </div>
          )}
          {user.subscription_end_date && (
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Scadenza:</span>
              <span className="font-medium">{new Date(user.subscription_end_date).toLocaleDateString('it-IT')}</span>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Il Mio Profilo</h1>
          <p className="text-gray-600 mb-8">Gestisci le tue informazioni e documenti</p>

          {success && (
            <Alert className="mb-6 bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">{success}</AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid lg:grid-cols-2 gap-6 mb-6">
            {getSubscriptionInfo()}

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="w-6 h-6" />
                  Informazioni Personali
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div>
                    <Label>Nome Completo</Label>
                    <Input value={user?.full_name || ""} disabled className="bg-gray-50" />
                  </div>
                  <div>
                    <Label>Email</Label>
                    <Input value={user?.email || ""} disabled className="bg-gray-50" />
                  </div>
                  <div>
                    <Label htmlFor="phone">Telefono</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+39 123 456 7890"
                    />
                  </div>
                  <div>
                    <Label htmlFor="birth_date">Data di Nascita</Label>
                    <Input
                      id="birth_date"
                      type="date"
                      value={formData.birth_date}
                      onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
                    />
                  </div>
                  <Button type="submit" className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                    Aggiorna Profilo
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-6 h-6" />
                Documenti Richiesti
              </CardTitle>
              <p className="text-sm text-gray-600 mt-2">
                Carica i documenti necessari per attivare il tuo abbonamento
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* ID Document */}
              <div className="border-2 border-dashed rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-lg">Documento d'Identità</h3>
                    <p className="text-sm text-gray-600">Carta d'identità o patente</p>
                  </div>
                  {user?.id_document_url && (
                    <Badge className="bg-green-100 text-green-800">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Caricato
                    </Badge>
                  )}
                </div>
                
                {user?.id_document_url ? (
                  <div className="space-y-3">
                    <a
                      href={user.id_document_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-600 hover:text-purple-700 text-sm flex items-center gap-2"
                    >
                      <FileText className="w-4 h-4" />
                      Visualizza documento
                    </a>
                    <Input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => e.target.files[0] && handleFileUpload(e.target.files[0], "id")}
                      disabled={uploading.id}
                      className="cursor-pointer"
                    />
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => e.target.files[0] && handleFileUpload(e.target.files[0], "id")}
                      disabled={uploading.id}
                      className="cursor-pointer"
                    />
                    {uploading.id && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
                        Caricamento in corso...
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Medical Certificate */}
              <div className="border-2 border-dashed rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-lg">Certificato Medico</h3>
                    <p className="text-sm text-gray-600">Certificato per attività sportiva non agonistica</p>
                  </div>
                  {user?.medical_certificate_url && (
                    <Badge className="bg-green-100 text-green-800">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Caricato
                    </Badge>
                  )}
                </div>
                
                {user?.medical_certificate_url ? (
                  <div className="space-y-3">
                    <a
                      href={user.medical_certificate_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-600 hover:text-purple-700 text-sm flex items-center gap-2"
                    >
                      <FileText className="w-4 h-4" />
                      Visualizza certificato
                    </a>
                    <Input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => e.target.files[0] && handleFileUpload(e.target.files[0], "medical")}
                      disabled={uploading.medical}
                      className="cursor-pointer"
                    />
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => e.target.files[0] && handleFileUpload(e.target.files[0], "medical")}
                      disabled={uploading.medical}
                      className="cursor-pointer"
                    />
                    {uploading.medical && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
                        Caricamento in corso...
                      </div>
                    )}
                  </div>
                )}
              </div>

              {user?.documents_verified && (
                <Alert className="bg-green-50 border-green-200">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    I tuoi documenti sono stati verificati e approvati!
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}