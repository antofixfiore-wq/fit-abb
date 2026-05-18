import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import PullToRefresh from "@/components/mobile/PullToRefresh";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  Flag, 
  Bookmark,
  MapPin,
  Clock,
  Users,
  Globe,
  Camera,
  X,
  Upload,
  Search,
  UserPlus,
  Check
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Community() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("discover");
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [friends, setFriends] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [comments, setComments] = useState({});
  const [loading, setLoading] = useState(true);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [newPost, setNewPost] = useState({
    caption: "",
    photo_url: "",
    gym_id: "",
    gym_name: "",
    is_public: true
  });

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    try {
      const userData = await base44.auth.me();
      setUser(userData);

      // Carica amici accettati
      const allFriends = await base44.entities.GymFriend.filter({ 
        $or: [{ user_email: userData.email }, { friend_email: userData.email }] 
      });
      const acceptedFriends = allFriends
        .filter(f => f.status === "accepted")
        .map(f => f.user_email === userData.email ? f.friend_email : f.user_email);
      setFriends(acceptedFriends);

      // Carica richieste di amicizia
      const requests = await base44.entities.GymFriend.filter({ 
        friend_email: userData.email,
        status: "pending"
      });
      setFriendRequests(requests);

      // Carica post in base al tab
      let loadedPosts;
      if (activeTab === "gymfriends") {
        // Post solo dagli amici accettati
        const allPosts = await base44.entities.CommunityPost.list("-created_date", 100);
        loadedPosts = allPosts.filter(post => 
          (acceptedFriends.includes(post.user_email) || post.user_email === userData.email)
        );
      } else {
        // Post pubblici (Discover)
        loadedPosts = await base44.entities.CommunityPost.filter({ is_public: true }, "-created_date", 50);
      }

      setPosts(loadedPosts || []);

      // Carica commenti per ogni post
      const allComments = await base44.entities.CommunityComment.list("-created_date");
      const commentsByPost = {};
      allComments.forEach(comment => {
        if (!commentsByPost[comment.post_id]) {
          commentsByPost[comment.post_id] = [];
        }
        commentsByPost[comment.post_id].push(comment);
      });
      setComments(commentsByPost);
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
    if (!newPost.caption && !newPost.photo_url) return;

    try {
      await base44.entities.CommunityPost.create({
        ...newPost,
        user_email: user.email,
        user_name: user.full_name,
        user_photo_url: user.profile_image_url,
        boosts: 0,
        boosted_by: [],
        comments_count: 0,
        created_date: new Date().toISOString()
      });
      
      setNewPost({ caption: "", photo_url: "", gym_id: "", gym_name: "", is_public: true });
      setShowCreatePost(false);
      await loadData();
    } catch (error) {
      console.error("Error creating post:", error);
    }
  };

  const handleBoost = async (post) => {
    const hasBoosted = post.boosted_by?.includes(user.email);
    const updatedBoostedBy = hasBoosted
      ? post.boosted_by.filter(email => email !== user.email)
      : [...(post.boosted_by || []), user.email];
    
    setPosts(prevPosts => prevPosts.map(p => 
      p.id === post.id 
        ? { ...p, boosts: updatedBoostedBy.length, boosted_by: updatedBoostedBy }
        : p
    ));
    
    try {
      await base44.entities.CommunityPost.update(post.id, {
        boosts: updatedBoostedBy.length,
        boosted_by: updatedBoostedBy
      });
    } catch (error) {
      console.error("Error boosting post:", error);
      await loadData();
    }
  };

  const handleAddComment = async (postId, text) => {
    if (!text.trim()) return;

    try {
      await base44.entities.CommunityComment.create({
        post_id: postId,
        user_email: user.email,
        user_name: user.full_name,
        user_photo_url: user.profile_image_url,
        text,
        created_date: new Date().toISOString()
      });
      
      // Aggiorna counter commenti
      const post = posts.find(p => p.id === postId);
      await base44.entities.CommunityPost.update(postId, {
        comments_count: (post?.comments_count || 0) + 1
      });
      
      await loadData();
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  const handleFriendRequest = async (request, accept) => {
    try {
      await base44.entities.GymFriend.update(request.id, {
        status: accept ? "accepted" : "rejected"
      });
      await loadData();
    } catch (error) {
      console.error("Error handling friend request:", error);
    }
  };

  const sendFriendRequest = async (targetEmail, targetName) => {
    try {
      await base44.entities.GymFriend.create({
        user_email: user.email,
        friend_email: targetEmail,
        friend_name: targetName,
        status: "pending",
        created_date: new Date().toISOString()
      });
      await loadData();
    } catch (error) {
      console.error("Error sending friend request:", error);
    }
  };

  const getRelativeTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return "ora";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m fa`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h fa`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}g fa`;
    return date.toLocaleDateString('it-IT', { day: 'numeric', month: 'short' });
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
      <PullToRefresh onRefresh={loadData}>
      <div className="max-w-2xl mx-auto px-4 pt-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4"
        >
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-black text-white">Community</h1>
            <Button
              onClick={() => setShowCreatePost(true)}
              className="text-black font-bold rounded-full"
              style={{ background: "#E8FF00" }}
              size="sm"
            >
              <Camera className="w-4 h-4 mr-1" />
              Nuovo
            </Button>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-white/5 rounded-full p-1">
              <TabsTrigger value="gymfriends" className="rounded-full data-[state=active]:bg-[#E8FF00] data-[state=active]:text-black">
                <Users className="w-4 h-4 mr-2" />
                GymFriends
              </TabsTrigger>
              <TabsTrigger value="discover" className="rounded-full data-[state=active]:bg-[#E8FF00] data-[state=active]:text-black">
                <Globe className="w-4 h-4 mr-2" />
                Discover
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-4">
              {/* Friend Requests */}
              {activeTab === "gymfriends" && friendRequests.length > 0 && (
                <Card className="bg-[#111] border-white/5 rounded-2xl mb-4">
                  <CardContent className="p-4">
                    <h3 className="font-bold text-white mb-3">Richieste di Amicizia</h3>
                    <div className="space-y-2">
                      {friendRequests.map(request => (
                        <div key={request.id} className="flex items-center justify-between bg-white/5 rounded-xl p-3">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarFallback className="text-black font-bold" style={{ background: "#E8FF00" }}>
                                {request.user_name?.charAt(0).toUpperCase() || 'U'}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-semibold text-white text-sm">{request.user_name || "Utente"}</p>
                              <p className="text-xs text-gray-500">Vuoi connetterti</p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="icon"
                              variant="outline"
                              onClick={() => handleFriendRequest(request, false)}
                              className="h-9 w-9 rounded-full"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                            <Button
                              size="icon"
                              onClick={() => handleFriendRequest(request, true)}
                              className="h-9 w-9 rounded-full"
                              style={{ background: "#E8FF00" }}
                            >
                              <Check className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Posts */}
              {posts.length === 0 ? (
                <Card className="py-12 bg-[#111] border-white/5 rounded-2xl">
                  <CardContent className="text-center">
                    {activeTab === "gymfriends" ? (
                      <>
                        <Users className="w-12 h-12 text-gray-700 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-white mb-2">Nessun post dai tuoi GymFriends</h3>
                        <p className="text-gray-600 text-sm">Connettiti con altri utenti per vedere i loro post</p>
                      </>
                    ) : (
                      <>
                        <Globe className="w-12 h-12 text-gray-700 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-white mb-2">Scopri la community</h3>
                        <p className="text-gray-600 text-sm">I post pubblici appariranno qui</p>
                      </>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {posts.map((post, index) => (
                    <PostCard
                      key={post.id}
                      post={post}
                      user={user}
                      onBoost={handleBoost}
                      onAddComment={handleAddComment}
                      comments={comments[post.id] || []}
                      getRelativeTime={getRelativeTime}
                      sendFriendRequest={sendFriendRequest}
                      isFriend={friends.includes(post.user_email) || post.user_email === user.email}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
      </PullToRefresh>

      {/* Create Post Modal */}
      <AnimatePresence>
        {showCreatePost && (
          <CreatePostModal
            newPost={newPost}
            setNewPost={setNewPost}
            setShowCreatePost={setShowCreatePost}
            handlePhotoUpload={handlePhotoUpload}
            handleCreatePost={handleCreatePost}
            uploading={uploading}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function PostCard({ post, user, onBoost, onAddComment, comments, getRelativeTime, sendFriendRequest, isFriend }) {
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [hasBoosted] = useState(post.boosted_by?.includes(user.email));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-4"
    >
      <Card className="bg-[#111] border-white/5 rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              {post.user_photo_url ? (
                <img src={post.user_photo_url} alt={post.user_name} className="object-cover" />
              ) : (
                <AvatarFallback className="text-black font-bold" style={{ background: "#E8FF00" }}>
                  {post.user_name?.charAt(0).toUpperCase() || 'U'}
                </AvatarFallback>
              )}
            </Avatar>
            <div>
              <p className="font-semibold text-white text-sm">{post.user_name || "Utente"}</p>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Clock className="w-3 h-3" />
                {getRelativeTime(post.created_date)}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!isFriend && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => sendFriendRequest(post.user_email, post.user_name)}
                className="h-8 text-xs"
              >
                <UserPlus className="w-3 h-3 mr-1" />
                Connetti
              </Button>
            )}
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Flag className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Caption */}
        {post.caption && (
          <div className="px-4 pb-3">
            <p className="text-white text-sm">{post.caption}</p>
          </div>
        )}

        {/* Gym Tag */}
        {post.gym_name && (
          <div className="px-4 pb-3">
            <div className="flex items-center gap-2 text-xs text-gray-500 bg-white/5 rounded-lg px-3 py-2 inline-flex">
              <MapPin className="w-3 h-3" />
              <span>{post.gym_name}</span>
            </div>
          </div>
        )}

        {/* Photo */}
        {post.photo_url && (
          <div className="relative">
            <img
              src={post.photo_url}
              alt="Post"
              className="w-full object-cover max-h-96"
            />
          </div>
        )}

        {/* Actions */}
        <CardContent className="p-4 pt-3">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-4">
              <button
                onClick={() => onBoost(post)}
                className={`flex items-center gap-1.5 text-sm transition-colors ${
                  hasBoosted ? 'text-[#E8FF00]' : 'text-gray-600 hover:text-[#E8FF00]'
                }`}
              >
                <Heart className={`w-5 h-5 ${hasBoosted ? 'fill-[#E8FF00]' : ''}`} />
                <span className="font-medium">{post.boosts || 0}</span>
              </button>
              <button
                onClick={() => setShowComments(!showComments)}
                className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-white transition-colors"
              >
                <MessageCircle className="w-5 h-5" />
                <span className="font-medium">{post.comments_count || 0}</span>
              </button>
              <button className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-white transition-colors">
                <Share2 className="w-5 h-5" />
              </button>
            </div>
            <button className="text-gray-600 hover:text-white transition-colors">
              <Bookmark className="w-5 h-5" />
            </button>
          </div>

          {/* Comments Section */}
          <AnimatePresence>
            {showComments && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-3 pt-3 border-t border-white/5"
              >
                {comments.length > 0 && (
                  <div className="space-y-2">
                    {comments.map((comment) => (
                      <div key={comment.id} className="flex gap-2.5">
                        <Avatar className="h-7 w-7 flex-shrink-0">
                          {comment.user_photo_url ? (
                            <img src={comment.user_photo_url} alt={comment.user_name} className="object-cover" />
                          ) : (
                            <AvatarFallback className="text-xs font-bold text-black" style={{ background: "#E8FF00" }}>
                              {comment.user_name?.charAt(0).toUpperCase() || 'U'}
                            </AvatarFallback>
                          )}
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
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (onAddComment(post.id, newComment), setNewComment(""))}
                    className="bg-white/5 border-white/10 text-white placeholder-gray-600 text-sm rounded-xl"
                  />
                  <Button
                    size="icon"
                    onClick={() => { onAddComment(post.id, newComment); setNewComment(""); }}
                    disabled={!newComment.trim()}
                    className="text-black rounded-xl flex-shrink-0"
                    style={{ background: "#E8FF00" }}
                  >
                    <Share2 className="w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function CreatePostModal({ newPost, setNewPost, setShowCreatePost, handlePhotoUpload, handleCreatePost, uploading }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={() => setShowCreatePost(false)}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-[#111] border border-white/10 rounded-2xl w-full max-w-lg overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">Nuovo Post</h2>
          <Button variant="ghost" size="icon" onClick={() => setShowCreatePost(false)}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <form onSubmit={handleCreatePost} className="p-4 space-y-4">
          {/* Caption */}
          <Textarea
            placeholder="Scrivi una didascalia..."
            value={newPost.caption}
            onChange={(e) => setNewPost({ ...newPost, caption: e.target.value })}
            rows={3}
            className="bg-white/5 border-white/10 text-white placeholder-gray-600 rounded-xl resize-none"
          />

          {/* Photo Upload */}
          <div className="border border-dashed border-white/10 rounded-xl p-4">
            {newPost.photo_url ? (
              <div className="relative">
                <img src={newPost.photo_url} alt="Preview" className="w-full h-48 object-cover rounded-xl" />
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

          {/* Gym Tag (Optional) */}
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-gray-500" />
            <Input
              placeholder="Tagga palestra (opzionale)"
              value={newPost.gym_name}
              onChange={(e) => setNewPost({ ...newPost, gym_name: e.target.value })}
              className="bg-white/5 border-white/10 text-white placeholder-gray-600 rounded-xl"
            />
          </div>

          {/* Privacy Toggle */}
          <div className="flex items-center justify-between bg-white/5 rounded-xl p-3">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-300">Pubblico (visibile nel Discover)</span>
            </div>
            <input
              type="checkbox"
              checked={newPost.is_public}
              onChange={(e) => setNewPost({ ...newPost, is_public: e.target.checked })}
              className="w-4 h-4 rounded"
            />
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full text-black font-bold rounded-full"
            style={{ background: "#E8FF00" }}
            disabled={(!newPost.caption && !newPost.photo_url)}
          >
            Pubblica nella Community
          </Button>
        </form>
      </motion.div>
    </motion.div>
  );
}