import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dumbbell, Check, Star, Building2, ArrowRight, Award, Clock, MapPin } from "lucide-react";
import { motion } from "framer-motion";

const subscriptionPlans = [
  {
    type: "silver",
    name: "Silver",
    price: 29.99,
    color: "from-gray-400 to-gray-600",
    benefits: [
      "Accesso a palestre selezionate",
      "Orari limitati (6:00-14:00)",
      "Sala pesi e cardio",
      "App mobile"
    ]
  },
  {
    type: "gold",
    name: "Gold",
    price: 39.99,
    color: "from-yellow-400 to-yellow-600",
    popular: true,
    benefits: [
      "Accesso a tutte le palestre partner",
      "Orario FULL",
      "Tutti i corsi di gruppo",
      "Sala pesi, cardio e funzionale"
    ]
  },
  {
    type: "premium",
    name: "Premium",
    price: 99.99,
    color: "from-blue-500 to-orange-500",
    benefits: [
      "Accesso illimitato 24/7",
      "Tutte le palestre premium",
      "Tutti i corsi e classi esclusive",
      "4 sessioni PT al mese",
      "Spa e piscina incluse",
      "Programma nutrizionale personalizzato"
    ]
  }
];

export default function Home() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [gyms, setGyms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const userData = await base44.auth.me();
        setUser(userData);
        const gymsData = await base44.entities.Gym.list("-created_date", 6);
        setGyms(gymsData);
      } catch (error) {
        console.error("Error loading data:", error);
      }
      setLoading(false);
    };
    loadData();
  }, []);

  const handleSubscriptionSelect = (plan) => {
    if (!user) {
      base44.auth.redirectToLogin(createPageUrl("Home"));
      return;
    }
    
    if (!user.id_document_url || !user.medical_certificate_url) {
      navigate(createPageUrl("Profile"));
      return;
    }

    navigate(`${createPageUrl("Subscription")}?plan=${plan.type}`);
  };

  const hasActiveSubscription = user?.subscription_type && user.subscription_type !== "none";

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-orange-600 text-white">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="absolute inset-0" style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1600)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 0.15
        }}></div>
        
        <div className="relative max-w-7xl mx-auto px-6 py-24 md:py-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <div className="mb-8 flex justify-center">
              <img 
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6900e246d71384c10b97f155/979b3bbd7_EnergeticBlueandOrangeFitnessAppLogo.png"
                alt="Fit ABB"
                className="w-32 h-32 object-contain drop-shadow-2xl"
              />
            </div>
            <Badge className="mb-6 bg-white/20 text-white border-white/30 px-4 py-2">
              <Award className="w-4 h-4 mr-2" />
              Un abbonamento, infinite palestre
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Allenati Ovunque in Italia
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100">
              Accesso illimitato a centinaia di palestre con un solo abbonamento
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-6"
                onClick={() => {
                  if (!user) {
                    base44.auth.redirectToLogin(createPageUrl("Home"));
                  } else {
                    document.getElementById('plans').scrollIntoView({ behavior: 'smooth' });
                  }
                }}
              >
                Inizia Ora
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white/10 text-lg px-8 py-6"
                onClick={() => navigate(createPageUrl("Gyms"))}
              >
                Esplora le Palestre
              </Button>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="grid grid-cols-3 gap-8 mt-20 max-w-3xl mx-auto"
          >
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">500+</div>
              <div className="text-blue-200">Palestre Partner</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">20</div>
              <div className="text-blue-200">Regioni Coperte</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">10K+</div>
              <div className="text-blue-200">Membri Attivi</div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Subscription Plans */}
      <section id="plans" className="py-20 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Scegli il Tuo Piano
            </h2>
            <p className="text-xl text-gray-600">
              Trova l'abbonamento perfetto per i tuoi obiettivi di fitness
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {subscriptionPlans.map((plan, index) => (
              <motion.div
                key={plan.type}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className={`relative overflow-hidden transition-all duration-300 hover:shadow-2xl ${
                  plan.popular ? 'ring-2 ring-blue-500 scale-105' : ''
                }`}>
                  {plan.popular && (
                    <div className="absolute top-0 right-0 bg-gradient-to-r from-blue-500 to-orange-500 text-white px-4 py-1 text-sm font-semibold">
                      PIÙ POPOLARE
                    </div>
                  )}
                  
                  <CardHeader className="pb-8 pt-8">
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${plan.color} flex items-center justify-center mb-4`}>
                      <Dumbbell className="w-8 h-8 text-white" />
                    </div>
                    <CardTitle className="text-2xl">{plan.name}</CardTitle>
                    <div className="mt-4">
                      <span className="text-4xl font-bold">€{plan.price}</span>
                      <span className="text-gray-500">/mese</span>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-6">
                    <ul className="space-y-3">
                      {plan.benefits.map((benefit, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <div className={`w-5 h-5 rounded-full bg-gradient-to-br ${plan.color} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                            <Check className="w-3 h-3 text-white" />
                          </div>
                          <span className="text-gray-700">{benefit}</span>
                        </li>
                      ))}
                    </ul>

                    <Button
                      className={`w-full ${plan.popular ? 'bg-gradient-to-r from-blue-600 to-orange-600 hover:from-blue-700 hover:to-orange-700' : ''}`}
                      variant={plan.popular ? 'default' : 'outline'}
                      size="lg"
                      onClick={() => handleSubscriptionSelect(plan)}
                      disabled={hasActiveSubscription && user.subscription_type === plan.type}
                    >
                      {hasActiveSubscription && user.subscription_type === plan.type ? 'Piano Attivo' : 'Scegli Piano'}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Gyms */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                Palestre in Evidenza
              </h2>
              <p className="text-gray-600">Scopri alcune delle nostre palestre partner</p>
            </div>
            <Button
              variant="outline"
              onClick={() => navigate(createPageUrl("Gyms"))}
              className="hidden md:flex items-center gap-2"
            >
              Vedi Tutte
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {gyms.slice(0, 6).map((gym) => (
              <motion.div
                key={gym.id}
                whileHover={{ y: -5 }}
                transition={{ duration: 0.2 }}
              >
                <Card className="overflow-hidden cursor-pointer hover:shadow-xl transition-shadow duration-300"
                  onClick={() => navigate(`${createPageUrl("GymDetail")}?id=${gym.id}`)}>
                  <div className="relative h-48 bg-gray-200">
                    {gym.photos?.[0] ? (
                      <img
                        src={gym.photos[0]}
                        alt={gym.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-orange-100">
                        <Building2 className="w-16 h-16 text-blue-300" />
                      </div>
                    )}
                    {gym.google_rating && (
                      <div className="absolute top-4 right-4 bg-white rounded-full px-3 py-1 flex items-center gap-1 shadow-lg">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-semibold text-sm">{gym.google_rating}</span>
                      </div>
                    )}
                  </div>
                  <CardContent className="p-6">
                    <h3 className="font-bold text-xl mb-2">{gym.name}</h3>
                    <div className="flex items-center gap-2 text-gray-600 mb-3">
                      <MapPin className="w-4 h-4" />
                      <span className="text-sm">{gym.city}</span>
                    </div>
                    {gym.amenities && gym.amenities.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {gym.amenities.slice(0, 3).map((amenity, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            {amenity}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-8 md:hidden">
            <Button
              variant="outline"
              onClick={() => navigate(createPageUrl("Gyms"))}
              className="flex items-center gap-2"
            >
              Vedi Tutte le Palestre
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-r from-blue-600 to-orange-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <Clock className="w-16 h-16 mx-auto mb-6 opacity-90" />
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Inizia la Tua Trasformazione Oggi
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            Unisciti a migliaia di persone che si allenano già con Fit ABB
          </p>
          <Button
            size="lg"
            className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-6"
            onClick={() => {
              if (!user) {
                base44.auth.redirectToLogin(createPageUrl("Home"));
              } else {
                document.getElementById('plans').scrollIntoView({ behavior: 'smooth' });
              }
            }}
          >
            Scegli il Tuo Piano
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </section>
    </div>
  );
}