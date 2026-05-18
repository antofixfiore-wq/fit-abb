import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, CheckCircle2, AlertCircle, FileText, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";

export default function ASIAssociation() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoadingAuth } = useAuth();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [associating, setAssociating] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    address: "",
    city: "",
    cap: "",
    phone: "",
    codice_fiscale: ""
  });
  const [documents, setDocuments] = useState({
    certificato_medico: null,
    documento: null,
    tessera_asi: null
  });

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const userData = await base44.auth.me();
        setUser(userData);
        
        if (userData.address) {
          setFormData({
            address: userData.address || "",
            city: userData.city || "",
            cap: userData.cap || "",
            phone: userData.phone || "",
            codice_fiscale: userData.codice_fiscale || ""
          });
        }

        // Verifica se associazione già completata
        if (userData.asi_association_status === "completed") {
          setSuccess(true);
        }
      } catch (err) {
        setError("Errore nel caricamento dati utente");
      } finally {
        setLoading(false);
      }
    };

    if (!isLoadingAuth && isAuthenticated) {
      loadUserData();
    } else if (!isLoadingAuth && !isAuthenticated) {
      navigate("/Onboarding");
    }
  }, [isAuthenticated, isLoadingAuth]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = async (docType, file) => {
    setUploading(true);
    setError(null);

    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setDocuments(prev => ({ ...prev, [docType]: file_url }));
    } catch (err) {
      setError("Errore nel caricamento del file");
    } finally {
      setUploading(false);
    }
  };

  const handleSaveData = async () => {
    try {
      setError(null);
      
      // Salva dati anagrafici
      await base44.auth.updateMe({
        ...formData,
        asi_documents_uploaded: true
      });

      // Crea record ASIAssociation
      const allDocs = Object.values(documents).filter(Boolean);
      
      await base44.entities.ASIAssociation.create({
        user_email: user.email,
        full_name: user.full_name,
        codice_fiscale: formData.codice_fiscale,
        address: formData.address,
        city: formData.city,
        cap: formData.cap,
        phone: formData.phone,
        subscription_type: user.subscription_type || "gold",
        document_urls: allDocs,
        status: "pending"
      });

      setSuccess(true);
    } catch (err) {
      setError(err.message || "Errore nel salvataggio dati");
    }
  };

  const handleAssociate = async () => {
    setAssociating(true);
    setError(null);

    try {
      const response = await base44.functions.invoke("associateToASI", {});
      
      if (response.data.success) {
        setSuccess(true);
      } else {
        setError(response.data.error || "Associazione fallita");
      }
    } catch (err) {
      setError(err.message || "Errore durante l'associazione");
    } finally {
      setAssociating(false);
    }
  };

  if (loading || isLoadingAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-[#E8FF00]" />
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] p-4 md:p-8">
        <Card className="max-w-2xl mx-auto bg-black border-white/10">
          <CardHeader>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-12 h-12 text-[#E8FF00]" />
              <div>
                <CardTitle className="text-2xl text-white">Associazione ASI Completata!</CardTitle>
                <CardDescription className="text-gray-400">
                  La tua tessera ASI è stata attivata con successo
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert className="bg-[#E8FF00]/10 border-[#E8FF00]/20">
              <AlertDescription className="text-white">
                Ora sei ufficialmente associato all'ente di promozione sportiva ASI. 
                Potrai accedere a tutti i benefici riservati agli atleti tesserati.
              </AlertDescription>
            </Alert>
            <Button 
              onClick={() => navigate("/Profile")} 
              className="w-full bg-[#E8FF00] text-black hover:bg-[#E8FF00]/90"
            >
              Torna al Profilo
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-white">Associazione ASI</h1>
          <p className="text-gray-400">
            Completa i tuoi dati e carica i documenti per ottenere la tessera ASI
          </p>
        </div>

        {error && (
          <Alert variant="destructive" className="bg-red-500/10 border-red-500/20">
            <AlertCircle className="w-4 h-4 text-red-500" />
            <AlertDescription className="text-red-500 ml-2">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Dati Anagrafici */}
        <Card className="bg-black border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#E8FF00]" />
              Dati Anagrafici
            </CardTitle>
            <CardDescription className="text-gray-400">
              Inserisci i tuoi dati completi per l'associazione
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-white">Codice Fiscale *</Label>
                <Input
                  value={formData.codice_fiscale}
                  onChange={(e) => handleInputChange("codice_fiscale", e.target.value)}
                  className="bg-white/5 border-white/10 text-white"
                  placeholder="RSSMRA85M01H501Z"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-white">Telefono *</Label>
                <Input
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  className="bg-white/5 border-white/10 text-white"
                  placeholder="+39 333 1234567"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-white">Indirizzo *</Label>
              <Input
                value={formData.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
                className="bg-white/5 border-white/10 text-white"
                placeholder="Via Roma 123"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-white">Città *</Label>
                <Input
                  value={formData.city}
                  onChange={(e) => handleInputChange("city", e.target.value)}
                  className="bg-white/5 border-white/10 text-white"
                  placeholder="Milano"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-white">CAP *</Label>
                <Input
                  value={formData.cap}
                  onChange={(e) => handleInputChange("cap", e.target.value)}
                  className="bg-white/5 border-white/10 text-white"
                  placeholder="20121"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Upload Documenti */}
        <Card className="bg-black border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Upload className="w-5 h-5 text-[#E8FF00]" />
              Carica Documenti
            </CardTitle>
            <CardDescription className="text-gray-400">
              Carica i documenti richiesti per l'associazione ASI
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { key: "certificato_medico", label: "Certificato Medico", required: true },
              { key: "documento", label: "Documento d'Identità", required: true },
              { key: "tessera_asi", label: "Tessera ASI (se già in possesso)", required: false }
            ].map((doc) => (
              <div key={doc.key} className="space-y-2">
                <Label className="text-white">
                  {doc.label} {doc.required && "*"}
                </Label>
                <div className="flex gap-2">
                  <Input
                    type="file"
                    onChange={(e) => handleFileUpload(doc.key, e.target.files[0])}
                    className="bg-white/5 border-white/10 text-white"
                    disabled={uploading}
                  />
                  {documents[doc.key] && (
                    <CheckCircle2 className="w-6 h-6 text-[#E8FF00]" />
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Azioni */}
        <div className="space-y-4">
          <Button
            onClick={handleSaveData}
            className="w-full bg-[#E8FF00] text-black hover:bg-[#E8FF00]/90"
            disabled={uploading || !formData.codice_fiscale || !formData.address}
          >
            Salva Dati e Carica Documenti
          </Button>

          {user?.asi_documents_uploaded && (
            <Button
              onClick={handleAssociate}
              disabled={associating}
              className="w-full bg-white text-black hover:bg-white/90"
            >
              {associating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Associazione in corso...
                </>
              ) : (
                "Completa Associazione ASI"
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}