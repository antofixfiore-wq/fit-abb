import React from "react";
import { Building2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import GymsMap from "@/components/gyms/GymsMap";

export default function GymsMapView({ viewMode, searchType, gyms, userLocation, setViewMode }) {
  if (viewMode === "map" && searchType === "gyms") {
    return (
      <div className="max-w-7xl mx-auto px-6 py-6">
        {gyms.length > 0 ? (
          <GymsMap gyms={gyms} userLocation={userLocation} />
        ) : (
          <div className="text-center py-20">
            <Building2 className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Nessuna palestra disponibile</h3>
            <p className="text-gray-500">Non ci sono palestre nel database</p>
          </div>
        )}
        {!userLocation && gyms.length > 0 && (
          <p className="text-center text-gray-500 text-xs mt-2">
            Abilita la geolocalizzazione per vedere le palestre vicino a te
          </p>
        )}
      </div>
    );
  }

  if (viewMode === "map" && searchType === "users") {
    return (
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="text-center py-20">
          <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">Mappa non disponibile</h3>
          <p className="text-gray-500">La visualizzazione mappa è disponibile solo per le palestre</p>
          <Button variant="outline" onClick={() => setViewMode("list")} className="mt-4">
            Passa alla lista
          </Button>
        </div>
      </div>
    );
  }

  return null;
}