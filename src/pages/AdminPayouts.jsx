import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Euro,
  Building2,
  Users,
  TrendingUp,
  BarChart3,
  CheckCircle,
  AlertCircle,
  Clock,
  RefreshCw,
  ArrowRight,
  Wallet
} from "lucide-react";
import { motion } from "framer-motion";

export default function AdminPayouts() {
  const [user, setUser] = useState(null);
  const [gyms, setGyms] = useState([]);
  const [reports, setReports] = useState([]);
  const [comunionFunds, setComunionFunds] = useState([]);
  const [accesses, setAccesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const userData = await base44.auth.me();
    if (userData?.role !== "admin") {
      setError("Accesso riservato agli amministratori");
      setLoading(false);
      return;
    }
    setUser(userData);

    const [gymsData, reportsData, fundsData, accessesData] = await Promise.all([
      base44.entities.Gym.list(),
      base44.entities.GymPayoutReport.list("-period_year", 100),
      base44.entities.ComunionFund.list("-period_year", 12),
      base44.entities.GymAccess.list("-created_date", 1000)
    ]);

    setGyms(gymsData);
    setReports(reportsData);
    setComunionFunds(fundsData);
    setAccesses(accessesData);
    setLoading(false);
  };

  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  const thisMonthAccesses = accesses.filter(a => {
    const d = new Date(a.access_date || a.created_date);
    return d.getMonth() + 1 === currentMonth && d.getFullYear() === currentYear && a.access_granted;
  });

  const totalNetworkVisits = thisMonthAccesses.length;

  const gymVisitMap = {};
  thisMonthAccesses.forEach(a => {
    gymVisitMap[a.gym_id] = (gymVisitMap[a.gym_id] || 0) + 1;
  });

  const monthName = (m) => {
    const names = ["", "Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno",
      "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre"];
    return names[m] || m;
  };

  const currentFund = comunionFunds.find(f => f.period_month === currentMonth && f.period_year === currentYear);
  const totalPending = reports.filter(r => r.status === "pending").reduce((sum, r) => sum + (r.total_amount || 0), 0);
  const totalTransferred = reports.filter(r => r.status === "transferred").reduce((sum, r) => sum + (r.total_amount || 0), 0);

  const stripeConnectedGyms = gyms.filter(g => g.stripe_onboarding_complete).length;
  const pendingVisuraGyms = gyms.filter(g => g.visura_url && g.visura_status === "pending").length;

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-[#0a0a0a]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E8FF00]"></div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-[#0a0a0a] p-6 flex items-center justify-center">
      <Alert className="bg-red-900/20 border-red-500/30 max-w-md">
        <AlertCircle className="h-4 w-4 text-red-400" />
        <AlertDescription className="text-red-300">{error}</AlertDescription>
      </Alert>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0a0a] p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Gestione Pagamenti Palestre</h1>
            <p className="text-gray-400 text-sm mt-1">Panoramica distribuzione fondi e report mensili</p>
          </div>
          <Button onClick={loadData} variant="outline" className="border-white/20 text-white hover:bg-white/10">
            <RefreshCw className="w-4 h-4 mr-2" />
            Aggiorna
          </Button>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Da trasferire", value: `€${totalPending.toFixed(2)}`, icon: <Clock className="w-5 h-5" />, color: "text-yellow-400" },
            { label: "Trasferiti totale", value: `€${totalTransferred.toFixed(2)}`, icon: <CheckCircle className="w-5 h-5" />, color: "text-green-400" },
            { label: "Palestre con Stripe", value: `${stripeConnectedGyms}/${gyms.length}`, icon: <Building2 className="w-5 h-5" />, color: "text-[#E8FF00]" },
            { label: "Visure da approvare", value: pendingVisuraGyms, icon: <AlertCircle className="w-5 h-5" />, color: "text-orange-400" }
          ].map((kpi, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <Card className="bg-black/40 border-white/10">
                <CardContent className="p-4">
                  <div className={`${kpi.color} mb-2`}>{kpi.icon}</div>
                  <p className={`text-2xl font-bold ${kpi.color}`}>{kpi.value}</p>
                  <p className="text-xs text-gray-500 mt-1">{kpi.label}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="bg-black/40 border border-white/10">
            <TabsTrigger value="overview" className="data-[state=active]:bg-[#E8FF00] data-[state=active]:text-black text-gray-400">
              Panoramica
            </TabsTrigger>
            <TabsTrigger value="comunion" className="data-[state=active]:bg-[#E8FF00] data-[state=active]:text-black text-gray-400">
              Fondo Comunion
            </TabsTrigger>
            <TabsTrigger value="reports" className="data-[state=active]:bg-[#E8FF00] data-[state=active]:text-black text-gray-400">
              Report Mensili
            </TabsTrigger>
            <TabsTrigger value="gyms" className="data-[state=active]:bg-[#E8FF00] data-[state=active]:text-black text-gray-400">
              Palestre
            </TabsTrigger>
          </TabsList>

          {/* PANORAMICA */}
          <TabsContent value="overview">
            <Card className="bg-black/40 border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Accessi Rete — {monthName(currentMonth)} {currentYear}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm border-b border-white/10 pb-3">
                    <span className="text-gray-400">Accessi totali rete</span>
                    <span className="text-white font-bold">{totalNetworkVisits}</span>
                  </div>
                  {gyms.map((gym) => {
                    const visits = gymVisitMap[gym.id] || 0;
                    const pct = totalNetworkVisits > 0 ? ((visits / totalNetworkVisits) * 100).toFixed(1) : 0;
                    return (
                      <div key={gym.id} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-300 flex items-center gap-2">
                            <Building2 className="w-3 h-3 text-gray-500" />
                            {gym.name}
                          </span>
                          <div className="flex items-center gap-3">
                            <span className="text-gray-400">{visits} accessi</span>
                            <span className="text-[#E8FF00] font-mono text-xs w-12 text-right">{pct}%</span>
                          </div>
                        </div>
                        <div className="w-full bg-white/5 rounded-full h-1.5">
                          <div
                            className="bg-[#E8FF00] h-1.5 rounded-full transition-all"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* FONDO COMUNION */}
          <TabsContent value="comunion">
            <div className="space-y-4">
              <Card className="bg-black/40 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Wallet className="w-5 h-5 text-[#E8FF00]" />
                    Come funziona il Fondo Comunion
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid md:grid-cols-3 gap-4 text-sm">
                    <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                      <p className="text-gray-400 mb-1">1. Raccolta</p>
                      <p className="text-white text-xs">Gli abbonati che non visitano nessuna palestra nel mese confluiscono nel fondo</p>
                    </div>
                    <div className="p-3 rounded-lg bg-white/5 border border-white/10 text-center">
                      <ArrowRight className="w-4 h-4 text-[#E8FF00] mx-auto mb-1" />
                      <p className="text-gray-400 mb-1">2. Distribuzione</p>
                      <p className="text-white text-xs">90% alle palestre proporzionale agli accessi — 10% piattaforma</p>
                    </div>
                    <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                      <p className="text-gray-400 mb-1">3. Trasferimento</p>
                      <p className="text-white text-xs">Bonifico automatico via Stripe Connect il 1° di ogni mese</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {comunionFunds.length === 0 ? (
                <Card className="bg-black/40 border-white/10">
                  <CardContent className="py-12 text-center text-gray-500">
                    <BarChart3 className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p>Nessun fondo Comunion generato ancora.</p>
                  </CardContent>
                </Card>
              ) : (
                comunionFunds.map((fund) => (
                  <Card key={fund.id} className="bg-black/40 border-white/10">
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-white font-semibold">{monthName(fund.period_month)} {fund.period_year}</h3>
                          <p className="text-xs text-gray-500">{fund.total_inactive_users} utenti inattivi</p>
                        </div>
                        <Badge className={
                          fund.status === "distributed" ? "bg-green-900/50 text-green-300" :
                          fund.status === "calculated" ? "bg-yellow-900/50 text-yellow-300" :
                          "bg-gray-900/50 text-gray-300"
                        }>
                          {fund.status === "distributed" ? "Distribuito" : fund.status === "calculated" ? "Calcolato" : "In attesa"}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <p className="text-xs text-gray-500">Totale raccolto</p>
                          <p className="text-lg font-bold text-white">€{(fund.total_collected || 0).toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Alle palestre (90%)</p>
                          <p className="text-lg font-bold text-[#E8FF00]">€{(fund.distributable_amount || 0).toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Piattaforma (10%)</p>
                          <p className="text-lg font-bold text-gray-400">€{(fund.platform_fee || 0).toFixed(2)}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* REPORT MENSILI */}
          <TabsContent value="reports">
            <Card className="bg-black/40 border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Tutti i Report</CardTitle>
              </CardHeader>
              <CardContent>
                {reports.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">Nessun report generato ancora.</div>
                ) : (
                  <div className="space-y-2">
                    {reports.map((r) => (
                      <div key={r.id} className="flex items-center justify-between p-3 rounded-lg border border-white/10 hover:border-white/20">
                        <div>
                          <p className="text-white text-sm font-medium">{r.gym_name}</p>
                          <p className="text-xs text-gray-500">{monthName(r.period_month)} {r.period_year} · {r.total_visits} accessi</p>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right text-xs text-gray-400 hidden md:block">
                            <p>M1: €{(r.method1_amount || 0).toFixed(2)}</p>
                            <p>M2: €{(r.method2_amount || 0).toFixed(2)}</p>
                          </div>
                          <p className="text-[#E8FF00] font-bold">€{(r.total_amount || 0).toFixed(2)}</p>
                          <Badge className={
                            r.status === "transferred" ? "bg-green-900/50 text-green-300" :
                            r.status === "failed" ? "bg-red-900/50 text-red-300" :
                            "bg-yellow-900/50 text-yellow-300"
                          }>
                            {r.status === "transferred" ? "Trasferito" : r.status === "failed" ? "Fallito" : "In attesa"}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* PALESTRE */}
          <TabsContent value="gyms">
            <Card className="bg-black/40 border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Stato Palestre</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {gyms.map((gym) => (
                    <div key={gym.id} className="p-4 rounded-lg border border-white/10">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-white font-medium">{gym.name}</p>
                          <p className="text-xs text-gray-500">{gym.city} · {gym.manager_email}</p>
                        </div>
                        <div className="flex gap-2 flex-wrap justify-end">
                          <Badge className={gym.stripe_onboarding_complete ? "bg-green-900/50 text-green-300" : "bg-gray-900/50 text-gray-400"}>
                            {gym.stripe_onboarding_complete ? "✓ Stripe" : "Stripe ✗"}
                          </Badge>
                          {gym.visura_url && (
                            <Badge className={
                              gym.visura_status === "approved" ? "bg-green-900/50 text-green-300" :
                              gym.visura_status === "rejected" ? "bg-red-900/50 text-red-300" :
                              "bg-yellow-900/50 text-yellow-300"
                            }>
                              Visura: {gym.visura_status === "approved" ? "✓" : gym.visura_status === "rejected" ? "✗" : "⏳"}
                            </Badge>
                          )}
                        </div>
                      </div>
                      {gym.visura_url && gym.visura_status === "pending" && (
                        <div className="flex gap-2 mt-3">
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700 text-white text-xs"
                            onClick={async () => {
                              await base44.entities.Gym.update(gym.id, { visura_status: "approved" });
                              loadData();
                            }}
                          >
                            Approva Visura
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-red-500/30 text-red-400 hover:bg-red-900/20 text-xs"
                            onClick={async () => {
                              await base44.entities.Gym.update(gym.id, { visura_status: "rejected" });
                              loadData();
                            }}
                          >
                            Rifiuta
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}