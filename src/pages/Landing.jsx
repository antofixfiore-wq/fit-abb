import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Dumbbell, 
  MapPin, 
  Sparkles, 
  Users, 
  Award, 
  CheckCircle,
  ArrowRight,
  Star,
  TrendingUp,
  Heart
} from "lucide-react";
import { motion } from "framer-motion";

export default function Landing() {
  const features = [
    {
      icon: MapPin,
      title: "Accesso Multi-Palestra",
      description: "Un solo abbonamento per centinaia di palestre in tutta Italia"
    },
    {
      icon: Sparkles,
      title: "AI Workout Planner",
      description: "Piani di allenamento personalizzati generati con intelligenza artificiale"
    },
    {
      icon: Users,
      title: "Community Attiva",
      description: "Connettiti con altri appassionati di fitness e condividi i tuoi progressi"
    },
    {
      icon: Award,
      title: "Sistema Gamification",
      description: "Guadagna badge e punti per rimanere motivato e raggiungere i tuoi obiettivi"
    }
  ];

  const plans = [
    {
      name: "Silver",
      price: 29.99,
      color: "from-gray-400 to-gray-600",
      features: ["Accesso a palestre basic", "Community", "Tracking allenamenti", "Supporto email"]
    },
    {
      name: "Gold",
      price: 39.99,
      color: "from-yellow-400 to-yellow-600",
      popular: true,
      features: ["Tutto in Silver", "Palestre premium", "AI Workout Planner", "Eventi esclusivi"]
    },
    {
      name: "Premium",
      price: 99.99,
      color: "from-blue-500 to-orange-500",
      features: ["Tutto in Gold", "Tutte le palestre partner", "Coaching personalizzato", "Priorità supporto"]
    }
  ];

  const testimonials = [
    {
      name: "Marco R.",
      text: "Finalmente posso allenarmi in qualsiasi palestra senza vincoli! Fit ABB ha rivoluzionato il mio modo di fare fitness.",
      rating: 5
    },
    {
      name: "Giulia M.",
      text: "L'AI Workout Planner è incredibile. Mi ha creato un programma perfetto per i miei obiettivi!",
      rating: 5
    },
    {
      name: "Andrea T.",
      text: "La community è fantastica, mi ha dato la motivazione che mi mancava. Consiglio a tutti!",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-orange-600 text-white py-20 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="max-w-6xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <Badge className="mb-6 bg-white/20 text-white border-white/30 px-4 py-2 text-sm">
              🎉 Nuove palestre partner ogni settimana
            </Badge>
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Allena l'Italia Intera
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-300">
                Con un Solo Abbonamento
              </span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto">
              Accedi a centinaia di palestre, piani AI personalizzati e una community che ti supporta
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-white text-blue-700 hover:bg-blue-50 text-lg px-8 py-6"
                asChild
              >
                <Link to={createPageUrl("Pricing")}>
                  Inizia Ora
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white/10 text-lg px-8 py-6"
                asChild
              >
                <Link to={createPageUrl("About")}>
                  Scopri di Più
                </Link>
              </Button>
            </div>

            <div className="mt-12 flex flex-wrap justify-center gap-8 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-300" />
                <span>Nessun vincolo</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-300" />
                <span>Cancellazione gratuita</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-300" />
                <span>Prima settimana gratis</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              <div className="text-4xl font-bold text-blue-600 mb-2">500+</div>
              <div className="text-gray-600">Palestre Partner</div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <div className="text-4xl font-bold text-orange-600 mb-2">50K+</div>
              <div className="text-gray-600">Utenti Attivi</div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
            >
              <div className="text-4xl font-bold text-green-600 mb-2">1M+</div>
              <div className="text-gray-600">Allenamenti Completati</div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
            >
              <div className="text-4xl font-bold text-purple-600 mb-2">4.9★</div>
              <div className="text-gray-600">Rating Medio</div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Tutto Quello Che Ti Serve per il Tuo Fitness
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Una piattaforma completa che combina tecnologia e community
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="h-full hover:shadow-xl transition-shadow duration-300 border-2 hover:border-blue-200">
                    <CardContent className="pt-6">
                      <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-orange-500 rounded-xl flex items-center justify-center mb-4">
                        <Icon className="w-7 h-7 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        {feature.title}
                      </h3>
                      <p className="text-gray-600">{feature.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Cosa Dicono i Nostri Utenti
            </h2>
            <p className="text-xl text-gray-600">
              Migliaia di persone hanno già trasformato il loro fitness
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full">
                  <CardContent className="pt-6">
                    <div className="flex mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <p className="text-gray-700 mb-4 italic">"{testimonial.text}"</p>
                    <p className="font-semibold text-gray-900">- {testimonial.name}</p>
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
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Pronto a Iniziare il Tuo Percorso Fitness?
            </h2>
            <p className="text-xl mb-8 text-blue-100">
              Unisciti a migliaia di persone che hanno già scelto Fit ABB
            </p>
            <Button
              size="lg"
              className="bg-white text-blue-700 hover:bg-blue-50 text-lg px-10 py-6"
              asChild
            >
              <Link to={createPageUrl("Pricing")}>
                Scegli il Tuo Piano
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>
    </div>
  );
}