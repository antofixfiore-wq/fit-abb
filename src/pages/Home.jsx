import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Check, Star, Building2, ArrowRight, MapPin, Zap, Clock, Infinity, ChevronDown } from "lucide-react";
import { motion } from "framer-motion";

const subscriptionPlans = [
  {
    id: "gold",
    name: "Gold",
    price: 40,
    period: "mese",
    highlight: false,
    tag: null,
    description: "Accesso alle palestre Gold del network Fit Abb",
    benefits: [
      "Palestre Gold convenzionate",
      "AI Workout Planner",
      "Tracking allenamenti",
      "Community e badge",
    ],
    icon: Clock,
  },
  {
    id: "annuale_gold",
    name: "Gold Annuale",
    price: 365,
    period: "anno",
    priceNote: "= 1€ al giorno",
    highlight: true,
    tag: "⭐ Più venduto",
    description: "1€ al giorno per accedere a tutte le palestre Gold. Il miglior rapporto qualità/prezzo.",
    benefits: [
      "Accesso a tutte le palestre Gold",
      "Ingressi illimitati H24",
      "AI Workout Planner",
      "Tracking allenamenti",
      "Community e badge",
    ],
    icon: Infinity,
    highlightColor: "#E8FF00",
  },
  {
    id: "annuale_plus",
    name: "Plus Annuale",
    price: 650,
    period: "anno",
    priceNote: "= 1,78€ al giorno",
    highlight: true,
    tag: "⭐ Più venduto",
    description: "Accesso a tutte le palestre convenzionate, incluse le Platinum. La massima libertà.",
    benefits: [
      "Ingressi illimitati H24",
      "Accesso a tutte le palestre convenzionate",
      "Palestre Gold + Platinum",
      "AI Workout Planner",
      "Community e badge",
    ],
    icon: Zap,
    highlightColor: "#fff",
  },
  {
    id: "plus",
    name: "Plus",
    price: 70,
    period: "mese",
    highlight: false,
    tag: null,
    description: "Accesso a palestre Gold e Platinum del network Fit Abb",
    benefits: [
      "Palestre Gold + Platinum",
      "AI Workout Planner",
      "Tracking allenamenti",
      "Community e badge",
    ],
    icon: Zap,
  },
];

// Rileva se l'app gira dentro una WebView iOS nativa (App Store)
const isIOSNative = () => {
  const ua = navigator.userAgent || "";
  const isIOS = /iPad|iPhone|iPod/.test(ua) && !window.MSStream;
  const isStandalone = window.navigator.standalone === true;
  const isWebView = !ua.includes("Safari") || isStandalone;
  return isIOS && isWebView;
};

export default function Home() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [gyms, setGyms] = useState([]);
  const [loading, setLoading] = useState(true);
  const iosNative = isIOSNative();

  useEffect(() => {
    const loadData = async () => {
      // Se l'utente arriva come ospite, non reindirizzare
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get("guest") === "true") {
        try {
          const gymsData = await base44.entities.Gym.list("-created_date", 6);
          setGyms(gymsData);
        } catch {}
        setLoading(false);
        return;
      }

      try {
        const userData = await base44.auth.me();
        setUser(userData);
        // Se non ha abbonamento attivo, vai all'onboarding
        if (!userData?.subscription_type || userData.subscription_type === "none") {
          navigate(createPageUrl("Onboarding"));
          return;
        }
      } catch (error) {
        // non loggato → onboarding
        navigate(createPageUrl("Onboarding"));
        return;
      }
      try {
        const gymsData = await base44.entities.Gym.list("-created_date", 6);
        setGyms(gymsData);
      } catch {}
      setLoading(false);
    };
    loadData();
  }, []);

  const handleCTAClick = () => {
    if (!user) {
      base44.auth.redirectToLogin(createPageUrl("Home"));
    } else {
      document.getElementById("piani").scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white overflow-x-hidden">

      {/* ─── HERO ─── */}
      <section className="relative min-h-[85vh] md:min-h-screen flex flex-col items-center justify-center text-center px-4 overflow-hidden pt-safe pb-safe">
        {/* Background image */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: "url(https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1600)",
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity: 0.18,
          }}
        />
        {/* Yellow glow */}
        <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-[#0a0a0a]" />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] md:w-[600px] md:h-[600px] rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(232,255,0,0.12) 0%, transparent 70%)",
          }}
        />

        <div className="relative z-10 max-w-3xl mx-auto flex flex-col items-center justify-center flex-1">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="mb-6 md:mb-8 flex justify-center"
          >
            <img
              src="https://media.base44.com/images/public/6900e246d71384c10b97f155/49b0b5056_6cb7a69af_generated_image.png"
              alt="FitAbb"
              className="w-20 h-20 md:w-32 md:h-32 object-contain drop-shadow-2xl rounded-2xl"
            />
          </motion.div>

          {/* Slogan principale */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-3xl md:text-7xl lg:text-8xl font-black tracking-tight leading-tight mb-3 md:mb-4"
          >
            <span style={{ color: "#E8FF00" }}>DOVE VUOI,</span>
            <br />
            <span className="text-white">COME VUOI,</span>
            <br />
            <span style={{ color: "#E8FF00" }}>QUANDO VUOI.</span>
          </motion.h1>

          {/* Sottotitolo */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-base md:text-2xl text-gray-300 mt-4 md:mt-6 mb-6 md:mb-10 font-light px-2"
          >
            1 solo abbonamento,{" "}
            <span className="text-white font-semibold">tantissime palestre</span>
          </motion.p>

          {/* CTA buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.45 }}
            className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center w-full max-w-md"
          >
            <Button
              size="lg"
              className="text-black text-sm md:text-lg font-bold px-6 md:px-10 py-5 md:py-7 rounded-full shadow-2xl hover:opacity-90 transition-opacity w-full"
              style={{ background: "#E8FF00" }}
              onClick={handleCTAClick}
            >
              Esplora i piani
              <ArrowRight className="w-4 h-4 md:w-5 md:h-5 ml-2" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white/30 text-white hover:bg-white/10 text-sm md:text-lg px-6 md:px-10 py-5 md:py-7 rounded-full w-full"
              onClick={() => navigate(createPageUrl("Gyms"))}
            >
              Esplora palestre
            </Button>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="grid grid-cols-3 gap-4 md:gap-6 mt-8 md:mt-20 max-w-sm md:max-w-lg mx-auto"
          >
            {[
              { val: "500+", label: "Palestre" },
              { val: "20", label: "Regioni" },
              { val: "10K+", label: "Membri" },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-2xl md:text-4xl font-black" style={{ color: "#E8FF00" }}>{s.val}</div>
                <div className="text-gray-500 text-xs md:text-sm mt-1">{s.label}</div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 text-gray-500 cursor-pointer"
          onClick={() => document.getElementById("piani").scrollIntoView({ behavior: "smooth" })}
        >
          <ChevronDown className="w-8 h-8" />
        </motion.div>
      </section>

      {/* ─── PIANI ─── */}
      <section id="piani" className="py-16 md:py-24 px-6 bg-[#0a0a0a]">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10 md:mb-16"
          >
            <Badge className="mb-3 md:mb-4 bg-white/5 text-gray-300 border-white/10 px-3 py-1.5 md:px-4 md:py-2 text-xs md:text-sm">
              Abbonamenti
            </Badge>
            <h2 className="text-3xl md:text-6xl font-black mb-3 md:mb-4">
              Scegli il tuo piano
            </h2>
            <p className="text-gray-400 text-base md:text-xl">
              Un abbonamento, libertà totale in tutte le palestre Fit Abb
            </p>
          </motion.div>

          {/* 4 card: scroll orizzontale su mobile, griglia su desktop */}
          <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory -mx-6 px-6 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:overflow-visible sm:pb-0 items-center">

            {subscriptionPlans.map((plan, i) => {
              const Icon = plan.icon;
              const isGoldAnnuale = plan.id === "annuale_gold";
              const isPlusAnnuale = plan.id === "annuale_plus";
              return (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className={`snap-start shrink-0 w-72 sm:w-auto ${plan.highlight ? "lg:-mt-6 z-10" : ""}`}
                >
                  <Card
                    className={`relative overflow-hidden border-0 transition-all duration-300 hover:scale-[1.02] ${
                      isGoldAnnuale
                        ? "shadow-2xl ring-4 ring-[#E8FF00]/60"
                        : isPlusAnnuale
                        ? "shadow-2xl ring-4 ring-white/40"
                        : "bg-[#141414] hover:bg-[#1a1a1a]"
                    }`}
                    style={
                      isGoldAnnuale
                        ? { background: "#E8FF00" }
                        : isPlusAnnuale
                        ? { background: "#1a1a1a" }
                        : {}
                    }
                  >
                    {plan.tag && (
                      <div
                        className="text-xs font-bold tracking-wider px-4 py-2 text-center"
                        style={
                          isGoldAnnuale
                            ? { background: "#000", color: "#E8FF00" }
                            : { background: "#E8FF00", color: "#000" }
                        }
                      >
                        {plan.tag}
                      </div>
                    )}

                    <CardContent className={`p-7 ${plan.highlight ? "pt-5" : "pt-7"}`}>
                      {/* Icon */}
                      <div
                        className={`w-11 h-11 rounded-xl flex items-center justify-center mb-5 ${
                          isGoldAnnuale ? "bg-black/15" : "bg-white/5"
                        }`}
                      >
                        <Icon className={`w-5 h-5 ${isGoldAnnuale ? "text-black" : "text-[#E8FF00]"}`} />
                      </div>

                      {/* Name */}
                      <h3 className={`text-lg font-bold mb-1 ${isGoldAnnuale ? "text-black" : "text-white"}`}>
                        {plan.name}
                      </h3>

                      {/* Price */}
                      {!iosNative && (
                        <>
                          <div className="mb-1">
                            <span className={`text-5xl font-black ${isGoldAnnuale ? "text-black" : "text-white"}`}>
                              €{plan.price}
                            </span>
                            <span className={`text-base ml-2 ${isGoldAnnuale ? "text-black/60" : "text-gray-500"}`}>
                              /{plan.period}
                            </span>
                          </div>
                          {plan.priceNote && (
                            <div className={`font-bold text-xs mb-3 ${isGoldAnnuale ? "text-black" : "text-[#E8FF00]"}`}>
                              {plan.priceNote}
                            </div>
                          )}
                        </>
                      )}

                      {/* Description */}
                      <p className={`text-xs mb-5 leading-relaxed ${isGoldAnnuale ? "text-black/80" : "text-gray-400"}`}>
                        {plan.description}
                      </p>

                      {/* Benefits */}
                      <ul className="space-y-2 mb-7">
                        {plan.benefits.map((b, idx) => (
                          <li key={idx} className="flex items-center gap-2">
                            <div
                              className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${
                                isGoldAnnuale ? "bg-black/20" : "bg-[#E8FF00]/10"
                              }`}
                            >
                              <Check className={`w-2.5 h-2.5 ${isGoldAnnuale ? "text-black" : "text-[#E8FF00]"}`} />
                            </div>
                            <span className={`text-xs ${isGoldAnnuale ? "text-black" : "text-gray-300"}`}>{b}</span>
                          </li>
                        ))}
                      </ul>

                      {/* CTA */}
                      {iosNative ? (
                        <Button
                          size="sm"
                          className={`w-full rounded-full font-bold py-5 text-sm transition-all ${
                            isGoldAnnuale
                              ? "bg-black text-[#E8FF00] hover:bg-gray-900"
                              : "bg-[#E8FF00] text-black hover:opacity-90"
                          }`}
                          onClick={() => window.open("https://fitabb.com", "_blank")}
                        >
                          Scopri su fitabb.com
                          <ArrowRight className="w-3 h-3 ml-1" />
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          className={`w-full rounded-full font-bold py-5 text-sm transition-all ${
                            isGoldAnnuale
                              ? "bg-black text-[#E8FF00] hover:bg-gray-900"
                              : "bg-[#E8FF00] text-black hover:opacity-90"
                          }`}
                          onClick={handleCTAClick}
                        >
                          Scegli questo piano
                          <ArrowRight className="w-3 h-3 ml-1" />
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          {/* Sotto i piani */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mt-12"
          >
            <p className="text-gray-500 mb-6">Hai già un abbonamento? Accedi al tuo profilo</p>
            <Button
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10 rounded-full px-8"
              onClick={() => navigate(createPageUrl("ClientDashboard"))}
            >
              Vai al mio profilo
            </Button>
          </motion.div>
        </div>
      </section>

      {/* ─── COME FUNZIONA ─── */}
      <section className="py-16 md:py-24 px-6 bg-black">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10 md:mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-black mb-3 md:mb-4">Come funziona</h2>
            <p className="text-gray-400 text-base md:text-lg">3 passi per iniziare ad allenarti ovunque</p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-8 md:gap-12">
            {[
              { num: "01", title: "Scegli il piano", desc: "Seleziona l'abbonamento più adatto alle tue esigenze e al tuo budget." },
              { num: "02", title: "Trova la palestra", desc: "Cerca tra centinaia di palestre convenzionate vicino a te in tutta Italia." },
              { num: "03", title: "Allenati", desc: "Mostra il tuo QR code all'ingresso e accedi. Nessuna burocrazia." },
            ].map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="text-center"
              >
                <div
                  className="text-5xl md:text-6xl font-black mb-3 md:mb-4 block"
                  style={{ color: "#E8FF00", opacity: 0.3 }}
                >
                  {step.num}
                </div>
                <h3 className="text-lg md:text-xl font-bold text-white mb-2 md:mb-3">{step.title}</h3>
                <p className="text-gray-400 text-sm md:text-base">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PALESTRE ─── */}
      {gyms.length > 0 && (
        <section className="py-16 md:py-24 px-6 bg-[#0a0a0a]">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex flex-col md:flex-row md:items-end justify-between mb-8 md:mb-12 gap-4"
            >
              <div>
                <h2 className="text-3xl md:text-5xl font-black mb-2">Palestre convenzionate</h2>
                <p className="text-gray-400 text-base md:text-lg">Alcune delle strutture che ti aspettano</p>
              </div>
              <Button
                variant="outline"
                onClick={() => navigate(createPageUrl("Gyms"))}
                className="border-white/20 text-white hover:bg-white/10 rounded-full px-4 md:px-6 py-2 text-sm md:text-base self-start md:self-auto"
              >
                Esplora palestre convenzionate
                <ArrowRight className="w-3 h-3 md:w-4 md:h-4 ml-2" />
              </Button>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {gyms.slice(0, 6).map((gym, i) => (
                <motion.div
                  key={gym.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.07 }}
                  whileHover={{ y: -6 }}
                  className="cursor-pointer"
                  onClick={() => navigate(`${createPageUrl("GymDetail")}?id=${gym.id}`)}
                >
                  <Card className="overflow-hidden bg-[#141414] border-white/5 hover:border-[#E8FF00]/30 transition-all group">
                    <div className="relative h-48 bg-black overflow-hidden">
                      {gym.photos?.[0] ? (
                        <img
                          src={gym.photos[0]}
                          alt={gym.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-white/5 to-white/[0.02]">
                          <Building2 className="w-12 h-12 text-white/10" />
                        </div>
                      )}
                      {gym.google_rating && (
                        <div className="absolute top-3 right-3 bg-black/80 backdrop-blur-sm rounded-full px-3 py-1 flex items-center gap-1">
                          <Star className="w-3 h-3 fill-[#E8FF00] text-[#E8FF00]" />
                          <span className="text-xs font-bold text-white">{gym.google_rating}</span>
                        </div>
                      )}
                    </div>
                    <CardContent className="p-5">
                      <h3 className="font-bold text-white mb-1">{gym.name}</h3>
                      <div className="flex items-center gap-1 text-gray-500 text-sm">
                        <MapPin className="w-3 h-3" />
                        {gym.city}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── FINAL CTA ─── */}
      <section className="py-20 md:py-32 px-6 relative overflow-hidden" style={{ background: "#E8FF00" }}>
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-6xl font-black text-black mb-4 md:mb-6 leading-tight">
              Inizia oggi.<br />1€ al giorno.
            </h2>
            <p className="text-black/70 text-base md:text-xl mb-8 md:mb-10">
              Unisciti a migliaia di persone che si allenano già con Fit Abb
            </p>
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center">
              <Button
                size="lg"
                className="bg-black text-[#E8FF00] hover:bg-gray-900 text-sm md:text-lg font-bold px-8 md:px-12 py-6 md:py-8 rounded-full shadow-xl"
                onClick={handleCTAClick}
              >
                Esplora i piani di abbonamento
                <ArrowRight className="w-4 h-4 md:w-6 md:h-6 ml-2 md:ml-3" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-black/30 text-black hover:bg-black/10 text-sm md:text-lg px-8 md:px-10 py-6 md:py-8 rounded-full"
                onClick={() => navigate(createPageUrl("Gyms"))}
              >
                Esplora palestre convenzionate
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}