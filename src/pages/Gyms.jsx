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
import { Building2, Users, Search, MapPin, Star, Filter, X, Navigation, TrendingDown, TrendingUp, Map, List } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import GymsMap from "@/components/gyms/GymsMap";

export default function Gyms() {
  const navigate = useNavigate();
  const [searchType, setSearchType] = useState("gyms"); // "gyms" | "users"
  const [gyms, setGyms] = useState([]);
  const [users, setUsers] = useState([]);
  const [memberships, setMemberships] = useState([]);
  const [filteredGyms, setFilteredGyms] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
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
    if (searchType === "gyms") {
      filterAndSortGyms();
    } else {
      filterAndSortUsers();
    }
  }, [searchTerm, regionFilter, cityFilter, selectedAmenities, priceRange, sortBy, gyms, memberships, users, userLocation, nearbyOnly, searchType]);

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
      const [gymsData, membershipsData, usersData] = await Promise.all([
        base44.entities.Gym.list(),
        base44.entities.GymMembership.list(),
        base44.entities.User.list()
      ]);
      setGyms(gymsData || []);
      setMemberships(membershipsData || []);
      setFilteredGyms(gymsData || []);
      // Filtra solo utenti regolari (non admin) e escludi se stessi
      const currentUser = await base44.auth.me();
      const regularUsers = (usersData || []).filter(u => u.role !== "admin" && u.email !== currentUser.email);
      setUsers(regularUsers);
      setFilteredUsers(regularUsers);
    } catch (error) {
      console.error("Error loading data:", error);
      setGyms([]);
      setMemberships([]);
      setFilteredGyms([]);
      setUsers([]);
      setFilteredUsers([]);
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

    setFilteredGyms(filtered);
  };

  const filterAndSortUsers = () => {
    let filtered = users;

    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (regionFilter !== "all") {
      filtered = filtered.filter(user => user.region === regionFilter);
    }

    if (cityFilter !== "all") {
      filtered = filtered.filter(user => user.city === cityFilter);
    }

    filtered = filtered.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return (a.full_name || "").localeCompare(b.full_name || "");
        case "workouts":
          return (b.completed_workouts || 0) - (a.completed_workouts || 0);
        case "level":
          return (b.level || 1) - (a.level || 1);
        default:
          return 0;
      }
    });

    setFilteredUsers(filtered);
  };

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
    const data = searchType === "gyms" ? gyms : users;
    const regions = [...new Set(data.map(item => item.region).filter(Boolean))];
    return regions.sort();
  };

  const getUniqueCities = () => {
    const data = searchType === "gyms" ? gyms : users;
    let cities = data.map(item => item.city).filter(Boolean);
    if (regionFilter !== "all") {
      cities = data.filter(item => item.region === regionFilter).map(item => item.city).filter(Boolean);
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
            {/* Toggle Tipo Ricerca */}
            <div className="flex gap-4 mb-6">
              <button
                onClick={() => setSearchType("gyms")}
                className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold transition-all ${
                  searchType === "gyms" 
                    ? "bg-[#E8FF00] text-black" 
                    : "bg-white/10 text-gray-400 hover:text-white"
                }`}
              >
                <Building2 className="w-5 h-5" />
                Palestre
              </button>
              <button
                onClick={() => setSearchType("users")}
                className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold transition-all ${
                  searchType === "users" 
                    ? "bg-[#E8FF00] text-black" 
                    : "bg-white/10 text-gray-400 hover:text-white"
                }`}
              >
                <Users className="w-5 h-5" />
                Clienti
              </button>
            </div>
            <h1 className="text-4xl md:text-5xl font-black mb-4">
              {searchType === "gyms" ? "Le Nostre Palestre" : "I Nostri Clienti"}
            </h1>
            <p className="text-xl text-gray-400">
              {searchType === "gyms" 
                ? `${filteredGyms.length} di ${gyms.length} palestre partner in tutta Italia`
                : `${filteredUsers.length} di ${users.length} clienti attivi`
              }
            </p>
          </motion.div>
        </div>
      </div>

      {/* Search and Sort Bar - Mobile optimized */}
      <div className="bg-[#1a1a1a] border-b border-white/10 sticky top-0 z-10 shadow-sm backdrop-blur-xl safe-top">
        <div className="px-4 py-3">
          <div className="flex flex-col gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder={searchType === "gyms" ? "Cerca palestra..." : "Cerca cliente..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-12 text-base touch-manipulation"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1">
              <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full min-w-[140px] h-12 touch-manipulation">
                <SelectValue placeholder="Ordina" />
              </SelectTrigger>
              <SelectContent>
                {searchType === "gyms" ? (
                  <>
                    <SelectItem value="rating">
                      <div className="flex items-center gap-2">
                        <Star className="w-4 h-4" />
                        Rating
                      </div>
                    </SelectItem>
                    <SelectItem value="price-asc">Prezzo ↑</SelectItem>
                    <SelectItem value="price-desc">Prezzo ↓</SelectItem>
                    {userLocation && (
                      <SelectItem value="distance">
                        <div className="flex items-center gap-2">
                          <Navigation className="w-4 h-4" />
                          Distanza
                        </div>
                      </SelectItem>
                    )}
                    <SelectItem value="name">Nome A-Z</SelectItem>
                  </>
                ) : (
                  <>
                    <SelectItem value="name">Nome A-Z</SelectItem>
                    <SelectItem value="workouts">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4" />
                        Allenamenti
                      </div>
                    </SelectItem>
                    <SelectItem value="level">
                      <div className="flex items-center gap-2">
                        <Star className="w-4 h-4" />
                        Livello
                      </div>
                    </SelectItem>
                  </>
                )}
              </SelectContent>
              </Select>
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="h-12 min-w-[48px] px-3 touch-manipulation"
              >
                <Filter className="w-5 h-5" />
                {activeFiltersCount() > 0 && (
                  <Badge className="ml-1 bg-blue-600 min-w-[20px] h-5 text-xs">{activeFiltersCount()}</Badge>
                )}
              </Button>
              {/* Toggle mappa/lista */}
              <div className="flex border border-white/20 rounded-lg overflow-hidden shrink-0">
                <button
                  onClick={() => setViewMode("map")}
                  className={`px-3 py-2 flex items-center justify-center transition-colors touch-manipulation ${viewMode === "map" ? "bg-[#E8FF00] text-black" : "bg-transparent text-gray-400"}`}
                >
                  <Map className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`px-3 py-2 flex items-center justify-center transition-colors touch-manipulation ${viewMode === "list" ? "bg-[#E8FF00] text-black" : "bg-transparent text-gray-400"}`}
                >
                  <List className="w-5 h-5" />
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

      {/* Mappa — solo per palestre */}
      {viewMode === "map" && searchType === "gyms" && (
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
      )}

      {/* Messaggio per mappa clienti */}
      {viewMode === "map" && searchType === "users" && (
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
      )}

      {/* Gyms Grid - Mobile optimized */}
      {viewMode === "list" && searchType === "gyms" && (
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
                        <img
                          src={gym.photos[0]}
                          alt={gym.name}
                          className="w-full h-full object-cover active:scale-105 transition-transform"
                        />
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
      )}

      {/* Users Grid */}
      {viewMode === "list" && searchType === "users" && (
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
      )}
      </div>
    </PullToRefresh>
  );
}