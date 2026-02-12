import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, MapPin, Star, Award, TrendingUp, Users } from "lucide-react";
import { motion } from "framer-motion";

export default function PersonalTrainers() {
  const navigate = useNavigate();
  const [trainers, setTrainers] = useState([]);
  const [services, setServices] = useState([]);
  const [filteredTrainers, setFilteredTrainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [cityFilter, setCityFilter] = useState("all");
  const [specializationFilter, setSpecializationFilter] = useState("all");

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterTrainers();
  }, [searchTerm, cityFilter, specializationFilter, trainers]);

  const loadData = async () => {
    try {
      const [trainersData, servicesData] = await Promise.all([
        base44.entities.PersonalTrainer.list("-total_sales"),
        base44.entities.PTService.filter({ is_active: true })
      ]);
      setTrainers(trainersData);
      setServices(servicesData);
      setFilteredTrainers(trainersData);
    } catch (error) {
      console.error("Error loading data:", error);
    }
    setLoading(false);
  };

  const filterTrainers = () => {
    let filtered = trainers;

    if (searchTerm) {
      filtered = filtered.filter(trainer =>
        trainer.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trainer.bio?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trainer.specializations?.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (cityFilter !== "all") {
      filtered = filtered.filter(trainer => trainer.city === cityFilter);
    }

    if (specializationFilter !== "all") {
      filtered = filtered.filter(trainer =>
        trainer.specializations?.includes(specializationFilter)
      );
    }

    setFilteredTrainers(filtered);
  };

  const getTrainerServices = (ptEmail) => {
    return services.filter(s => s.pt_email === ptEmail);
  };

  const getUniqueCities = () => {
    return [...new Set(trainers.map(t => t.city).filter(Boolean))].sort();
  };

  const getUniqueSpecializations = () => {
    const specs = trainers.flatMap(t => t.specializations || []);
    return [...new Set(specs)].sort();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0a0a0a]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Header */}
      <div className="bg-black text-white py-16 px-6 border-b border-white/10">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl md:text-5xl font-black mb-4">Personal Trainer</h1>
            <p className="text-xl text-gray-400">
              Trova il tuo coach perfetto tra {trainers.length} professionisti certificati
            </p>
          </motion.div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-[#1a1a1a] border-b border-white/10 sticky top-0 z-10 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Cerca per nome o specializzazione..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white/5 border-white/10 text-white"
              />
            </div>
            <Select value={cityFilter} onValueChange={setCityFilter}>
              <SelectTrigger className="w-full md:w-[200px] bg-white/5 border-white/10 text-white">
                <SelectValue placeholder="Città" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tutte le città</SelectItem>
                {getUniqueCities().map(city => (
                  <SelectItem key={city} value={city}>{city}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={specializationFilter} onValueChange={setSpecializationFilter}>
              <SelectTrigger className="w-full md:w-[200px] bg-white/5 border-white/10 text-white">
                <SelectValue placeholder="Specializzazione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tutte</SelectItem>
                {getUniqueSpecializations().map(spec => (
                  <SelectItem key={spec} value={spec}>{spec}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Trainers Grid */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {filteredTrainers.length === 0 ? (
          <div className="text-center py-20">
            <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              Nessun trainer trovato
            </h3>
            <p className="text-gray-400">Prova a modificare i filtri di ricerca</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTrainers.map((trainer, index) => {
              const trainerServices = getTrainerServices(trainer.user_email);
              const minPrice = trainerServices.length > 0 ? Math.min(...trainerServices.map(s => s.price)) : null;

              return (
                <motion.div
                  key={trainer.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  whileHover={{ y: -5 }}
                >
                  <Card
                    className="overflow-hidden cursor-pointer hover:scale-105 transition-all duration-300 bg-[#1a1a1a] border-white/10 group h-full"
                    onClick={() => navigate(`${createPageUrl("PTProfile")}?id=${trainer.id}`)}
                  >
                    {/* Cover Image */}
                    <div className="relative h-40 bg-gradient-to-br from-blue-600 to-orange-600 overflow-hidden">
                      {trainer.cover_image_url && (
                        <img
                          src={trainer.cover_image_url}
                          alt={trainer.full_name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      )}
                      {trainer.is_verified && (
                        <div className="absolute top-4 right-4 bg-blue-600 text-white rounded-full px-3 py-1 flex items-center gap-1 shadow-lg">
                          <Award className="w-3 h-3" />
                          <span className="text-xs font-semibold">Verificato</span>
                        </div>
                      )}
                    </div>

                    {/* Profile Image */}
                    <div className="relative -mt-12 px-6">
                      <div className="w-24 h-24 rounded-full border-4 border-[#1a1a1a] overflow-hidden bg-gray-800">
                        {trainer.profile_image_url ? (
                          <img
                            src={trainer.profile_image_url}
                            alt={trainer.full_name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-orange-500 text-white text-2xl font-bold">
                            {trainer.full_name?.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                    </div>

                    <CardContent className="p-6 pt-4">
                      <h3 className="font-bold text-xl text-white mb-1">{trainer.full_name}</h3>
                      
                      <div className="flex items-center gap-2 text-gray-400 mb-3">
                        <MapPin className="w-4 h-4" />
                        <span className="text-sm">{trainer.city}</span>
                      </div>

                      {trainer.rating > 0 && (
                        <div className="flex items-center gap-2 mb-3">
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                            <span className="text-white font-semibold">{trainer.rating.toFixed(1)}</span>
                          </div>
                          <span className="text-gray-500 text-sm">({trainer.total_reviews} recensioni)</span>
                        </div>
                      )}

                      {trainer.bio && (
                        <p className="text-gray-400 text-sm mb-4 line-clamp-2">{trainer.bio}</p>
                      )}

                      {trainer.specializations && trainer.specializations.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {trainer.specializations.slice(0, 3).map((spec, i) => (
                            <Badge key={i} className="bg-white/10 text-white border-white/20 text-xs">
                              {spec}
                            </Badge>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-4 border-t border-white/10">
                        <div className="flex items-center gap-2 text-gray-400 text-sm">
                          <TrendingUp className="w-4 h-4" />
                          <span>{trainerServices.length} servizi</span>
                        </div>
                        {minPrice && (
                          <div className="text-white font-bold">
                            Da €{minPrice}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}