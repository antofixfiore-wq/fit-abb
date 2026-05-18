import React from "react";
import { Search, Filter, Map, List, Star, Navigation, TrendingUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function GymsSearchBar({ 
  searchTerm, setSearchTerm, searchType, sortBy, setSortBy, 
  showFilters, setShowFilters, activeFiltersCount, viewMode, setViewMode, userLocation 
}) {
  return (
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
              {activeFiltersCount > 0 && (
                <Badge className="ml-1 bg-blue-600 min-w-[20px] h-5 text-xs">{activeFiltersCount}</Badge>
              )}
            </Button>
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
  );
}