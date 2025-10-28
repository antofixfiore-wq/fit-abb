import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building2, Search, MapPin, Star, Filter } from "lucide-react";
import { motion } from "framer-motion";

export default function Gyms() {
  const navigate = useNavigate();
  const [gyms, setGyms] = useState([]);
  const [filteredGyms, setFilteredGyms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [regionFilter, setRegionFilter] = useState("all");

  useEffect(() => {
    loadGyms();
  }, []);

  useEffect(() => {
    filterGyms();
  }, [searchTerm, regionFilter, gyms]);

  const loadGyms = async () => {
    try {
      const gymsData = await base44.entities.Gym.list("-google_rating");
      setGyms(gymsData);
      setFilteredGyms(gymsData);
    } catch (error) {
      console.error("Error loading gyms:", error);
    }
    setLoading(false);
  };

  const filterGyms = () => {
    let filtered = gyms;

    if (searchTerm) {
      filtered = filtered.filter(gym =>
        gym.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        gym.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        gym.address?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (regionFilter !== "all") {
      filtered = filtered.filter(gym => gym.region === regionFilter);
    }

    setFilteredGyms(filtered);
  };

  const getUniqueRegions = () => {
    const regions = [...new Set(gyms.map(gym => gym.region).filter(Boolean))];
    return regions.sort();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Le Nostre Palestre</h1>
            <p className="text-xl text-purple-100">
              Oltre {gyms.length} palestre partner in tutta Italia
            </p>
          </motion.div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Cerca per nome, città..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="text-gray-400 w-5 h-5" />
              <Select value={regionFilter} onValueChange={setRegionFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Tutte le regioni" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tutte le regioni</SelectItem>
                  {getUniqueRegions().map(region => (
                    <SelectItem key={region} value={region}>{region}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Gyms Grid */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {filteredGyms.length === 0 ? (
          <div className="text-center py-20">
            <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              Nessuna palestra trovata
            </h3>
            <p className="text-gray-500">
              Prova a modificare i filtri di ricerca
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGyms.map((gym, index) => (
              <motion.div
                key={gym.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                whileHover={{ y: -5 }}
              >
                <Card className="overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300"
                  onClick={() => navigate(`${createPageUrl("GymDetail")}?id=${gym.id}`)}>
                  <div className="relative h-56 bg-gray-200">
                    {gym.photos?.[0] ? (
                      <img
                        src={gym.photos[0]}
                        alt={gym.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-100 to-pink-100">
                        <Building2 className="w-20 h-20 text-purple-300" />
                      </div>
                    )}
                    {gym.google_rating && (
                      <div className="absolute top-4 right-4 bg-white rounded-full px-3 py-1.5 flex items-center gap-1 shadow-lg">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-semibold text-sm">{gym.google_rating}</span>
                      </div>
                    )}
                  </div>
                  <CardContent className="p-6">
                    <h3 className="font-bold text-xl mb-3">{gym.name}</h3>
                    <div className="space-y-2 mb-4">
                      <div className="flex items-start gap-2 text-gray-600">
                        <MapPin className="w-4 h-4 mt-1 flex-shrink-0" />
                        <div className="text-sm">
                          <div>{gym.city}</div>
                          {gym.address && <div className="text-gray-500">{gym.address}</div>}
                        </div>
                      </div>
                    </div>
                    {gym.amenities && gym.amenities.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {gym.amenities.slice(0, 4).map((amenity, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            {amenity}
                          </Badge>
                        ))}
                        {gym.amenities.length > 4 && (
                          <Badge variant="outline" className="text-xs">
                            +{gym.amenities.length - 4}
                          </Badge>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}