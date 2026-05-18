import React from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function GymsFilters({
  showFilters, regionFilter, setRegionFilter, cityFilter, setCityFilter,
  priceRange, setPriceRange, selectedAmenities, toggleAmenity, commonAmenities,
  activeFiltersCount, clearFilters, searchType, getUniqueRegions, getUniqueCities
}) {
  return (
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

            {activeFiltersCount > 0 && (
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
  );
}