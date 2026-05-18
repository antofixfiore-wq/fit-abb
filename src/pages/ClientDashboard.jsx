import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import PullToRefresh from "@/components/mobile/PullToRefresh";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  Trophy,
  MapPin,
  Calendar,
  Target,
  Flame,
  Camera,
  X,
  Upload,
  Edit,
  Send,
  Award
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ProgressStats from "../components/gamification/ProgressStats";
import BadgeCard from "../components/gamification/BadgeCard";

export default function ClientDashboard() {
  const [user, setUser] = useState(null);
  const [feedPosts, setFeedPosts] = useState([]);
  const [comments, setComments] = useState({});
  const [showComments, setShowComments] = useState({});
  const [newComment, setNewComment] = useState({});
  const [achievements, setAchievements] = useState([]); // New state for achievements
  const [stats, setStats] = useState({
    totalWorkouts: 0,
    activeSubscription: null,
    monthlyVisits: 0,
    streak: 0
  });
  const [loading, setLoading] = useState(true);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadingProfile, setUploadingProfile] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [newPost, setNewPost] = useState({
    title: "",
    description: "",
    photo_url: "",
    type: "photo"
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const userData = await base44.auth.me();
      setUser(userData);
      
      const posts = await base44.entities.FeedPost.list("-created_date", 50);
      setFeedPosts(posts);
      
      const allComments = await base44.entities.Comment.list("-created_date");
      const commentsByPost = {};
      allComments.forEach(comment => {
        if (!commentsByPost[comment.post_id]) {
          commentsByPost[comment.post_id] = [];
        }
        commentsByPost[comment.post_id].push(comment);
      });
      setComments(commentsByPost);

      const userAchievements = await base44.entities.UserAchievement.filter(
        { user_email: userData.email },
        "-unlocked_date"
      );
      setAchievements(userAchievements);
      
      setStats({
        totalWorkouts: userData.completed_workouts || 0, // Use userData.completed_workouts
        activeSubscription: userData.subscription_type,
        monthlyVisits: 12,
        streak: userData.current_streak || 0 // Use userData.current_streak
      });
    } catch (error) {
      console.error("Error loading data:", error);
    }
    setLoading(false);
  };

  const calculateLevel = (totalPoints) => {
    const getPointsForLevel = (level) => {
      const basePoints = 500;
      return Math.floor(basePoints * Math.pow(1.5, level - 1));
    };
    
    let level = 1;
    let pointsRequired = 0;
    
    while (level < 10) {
      pointsRequired += getPointsForLevel(level);
      if (totalPoints < pointsRequired) break;
      level++;
    }
    
    return Math.min(level, 10);
  };

  const checkAndAwardBadges = async () => {
    if (!user) return; // Ensure user data is loaded

    const existingBadges = achievements.map(a => a.badge_type);
    const newBadges = [];

    // Assuming user stats like completed_workouts, current_streak, total_points are updated before this check
    // If not, fetch the latest user data here or ensure `user` state is always up-to-date.
    // For this implementation, we will use the `user` state passed to this function.

    if (!existingBadges.includes("first_workout") && user.completed_workouts >= 1) {
      newBadges.push({
        badge_type: "first_workout",
        badge_name: "Primo Allenamento",
        badge_description: "Hai completato il tuo primo allenamento!",
        points_earned: 50
      });
    }

    if (!existingBadges.includes("workout_master") && user.completed_workouts >= 10) {
      newBadges.push({
        badge_type: "workout_master",
        badge_name: "Maestro degli Allenamenti",
        badge_description: "10 allenamenti completati",
        points_earned: 200
      });
    }

    if (!existingBadges.includes("streak_3") && user.current_streak >= 3) {
      newBadges.push({
        badge_type: "streak_3",
        badge_name: "In Fiamme",
        badge_description: "3 giorni di streak consecutivi",
        points_earned: 100
      });
    }

    if (!existingBadges.includes("streak_7") && user.current_streak >= 7) {
      newBadges.push({
        badge_type: "streak_7",
        badge_name: "Settimana Perfetta",
        badge_description: "7 giorni di streak consecutivi",
        points_earned: 250
      });
    }

    // This check relies on `feedPosts` which is already fetched.
    const userPosts = feedPosts.filter(p => p.user_email === user.email).length;
    
    if (!existingBadges.includes("social_butterfly") && userPosts >= 5) {
      newBadges.push({
        badge_type: "social_butterfly",
        badge_name: "Farfalla Sociale",
        badge_description: "5 post condivisi",
        points_earned: 150
      });
    }

    if (!existingBadges.includes("social_influencer") && userPosts >= 20) {
      newBadges.push({
        badge_type: "social_influencer",
        badge_name: "Influencer",
        badge_description: "20 post condivisi",
        points_earned: 400
      });
    }

    if (!existingBadges.includes("workout_legend") && user.completed_workouts >= 50) {
      newBadges.push({
        badge_type: "workout_legend",
        badge_name: "Leggenda Fitness",
        badge_description: "50 allenamenti completati",
        points_earned: 500
      });
    }

    if (!existingBadges.includes("workout_titan") && user.completed_workouts >= 100) {
      newBadges.push({
        badge_type: "workout_titan",
        badge_name: "Titano dell'Allenamento",
        badge_description: "100 allenamenti completati",
        points_earned: 1000
      });
    }

    if (!existingBadges.includes("streak_14") && user.current_streak >= 14) {
      newBadges.push({
        badge_type: "streak_14",
        badge_name: "Due Settimane Strong",
        badge_description: "14 giorni consecutivi",
        points_earned: 400
      });
    }

    if (!existingBadges.includes("streak_100") && user.current_streak >= 100) {
      newBadges.push({
        badge_type: "streak_100",
        badge_name: "Immortale",
        badge_description: "100 giorni consecutivi",
        points_earned: 3000
      });
    }

    if (!existingBadges.includes("level_5") && user.level >= 5) {
      newBadges.push({
        badge_type: "level_5",
        badge_name: "Veterano",
        badge_description: "Livello 5 raggiunto",
        points_earned: 250
      });
    }

    if (!existingBadges.includes("level_10") && user.level >= 10) {
      newBadges.push({
        badge_type: "level_10",
        badge_name: "Leggenda Vivente",
        badge_description: "Livello 10 raggiunto",
        points_earned: 1000
      });
    }

    for (const badge of newBadges) {
      try {
        await base44.entities.UserAchievement.create({
          ...badge,
          user_email: user.email,
          unlocked_date: new Date().toISOString().split('T')[0] // Format date as YYYY-MM-DD
        });

        // Update user's total points and level in the backend
        const newTotalPoints = (user.total_points || 0) + badge.points_earned;
        const newLevel = calculateLevel(newTotalPoints);
        
        await base44.auth.updateMe({
          total_points: newTotalPoints,
          level: newLevel
        });
      } catch (error) {
        console.error(`Error awarding badge ${badge.badge_type}:`, error);
      }
    }

    if (newBadges.length > 0) {
      await loadData(); // Re-load data to update achievements and user points
    }
  };

  const handleProfileImageUpload = async (file) => {
    if (!file) return;
    
    setUploadingProfile(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      await base44.auth.updateMe({ profile_image_url: file_url });
      await loadData();
    } catch (error) {
      console.error("Error uploading profile image:", error);
    }
    setUploadingProfile(false);
  };

  const handleBannerImageUpload = async (file) => {
    if (!file) return;
    
    setUploadingBanner(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      await base44.auth.updateMe({ banner_image_url: file_url });
      await loadData();
    } catch (error) {
      console.error("Error uploading banner image:", error);
    }
    setUploadingBanner(false);
  };

  const handlePhotoUpload = async (file) => {
    if (!file) return;
    
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setNewPost({ ...newPost, photo_url: file_url });
    } catch (error) {
      console.error("Error uploading photo:", error);
    }
    setUploading(false);
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!newPost.title) return;

    try {
      await base44.entities.FeedPost.create({
        ...newPost,
        user_email: user.email,
        user_name: user.full_name
      });
      
      setNewPost({ title: "", description: "", photo_url: "", type: "photo" });
      setShowCreatePost(false);
      await loadData();
      await checkAndAwardBadges(); // Call badge check after creating a post and reloading data
    } catch (error) {
      console.error("Error creating post:", error);
    }
  };

  const handleLike = async (post) => {
    const hasLiked = post.liked_by?.includes(user.email);
    const updatedLikedBy = hasLiked
      ? post.liked_by.filter(email => email !== user.email)
      : [...(post.liked_by || []), user.email];
    
    // Optimistic UI update
    setFeedPosts(prevPosts => prevPosts.map(p => 
      p.id === post.id 
        ? { ...p, likes: updatedLikedBy.length, liked_by: updatedLikedBy }
        : p
    ));
    
    try {
      await base44.entities.FeedPost.update(post.id, {
        likes: updatedLikedBy.length,
        liked_by: updatedLikedBy
      });
    } catch (error) {
      console.error("Error liking post:", error);
      // Revert on error
      await loadData();
    }
  };

  const handleAddComment = async (postId) => {
    const commentText = newComment[postId];
    if (!commentText?.trim()) return;

    try {
      await base44.entities.Comment.create({
        post_id: postId,
        user_email: user.email,
        user_name: user.full_name,
        text: commentText
      });
      
      setNewComment({ ...newComment, [postId]: "" });
      await loadData();
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  const toggleComments = (postId) => {
    setShowComments({ ...showComments, [postId]: !showComments[postId] });
  };

  const getPostIcon = (type) => {
    switch(type) {
      case "achievement": return Trophy;
      case "checkin": return MapPin;
      case "workout": return Target;
      case "photo": return Camera;
      default: return Camera;
    }
  };

  const getPostColor = (type) => {
    switch(type) {
      case "achievement": return "from-yellow-400 to-orange-500";
      case "checkin": return "from-blue-500 to-blue-600";
      case "workout": return "from-green-500 to-emerald-600";
      case "photo": return "from-purple-500 to-pink-500";
      default: return "from-gray-500 to-gray-600";
    }
  };

  const allPossibleBadges = [
    {
      badge_type: "first_workout",
      badge_name: "Primo Allenamento",
      badge_description: "Completa il tuo primo allenamento",
      points_earned: 50
    },
    {
      badge_type: "workout_master",
      badge_name: "Maestro degli Allenamenti",
      badge_description: "Completa 10 allenamenti",
      points_earned: 200
    },
    {
      badge_type: "workout_legend",
      badge_name: "Leggenda Fitness",
      badge_description: "Completa 50 allenamenti",
      points_earned: 500
    },
    {
      badge_type: "workout_titan",
      badge_name: "Titano dell'Allenamento",
      badge_description: "Completa 100 allenamenti",
      points_earned: 1000
    },
    {
      badge_type: "streak_3",
      badge_name: "In Fiamme",
      badge_description: "3 giorni consecutivi",
      points_earned: 100
    },
    {
      badge_type: "streak_7",
      badge_name: "Settimana Perfetta",
      badge_description: "7 giorni consecutivi",
      points_earned: 250
    },
    {
      badge_type: "streak_14",
      badge_name: "Due Settimane Strong",
      badge_description: "14 giorni consecutivi",
      points_earned: 400
    },
    {
      badge_type: "streak_30",
      badge_name: "Mese Inarrestabile",
      badge_description: "30 giorni consecutivi",
      points_earned: 1000
    },
    {
      badge_type: "streak_100",
      badge_name: "Immortale",
      badge_description: "100 giorni consecutivi",
      points_earned: 3000
    },
    {
      badge_type: "data_tracker",
      badge_name: "Analista",
      badge_description: "Inserisci dati per 7 giorni",
      points_earned: 150
    },
    {
      badge_type: "data_master",
      badge_name: "Maestro dei Dati",
      badge_description: "Inserisci dati per 30 giorni",
      points_earned: 500
    },
    {
      badge_type: "weight_loss_5",
      badge_name: "Trasformazione",
      badge_description: "Perdi 5kg",
      points_earned: 300
    },
    {
      badge_type: "weight_loss_10",
      badge_name: "Grande Trasformazione",
      badge_description: "Perdi 10kg",
      points_earned: 600
    },
    {
      badge_type: "event_participant",
      badge_name: "Partecipante",
      badge_description: "Partecipa a un evento",
      points_earned: 100
    },
    {
      badge_type: "social_butterfly",
      badge_name: "Farfalla Sociale",
      badge_description: "Condividi 5 post",
      points_earned: 150
    },
    {
      badge_type: "social_influencer",
      badge_name: "Influencer",
      badge_description: "Condividi 20 post",
      points_earned: 400
    },
    {
      badge_type: "ai_explorer",
      badge_name: "Esploratore AI",
      badge_description: "Genera un piano AI",
      points_earned: 100
    },
    {
      badge_type: "level_5",
      badge_name: "Veterano",
      badge_description: "Raggiungi il livello 5",
      points_earned: 250
    },
    {
      badge_type: "level_10",
      badge_name: "Leggenda Vivente",
      badge_description: "Raggiungi il livello 10",
      points_earned: 1000
    }
  ];

  // This variable is not used in the provided outline but is a common pattern for badge management.
  // const unlockedBadgeTypes = achievements.map(a => a.badge_type);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0a0a0a]">
        <div className="w-10 h-10 rounded-full border-2 border-[#E8FF00] border-t-transparent animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <PullToRefresh onRefresh={loadData}>
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="mb-6 overflow-hidden bg-[#111] border-white/5 rounded-2xl">
            {/* Banner */}
            <div className="relative h-36 group">
              {user?.banner_image_url ? (
                <img src={user.banner_image_url} alt="Banner" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full" style={{ background: "linear-gradient(135deg, #111 0%, #2a2a00 50%, #E8FF00 100%)" }}></div>
              )}
              <label className="absolute top-4 right-4 cursor-pointer">
                <div className="bg-black/60 hover:bg-black/80 p-2 rounded-full shadow-lg transition-all opacity-0 group-hover:opacity-100 backdrop-blur-sm">
                  {uploadingBanner ? (
                    <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
                  ) : (
                    <Edit className="w-4 h-4 text-white" />
                  )}
                </div>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => e.target.files[0] && handleBannerImageUpload(e.target.files[0])}
                  disabled={uploadingBanner}
                  className="hidden"
                />
              </label>
            </div>

            <CardContent className="pt-0 -mt-16 relative px-6 pb-6">
              <div className="flex flex-col md:flex-row md:items-end gap-4">
                {/* Profile Image */}
                <div className="relative group">
                  <Avatar className="h-28 w-28 border-4 shadow-2xl" style={{ borderColor: "#E8FF00" }}>
                    {user?.profile_image_url ? (
                      <img src={user.profile_image_url} alt={user.full_name} className="object-cover" />
                    ) : (
                      <AvatarFallback className="text-3xl font-black text-black" style={{ background: "#E8FF00" }}>
                        {user?.full_name?.charAt(0).toUpperCase() || 'U'}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <label className="absolute bottom-0 right-0 cursor-pointer">
                    <div className="bg-black/80 hover:bg-black p-2 rounded-full shadow-lg border border-white/20 transition-all backdrop-blur-sm">
                      {uploadingProfile ? (
                        <div className="w-3 h-3 rounded-full border-2 border-[#E8FF00] border-t-transparent animate-spin"></div>
                      ) : (
                        <Camera className="w-3 h-3 text-white" />
                      )}
                    </div>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => e.target.files[0] && handleProfileImageUpload(e.target.files[0])}
                      disabled={uploadingProfile}
                      className="hidden"
                    />
                  </label>
                </div>

                <div className="flex-1 pb-2">
                  <h1 className="text-2xl font-black text-white tracking-tight">{user?.full_name}</h1>
                  {stats.activeSubscription && stats.activeSubscription !== "none" && (
                    <Badge
                      className="mt-2 font-bold text-black text-sm px-3 py-1"
                      style={{ background: "#E8FF00" }}
                    >
                      {stats.activeSubscription === "annuale"
                        ? "Piano Annuale — €365/anno"
                        : stats.activeSubscription === "mensile"
                        ? "Piano Mensile — €40/mese"
                        : stats.activeSubscription === "mattina"
                        ? "Piano Mattina — €25/mese"
                        : stats.activeSubscription.toUpperCase()}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-4 gap-3 mt-5">
                {[
                  { val: stats.totalWorkouts, label: "Allenamenti" },
                  { val: stats.monthlyVisits, label: "Questo mese" },
                  { val: stats.streak, label: "Giorni streak", accent: true },
                  { val: feedPosts.filter(p => p.user_email === user?.email).length, label: "Post" },
                ].map((s) => (
                  <div key={s.label} className="bg-white/5 rounded-xl p-3 text-center">
                    <div className={`text-2xl font-black ${s.accent ? "text-[#E8FF00]" : "text-white"}`}>{s.val}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Progress Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="mb-4"
        >
          <ProgressStats user={user} />
        </motion.div>

        {/* Badges Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="mb-6"
        >
          <Card className="bg-[#111] border-white/5 rounded-2xl">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5" style={{ color: "#E8FF00" }} />
                  <h3 className="font-bold text-lg text-white">I Tuoi Badge</h3>
                </div>
                <Badge className="text-black font-bold text-xs px-3" style={{ background: "#E8FF00" }}>
                  {achievements.length} / {allPossibleBadges.length}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {allPossibleBadges.map((badge) => {
                  const unlocked = achievements.find(a => a.badge_type === badge.badge_type);
                  return (
                    <BadgeCard 
                      key={badge.badge_type}
                      achievement={unlocked || badge}
                      locked={!unlocked}
                    />
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Create Post Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="mb-6"
        >
          <Button
            onClick={() => setShowCreatePost(!showCreatePost)}
            className="w-full text-black font-bold hover:opacity-90"
            style={{ background: "#E8FF00" }}
            size="lg"
          >
            <Camera className="w-5 h-5 mr-2" />
            Condividi un momento
          </Button>
        </motion.div>

        {/* Create Post Form */}
        <AnimatePresence>
          {showCreatePost && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6"
            >
              <Card className="bg-[#111] border-white/5 rounded-2xl">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-white">Crea Post</h3>
                    <Button variant="ghost" size="icon" onClick={() => setShowCreatePost(false)} className="text-gray-500 hover:text-white">
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleCreatePost} className="space-y-3">
                    <Input
                      placeholder="Titolo del post"
                      value={newPost.title}
                      onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                      required
                      className="bg-white/5 border-white/10 text-white placeholder-gray-600 rounded-xl"
                    />
                    <Textarea
                      placeholder="Descrizione (opzionale)"
                      value={newPost.description}
                      onChange={(e) => setNewPost({ ...newPost, description: e.target.value })}
                      rows={3}
                      className="bg-white/5 border-white/10 text-white placeholder-gray-600 rounded-xl"
                    />
                    
                    <div className="border border-dashed border-white/10 rounded-xl p-4">
                      {newPost.photo_url ? (
                        <div className="relative">
                          <img src={newPost.photo_url} alt="Preview" className="w-full h-48 object-cover rounded-xl" />
                          <Button type="button" variant="destructive" size="icon" className="absolute top-2 right-2" onClick={() => setNewPost({ ...newPost, photo_url: "" })}>
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ) : (
                        <label className="flex flex-col items-center gap-2 cursor-pointer py-4">
                          <Upload className="w-7 h-7 text-gray-600" />
                          <span className="text-sm text-gray-600">{uploading ? "Caricamento..." : "Carica una foto"}</span>
                          <Input type="file" accept="image/*" onChange={(e) => e.target.files[0] && handlePhotoUpload(e.target.files[0])} disabled={uploading} className="hidden" />
                        </label>
                      )}
                    </div>

                    <Button type="submit" className="w-full text-black font-bold rounded-full" style={{ background: "#E8FF00" }} disabled={!newPost.title}>
                      Pubblica
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Feed header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white">Community Feed</h2>
        </div>

        {/* Feed */}
        <div className="space-y-3">
          {feedPosts.map((post, index) => {
            const PostIcon = getPostIcon(post.type);
            const hasLiked = post.liked_by?.includes(user.email);
            const postComments = comments[post.id] || [];
            const isCommentsOpen = showComments[post.id];
            
            return (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.04 }}
              >
                <Card className="overflow-hidden bg-[#111] border-white/5 rounded-2xl hover:border-white/10 transition-all duration-200">
                  <CardHeader className="pb-2 px-5 pt-5">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${getPostColor(post.type)} flex items-center justify-center flex-shrink-0`}>
                        <PostIcon className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-white text-sm">{post.user_name}</h3>
                        <p className="text-xs text-gray-500">
                          {new Date(post.created_date).toLocaleDateString('it-IT', { 
                            day: 'numeric', 
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3 px-5 pb-4">
                    <div>
                      <h4 className="font-bold text-white mb-1">{post.title}</h4>
                      {post.description && (
                        <p className="text-gray-400 text-sm leading-relaxed">{post.description}</p>
                      )}
                    </div>
                    
                    {post.photo_url && (
                      <img
                        src={post.photo_url}
                        alt={post.title}
                        className="w-full rounded-xl object-cover max-h-80"
                      />
                    )}
                    
                    {post.gym_name && (
                      <div className="flex items-center gap-2 text-xs text-gray-500 bg-white/5 rounded-lg px-3 py-2">
                        <MapPin className="w-3 h-3" />
                        <span>{post.gym_name}</span>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex items-center gap-5 pt-1 border-t border-white/5">
                      <button
                        onClick={() => handleLike(post)}
                        className={`flex items-center gap-1.5 text-sm transition-colors ${
                          hasLiked ? 'text-red-400' : 'text-gray-600 hover:text-red-400'
                        }`}
                      >
                        <Heart className={`w-4 h-4 ${hasLiked ? 'fill-red-400' : ''}`} />
                        <span className="font-medium">{post.likes || 0}</span>
                      </button>
                      <button 
                        onClick={() => toggleComments(post.id)}
                        className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-white transition-colors"
                      >
                        <MessageCircle className="w-4 h-4" />
                        <span className="font-medium">{postComments.length}</span>
                      </button>
                      <button className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-white transition-colors">
                        <Share2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Comments Section */}
                    <AnimatePresence>
                      {isCommentsOpen && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="space-y-3 pt-3 border-t border-white/5"
                        >
                          {postComments.length > 0 && (
                            <div className="space-y-2">
                              {postComments.map((comment) => (
                                <div key={comment.id} className="flex gap-2.5">
                                  <Avatar className="h-7 w-7 flex-shrink-0">
                                    <AvatarFallback className="text-xs font-bold text-black" style={{ background: "#E8FF00" }}>
                                      {comment.user_name?.charAt(0).toUpperCase() || 'U'}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="flex-1 bg-white/5 rounded-xl px-3 py-2">
                                    <p className="font-semibold text-xs text-white">{comment.user_name}</p>
                                    <p className="text-sm text-gray-300 mt-0.5">{comment.text}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Add Comment */}
                          <div className="flex gap-2">
                            <Input
                              placeholder="Scrivi un commento..."
                              value={newComment[post.id] || ""}
                              onChange={(e) => setNewComment({ ...newComment, [post.id]: e.target.value })}
                              onKeyPress={(e) => e.key === 'Enter' && handleAddComment(post.id)}
                              className="bg-white/5 border-white/10 text-white placeholder-gray-600 text-sm rounded-xl"
                            />
                            <Button
                              size="icon"
                              onClick={() => handleAddComment(post.id)}
                              disabled={!newComment[post.id]?.trim()}
                              className="text-black rounded-xl flex-shrink-0"
                              style={{ background: "#E8FF00" }}
                            >
                              <Send className="w-4 h-4" />
                            </Button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {feedPosts.length === 0 && (
          <Card className="py-12 bg-[#111] border-white/5 rounded-2xl">
            <CardContent className="text-center">
              <Camera className="w-12 h-12 text-gray-700 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-white mb-2">Nessun post ancora</h3>
              <p className="text-gray-600 text-sm mb-5">Condividi il tuo primo momento di allenamento!</p>
              <Button
                onClick={() => setShowCreatePost(true)}
                className="text-black font-bold rounded-full px-6"
                style={{ background: "#E8FF00" }}
              >
                <Camera className="w-4 h-4 mr-2" />
                Crea il primo post
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
      </PullToRefresh>
    </div>
  );
}