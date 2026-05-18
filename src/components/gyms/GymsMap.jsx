import React, { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Building2 } from "lucide-react";

// Fix default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const userIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-yellow.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

function RecenterMap({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.setView(center, 12);
  }, [center]);
  return null;
}

export default function GymsMap({ gyms, userLocation }) {
  const navigate = useNavigate();

  // Default center: Italia
  const defaultCenter = userLocation
    ? [userLocation.lat, userLocation.lng]
    : [41.9, 12.5];

  const gymsWithCoords = gyms.filter(g => g.latitude && g.longitude);

  if (gymsWithCoords.length === 0 && !userLocation) {
    return (
      <div className="w-full h-[500px] md:h-[600px] rounded-xl overflow-hidden border border-white/10 flex items-center justify-center bg-[#1a1a1a]">
        <div className="text-center text-white text-sm">
          <Building2 className="w-16 h-16 mx-auto mb-4 text-gray-600" />
          <p>Nessuna palestra disponibile</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[500px] md:h-[600px] rounded-xl overflow-hidden border border-white/10">
      <MapContainer
        center={defaultCenter}
        zoom={userLocation ? 12 : 6}
        style={{ height: "100%", width: "100%" }}
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {userLocation && (
          <RecenterMap center={[userLocation.lat, userLocation.lng]} />
        )}

        {/* Posizione utente */}
        {userLocation && (
          <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
            <Popup>
              <div className="text-sm font-semibold">📍 Sei qui</div>
            </Popup>
          </Marker>
        )}

        {/* Palestre */}
        {gymsWithCoords.map(gym => (
          <Marker key={gym.id} position={[gym.latitude, gym.longitude]}>
            <Popup>
              <div className="min-w-[180px]">
                {gym.photos?.[0] && (
                  <img src={gym.photos[0]} alt={gym.name} className="w-full h-24 object-cover rounded mb-2" />
                )}
                <p className="font-bold text-sm">{gym.name}</p>
                <p className="text-xs text-gray-500 mb-2">{gym.city} — {gym.address}</p>
                {gym.google_rating && (
                  <p className="text-xs mb-2">⭐ {gym.google_rating}</p>
                )}
                <button
                  onClick={() => navigate(`${createPageUrl("GymDetail")}?id=${gym.id}`)}
                  className="w-full bg-black text-yellow-300 text-xs font-semibold py-1.5 px-3 rounded hover:bg-gray-800 transition"
                >
                  Vedi dettagli →
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {gymsWithCoords.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60 text-white text-sm pointer-events-none">
          Nessuna palestra con coordinate disponibile
        </div>
      )}
    </div>
  );
}