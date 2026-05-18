import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import PullToRefresh from "@/components/mobile/PullToRefresh";
import GymsHeader from "@/components/gyms/GymsHeader";
import GymsSearchBar from "@/components/gyms/GymsSearchBar";
import GymsFilters from "@/components/gyms/GymsFilters";
import GymsLocationBanners from "@/components/gyms/GymsLocationBanners";
import GymsMapView from "@/components/gyms/GymsMapView";
import GymsListView from "@/components/gyms/GymsListView";

export default function Gyms() {
  const navigate = useNavigate();
  const [searchType, setSearchType] = useState("gyms");
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
  const [viewMode, setViewMode] = useState("map");
  const [nearbyOnly, setNearbyOnly] = useState(false);
  const [locationStatus, setLocationStatus] = useState("idle");

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
        setNearbyOnly(true);
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
        <GymsHeader 
          searchType={searchType}
          setSearchType={setSearchType}
          filteredGyms={filteredGyms}
          gyms={gyms}
          filteredUsers={filteredUsers}
          users={users}
        />
        
        <GymsSearchBar
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          searchType={searchType}
          sortBy={sortBy}
          setSortBy={setSortBy}
          showFilters={showFilters}
          setShowFilters={setShowFilters}
          activeFiltersCount={activeFiltersCount()}
          viewMode={viewMode}
          setViewMode={setViewMode}
          userLocation={userLocation}
        />

        <GymsFilters
          showFilters={showFilters}
          regionFilter={regionFilter}
          setRegionFilter={setRegionFilter}
          cityFilter={cityFilter}
          setCityFilter={setCityFilter}
          priceRange={priceRange}
          setPriceRange={setPriceRange}
          selectedAmenities={selectedAmenities}
          toggleAmenity={toggleAmenity}
          commonAmenities={commonAmenities}
          activeFiltersCount={activeFiltersCount()}
          clearFilters={clearFilters}
          searchType={searchType}
          getUniqueRegions={getUniqueRegions}
          getUniqueCities={getUniqueCities}
        />

        <GymsLocationBanners
          locationStatus={locationStatus}
          nearbyOnly={nearbyOnly}
          filteredGyms={filteredGyms}
          setNearbyOnly={setNearbyOnly}
          setSortBy={setSortBy}
        />

        <GymsMapView
          viewMode={viewMode}
          searchType={searchType}
          gyms={gyms}
          userLocation={userLocation}
          setViewMode={setViewMode}
        />

        <GymsListView
          viewMode={viewMode}
          searchType={searchType}
          filteredGyms={filteredGyms}
          filteredUsers={filteredUsers}
          clearFilters={clearFilters}
          getGymMinPrice={getGymMinPrice}
          navigate={navigate}
        />
      </PullToRefresh>
    </div>
  );
}