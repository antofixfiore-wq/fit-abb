import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import {
  Building2, Plus, Search, CheckCircle, AlertCircle,
  Loader2, Edit, X, Save, Mail, MapPin, Phone, Euro
} from "lucide-react";
import { toast } from "sonner";

const EMPTY_GYM = {
  name: "", city: "", address: "", region: "",
  phone: "", email: "", piva: "", billing_name: "", iban: "",
  manager_email: "", description: "",
  available_for_gold: true, available_for_plus: false,
  is_partner: true, visura_status: "approved",
  payout_method: "both",
};

export default function AdminGyms() {
  const [user, setUser] = useState(null);
  const [gyms, setGyms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingGym, setEditingGym] = useState(null);
  const [form, setForm] = useState(EMPTY_GYM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    try {
      const u = await base44.auth.me();
      if (u?.role !== "admin") {
        setError("Accesso riservato agli amministratori");
        setLoading(false);
        return;
      }
      setUser(u);
      await loadGyms();
    } catch {
      setError("Errore di autenticazione");
    }
    setLoading(false);
  };

  const loadGyms = async () => {
    const data = await base44.entities.Gym.list();
    setGyms(data);
  };

  const set = (field) => (e) =>
    setForm(f => ({ ...f, [field]: e.target?.value ?? e }));

  const openNew = () => {
    setForm(EMPTY_GYM);
    setEditingGym(null);
    setError("");
    setShowForm(true);
  };

  const openEdit = (gym) => {
    setForm({ ...EMPTY_GYM, ...gym });
    setEditingGym(gym);
    setError("");
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.city || !form.address) {
      setError("Nome, città e indirizzo sono obbligatori");
      return;
    }
    setSaving(true);
    setError("");
    try {
      if (editingGym) {
        await base44.entities.Gym.update(editingGym.id, form);
        toast.success("Palestra aggiornata!");
      } else {
        await base44.entities.Gym.create({ ...form, qr_code: `GYM-${Date.now()}` });
        toast.success("Palestra creata!");

        // Invia email di benvenuto al gestore se c'è un manager_email
        if (form.manager_email) {
          await base44.integrations.Core.SendEmail({
            to: form.manager_email,
            subject: "Benvenuto nel circuito Fit ABB! 🏋️",
            body: `Ciao,\n\nLa palestra "${form.name}" è stata aggiunta al circuito Fit ABB.\n\nAccedi alla tua dashboard su https://fitabb.com/GymDashboard per completare il profilo con foto, orari e documenti.\n\nSe non hai ancora un account, registrati con questa email: ${form.manager_email}\n\nPer qualsiasi domanda scrivici a partner@fit-abb.com\n\nBenvenuto a bordo!\nIl team Fit ABB`
          });
        }
      }
      await loadGyms();
      setShowForm(false);
    } catch (e) {
      setError("Errore nel salvataggio: " + e.message);
    }
    setSaving(false);
  };

  const handleDelete = async (gym) => {
    if (!confirm(`Sei sicuro di voler eliminare "${gym.name}"?`)) return;
    await base44.entities.Gym.delete(gym.id);
    toast.success("Palestra eliminata");
    await loadGyms();
  };

  const handleApproveVisura = async (gym, status) => {
    await base44.entities.Gym.update(gym.id, { visura_status: status });
    toast.success(status === "approved" ? "Visura approvata" : "Visura rifiutata");
    await loadGyms();
  };

  const filtered = gyms.filter(g =>
    g.name?.toLowerCase().includes(search.toLowerCase()) ||
    g.city?.toLowerCase().includes(search.toLowerCase()) ||
    g.manager_email?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
      <Loader2 className="w-10 h-10 text-[#E8FF00] animate-spin" />
    </div>
  );

  if (error && !user) return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-6">
      <Alert className="bg-red-900/20 border-red-500/30 max-w-md">
        <AlertCircle className="h-4 w-4 text-red-400" />
        <AlertDescription className="text-red-300">{error}</AlertDescription>
      </Alert>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0a0a] p-4 md:p-6">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Building2 className="w-6 h-6 text-[#E8FF00]" />
              Gestione Palestre
            </h1>
            <p className="text-gray-400 text-sm mt-1">{gyms.length} palestre nel circuito</p>
          </div>
          <Button onClick={openNew} className="bg-[#E8FF00] text-black font-bold hover:opacity-90">
            <Plus className="w-4 h-4 mr-2" />
            Aggiungi Palestra
          </Button>
        </div>

        {/* Ricerca */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cerca per nome, città, email..."
            className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-gray-600"
          />
        </div>

        {/* Form creazione/modifica */}
        {showForm && (
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center justify-between">
                <span>{editingGym ? `Modifica: ${editingGym.name}` : "Nuova Palestra"}</span>
                <button onClick={() => setShowForm(false)} className="text-gray-500 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              {error && (
                <Alert className="bg-red-900/20 border-red-500/30">
                  <AlertCircle className="h-4 w-4 text-red-400" />
                  <AlertDescription className="text-red-300">{error}</AlertDescription>
                </Alert>
              )}

              {/* Dati struttura */}
              <div>
                <p className="text-[#E8FF00] text-xs font-bold uppercase tracking-wider mb-3">📍 Dati Struttura</p>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="sm:col-span-2">
                    <Label className="text-gray-400 text-xs">Nome Palestra *</Label>
                    <Input value={form.name} onChange={set("name")} placeholder="Power Gym Milano" className="bg-white/5 border-white/10 text-white mt-1" />
                  </div>
                  <div>
                    <Label className="text-gray-400 text-xs">Indirizzo *</Label>
                    <Input value={form.address} onChange={set("address")} placeholder="Via Roma 1" className="bg-white/5 border-white/10 text-white mt-1" />
                  </div>
                  <div>
                    <Label className="text-gray-400 text-xs">Città *</Label>
                    <Input value={form.city} onChange={set("city")} placeholder="Milano" className="bg-white/5 border-white/10 text-white mt-1" />
                  </div>
                  <div>
                    <Label className="text-gray-400 text-xs">Regione</Label>
                    <Input value={form.region} onChange={set("region")} placeholder="Lombardia" className="bg-white/5 border-white/10 text-white mt-1" />
                  </div>
                  <div>
                    <Label className="text-gray-400 text-xs">Telefono</Label>
                    <Input value={form.phone} onChange={set("phone")} placeholder="+39 02 1234567" className="bg-white/5 border-white/10 text-white mt-1" />
                  </div>
                  <div>
                    <Label className="text-gray-400 text-xs">Email Contatto</Label>
                    <Input type="email" value={form.email} onChange={set("email")} placeholder="info@palestra.it" className="bg-white/5 border-white/10 text-white mt-1" />
                  </div>
                  <div>
                    <Label className="text-gray-400 text-xs">Email Gestore (per accesso dashboard)</Label>
                    <Input type="email" value={form.manager_email} onChange={set("manager_email")} placeholder="gestore@palestra.it" className="bg-white/5 border-white/10 text-white mt-1" />
                  </div>
                  <div className="sm:col-span-2">
                    <Label className="text-gray-400 text-xs">Descrizione</Label>
                    <Input value={form.description} onChange={set("description")} placeholder="Breve descrizione..." className="bg-white/5 border-white/10 text-white mt-1" />
                  </div>
                </div>
              </div>

              {/* Piani accettati */}
              <div>
                <p className="text-[#E8FF00] text-xs font-bold uppercase tracking-wider mb-3">🎫 Piani Accettati</p>
                <div className="flex gap-6">
                  <div className="flex items-center gap-2">
                    <Switch checked={form.available_for_gold} onCheckedChange={(v) => setForm(f => ({ ...f, available_for_gold: v }))} />
                    <Label className="text-gray-300">Gold</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch checked={form.available_for_plus} onCheckedChange={(v) => setForm(f => ({ ...f, available_for_plus: v }))} />
                    <Label className="text-gray-300">Plus</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch checked={form.is_partner} onCheckedChange={(v) => setForm(f => ({ ...f, is_partner: v }))} />
                    <Label className="text-gray-300">Partner ufficiale</Label>
                  </div>
                </div>
              </div>

              {/* Dati fiscali */}
              <div>
                <p className="text-[#E8FF00] text-xs font-bold uppercase tracking-wider mb-3">💳 Dati Fiscali & Pagamento</p>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <Label className="text-gray-400 text-xs">Partita IVA</Label>
                    <Input value={form.piva} onChange={set("piva")} placeholder="IT12345678901" className="bg-white/5 border-white/10 text-white mt-1" />
                  </div>
                  <div>
                    <Label className="text-gray-400 text-xs">IBAN</Label>
                    <Input value={form.iban} onChange={set("iban")} placeholder="IT60X..." className="bg-white/5 border-white/10 text-white mt-1" />
                  </div>
                  <div className="sm:col-span-2">
                    <Label className="text-gray-400 text-xs">Ragione Sociale</Label>
                    <Input value={form.billing_name} onChange={set("billing_name")} placeholder="Fitness SRL" className="bg-white/5 border-white/10 text-white mt-1" />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button variant="outline" onClick={() => setShowForm(false)} className="flex-1 border-white/10 text-white hover:bg-white/5">
                  Annulla
                </Button>
                <Button onClick={handleSave} disabled={saving} className="flex-1 bg-[#E8FF00] text-black font-bold hover:opacity-90">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4 mr-2" />{editingGym ? "Salva Modifiche" : "Crea Palestra"}</>}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Lista palestre */}
        <div className="space-y-3">
          {filtered.length === 0 && (
            <Card className="bg-white/5 border-white/10">
              <CardContent className="py-12 text-center text-gray-500">
                <Building2 className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p>Nessuna palestra trovata</p>
              </CardContent>
            </Card>
          )}
          {filtered.map(gym => (
            <Card key={gym.id} className="bg-white/5 border-white/10">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="text-white font-bold">{gym.name}</h3>
                      {gym.is_partner && <Badge className="bg-[#E8FF00]/20 text-[#E8FF00] text-xs">Partner</Badge>}
                      {gym.available_for_gold && <Badge className="bg-yellow-900/50 text-yellow-300 text-xs">Gold</Badge>}
                      {gym.available_for_plus && <Badge className="bg-blue-900/50 text-blue-300 text-xs">Plus</Badge>}
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-400">
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{gym.city}{gym.address ? `, ${gym.address}` : ""}</span>
                      {gym.manager_email && <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{gym.manager_email}</span>}
                      {gym.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{gym.phone}</span>}
                    </div>

                    {/* Stato visura */}
                    {gym.visura_url && (
                      <div className="flex items-center gap-2 mt-2">
                        <Badge className={
                          gym.visura_status === "approved" ? "bg-green-900/50 text-green-300" :
                          gym.visura_status === "rejected" ? "bg-red-900/50 text-red-300" :
                          "bg-yellow-900/50 text-yellow-300"
                        }>
                          Visura: {gym.visura_status === "approved" ? "✓ Approvata" : gym.visura_status === "rejected" ? "✗ Rifiutata" : "⏳ Da approvare"}
                        </Badge>
                        {gym.visura_status === "pending" && (
                          <>
                            <button onClick={() => handleApproveVisura(gym, "approved")} className="text-xs text-green-400 hover:underline">Approva</button>
                            <button onClick={() => handleApproveVisura(gym, "rejected")} className="text-xs text-red-400 hover:underline">Rifiuta</button>
                          </>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 shrink-0">
                    <Button size="sm" variant="outline" onClick={() => openEdit(gym)} className="border-white/10 text-white hover:bg-white/10">
                      <Edit className="w-3.5 h-3.5" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleDelete(gym)} className="border-red-500/30 text-red-400 hover:bg-red-900/20">
                      <X className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}