import React from "react";
import { Link } from "react-router-dom";
import { CheckCircle, Zap, MapPin, BarChart2, Users, Shield, Star } from "lucide-react";

const FEATURES = [
  {
    icon: MapPin,
    title: "Rete di palestre",
    desc: "Accedi a centinaia di palestre partner in tutta Italia con un solo abbonamento.",
  },
  {
    icon: Zap,
    title: "Check-in immediato",
    desc: "QR code o codice numerico per entrare in palestra in meno di 5 secondi.",
  },
  {
    icon: BarChart2,
    title: "Tracking fitness",
    desc: "Monitora peso, calorie, passi, sonno e allenamenti in un unico posto.",
  },
  {
    icon: Users,
    title: "Personal Trainer",
    desc: "Acquista schede, piani nutrizionali e coaching da PT verificati.",
  },
  {
    icon: Shield,
    title: "Sicuro e certificato",
    desc: "Pagamenti sicuri con Stripe, dati protetti secondo GDPR.",
  },
  {
    icon: Star,
    title: "Gamification",
    desc: "Sblocca badge, scala classifiche e rimani motivato ogni giorno.",
  },
];

const PLANS = [
  {
    name: "Gold",
    badge: "bg-yellow-300 text-black",
    features: ["Palestre Gold", "AI Workout planner", "Badge & rewards", "Community"],
  },
  {
    name: "Plus",
    badge: "bg-[#E8FF00] text-black",
    features: ["Palestre Gold + Platinum", "AI Workout planner", "Badge & rewards", "Community"],
    highlight: true,
  },
  {
    name: "Platinum",
    badge: "bg-blue-200 text-blue-900",
    features: ["Tutte le palestre", "Supporto prioritario", "Coaching 1-1", "VIP eventi"],
  },
];

export default function AppStoreLanding() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Nav */}
      <nav className="border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img
            src="https://media.base44.com/images/public/6900e246d71384c10b97f155/49b0b5056_6cb7a69af_generated_image.png"
            alt="Fit ABB"
            className="w-9 h-9 object-contain"
          />
          <span className="font-bold text-lg">Fit ABB</span>
        </div>
        <div className="flex items-center gap-6 text-sm text-gray-400">
          <Link to="/privacy" className="hover:text-white transition-colors">Privacy</Link>
          <Link to="/terms" className="hover:text-white transition-colors">Termini</Link>
          <a href="mailto:supporto@fit-abb.com" className="hover:text-white transition-colors">Supporto</a>
        </div>
      </nav>

      {/* Hero */}
      <section className="px-6 py-20 text-center max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-[#E8FF00]/10 border border-[#E8FF00]/30 rounded-full px-4 py-1.5 text-[#E8FF00] text-sm font-medium mb-8">
          <Zap className="w-4 h-4" /> Disponibile su iOS e Android
        </div>
        <h1 className="text-5xl md:text-6xl font-extrabold leading-tight mb-6">
          Una palestra?<br />
          <span className="text-[#E8FF00]">Tutte le palestre.</span>
        </h1>
        <p className="text-gray-400 text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
          Fit ABB è l'app che ti dà accesso a una rete crescente di palestre in Italia,
          con un unico abbonamento mensile. Allena dove vuoi, quando vuoi.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="#"
            className="flex items-center justify-center gap-3 bg-white text-black font-semibold px-6 py-3 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <img src="https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg" alt="Apple" className="w-5 h-5" />
            App Store
          </a>
          <a
            href="#"
            className="flex items-center justify-center gap-3 bg-[#E8FF00] text-black font-semibold px-6 py-3 rounded-xl hover:bg-yellow-300 transition-colors"
          >
            <img src="https://upload.wikimedia.org/wikipedia/commons/d/d0/Google_Play_Arrow_logo.svg" alt="Google Play" className="w-5 h-5" />
            Google Play
          </a>
        </div>
      </section>

      {/* Video Section */}
      <section className="px-6 py-12 max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-3">Come funziona Fit ABB</h2>
          <p className="text-gray-400">Scopri quanto è semplice accedere a tutte le palestre d'Italia</p>
        </div>
        <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-[#E8FF00]/5">
          <video
            src="https://media.base44.com/videos/public/6900e246d71384c10b97f155/d63128cd0_generated_video.mp4"
            controls
            autoPlay
            muted
            loop
            playsInline
            className="w-full aspect-video object-cover"
          >
            Il tuo browser non supporta il video.
          </video>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 py-16 max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12">Tutto quello che ti serve</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((f) => {
            const Icon = f.icon;
            return (
              <div key={f.title} className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-[#E8FF00]/40 transition-colors">
                <div className="w-10 h-10 bg-[#E8FF00]/10 rounded-xl flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-[#E8FF00]" />
                </div>
                <h3 className="font-semibold text-white mb-2">{f.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Plans */}
      <section className="px-6 py-16 max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12">Scegli il tuo piano</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={`bg-white/5 border rounded-2xl p-6 ${plan.highlight ? "border-[#E8FF00]/60 ring-1 ring-[#E8FF00]/30" : "border-white/10"}`}
            >
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold mb-4 ${plan.badge}`}>
                {plan.name}
              </span>
              <ul className="space-y-2 mt-4">
                {plan.features.map((feat) => (
                  <li key={feat} className="flex items-center gap-2 text-sm text-gray-300">
                    <CheckCircle className="w-4 h-4 text-[#E8FF00] flex-shrink-0" />
                    {feat}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* App Info for stores */}
      <section className="px-6 py-16 max-w-3xl mx-auto text-center">
        <h2 className="text-2xl font-bold mb-4">Informazioni app</h2>
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-left space-y-3 text-sm text-gray-300">
          <div className="flex justify-between"><span className="text-gray-500">Versione</span><span>1.0.0</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Classificazione età</span><span>4+ (nessun contenuto inappropriato)</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Categoria</span><span>Salute e Fitness</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Lingua</span><span>Italiano</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Supporto</span><span><a href="mailto:supporto@fit-abb.com" className="text-[#E8FF00]">supporto@fit-abb.com</a></span></div>
          <div className="flex justify-between"><span className="text-gray-500">Privacy Policy</span><span><Link to="/privacy" className="text-[#E8FF00]">Leggi qui</Link></span></div>
          <div className="flex justify-between"><span className="text-gray-500">Termini</span><span><Link to="/terms" className="text-[#E8FF00]">Leggi qui</Link></span></div>
          <div className="flex justify-between"><span className="text-gray-500">Eliminazione account</span><span><Link to="/delete-account" className="text-[#E8FF00]">Richiedi qui</Link></span></div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 px-6 py-8 text-center text-gray-500 text-sm">
        <p className="mb-3">
          <Link to="/privacy" className="hover:text-white mx-3">Privacy Policy</Link>
          <Link to="/terms" className="hover:text-white mx-3">Termini e Condizioni</Link>
          <Link to="/delete-account" className="hover:text-white mx-3">Elimina Account</Link>
          <a href="mailto:supporto@fit-abb.com" className="hover:text-white mx-3">Supporto</a>
        </p>
        <p>© {new Date().getFullYear()} Fit ABB. Tutti i diritti riservati.</p>
      </footer>
    </div>
  );
}