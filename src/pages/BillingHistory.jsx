import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Receipt, Download, ExternalLink, Calendar, CreditCard, Award, AlertCircle, Clock } from "lucide-react";
import { motion } from "framer-motion";

const planNames = {
  gold: "Gold Mensile",
  plus: "Plus Mensile",
  annuale_gold: "Gold Annuale",
  annuale_plus: "Plus Annuale",
  premium: "Platinum",
};

const planColors = {
  gold: "bg-yellow-100 text-yellow-800",
  plus: "bg-lime-100 text-lime-800",
  annuale_gold: "bg-yellow-100 text-yellow-800",
  annuale_plus: "bg-lime-100 text-lime-800",
  premium: "bg-blue-100 text-blue-800",
  none: "bg-gray-100 text-gray-800",
};

const statusConfig = {
  paid: { label: "Pagata", color: "bg-green-100 text-green-800" },
  open: { label: "In attesa", color: "bg-orange-100 text-orange-800" },
  void: { label: "Annullata", color: "bg-gray-100 text-gray-600" },
  uncollectible: { label: "Non riscossa", color: "bg-red-100 text-red-800" },
  draft: { label: "Bozza", color: "bg-gray-100 text-gray-600" },
};

export default function BillingHistory() {
  const [user, setUser] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const userData = await base44.auth.me();
      setUser(userData);

      if (userData.stripe_customer_id) {
        const res = await base44.functions.invoke("getStripeInvoices", {});
        setInvoices(res.data?.invoices || []);
      }
    } catch (err) {
      setError("Errore nel caricamento dello storico pagamenti.");
    }
    setLoading(false);
  };

  const formatDate = (isoStr) => {
    if (!isoStr) return "—";
    return new Date(isoStr).toLocaleDateString("it-IT", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const formatAmount = (amount, currency) => {
    return `€${amount.toFixed(2)}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0a0a0a]">
        <div className="w-10 h-10 rounded-full border-2 border-[#E8FF00] border-t-transparent animate-spin"></div>
      </div>
    );
  }

  const currentPlan = user?.subscription_plan || user?.subscription_type;
  const subStatus = user?.subscription_status;
  const isCancelling = user?.subscription_cancel_at_period_end;

  return (
    <div className="min-h-screen bg-[#0a0a0a] p-4 md:p-6">
      <div className="max-w-3xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-1 flex items-center gap-3">
              <Receipt className="w-8 h-8 text-[#E8FF00]" />
              Fatturazione
            </h1>
            <p className="text-gray-400">Storico pagamenti e ricevute del tuo abbonamento</p>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Riepilogo abbonamento corrente */}
          {currentPlan && currentPlan !== "none" && (
            <Card className="mb-6 bg-[#1a1a1a] border-white/10 overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-[#E8FF00] to-yellow-400"></div>
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2 text-lg">
                  <Award className="w-5 h-5 text-[#E8FF00]" />
                  Abbonamento Attivo
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Piano</span>
                  <Badge className={planColors[currentPlan] || "bg-gray-100 text-gray-800"}>
                    {planNames[currentPlan] || currentPlan.toUpperCase()}
                  </Badge>
                </div>
                {subStatus && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Stato</span>
                    <Badge className={statusConfig[subStatus]?.color || "bg-gray-100 text-gray-600"}>
                      {subStatus === "active" ? (isCancelling ? "Attivo (disdetta a scadenza)" : "Attivo") : statusConfig[subStatus]?.label || subStatus}
                    </Badge>
                  </div>
                )}
                {user?.subscription_start_date && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Inizio</span>
                    <span className="text-white text-sm">{formatDate(user.subscription_start_date)}</span>
                  </div>
                )}
                {user?.subscription_end_date && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">{isCancelling ? "Scade il" : "Prossimo rinnovo"}</span>
                    <span className="text-white text-sm flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-gray-500" />
                      {formatDate(user.subscription_end_date)}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Storico ricevute */}
          <Card className="bg-[#1a1a1a] border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2 text-lg">
                <CreditCard className="w-5 h-5 text-[#E8FF00]" />
                Storico Pagamenti
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!user?.stripe_customer_id ? (
                <div className="text-center py-12">
                  <Receipt className="w-14 h-14 text-gray-700 mx-auto mb-4" />
                  <p className="text-gray-400 text-sm">Nessun pagamento ancora registrato.</p>
                  <p className="text-gray-600 text-xs mt-1">Le ricevute appariranno qui dopo il primo abbonamento.</p>
                </div>
              ) : invoices.length === 0 ? (
                <div className="text-center py-12">
                  <Receipt className="w-14 h-14 text-gray-700 mx-auto mb-4" />
                  <p className="text-gray-400 text-sm">Nessuna ricevuta disponibile.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {invoices.map((inv, i) => {
                    const status = statusConfig[inv.status] || { label: inv.status, color: "bg-gray-100 text-gray-600" };
                    return (
                      <motion.div
                        key={inv.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: i * 0.05 }}
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white/5 hover:bg-white/8 rounded-xl p-4 border border-white/5 transition-colors"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-xl bg-[#E8FF00]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Receipt className="w-5 h-5 text-[#E8FF00]" />
                          </div>
                          <div>
                            <p className="font-semibold text-white text-sm">
                              {inv.description || "Abbonamento Fit ABB"}
                            </p>
                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                              <span className="text-xs text-gray-500 flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {formatDate(inv.created)}
                              </span>
                              {inv.number && (
                                <span className="text-xs text-gray-600">#{inv.number}</span>
                              )}
                            </div>
                            {inv.period_start && inv.period_end && (
                              <p className="text-xs text-gray-600 mt-0.5">
                                Periodo: {formatDate(inv.period_start)} → {formatDate(inv.period_end)}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-3 sm:flex-col sm:items-end ml-13 sm:ml-0">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white text-base">
                              {formatAmount(inv.amount_paid, inv.currency)}
                            </span>
                            <Badge className={`${status.color} text-xs`}>
                              {status.label}
                            </Badge>
                          </div>
                          <div className="flex gap-2">
                            {inv.invoice_pdf && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-white/10 text-gray-300 hover:bg-white/10 hover:text-white text-xs h-8 px-3"
                                onClick={() => window.open(inv.invoice_pdf, "_blank")}
                              >
                                <Download className="w-3.5 h-3.5 mr-1.5" />
                                PDF
                              </Button>
                            )}
                            {inv.hosted_invoice_url && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-white/10 text-gray-300 hover:bg-white/10 hover:text-white text-xs h-8 px-3"
                                onClick={() => window.open(inv.hosted_invoice_url, "_blank")}
                              >
                                <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
                                Apri
                              </Button>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Note */}
          <p className="text-xs text-gray-700 text-center mt-6">
            Le ricevute vengono generate automaticamente da Stripe ed inviate via email all'indirizzo {user?.email}.
          </p>

        </motion.div>
      </div>
    </div>
  );
}