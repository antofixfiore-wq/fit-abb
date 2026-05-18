import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Shield, MapPin, Users, Eye, Check } from "lucide-react";

export default function PrivacyOnboarding() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState("friends_only");
  const [loading, setLoading] = useState(false);

  const handleContinue = async () => {
    setLoading(true);
    try {
      const settings = {
        isPublic: selected === "public",
        geolocationAllowed: selected === "nearby",
        nearbyDiscoveryAllowed: selected === "nearby",
        allowFriendRequests: true,
        allowComments: true
      };

      await base44.auth.updateMe(settings);

      // Log consenso
      await base44.entities.UserConsent.create({
        user_email: (await base44.auth.me()).email,
        geolocation_allowed: selected === "nearby",
        nearby_discovery_allowed: selected === "nearby",
        public_profile_allowed: selected === "public",
        version: "1.0",
        timestamp: new Date().toISOString()
      });

      navigate("/Community");
    } catch (error) {
      console.error("Error saving privacy settings:", error);
    }
    setLoading(false);
  };

  const handleSkip = () => {
    navigate("/Community");
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-lg w-full"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-[#E8FF00] flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-black" />
          </div>
          <h1 className="text-3xl font-black text-white mb-2">Privacy e Visibilità</h1>
          <p className="text-gray-400">Scegli come vuoi partecipare alla community</p>
        </div>

        <div className="space-y-3 mb-6">
          {/* Option 1: Solo GymFriends */}
          <Card 
            className={`bg-[#111] border-2 cursor-pointer transition-all ${
              selected === "friends_only" 
                ? "border-[#E8FF00]" 
                : "border-white/5 hover:border-white/10"
            }`}
            onClick={() => setSelected("friends_only")}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  selected === "friends_only" ? "bg-[#E8FF00]" : "bg-white/5"
                }`}>
                  <Users className={`w-5 h-5 ${
                    selected === "friends_only" ? "text-black" : "text-gray-400"
                  }`} />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-white">Solo GymFriends</p>
                  <p className="text-sm text-gray-500">I tuoi post sono visibili solo ai tuoi amici</p>
                </div>
                {selected === "friends_only" && (
                  <Check className="w-5 h-5 text-[#E8FF00]" />
                )}
              </div>
            </CardContent>
          </Card>

          {/* Option 2: GymFriends + Vicino */}
          <Card 
            className={`bg-[#111] border-2 cursor-pointer transition-all ${
              selected === "nearby" 
                ? "border-[#E8FF00]" 
                : "border-white/5 hover:border-white/10"
            }`}
            onClick={() => setSelected("nearby")}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  selected === "nearby" ? "bg-[#E8FF00]" : "bg-white/5"
                }`}>
                  <MapPin className={`w-5 h-5 ${
                    selected === "nearby" ? "text-black" : "text-gray-400"
                  }`} />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-white">GymFriends + Vicino a me</p>
                  <p className="text-sm text-gray-500">Scopri e fatti scoprire da utenti nelle vicinanze</p>
                </div>
                {selected === "nearby" && (
                  <Check className="w-5 h-5 text-[#E8FF00]" />
                )}
              </div>
            </CardContent>
          </Card>

          {/* Option 3: Preferisco non partecipare */}
          <Card 
            className={`bg-[#111] border-2 cursor-pointer transition-all ${
              selected === "skip" 
                ? "border-[#E8FF00]" 
                : "border-white/5 hover:border-white/10"
            }`}
            onClick={() => setSelected("skip")}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  selected === "skip" ? "bg-[#E8FF00]" : "bg-white/5"
                }`}>
                  <Eye className={`w-5 h-5 ${
                    selected === "skip" ? "text-black" : "text-gray-400"
                  }`} />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-white">Preferisco non partecipare ora</p>
                  <p className="text-sm text-gray-500">Potrai cambiare idea in qualsiasi momento</p>
                </div>
                {selected === "skip" && (
                  <Check className="w-5 h-5 text-[#E8FF00]" />
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Info box */}
        <Card className="bg-white/5 border-white/10 mb-6">
          <CardContent className="p-4">
            <p className="text-xs text-gray-400 leading-relaxed">
              <strong className="text-white">Condividendo questo Workout Moment,</strong> pubblichi foto e testo, 
              e se selezionato il nome palestra, secondo la visibilità scelta. 
              Puoi cambiare visibilità o cancellare in qualsiasi momento.
            </p>
            <p className="text-xs text-gray-400 leading-relaxed mt-2">
              <strong className="text-white">Usiamo la tua posizione,</strong> solo con consenso, 
              per suggerire contenuti vicini in modo approssimativo. 
              Non mostriamo la posizione precisa.
            </p>
          </CardContent>
        </Card>

        <div className="space-y-3">
          <Button 
            onClick={handleContinue} 
            disabled={loading || selected === "skip"}
            className="w-full font-bold text-black"
            style={{ background: "#E8FF00" }}
          >
            {loading ? "Salvataggio..." : "Continua"}
          </Button>
          
          {selected === "skip" && (
            <Button 
              onClick={handleSkip}
              variant="outline"
              className="w-full border-white/10 text-white hover:bg-white/5"
            >
              Vai alla Community
            </Button>
          )}
        </div>
      </motion.div>
    </div>
  );
}