import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, Gift, Euro, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createPageUrl } from "@/utils";

export default function PromoPopup({ onClose }) {
  const navigate = useNavigate();
  const [closed, setClosed] = useState(false);

  const handleClose = () => {
    setClosed(true);
    setTimeout(() => onClose(), 300);
  };

  const handleSubscribe = () => {
    handleClose();
    navigate(createPageUrl("Auth") + "?mode=register&type=client");
  };

  const handleGuest = () => {
    handleClose();
    navigate("/");
  };

  return (
    <AnimatePresence>
      {!closed && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] border border-[#E8FF00]/30 rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>

            {/* Icon */}
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[#E8FF00]/10 flex items-center justify-center">
              <Gift className="w-8 h-8 text-[#E8FF00]" />
            </div>

            {/* Title */}
            <h2 className="text-2xl md:text-3xl font-black text-white text-center mb-2">
              Offerta Speciale!
            </h2>
            <p className="text-gray-400 text-center text-sm mb-6">
              Solo per i nuovi iscritti
            </p>

            {/* Promo box */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 mb-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-[#E8FF00]/20 flex items-center justify-center">
                  <Euro className="w-5 h-5 text-[#E8FF00]" />
                </div>
                <div>
                  <p className="text-white font-bold text-lg">Primo mese GRATIS</p>
                  <p className="text-gray-500 text-xs">Paga solo l'iscrizione</p>
                </div>
              </div>

              <div className="flex items-center justify-between bg-black/30 rounded-xl p-3">
                <span className="text-gray-400 text-sm">Solo oggi:</span>
                <div className="text-right">
                  <span className="text-gray-500 line-through text-sm mr-2">€40</span>
                  <span className="text-[#E8FF00] font-black text-xl">€20</span>
                </div>
              </div>
            </div>

            {/* Benefits */}
            <ul className="space-y-2 mb-6">
              {[
                "Accesso illimitato alle palestre partner",
                "AI Workout Planner incluso",
                "Nessun impegno dopo il primo mese",
              ].map((benefit, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-gray-300">
                  <Check className="w-4 h-4 text-[#E8FF00]" />
                  {benefit}
                </li>
              ))}
            </ul>

            {/* CTA Primaria */}
            <Button
              size="lg"
              className="w-full bg-[#E8FF00] text-black font-bold text-base py-6 rounded-full hover:opacity-90 transition-opacity shadow-lg mb-3"
              onClick={handleSubscribe}
            >
              <Gift className="w-5 h-5 mr-2" />
              Iscriviti Subito!
            </Button>

            {/* CTA Secondaria - Ospite */}
            <button
              onClick={handleGuest}
              className="w-full text-gray-400 text-sm py-3 hover:text-white transition-colors flex items-center justify-center gap-2"
            >
              Continua come ospite
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Footer note */}
            <p className="text-center text-gray-500 text-xs mt-4">
              Offerta valida solo per il primo abbonamento
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}