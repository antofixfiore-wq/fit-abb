import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate, useSearchParams } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { X, Upload, Camera, MapPin, Globe } from "lucide-react";
import { motion } from "framer-motion";

export default function ShareAfterCheckIn() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [user, setUser] = useState(null);
  const [gym, setGym] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [postData, setPostData] = useState({
    caption: "",
    photo_url: "",
    gym_name: "",
    is_public: true
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const userData = await base44.auth.me();
      setUser(userData);

      const gymId = searchParams.get("gym_id");
      if (gymId) {
        const gyms = await base44.entities.Gym.list();
        const foundGym = gyms.find(g => g.id === gymId);
        setGym(foundGym);
        setPostData(prev => ({ ...prev, gym_name: foundGym?.name || "" }));
      }
    } catch (error) {
      console.error("Error loading data:", error);
    }
    setLoading(false);
  };

  const handlePhotoUpload = async (file) => {
    if (!file) return;
    
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setPostData({ ...postData, photo_url: file_url });
    } catch (error) {
      console.error("Error uploading photo:", error);
    }
    setUploading(false);
  };

  const handleShare = async () => {
    if (!postData.caption && !postData.photo_url) {
      // Skip sharing
      navigate(createPageUrl("ClientDashboard"));
      return;
    }

    try {
      await base44.entities.CommunityPost.create({
        user_email: user.email,
        user_name: user.full_name,
        user_photo_url: user.profile_image_url,
        caption: postData.caption,
        photo_url: postData.photo_url,
        gym_name: postData.gym_name,
        boosts: 0,
        boosted_by: [],
        comments_count: 0,
        is_public: postData.is_public,
        created_date: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error creating post:", error);
    }
    
    navigate(createPageUrl("ClientDashboard"));
  };

  const handleSkip = () => {
    navigate(createPageUrl("ClientDashboard"));
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
      <div className="max-w-2xl mx-auto px-4 pt-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-black text-white">Condividi Allenamento</h1>
          <Button variant="ghost" size="icon" onClick={handleSkip}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <Card className="bg-gradient-to-r from-[#E8FF00]/20 to-[#E8FF00]/5 border-[#E8FF00]/30 rounded-2xl">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 rounded-full bg-[#E8FF00]/20 flex items-center justify-center mx-auto mb-4">
                <Camera className="w-8 h-8 text-[#E8FF00]" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">
                Condividi questo allenamento con la community?
              </h2>
              <p className="text-gray-400 text-sm">
                Mostra ai tuoi GymFriends cosa stai facendo!
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-4"
        >
          {/* Caption */}
          <Card className="bg-[#111] border-white/5 rounded-2xl">
            <CardContent className="p-4 space-y-4">
              <Textarea
                placeholder="Come è andato l'allenamento? Scrivi qualcosa..."
                value={postData.caption}
                onChange={(e) => setPostData({ ...postData, caption: e.target.value })}
                rows={3}
                className="bg-white/5 border-white/10 text-white placeholder-gray-600 rounded-xl resize-none"
              />

              {/* Photo Upload */}
              <div className="border border-dashed border-white/10 rounded-xl p-4">
                {postData.photo_url ? (
                  <div className="relative">
                    <img src={postData.photo_url} alt="Preview" className="w-full h-48 object-cover rounded-xl" />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2"
                      onClick={() => setPostData({ ...postData, photo_url: "" })}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center gap-2 cursor-pointer py-4">
                    <Upload className="w-7 h-7 text-gray-600" />
                    <span className="text-sm text-gray-600">{uploading ? "Caricamento..." : "Carica una foto"}</span>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => e.target.files[0] && handlePhotoUpload(e.target.files[0])}
                      disabled={uploading}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {/* Gym Tag */}
              {gym && (
                <div className="flex items-center gap-2 bg-white/5 rounded-xl p-3">
                  <MapPin className="w-4 h-4 text-[#E8FF00]" />
                  <span className="text-sm text-white font-medium">{gym.name}</span>
                </div>
              )}

              {/* Privacy Toggle */}
              <div className="flex items-center justify-between bg-white/5 rounded-xl p-3">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-300">Pubblico (visibile nel Discover)</span>
                </div>
                <input
                  type="checkbox"
                  checked={postData.is_public}
                  onChange={(e) => setPostData({ ...postData, is_public: e.target.checked })}
                  className="w-4 h-4 rounded"
                />
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={handleSkip}
              variant="outline"
              className="flex-1 h-12 text-black font-bold bg-white border-white"
            >
              Salta
            </Button>
            <Button
              onClick={handleShare}
              className="flex-1 h-12 text-black font-bold"
              style={{ background: "#E8FF00" }}
              disabled={!postData.caption && !postData.photo_url}
            >
              <Camera className="w-5 h-5 mr-2" />
              Pubblica
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}