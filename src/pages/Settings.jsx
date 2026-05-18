import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { motion } from "framer-motion";
import { 
  Shield, 
  Lock, 
  Users, 
  Eye, 
  MessageCircle, 
  MapPin, 
  AlertCircle,
  Save,
  X,
  UserX,
  Flag
} from "lucide-react";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export default function Settings() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showBlockUser, setShowBlockUser] = useState(false);
  const [blockEmail, setBlockEmail] = useState("");
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [reportData, setReportData] = useState({ email: "", reason: "", description: "" });

  const [settings, setSettings] = useState({
    profile_public: true,
    allow_friend_requests: true,
    allow_comments: true,
    allow_nearby_discovery: true
  });

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await base44.auth.me();
      setUser(userData);
      setSettings({
        profile_public: userData.profile_public ?? true,
        allow_friend_requests: userData.allow_friend_requests ?? true,
        allow_comments: userData.allow_comments ?? true,
        allow_nearby_discovery: userData.allow_nearby_discovery ?? true
      });
    } catch (error) {
      console.error("Error loading user:", error);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await base44.auth.updateMe(settings);
      toast.success("Impostazioni salvate!");
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("Errore nel salvataggio");
    }
    setSaving(false);
  };

  const handleBlockUser = async () => {
    if (!blockEmail) return;
    
    try {
      const updatedBlocked = [...(user.blocked_users || []), blockEmail];
      await base44.auth.updateMe({ blocked_users: updatedBlocked });
      toast.success(`Utente ${blockEmail} bloccato`);
      setBlockEmail("");
      setShowBlockUser(false);
      await loadUser();
    } catch (error) {
      console.error("Error blocking user:", error);
      toast.error("Errore nel bloccare l'utente");
    }
  };

  const handleUnblockUser = async (email) => {
    try {
      const updatedBlocked = (user.blocked_users || []).filter(e => e !== email);
      await base44.auth.updateMe({ blocked_users: updatedBlocked });
      toast.success(`Utente ${email} sbloccato`);
      await loadUser();
    } catch (error) {
      console.error("Error unblocking user:", error);
      toast.error("Errore nello sbloccare l'utente");
    }
  };

  const handleReportUser = async () => {
    if (!reportData.email || !reportData.reason) return;
    
    try {
      await base44.entities.UserReport.create({
        reporter_email: user.email,
        reported_user_email: reportData.email,
        reason: reportData.reason,
        description: reportData.description,
        status: "pending",
        created_date: new Date().toISOString()
      });
      toast.success("Segnalazione inviata");
      setReportData({ email: "", reason: "", description: "" });
      setShowReportDialog(false);
    } catch (error) {
      console.error("Error reporting user:", error);
      toast.error("Errore nella segnalazione");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0a0a0a]">
        <div className="w-10 h-10 rounded-full border-2 border-[#E8FF00] border-t-transparent animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] pb-24">
      <div className="max-w-2xl mx-auto px-4 py-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-black text-white">Impostazioni Privacy</h1>
            <Button onClick={handleSave} disabled={saving} className="text-black font-bold" style={{ background: "#E8FF00" }}>
              {saving ? "Salvataggio..." : "Salva"}
              <Save className="w-4 h-4 ml-2" />
            </Button>
          </div>

          {/* Profile Section */}
          <Card className="bg-[#111] border-white/5 rounded-2xl mb-4">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: "#E8FF00" }}>
                  <span className="text-black font-bold">{user?.full_name?.charAt(0).toUpperCase() || 'U'}</span>
                </div>
                <div>
                  <p className="font-bold text-white">{user?.full_name || "Utente"}</p>
                  <p className="text-sm text-gray-500">{user?.email}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Privacy Settings */}
          <Card className="bg-[#111] border-white/5 rounded-2xl mb-4">
            <CardContent className="p-4 space-y-4">
              <h2 className="font-bold text-white mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-[#E8FF00]" />
                Privacy e Visibilità
              </h2>

              <div className="flex items-center justify-between py-3 border-b border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                    <Eye className="w-4 h-4 text-[#E8FF00]" />
                  </div>
                  <div>
                    <p className="font-semibold text-white text-sm">Profilo pubblico</p>
                    <p className="text-xs text-gray-500">Gli altri utenti possono vedere il tuo profilo</p>
                  </div>
                </div>
                <Switch
                  checked={settings.profile_public}
                  onCheckedChange={(checked) => setSettings({ ...settings, profile_public: checked })}
                />
              </div>

              <div className="flex items-center justify-between py-3 border-b border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                    <Users className="w-4 h-4 text-[#E8FF00]" />
                  </div>
                  <div>
                    <p className="font-semibold text-white text-sm">Consenti richieste di amicizia</p>
                    <p className="text-xs text-gray-500">Gli utenti possono inviarti richieste</p>
                  </div>
                </div>
                <Switch
                  checked={settings.allow_friend_requests}
                  onCheckedChange={(checked) => setSettings({ ...settings, allow_friend_requests: checked })}
                />
              </div>

              <div className="flex items-center justify-between py-3 border-b border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                    <MessageCircle className="w-4 h-4 text-[#E8FF00]" />
                  </div>
                  <div>
                    <p className="font-semibold text-white text-sm">Consenti commenti</p>
                    <p className="text-xs text-gray-500">Gli utenti possono commentare i tuoi post</p>
                  </div>
                </div>
                <Switch
                  checked={settings.allow_comments}
                  onCheckedChange={(checked) => setSettings({ ...settings, allow_comments: checked })}
                />
              </div>

              <div className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                    <MapPin className="w-4 h-4 text-[#E8FF00]" />
                  </div>
                  <div>
                    <p className="font-semibold text-white text-sm">Scoperta da utenti vicini</p>
                    <p className="text-xs text-gray-500">Mostra il tuo profilo a utenti nelle vicinanze</p>
                  </div>
                </div>
                <Switch
                  checked={settings.allow_nearby_discovery}
                  onCheckedChange={(checked) => setSettings({ ...settings, allow_nearby_discovery: checked })}
                />
              </div>
            </CardContent>
          </Card>

          {/* Blocked Users */}
          <Card className="bg-[#111] border-white/5 rounded-2xl mb-4">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-white flex items-center gap-2">
                  <Lock className="w-5 h-5 text-[#E8FF00]" />
                  Utenti Bloccati
                </h2>
                <Button size="sm" variant="outline" onClick={() => setShowBlockUser(true)}>
                  <UserX className="w-4 h-4 mr-2" />
                  Blocca utente
                </Button>
              </div>

              {user?.blocked_users && user.blocked_users.length > 0 ? (
                <div className="space-y-2">
                  {user.blocked_users.map((email, index) => (
                    <div key={index} className="flex items-center justify-between bg-white/5 rounded-xl p-3">
                      <span className="text-sm text-gray-300">{email}</span>
                      <Button size="sm" variant="ghost" onClick={() => handleUnblockUser(email)}>
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm text-center py-4">Nessun utente bloccato</p>
              )}
            </CardContent>
          </Card>

          {/* Report User */}
          <Card className="bg-[#111] border-white/5 rounded-2xl">
            <CardContent className="p-4">
              <h2 className="font-bold text-white mb-4 flex items-center gap-2">
                <Flag className="w-5 h-5 text-[#E8FF00]" />
                Segnala Utente
              </h2>
              <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full">
                    <AlertCircle className="w-4 h-4 mr-2" />
                    Segnala un utente
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-[#111] border-white/10">
                  <DialogHeader>
                    <DialogTitle className="text-white">Segnala Utente</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div>
                      <Label className="text-gray-300">Email utente</Label>
                      <Input 
                        value={reportData.email}
                        onChange={(e) => setReportData({ ...reportData, email: e.target.value })}
                        className="bg-white/5 border-white/10 text-white"
                        placeholder="email@esempio.com"
                      />
                    </div>
                    <div>
                      <Label className="text-gray-300">Motivo</Label>
                      <select 
                        value={reportData.reason}
                        onChange={(e) => setReportData({ ...reportData, reason: e.target.value })}
                        className="w-full bg-white/5 border-white/10 text-white rounded-lg px-3 py-2"
                      >
                        <option value="">Seleziona motivo</option>
                        <option value="spam">Spam</option>
                        <option value="harassment">Molestie</option>
                        <option value="inappropriate_content">Contenuto inappropriato</option>
                        <option value="fake_profile">Profilo falso</option>
                        <option value="other">Altro</option>
                      </select>
                    </div>
                    <div>
                      <Label className="text-gray-300">Descrizione</Label>
                      <Textarea 
                        value={reportData.description}
                        onChange={(e) => setReportData({ ...reportData, description: e.target.value })}
                        className="bg-white/5 border-white/10 text-white"
                        rows={3}
                        placeholder="Descrivi il problema..."
                      />
                    </div>
                    <Button onClick={handleReportUser} className="w-full" style={{ background: "#E8FF00" }}>
                      Invia Segnalazione
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>

          {/* Block User Dialog */}
          <Dialog open={showBlockUser} onOpenChange={setShowBlockUser}>
            <DialogContent className="bg-[#111] border-white/10">
              <DialogHeader>
                <DialogTitle className="text-white">Blocca Utente</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label className="text-gray-300">Email utente da bloccare</Label>
                  <Input 
                    value={blockEmail}
                    onChange={(e) => setBlockEmail(e.target.value)}
                    className="bg-white/5 border-white/10 text-white"
                    placeholder="email@esempio.com"
                  />
                </div>
                <p className="text-xs text-gray-500">
                  L'utente bloccato non potrà vederti, seguirti o interagire con i tuoi post.
                </p>
                <Button onClick={handleBlockUser} className="w-full" style={{ background: "#E8FF00" }}>
                  Blocca
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </motion.div>
      </div>
    </div>
  );
}