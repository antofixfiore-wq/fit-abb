import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import PullToRefresh from "@/components/mobile/PullToRefresh";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Building2, Search, MapPin, Star, Filter, X, Navigation, TrendingDown, TrendingUp, Map, List } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import GymsMap from "@/components/gyms/GymsMap";

export default function Gyms() {
  const navigate = useNavigate();
  const [gyms, setGyms] = useState([]);
  const [memberships, setMemberships] = useState([]);
  const [filteredGyms, setFilteredGyms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [regionFilter, setRegionFilter] = useState("all");
  const [cityFilter, setCityFilter] = useState("all");
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [priceRange, setPriceRange] = useState([0, 200]);
  const [sortBy, setSortBy] = useState("rating");
  const [userLocation, setUserLocation] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState("map"); // "map" | "list"
  const [nearbyOnly, setNearbyOnly] = useState(false); // filtro 10 km
  const [locationStatus, setLocationStatus] = useState("idle"); // "idle" | "loading" | "granted" | "denied"

  useEffect(() => {
    loadData();
    getUserLocation();
  }, []);

  useEffect(() => {
    filterAndSortGyms();
  }, [searchTerm, regionFilter, cityFilter, selectedAmenities, priceRange, sortBy, gyms, memberships, userLocation, nearbyOnly]);

  const getUserLocation = () => {
    if (!navigator.geolocation) return;
    setLocationStatus("loading");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
        setLocationStatus("granted");
        setNearbyOnly(true); // attiva automaticamente il filtro 10 km
        setSortBy("distance");
      },
      () => {
        setLocationStatus("denied");
      }
    );
  };

  const loadData = async () => {
    try {
      const [gymsData, membershipsData] = await Promise.all([
        base44.entities.Gym.list(),
        base44.entities.GymMembership.list()
      ]);
      setGyms(gymsData);
      setMemberships(membershipsData);
      setFilteredGyms(gymsData);
    } catch (error) {
      console.error("Error loading data:", error);
    }
    setLoading(false);
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const getGymMinPrice = (gymId) => {
    const gymMemberships = memberships.filter(m => m.gym_id === gymId);
    if (gymMemberships.length === 0) return null;
    return Math.min(...gymMemberships.map(m => m.price));
  };

  const filterAndSortGyms = () => {
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

    if (cityFilter !== "all") {
      filtered = filtered.filter(gym => gym.city === cityFilter);
    }

    if (selectedAmenities.length > 0) {
      filtered = filtered.filter(gym => 
        gym.amenities && selectedAmenities.every(amenity => 
          gym.amenities.some(a => a.toLowerCase().includes(amenity.toLowerCase()))
        )
      );
    }

    filtered = filtered.filter(gym => {
      const minPrice = getGymMinPrice(gym.id);
      if (minPrice === null) return true;
      return minPrice >= priceRange[0] && minPrice <= priceRange[1];
    });

    // Filtro 10 km automatico quando attivo
    if (nearbyOnly && userLocation) {
      filtered = filtered.filter(gym => {
        if (!gym.latitude || !gym.longitude) return false;
        const dist = calculateDistance(userLocation.lat, userLocation.lng, gym.latitude, gym.longitude);
        return dist <= 10;
      });
    }

    filtered = filtered.sort((a, b) => {
      switch (sortBy) {
        case "rating":
          return (b.google_rating || 0) - (a.google_rating || 0);
        case "price-asc":
          const priceA = getGymMinPrice(a.id) || 999;
          const priceB = getGymMinPrice(b.id) || 999;
          return priceA - priceB;
        case "price-desc":
          const priceA2 = getGymMinPrice(a.id) || 0;
          const priceB2 = getGymMinPrice(b.id) || 0;
          return priceB2 - priceA2;
        case "distance":
          if (!userLocation) return 0;
          const distA = a.latitude && a.longitude ? calculateDistance(userLocation.lat, userLocation.lng, a.latitude, a.longitude) : 999999;
          const distB = b.latitude && b.longitude ? calculateDistance(userLocation.lat, userLocation.lng, b.latitude, b.longitude) : 999999;
          return distA - distB;
        case "name":
          return (a.name || "").localeCompare(b.name || "");
        default:
          return 0;
      }
    });

    setFilteredGyms(filtered);
  };

  const getUniqueRegions = () => {
    const regions = [...new Set(gyms.map(gym => gym.region).filter(Boolean))];
    return regions.sort();
  };

  const getUniqueCities = () => {
    let cities = gyms.map(gym => gym.city).filter(Boolean);
    if (regionFilter !== "all") {
      cities = gyms.filter(g => g.region === regionFilter).map(g => g.city).filter(Boolean);
    }
    return [...new Set(cities)].sort();
  };

  const commonAmenities = [
    { value: "piscina", label: "Piscina" },
    { value: "sauna", label: "Sauna" },
    { value: "24/7", label: "Aperto 24/7" },
    { value: "spinning", label: "Spinning" },
    { value: "yoga", label: "Yoga" },
    { value: "pilates", label: "Pilates" },
    { value: "crossfit", label: "CrossFit" },
    { value: "functional", label: "Functional Training" }
  ];

  const toggleAmenity = (amenity) => {
    setSelectedAmenities(prev =>
      prev.includes(amenity)
        ? prev.filter(a => a !== amenity)
        : [...prev, amenity]
    );
  };

  const clearFilters = () => {
    setSearchTerm("");
    setRegionFilter("all");
    setCityFilter("all");
    setSelectedAmenities([]);
    setPriceRange([0, 200]);
    setSortBy("rating");
  };

  const activeFiltersCount = () => {
    let count = 0;
    if (regionFilter !== "all") count++;
    if (cityFilter !== "all") count++;
    if (selectedAmenities.length > 0) count += selectedAmenities.length;
    if (priceRange[0] !== 0 || priceRange[1] !== 200) count++;
    return count;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <PullToRefresh onRefresh={loadData}>
      {/* Header */}
      <div className="bg-black text-white py-16 px-6 border-b border-white/10">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl md:text-5xl font-black mb-4">Le Nostre Palestre</h1>
            <p className="text-xl text-gray-400">
              {filteredGyms.length} di {gyms.length} palestre partner in tutta Italia
            </p>
          </motion.div>
        </div>
      </div>

      {/* Search and Sort Bar */}
      <div className="bg-[#1a1a1a] border-b border-white/10 sticky top-0 z-10 shadow-sm backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Cerca per nome, città..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Ordina per" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rating">
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4" />
                      Rating
                    </div>
                  </SelectItem>
                  <SelectItem value="price-asc">
                    <div className="flex items-center gap-2">
                      <TrendingDown className="w-4 h-4" />
                      Prezzo crescente
                    </div>
                  </SelectItem>
                  <SelectItem value="price-desc">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" />
                      Prezzo decrescente
                    </div>
                  </SelectItem>
                  {userLocation && (
                    <SelectItem value="distance">
                      <div className="flex items-center gap-2">
                        <Navigation className="w-4 h-4" />
                        Distanza
                      </div>
                    </SelectItem>
                  )}
                  <SelectItem value="name">Nome A-Z</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="relative"
              >
                <Filter className="w-4 h-4 mr-2" />
                Filtri
                {activeFiltersCount() > 0 && (
                  <Badge className="ml-2 bg-blue-600">{activeFiltersCount()}</Badge>
                )}
              </Button>
              {/* Toggle mappa/lista */}
              <div className="flex border border-white/20 rounded-md overflow-hidden">
                <button
                  onClick={() => setViewMode("map")}
                  className={`px-3 py-2 flex items-center gap-1.5 text-sm transition-colors ${viewMode === "map" ? "bg-[#E8FF00] text-black font-semibold" : "bg-transparent text-gray-400 hover:text-white"}`}
                >
                  <Map className="w-4 h-4" /> Mappa
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`px-3 py-2 flex items-center gap-1.5 text-sm transition-colors ${viewMode === "list" ? "bg-[#E8FF00] text-black font-semibold" : "bg-transparent text-gray-400 hover:text-white"}`}
                >
                  <List className="w-4 h-4" /> Lista
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Advanced Filters Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-white border-b overflow-hidden"
          >
            <div className="max-w-7xl mx-auto px-6 py-6">
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Region Filter */}
                <div>
                  <Label className="mb-2 block font-semibold">Regione</Label>
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

                {/* City Filter */}
                <div>
                  <Label className="mb-2 block font-semibold">Città</Label>
                  <Select value={cityFilter} onValueChange={setCityFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Tutte le città" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tutte le città</SelectItem>
                      {getUniqueCities().map(city => (
                        <SelectItem key={city} value={city}>{city}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Price Range */}
                <div className="md:col-span-2">
                  <Label className="mb-2 block font-semibold">
                    Fascia di prezzo: €{priceRange[0]} - €{priceRange[1]}
                  </Label>
                  <Slider
                    value={priceRange}
                    onValueChange={setPriceRange}
                    min={0}
                    max={200}
                    step={5}
                    className="mt-4"
                  />
                </div>

                {/* Amenities */}
                <div className="md:col-span-2 lg:col-span-4">
                  <Label className="mb-3 block font-semibold">Servizi</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {commonAmenities.map((amenity) => (
                      <div key={amenity.value} className="flex items-center space-x-2">
                        <Checkbox
                          id={amenity.value}
                          checked={selectedAmenities.includes(amenity.value)}
                          onCheckedChange={() => toggleAmenity(amenity.value)}
                        />
                        <Label
                          htmlFor={amenity.value}
                          className="text-sm font-normal cursor-pointer"
                        >
                          {amenity.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Clear Filters Button */}
              {activeFiltersCount() > 0 && (
                <div className="mt-4 flex justify-end">
                  <Button variant="ghost" onClick={clearFilters}>
                    <X className="w-4 h-4 mr-2" />
                    Cancella tutti i filtri
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Banner geolocalizzazione */}
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

      {/* Mappa — mostra TUTTE le palestre con coordinate, indipendentemente dal filtro distanza */}
      {viewMode === "map" && (
        <div className="max-w-7xl mx-auto px-6 py-6">
          <GymsMap gyms={gyms} userLocation={userLocation} />
          {!userLocation && (
            <p className="text-center text-gray-500 text-xs mt-2">
              Abilita la geolocalizzazione per vedere le palestre vicino a te
            </p>
          )}
        </div>
      )}

      {/* Gyms Grid */}
      {viewMode === "list" && <div className="max-w-7xl mx-auto px-6 py-12">
        {filteredGyms.length === 0 ? (
          <div className="text-center py-20">
            <Building2 className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              Nessuna palestra trovata
            </h3>
            <p className="text-gray-500 mb-4">
              Prova a modificare i filtri di ricerca
            </p>
            <Button variant="outline" onClick={clearFilters}>
              Cancella filtri
            </Button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGyms.map((gym, index) => {
              const minPrice = getGymMinPrice(gym.id);
              return (
                <motion.div
                  key={gym.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  whileHover={{ y: -5 }}
                >
                  <Card className="overflow-hidden cursor-pointer hover:scale-105 transition-all duration-300 h-full bg-[#1a1a1a] border-white/10 group"
                    onClick={() => navigate(`${createPageUrl("GymDetail")}?id=${gym.id}`)}>
                    <div className="relative h-56 bg-black overflow-hidden">
                      {gym.photos?.[0] ? (
                        <img
                          src={gym.photos[0]}
                          alt={gym.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-orange-100">
                          <Building2 className="w-20 h-20 text-blue-300" />
                        </div>
                      )}
                      {gym.google_rating && (
                        <div className="absolute top-4 right-4 bg-white rounded-full px-3 py-1.5 flex items-center gap-1 shadow-lg">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-semibold text-sm">{gym.google_rating}</span>
                        </div>
                      )}
                      {minPrice && (
                        <div className="absolute bottom-4 left-4 bg-blue-600 text-white rounded-lg px-3 py-1.5 shadow-lg">
                          <span className="text-sm font-semibold">Da €{minPrice}/mese</span>
                        </div>
                      )}
                    </div>
                    <CardContent className="p-6 space-y-4">
                      <div>
                        <h3 className="font-bold text-xl mb-3 text-white">{gym.name}</h3>
                        <div className="space-y-2 mb-4">
                          <div className="flex items-start gap-2 text-gray-400">
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
                      </div>
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`${createPageUrl("CheckIn")}?gym_id=${gym.id}`);
                        }}
                        className="w-full bg-[#E8FF00] hover:bg-[#E8FF00]/80 text-black font-semibold"
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
      </div>}
      </PullToRefresh>
    </div>
  );
}