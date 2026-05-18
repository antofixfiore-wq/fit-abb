import React from "react";
import { Building2, Users } from "lucide-react";
import { motion } from "framer-motion";

export default function GymsHeader({ searchType, setSearchType, filteredGyms, gyms, filteredUsers, users }) {
  return (
    <div className="bg-black text-white py-16 px-6 border-b border-white/10">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
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
  );
}