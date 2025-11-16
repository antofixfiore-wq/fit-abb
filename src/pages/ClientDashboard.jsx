import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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
  Upload
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ClientDashboard() {
  const [user, setUser] = useState(null);
  const [feedPosts, setFeedPosts] = useState([]);
  const [stats, setStats] = useState({
    totalWorkouts: 0,
    activeSubscription: null,
    monthlyVisits: 0,
    streak: 0
  });
  const [loading, setLoading] = useState(true);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [uploading, setUploading] = useState(false);
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
      
      // Carica i post dal database
      const posts = await base44.entities.FeedPost.list("-created_date", 50);
      setFeedPosts(posts);
      
      // Mock stats - in produzione, questi verrebbero da un'entità CheckIn o simile
      setStats({
        totalWorkouts: 45,
        activeSubscription: userData.subscription_type,
        monthlyVisits: 12,
        streak: 5
      });
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
    } catch (error) {
      console.error("Error creating post:", error);
    }
  };

  const handleLike = async (post) => {
    const hasLiked = post.liked_by?.includes(user.email);
    
    try {
      const updatedLikedBy = hasLiked
        ? post.liked_by.filter(email => email !== user.email)
        : [...(post.liked_by || []), user.email];
      
      await base44.entities.FeedPost.update(post.id, {
        likes: updatedLikedBy.length,
        liked_by: updatedLikedBy
      });
      
      await loadData();
    } catch (error) {
      console.error("Error liking post:", error);
    }
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Header Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="mb-6 overflow-hidden">
            <div className="h-32 bg-gradient-to-r from-blue-600 to-orange-600"></div>
            <CardContent className="pt-0 -mt-16 relative">
              <div className="flex flex-col md:flex-row md:items-end gap-4">
                <Avatar className="h-32 w-32 border-4 border-white shadow-lg">
                  <AvatarFallback className="text-3xl bg-gradient-to-br from-blue-500 to-orange-500 text-white">
                    {user?.full_name?.charAt(0).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 pb-4">
                  <h1 className="text-2xl font-bold text-gray-900">{user?.full_name}</h1>
                  {stats.activeSubscription && stats.activeSubscription !== "none" && (
                    <Badge className="mt-2 bg-gradient-to-r from-blue-600 to-orange-600 text-white">
                      {stats.activeSubscription.toUpperCase()}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{stats.totalWorkouts}</div>
                  <div className="text-sm text-gray-600">Allenamenti</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{stats.monthlyVisits}</div>
                  <div className="text-sm text-gray-600">Questo mese</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{stats.streak}</div>
                  <div className="text-sm text-gray-600">Giorni di fila</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{feedPosts.filter(p => p.user_email === user.email).length}</div>
                  <div className="text-sm text-gray-600">Post</div>
                </div>
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
            className="w-full bg-gradient-to-r from-blue-600 to-orange-600 hover:from-blue-700 hover:to-orange-700"
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
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-lg">Crea Post</h3>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowCreatePost(false)}
                    >
                      <X className="w-5 h-5" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleCreatePost} className="space-y-4">
                    <div>
                      <Input
                        placeholder="Titolo del post"
                        value={newPost.title}
                        onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Textarea
                        placeholder="Descrizione (opzionale)"
                        value={newPost.description}
                        onChange={(e) => setNewPost({ ...newPost, description: e.target.value })}
                        rows={3}
                      />
                    </div>
                    
                    {/* Photo Upload */}
                    <div className="border-2 border-dashed rounded-lg p-4">
                      {newPost.photo_url ? (
                        <div className="relative">
                          <img
                            src={newPost.photo_url}
                            alt="Preview"
                            className="w-full h-64 object-cover rounded-lg"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute top-2 right-2"
                            onClick={() => setNewPost({ ...newPost, photo_url: "" })}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ) : (
                        <label className="flex flex-col items-center gap-2 cursor-pointer">
                          <Upload className="w-8 h-8 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            {uploading ? "Caricamento..." : "Carica una foto"}
                          </span>
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

                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-blue-600 to-orange-600 hover:from-blue-700 hover:to-orange-700"
                      disabled={!newPost.title}
                    >
                      Pubblica
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Feed */}
        <div className="space-y-4">
          {feedPosts.map((post, index) => {
            const PostIcon = getPostIcon(post.type);
            const hasLiked = post.liked_by?.includes(user.email);
            
            return (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
              >
                <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${getPostColor(post.type)} flex items-center justify-center`}>
                        <PostIcon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{post.user_name}</h3>
                        <p className="text-sm text-gray-500 flex items-center gap-2">
                          <Calendar className="w-3 h-3" />
                          {new Date(post.created_date).toLocaleDateString('it-IT', { 
                            day: 'numeric', 
                            month: 'long',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-lg mb-2">{post.title}</h4>
                      {post.description && (
                        <p className="text-gray-700">{post.description}</p>
                      )}
                    </div>
                    
                    {post.photo_url && (
                      <img
                        src={post.photo_url}
                        alt={post.title}
                        className="w-full rounded-lg object-cover max-h-96"
                      />
                    )}
                    
                    {post.gym_name && (
                      <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
                        <MapPin className="w-4 h-4 text-blue-600" />
                        <span>{post.gym_name}</span>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex items-center justify-between pt-3 border-t">
                      <div className="flex items-center gap-6">
                        <button
                          onClick={() => handleLike(post)}
                          className={`flex items-center gap-2 transition-colors ${
                            hasLiked ? 'text-red-600' : 'text-gray-600 hover:text-red-600'
                          }`}
                        >
                          <Heart className={`w-5 h-5 ${hasLiked ? 'fill-red-600' : ''}`} />
                          <span className="text-sm font-medium">{post.likes || 0}</span>
                        </button>
                        <button className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors">
                          <MessageCircle className="w-5 h-5" />
                          <span className="text-sm font-medium">0</span>
                        </button>
                        <button className="flex items-center gap-2 text-gray-600 hover:text-green-600 transition-colors">
                          <Share2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {feedPosts.length === 0 && (
          <Card className="py-12">
            <CardContent className="text-center">
              <Camera className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                Nessun post ancora
              </h3>
              <p className="text-gray-500 mb-4">
                Condividi il tuo primo momento di allenamento!
              </p>
              <Button
                onClick={() => setShowCreatePost(true)}
                className="bg-gradient-to-r from-blue-600 to-orange-600 hover:from-blue-700 hover:to-orange-700"
              >
                <Camera className="w-4 h-4 mr-2" />
                Crea il primo post
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}