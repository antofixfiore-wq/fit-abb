import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Euro,
  TrendingUp,
  Users,
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle,
  BarChart3,
  ArrowUpRight
} from "lucide-react";
import { motion } from "framer-motion";

export default function PayoutReportTab({ gym }) {
  const [reports, setReports] = useState([]);
  const [comunionFunds, setComunionFunds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentMonthStats, setCurrentMonthStats] = useState(null);

  useEffect(() => {
    if (gym?.id) loadReports();
  }, [gym]);

  const loadReports = async () => {
    setLoading(true);
    const [reportsData, fundsData, accessesData] = await Promise.all([
      base44.entities.GymPayoutReport.filter({ gym_id: gym.id }, "-period_year,-period_month", 12),
      base44.entities.ComunionFund.list("-period_year,-period_month", 6),
      base44.entities.GymAccess.filter({ gym_id: gym.id })
    ]);

    setReports(reportsData);
    setComunionFunds(fundsData);

    // Calcola stats mese corrente
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();
    const thisMonthAccesses = accessesData.filter(a => {
      const d = new Date(a.access_date || a.created_date);
      return d.getMonth() + 1 === currentMonth && d.getFullYear() === currentYear && a.access_granted;
    });

    setCurrentMonthStats({
      visits: thisMonthAccesses.length,
      month: currentMonth,
      year: currentYear
    });

    setLoading(false);
  };

  const getStatusBadge = (status) => {
    const map = {
      pending: { label: "In attesa", className: "bg-yellow-100 text-yellow-800" },
      transferred: { label: "Trasferito", className: "bg-green-100 text-green-800" },
      failed: { label: "Fallito", className: "bg-red-100 text-red-800" }
    };
    const s = map[status] || map.pending;
    return <Badge className={s.className}>{s.label}</Badge>;
  };

  const getStatusIcon = (status) => {
    if (status === "transferred") return <CheckCircle className="w-4 h-4 text-green-500" />;
    if (status === "failed") return <AlertCircle className="w-4 h-4 text-red-500" />;
    return <Clock className="w-4 h-4 text-yellow-500" />;
  };

  const monthName = (m) => {
    const names = ["", "Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno",
      "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre"];
    return names[m] || m;
  };

  const totalEarned = reports.filter(r => r.status === "transferred").reduce((sum, r) => sum + (r.total_amount || 0), 0);
  const totalPending = reports.filter(r => r.status === "pending").reduce((sum, r) => sum + (r.total_amount || 0), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#E8FF00]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stripe Connect Status */}
      {!gym.stripe_onboarding_complete && (
        <Alert className="bg-yellow-900/20 border-yellow-500/30">
          <AlertCircle className="h-4 w-4 text-yellow-400" />
          <AlertDescription className="text-yellow-300">
            <strong>Collegamento bancario richiesto.</strong> Per ricevere i pagamenti devi completare la registrazione Stripe Connect.
            Vai alla tab <strong>Documenti & Pagamenti</strong> per completare la configurazione.
          </AlertDescription>
        </Alert>
      )}

      {/* Riepilogo */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="bg-black/40 border-white/10">
            <CardContent className="p-4">
              <p className="text-xs text-gray-400 mb-1">Incassato totale</p>
              <p className="text-2xl font-bold text-green-400">€{totalEarned.toFixed(2)}</p>
              <p className="text-xs text-gray-500 mt-1">trasferiti</p>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="bg-black/40 border-white/10">
            <CardContent className="p-4">
              <p className="text-xs text-gray-400 mb-1">In attesa</p>
              <p className="text-2xl font-bold text-yellow-400">€{totalPending.toFixed(2)}</p>
              <p className="text-xs text-gray-500 mt-1">da trasferire</p>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="bg-black/40 border-white/10">
            <CardContent className="p-4">
              <p className="text-xs text-gray-400 mb-1">Accessi questo mese</p>
              <p className="text-2xl font-bold text-[#E8FF00]">{currentMonthStats?.visits || 0}</p>
              <p className="text-xs text-gray-500 mt-1">{monthName(currentMonthStats?.month)}</p>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card className="bg-black/40 border-white/10">
            <CardContent className="p-4">
              <p className="text-xs text-gray-400 mb-1">Report generati</p>
              <p className="text-2xl font-bold text-white">{reports.length}</p>
              <p className="text-xs text-gray-500 mt-1">periodi</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Spiegazione metodi */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card className="bg-black/40 border-[#E8FF00]/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-[#E8FF00] flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Metodo 1 — Proporzionale Visite
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-gray-400">
              Il 100% del valore dell'abbonamento degli utenti che visitano la tua palestra viene distribuito 
              proporzionalmente al numero di accessi. Più accessi registri, più guadagni.
            </p>
          </CardContent>
        </Card>
        <Card className="bg-black/40 border-blue-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-blue-400 flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Metodo 2 — Fondo Comunion
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-gray-400">
              Gli abbonati che non hanno visitato nessuna palestra nel mese confluiscono nel fondo Comunion. 
              Il 90% viene distribuito alle palestre in base alla quota di accessi sulla rete totale. 
              La piattaforma trattiene il 10%.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Report mensili */}
      <Card className="bg-black/40 border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[#E8FF00]" />
            Report Mensili
          </CardTitle>
        </CardHeader>
        <CardContent>
          {reports.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>Nessun report generato ancora.</p>
              <p className="text-xs mt-1">I report vengono calcolati automaticamente ogni notte alle 01:00.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {reports.map((report) => (
                <motion.div
                  key={report.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="border border-white/10 rounded-lg p-4 hover:border-white/20 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(report.status)}
                      <div>
                        <p className="font-semibold text-white">
                          {monthName(report.period_month)} {report.period_year}
                        </p>
                        <div className="flex gap-4 text-xs text-gray-400 mt-1">
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {report.total_visits} accessi
                          </span>
                          <span className="flex items-center gap-1">
                            <TrendingUp className="w-3 h-3 text-green-400" />
                            Visite: €{(report.method1_amount || 0).toFixed(2)}
                          </span>
                          <span className="flex items-center gap-1">
                            <BarChart3 className="w-3 h-3 text-blue-400" />
                            Comunion: €{(report.method2_amount || 0).toFixed(2)}
                          </span>
                        </div>
                        {report.comunion_share_percent > 0 && (
                          <p className="text-xs text-gray-500 mt-1">
                            Quota Comunion: {report.comunion_share_percent.toFixed(1)}% della rete
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-[#E8FF00]">€{(report.total_amount || 0).toFixed(2)}</p>
                      <div className="mt-1">{getStatusBadge(report.status)}</div>
                      {report.transferred_at && (
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(report.transferred_at).toLocaleDateString("it-IT")}
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}