import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { User, Mail, Phone, MapPin, Calendar, CheckCircle, ArrowRight, Loader2, AlertCircle, Dumbbell, FileText } from "lucide-react";

export default function CompleteProfile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
    birth_date: "",
    address: "",
    id_document_url: "",
    medical_certificate_url: "",
  });

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await base44.auth.me();
        setUser(userData);
        setFormData({
          full_name: userData.full_name || "",
          phone: userData.phone || "",
          birth_date: userData.birth_date || "",
          address: userData.address || "",
          id_document_url: userData.id_document_url || "",
          medical_certificate_url: userData.medical_certificate_url || "",
        });
      } catch {
        navigate(createPageUrl("Auth") + "?mode=login&type=client");
        return;
      }
      setLoading(false);
    };
    loadUser();
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileUpload = async (file, type) => {
    setSaving(true);
    setError("");
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      const updateData = type === "id" 
        ? { id_document_url: file_url }
        : { medical_certificate_url: file_url };
      await base44.auth.updateMe(updateData);
      setFormData({ ...formData, [type === "id" ? "id_document_url" : "medical_certificate_url"]: file_url });
      setSuccess("Documento caricato!");
    } catch {
      setError("Errore nel caricamento");
    }
    setSaving(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      await base44.auth.updateMe({
        full_name: formData.full_name,
        phone: formData.phone,
        birth_date: formData.birth_date,
        address: formData.address,
      });
      setSuccess("Profilo completato! Ora puoi abbonarti.");
      setTimeout(() => {
        navigate(createPageUrl("ClientDashboard"));
      }, 1500);
    } catch {
      setError("Errore nel salvataggio");
    }
    setSaving(false);
  };

  const handleSkip = () => {
    navigate(createPageUrl("ClientDashboard"));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-[#E8FF00] animate-spin" />
      </div>
    );
  }

  const inputCls = "bg-white/5 border-white/10 text-white placeholder:text-gray-600 h-11";

  return (
    <div className="min-h-screen bg-[#0a0a0a] py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-2xl bg-[#E8FF00]/10 flex items-center justify-center">
              <Dumbbell className="w-8 h-8 text-[#E8FF00]" />
            </div>
          </div>
          <h1 className="text-3xl font-black text-white mb-2">Completa il tuo profilo</h1>
          <p className="text-gray-400 text-sm">
            Quasi fatto! Aggiungi gli ultimi dettagli per iniziare ad allenarti
          </p>
        </div>

        {error && (
          <Alert className="mb-6 bg-red-900/20 border-red-500/30">
            <AlertCircle className="h-4 w-4 text-red-400" />
            <AlertDescription className="text-red-300">{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-6 bg-green-900/20 border-green-500/30">
            <CheckCircle className="h-4 w-4 text-green-400" />
            <AlertDescription className="text-green-300">{success}</AlertDescription>
          </Alert>
        )}

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSubmit}
        >
          {/* Dati Personali */}
          <Card className="bg-[#1a1a1a] border-white/10 mb-6">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-white text-base">
                <User className="w-5 h-5" />
                Dati Personali
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-gray-400 text-xs">Nome e Cognome *</Label>
                <Input
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  placeholder="Mario Rossi"
                  className={inputCls}
                  required
                />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-400 text-xs">Telefono</Label>
                  <Input
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+39 123 456 7890"
                    className={inputCls}
                  />
                </div>
                <div>
                  <Label className="text-gray-400 text-xs">Data di Nascita</Label>
                  <Input
                    name="birth_date"
                    type="date"
                    value={formData.birth_date}
                    onChange={handleChange}
                    className={inputCls}
                  />
                </div>
              </div>
              <div>
                <Label className="text-gray-400 text-xs">Indirizzo</Label>
                <Input
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Via Roma 1, Milano"
                  className={inputCls}
                />
              </div>
            </CardContent>
          </Card>

          {/* Documenti */}
          <Card className="bg-[#1a1a1a] border-white/10 mb-6">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-white text-base">
                <FileText className="w-5 h-5" />
                Documenti (opzionali)
              </CardTitle>
              <p className="text-xs text-gray-400 mt-1">
                Carica i documenti per attivare l'abbonamento
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-white text-sm">Documento d'Identità</h3>
                    <p className="text-xs text-gray-500">Carta d'identità o patente</p>
                  </div>
                  {formData.id_document_url && (
                    <CheckCircle className="w-5 h-5 text-green-400" />
                  )}
                </div>
                {formData.id_document_url && (
                  <a href={formData.id_document_url} target="_blank" rel="noopener noreferrer"
                    className="text-[#E8FF00] text-xs flex items-center gap-1 mb-3 hover:underline">
                    <FileText className="w-3 h-3" /> Visualizza documento
                  </a>
                )}
                <Input 
                  type="file" 
                  accept="image/*,.pdf"
                  onChange={(e) => e.target.files[0] && handleFileUpload(e.target.files[0], "id")}
                  disabled={saving}
                  className="cursor-pointer bg-white/5 border-white/10 text-white text-sm h-10" 
                />
              </div>

              <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-white text-sm">Certificato Medico</h3>
                    <p className="text-xs text-gray-500">Per attività sportiva</p>
                  </div>
                  {formData.medical_certificate_url && (
                    <CheckCircle className="w-5 h-5 text-green-400" />
                  )}
                </div>
                {formData.medical_certificate_url && (
                  <a href={formData.medical_certificate_url} target="_blank" rel="noopener noreferrer"
                    className="text-[#E8FF00] text-xs flex items-center gap-1 mb-3 hover:underline">
                    <FileText className="w-3 h-3" /> Visualizza certificato
                  </a>
                )}
                <Input 
                  type="file" 
                  accept="image/*,.pdf"
                  onChange={(e) => e.target.files[0] && handleFileUpload(e.target.files[0], "medical")}
                  disabled={saving}
                  className="cursor-pointer bg-white/5 border-white/10 text-white text-sm h-10" 
                />
              </div>
            </CardContent>
          </Card>

          {/* Info box */}
          <div className="bg-blue-900/20 border border-blue-500/20 rounded-xl p-4 mb-6">
            <p className="text-blue-300 text-xs">
              💡 <strong>Suggerimento:</strong> Puoi saltare questo step e completare il profilo dopo dalla sezione Profilo.
              Ti chiederemo i documenti solo quando sarai pronto ad abbonarti.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              type="button"
              onClick={handleSkip}
              variant="outline"
              className="flex-1 border-white/10 text-white hover:bg-white/5"
            >
              Completa dopo
            </Button>
            <Button
              type="submit"
              disabled={saving}
              className="flex-1 font-bold text-black"
              style={{ background: "#E8FF00" }}
            >
              {saving ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Salvataggio...</>
              ) : (
                <><CheckCircle className="w-4 h-4 mr-2" /> Completa e Continua</>
              )}
            </Button>
          </div>
        </motion.form>
      </div>
    </div>
  );
}