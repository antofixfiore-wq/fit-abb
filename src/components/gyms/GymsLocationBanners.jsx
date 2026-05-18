import React from "react";
import { Navigation, X, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GymsLocationBanners({ locationStatus, nearbyOnly, filteredGyms, setNearbyOnly, setSortBy }) {
  return (
    <>
      {locationStatus === "loading" && (
        <div className="max-w-7xl mx-auto px-6 pt-4">
          <div className="bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3 flex items-center gap-3 text-sm text-gray-400">
            <div className="w-4 h-4 border-2 border-[#E8FF00] border-t-transparent rounded-full animate-spin" />
            Ricerca palestre vicino a te...
          </div>
        </div>
      )}
      {locationStatus === "granted" && nearbyOnly && (
        <div className="max-w-7xl mx-auto px-6 pt-4">
          <div className="bg-[#E8FF00]/10 border border-[#E8FF00]/30 rounded-xl px-4 py-3 flex items-center justify-between gap-3 text-sm">
            <div className="flex items-center gap-2 text-[#E8FF00]">
              <Navigation className="w-4 h-4" />
              <span className="font-semibold">Palestre entro 10 km da te</span>
              <span className="text-[#E8FF00]/70">— {filteredGyms.length} trovate</span>
            </div>
            <button
              onClick={() => { setNearbyOnly(false); setSortBy("rating"); }}
              className="text-gray-400 hover:text-white flex items-center gap-1 text-xs"
            >
              <X className="w-3 h-3" /> Mostra tutte
            </button>
          </div>
        </div>
      )}
      {locationStatus === "denied" && (
        <div className="max-w-7xl mx-auto px-6 pt-4">
          <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 flex items-center gap-3 text-sm text-gray-500">
            <MapPin className="w-4 h-4" />
            Posizione non disponibile — mostriamo tutte le palestre
          </div>
        </div>
      )}
    </>
  );
}