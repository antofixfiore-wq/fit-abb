import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, X } from "lucide-react";
import { motion } from "framer-motion";

export default function Pricing() {
  const plans = [
    {
      type: "gold",
      name: "Gold",
      price: 40,
      color: "from-yellow-400 to-yellow-600",
      bgColor: "bg-yellow-50",
      features: [
        { text: "Accesso a palestre Gold", included: true },
        { text: "Tracking allenamenti", included: true },
        { text: "Community e feed sociale", included: true },
        { text: "Badge e gamification", included: true },
        { text: "Supporto email", included: true },
        { text: "AI Workout Planner", included: true },
        { text: "Eventi esclusivi", included: true },
        { text: "Palestre Platinum", included: false },
        { text: "Coaching personalizzato", included: false }
      ]
    },
    {
      type: "plus",
      name: "Plus",
      price: 70,
      color: "from-[#E8FF00] to-yellow-400",
      bgColor: "bg-[#E8FF00]/10",
      popular: true,
      features: [
        { text: "Palestre Gold + Platinum", included: true },
        { text: "Tracking allenamenti", included: true },
        { text: "Community e feed sociale", included: true },
        { text: "Badge e gamification", included: true },
        { text: "Supporto email", included: true },
        { text: "AI Workout Planner", included: true },
        { text: "Eventi esclusivi", included: true },
        { text: "Coaching personalizzato", included: false }
      ]
    },
    {
      type: "premium",
      name: "Platinum",
      price: 99.99,
      color: "from-blue-500 to-orange-500",
      bgColor: "bg-gradient-to-br from-blue-50 to-orange-50",
      features: [
        { text: "Tutte le palestre partner", included: true },
        { text: "Tracking allenamenti", included: true },
        { text: "Community e feed sociale", included: true },
        { text: "Badge e gamification", included: true },
        { text: "Supporto prioritario 24/7", included: true },
        { text: "AI Workout Planner avanzato", included: true },
        { text: "Eventi esclusivi VIP", included: true },
        { text: "Coaching personalizzato 1-1", included: true }
      ]
    }
  ];

  const faqs = [
    {
      question: "Posso cancellare in qualsiasi momento?",
      answer: "Sì, puoi cancellare il tuo abbonamento in qualsiasi momento senza penali. L'abbonamento rimarrà attivo fino alla fine del periodo pagato."
    },
    {
      question: "Posso cambiare piano dopo l'iscrizione?",
      answer: "Assolutamente sì! Puoi fare upgrade o downgrade del tuo piano in qualsiasi momento dal tuo profilo."
    },
    {
      question: "Posso usare più palestre nello stesso giorno?",
      answer: "Sì, con Fit ABB puoi visitare tutte le palestre che vuoi nello stesso giorno, senza limiti."
    },
    {
      question: "C'è un periodo di prova?",
      answer: "Sì! Offriamo la prima settimana gratuita per tutti i nuovi utenti. Puoi cancellare prima della fine del periodo di prova senza costi."
    },
    {
      question: "Devo prenotare prima di andare in palestra?",
      answer: "No, con Fit ABB hai accesso libero a tutte le palestre partner. Basta presentarti con l'app."
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
              Scegli il Piano Perfetto per Te
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto mb-8">
              Nessun vincolo, cancellazione gratuita, prima settimana gratis
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <Badge className="bg-white/20 text-white border-white/30 px-4 py-2">
                <CheckCircle className="w-4 h-4 mr-2" />
                7 giorni di prova gratuita
              </Badge>
              <Badge className="bg-white/20 text-white border-white/30 px-4 py-2">
                <CheckCircle className="w-4 h-4 mr-2" />
                Cancellazione in qualsiasi momento
              </Badge>
              <Badge className="bg-white/20 text-white border-white/30 px-4 py-2">
                <CheckCircle className="w-4 h-4 mr-2" />
                Nessun costo nascosto
              </Badge>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <motion.div
                key={plan.type}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={plan.popular ? "lg:scale-105" : ""}
              >
                <Card className={`relative h-full ${plan.popular ? 'border-2 border-blue-500 shadow-2xl' : ''}`}>
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-gradient-to-r from-blue-600 to-orange-600 text-white px-4 py-1">
                        Più Popolare
                      </Badge>
                    </div>
                  )}
                  
                  <CardHeader className={`${plan.bgColor} pb-8`}>
                    <div className="text-center space-y-4">
                      <h3 className="text-2xl font-bold text-gray-900">{plan.name}</h3>
                      <div className="flex items-baseline justify-center gap-2">
                        <span className="text-5xl font-bold text-gray-900">€{plan.price}</span>
                        <span className="text-gray-600">/mese</span>
                      </div>
                      <div className={`h-1 w-24 mx-auto bg-gradient-to-r ${plan.color} rounded-full`}></div>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-8 space-y-6">
                    <ul className="space-y-4">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-3">
                          {feature.included ? (
                            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                          ) : (
                            <X className="w-5 h-5 text-gray-300 flex-shrink-0 mt-0.5" />
                          )}
                          <span className={feature.included ? "text-gray-700" : "text-gray-400"}>
                            {feature.text}
                          </span>
                        </li>
                      ))}
                    </ul>

                    <Button
                      className={`w-full ${
                        plan.popular
                          ? 'bg-gradient-to-r from-blue-600 to-orange-600 hover:from-blue-700 hover:to-orange-700'
                          : 'bg-gray-900 hover:bg-gray-800'
                      }`}
                      size="lg"
                      asChild
                    >
                      <Link to={createPageUrl(`Subscription?plan=${plan.type}`)}>
                        Inizia Gratis
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQs Section */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Domande Frequenti
            </h2>
            <p className="text-xl text-gray-600">
              Tutto quello che devi sapere sui nostri piani
            </p>
          </div>

          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card>
                  <CardContent className="pt-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-3">
                      {faq.question}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {faq.answer}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-br from-blue-600 to-orange-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold mb-6">
              Ancora Indeciso?
            </h2>
            <p className="text-xl mb-8 text-blue-100">
              Prova gratuitamente per 7 giorni, senza impegno
            </p>
            <Button
              size="lg"
              className="bg-white text-blue-700 hover:bg-blue-50 text-lg px-10 py-6"
              asChild
            >
              <Link to={createPageUrl("Contact")}>
                Contattaci per Maggiori Info
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>
    </div>
  );
}