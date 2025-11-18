import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { MapPin, Star, Search, Building2 } from "lucide-react";
import { motion } from "framer-motion";

export default function PartnersPage() {
  const [gyms, setGyms] = useState([]);
  const [filteredGyms, setFilteredGyms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("all");

  useEffect(() => {
    loadGyms();
  }, []);

  useEffect(() => {
    filterGyms();
  }, [searchTerm, selectedRegion, gyms]);

  const loadGyms = async () => {
    try {
      const gymsData = await base44.entities.Gym.list();
      setGyms(gymsData.filter(g => g.is_partner));
      setFilteredGyms(gymsData.filter(g => g.is_partner));
    } catch (error) {
      console.error("Error loading gyms:", error);
    }
    setLoading(false);
  };

  const filterGyms = () => {
    let filtered = gyms;

    if (searchTerm) {
      filtered = filtered.filter(gym =>
        gym.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        gym.city?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedRegion !== "all") {
      filtered = filtered.filter(gym => gym.region === selectedRegion);
    }

    setFilteredGyms(filtered);
  };

  const regions = [...new Set(gyms.map(g => g.region).filter(Boolean))];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 to-orange-600 text-white py-20 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Le Nostre Palestre Partner
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto mb-8">
              Oltre 500 palestre in tutta Italia pronte ad accoglierti
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Badge className="bg-white/20 text-white border-white/30 px-6 py-3 text-lg">
                <MapPin className="w-5 h-5 mr-2" />
                Tutte le regioni
              </Badge>
              <Badge className="bg-white/20 text-white border-white/30 px-6 py-3 text-lg">
                <Building2 className="w-5 h-5 mr-2" />
                {gyms.length} palestre
              </Badge>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Filters Section */}
      <section className="py-8 px-6 bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Cerca per nome o città..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="px-4 py-2 border rounded-lg bg-white"
            >
              <option value="all">Tutte le regioni</option>
              {regions.map(region => (
                <option key={region} value={region}>{region}</option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Gyms Grid */}
      <section className="py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6">
            <p className="text-gray-600">
              Mostrando {filteredGyms.length} di {gyms.length} palestre
            </p>
          </div>

          {filteredGyms.length === 0 ? (
            <Card className="p-12 text-center">
              <CardContent>
                <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  Nessuna palestra trovata
                </h3>
                <p className="text-gray-600 mb-4">
                  Prova a modificare i filtri di ricerca
                </p>
                <Button
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedRegion("all");
                  }}
                  variant="outline"
                >
                  Resetta Filtri
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredGyms.map((gym, index) => (
                <motion.div
                  key={gym.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 h-full">
                    <div className="relative h-48">
                      {gym.photos && gym.photos[0] ? (
                        <img
                          src={gym.photos[0]}
                          alt={gym.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-blue-100 to-orange-100 flex items-center justify-center">
                          <Dumbbell className="w-16 h-16 text-gray-400" />
                        </div>
                      )}
                      {gym.logo_url && (
                        <div className="absolute top-3 right-3 bg-white rounded-lg p-2 shadow-lg">
                          <img src={gym.logo_url} alt={gym.name} className="w-12 h-12 object-contain" />
                        </div>
                      )}
                    </div>
                    <CardContent className="p-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{gym.name}</h3>
                      
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                        <MapPin className="w-4 h-4" />
                        <span>{gym.city}{gym.region ? `, ${gym.region}` : ''}</span>
                      </div>

                      {gym.google_rating && (
                        <div className="flex items-center gap-2 mb-3">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-semibold">{gym.google_rating.toFixed(1)}</span>
                          <span className="text-gray-500 text-sm">/ 5.0</span>
                        </div>
                      )}

                      {gym.amenities && gym.amenities.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {gym.amenities.slice(0, 3).map((amenity, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {amenity}
                            </Badge>
                          ))}
                          {gym.amenities.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{gym.amenities.length - 3}
                            </Badge>
                          )}
                        </div>
                      )}

                      <Link to={createPageUrl(`GymDetail?id=${gym.id}`)}>
                        <Button className="w-full bg-gradient-to-r from-blue-600 to-orange-600 hover:from-blue-700 hover:to-orange-700">
                          Scopri di Più
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-br from-blue-600 to-orange-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold mb-6">
              Hai una Palestra e Vuoi Unirti a Noi?
            </h2>
            <p className="text-xl mb-8 text-blue-100">
              Diventa partner Fit ABB e raggiungi migliaia di nuovi clienti
            </p>
            <Button
              size="lg"
              className="bg-white text-blue-700 hover:bg-blue-50 text-lg px-10 py-6"
              asChild
            >
              <Link to={createPageUrl("Contact")}>
                Contattaci
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>
    </div>
  );
}