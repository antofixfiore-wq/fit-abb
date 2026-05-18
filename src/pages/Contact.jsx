import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Mail, Phone, MapPin, Send, CheckCircle, Building2, Users } from "lucide-react";
import { motion } from "framer-motion";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "general",
    message: ""
  });
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    setError(null);
    setSuccess(false);

    try {
      await base44.integrations.Core.SendEmail({
        to: "info@fitabb.it",
        subject: `[Contatto Web] ${formData.subject}`,
        body: `
          Nome: ${formData.name}
          Email: ${formData.email}
          Telefono: ${formData.phone}
          Oggetto: ${formData.subject}
          
          Messaggio:
          ${formData.message}
        `
      });

      setSuccess(true);
      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "general",
        message: ""
      });
    } catch (error) {
      setError("Errore nell'invio del messaggio. Riprova più tardi.");
    }
    
    setSending(false);
  };

  const contactInfo = [
    {
      icon: Mail,
      title: "Email",
      value: "info@fitabb.it",
      link: "mailto:info@fitabb.it"
    },
    {
      icon: Phone,
      title: "Telefono",
      value: "+39 02 1234 5678",
      link: "tel:+390212345678"
    },
    {
      icon: MapPin,
      title: "Sede",
      value: "Milano, Italia",
      link: null
    }
  ];

  const reasons = [
    {
      icon: Users,
      title: "Sei un Utente?",
      description: "Contattaci per supporto, domande sui piani o suggerimenti"
    },
    {
      icon: Building2,
      title: "Hai una Palestra?",
      description: "Diventa partner Fit ABB e raggiungi migliaia di nuovi clienti"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 to-orange-600 text-white py-20 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Contattaci
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto">
              Siamo qui per aiutarti. Scrivici e ti risponderemo il prima possibile
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Reasons */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {reasons.map((reason, index) => {
              const Icon = reason.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="h-full hover:shadow-lg transition-shadow">
                    <CardContent className="pt-6">
                      <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-orange-500 rounded-xl flex items-center justify-center mb-4">
                        <Icon className="w-7 h-7 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">
                        {reason.title}
                      </h3>
                      <p className="text-gray-600 text-lg">{reason.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Contact Form & Info */}
      <section className="py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Contact Form */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl">Invia un Messaggio</CardTitle>
                </CardHeader>
                <CardContent>
                  {success && (
                    <Alert className="mb-6 bg-green-50 border-green-200">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <AlertDescription className="text-green-800">
                        Messaggio inviato con successo! Ti risponderemo al più presto.
                      </AlertDescription>
                    </Alert>
                  )}

                  {error && (
                    <Alert variant="destructive" className="mb-6">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="name">Nome e Cognome *</Label>
                        <Input
                          id="name"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="Mario Rossi"
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">Email *</Label>
                        <Input
                          id="email"
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="mario.rossi@email.com"
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
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
                        <Label htmlFor="subject">Oggetto *</Label>
                        <Select value={formData.subject} onValueChange={(value) => setFormData({ ...formData, subject: value })}>
                          <SelectTrigger id="subject">
                            <SelectValue placeholder="Seleziona oggetto" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="general">Informazioni Generali</SelectItem>
                            <SelectItem value="support">Supporto Tecnico</SelectItem>
                            <SelectItem value="partnership">Diventa Partner</SelectItem>
                            <SelectItem value="feedback">Feedback</SelectItem>
                            <SelectItem value="other">Altro</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="message">Messaggio *</Label>
                      <Textarea
                        id="message"
                        required
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        placeholder="Scrivi qui il tuo messaggio..."
                        rows={6}
                      />
                    </div>

                    <Button
                      type="submit"
                      size="lg"
                      disabled={sending}
                      className="w-full bg-gradient-to-r from-blue-600 to-orange-600 hover:from-blue-700 hover:to-orange-700"
                    >
                      {sending ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          Invio in corso...
                        </>
                      ) : (
                        <>
                          <Send className="w-5 h-5 mr-2" />
                          Invia Messaggio
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Contact Info */}
            <div className="space-y-6">
              {contactInfo.map((info, index) => {
                const Icon = info.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-orange-500 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Icon className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900 mb-1">
                              {info.title}
                            </h3>
                            {info.link ? (
                              <a
                                href={info.link}
                                className="text-blue-600 hover:text-blue-700 hover:underline"
                              >
                                {info.value}
                              </a>
                            ) : (
                              <p className="text-gray-600">{info.value}</p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}

              <Card className="bg-gradient-to-br from-blue-50 to-orange-50">
                <CardContent className="pt-6">
                  <h3 className="font-semibold text-gray-900 mb-3">Orari di Supporto</h3>
                  <div className="space-y-2 text-sm text-gray-700">
                    <div className="flex justify-between">
                      <span>Lun - Ven:</span>
                      <span className="font-medium">9:00 - 18:00</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Sabato:</span>
                      <span className="font-medium">10:00 - 14:00</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Domenica:</span>
                      <span className="font-medium">Chiuso</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}