import React from "react";
import { Building2, Users, MapPin, Star } from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { createPageUrl } from "@/utils";

export default function GymsListView({ 
  viewMode, searchType, filteredGyms, filteredUsers, 
  clearFilters, getGymMinPrice, navigate 
}) {
  if (viewMode === "list" && searchType === "gyms") {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        {filteredGyms.length === 0 ? (
          <div className="text-center py-16">
            <Building2 className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-white mb-2">Nessuna palestra trovata</h3>
            <p className="text-gray-500 text-sm mb-4">Prova a modificare i filtri</p>
            <Button variant="outline" onClick={clearFilters} className="h-11 px-6 touch-manipulation">
              Cancella filtri
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredGyms.map((gym, index) => {
              const minPrice = getGymMinPrice(gym.id);
              return (
                <motion.div
                  key={gym.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Card className="overflow-hidden cursor-pointer active:scale-[0.98] transition-all h-full bg-[#1a1a1a] border-white/10 touch-manipulation"
                    onClick={() => navigate(`${createPageUrl("GymDetail")}?id=${gym.id}`)}>
                    <div className="relative h-48 bg-black overflow-hidden">
                      {gym.photos?.[0] ? (
                        <img src={gym.photos[0]} alt={gym.name} className="w-full h-full object-cover active:scale-105 transition-transform" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-white/5 to-white/[0.02]">
                          <Building2 className="w-16 h-16 text-white/10" />
                        </div>
                      )}
                      {gym.google_rating && (
                        <div className="absolute top-3 right-3 bg-black/80 backdrop-blur-sm rounded-full px-2.5 py-1 flex items-center gap-1">
                          <Star className="w-3.5 h-3.5 fill-[#E8FF00] text-[#E8FF00]" />
                          <span className="text-xs font-bold text-white">{gym.google_rating}</span>
                        </div>
                      )}
                      {minPrice && (
                        <div className="absolute bottom-3 left-3 bg-[#E8FF00] text-black rounded-lg px-2.5 py-1.5 shadow-lg">
                          <span className="text-xs font-bold">Da €{minPrice}/mese</span>
                        </div>
                      )}
                    </div>
                    <CardContent className="p-4 space-y-3">
                      <div>
                        <h3 className="font-bold text-base mb-2 text-white">{gym.name}</h3>
                        <div className="flex items-center gap-1.5 text-gray-400 text-sm">
                          <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                          <span className="truncate">{gym.city}</span>
                        </div>
                        {gym.amenities && gym.amenities.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {gym.amenities.slice(0, 3).map((amenity, i) => (
                              <Badge key={i} variant="secondary" className="text-[10px] px-2 py-0.5 h-auto">
                                {amenity}
                              </Badge>
                            ))}
                            {gym.amenities.length > 3 && (
                              <Badge variant="outline" className="text-[10px] px-2 py-0.5 h-auto">
                                +{gym.amenities.length - 3}
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`${createPageUrl("CheckIn")}?gym_id=${gym.id}`);
                        }}
                        className="w-full bg-[#E8FF00] hover:bg-[#E8FF00]/90 text-black font-semibold h-11 touch-manipulation"
                      >
                        💪 Allenati
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  if (viewMode === "list" && searchType === "users") {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        {filteredUsers.length === 0 ? (
          <div className="text-center py-16">
            <Users className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-white mb-2">Nessun cliente trovato</h3>
            <p className="text-gray-500 text-sm mb-4">Prova a modificare i filtri</p>
            <Button variant="outline" onClick={clearFilters} className="h-11 px-6 touch-manipulation">
              Cancella filtri
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredUsers.map((user, index) => (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card className="overflow-hidden h-full bg-[#1a1a1a] border-white/10 touch-manipulation">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold" style={{ background: "#E8FF00" }}>
                        {user.full_name?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-base text-white">{user.full_name || "Utente"}</h3>
                        {user.city && (
                          <div className="flex items-center gap-1 text-gray-400 text-sm">
                            <MapPin className="w-3 h-3" />
                            <span>{user.city}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/10">
                      <div className="text-center">
                        <div className="text-lg font-bold text-[#E8FF00]">{user.completed_workouts || 0}</div>
                        <div className="text-xs text-gray-500">Allenamenti</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-[#E8FF00]">{user.level || 1}</div>
                        <div className="text-xs text-gray-500">Livello</div>
                      </div>
                    </div>
                    {user.subscription_type && user.subscription_type !== "none" && (
                      <Badge className="w-full justify-center text-black font-bold text-xs px-3" style={{ background: "#E8FF00" }}>
                        {user.subscription_type.toUpperCase()}
                      </Badge>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return null;
}