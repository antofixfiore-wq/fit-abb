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
  MapPin,
  Camera,
  X,
  Upload,
  Send,
  Users,
  UserPlus,
  Edit
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ClientDashboard() {
  const [user, setUser] = useState(null);
  const [feedPosts, setFeedPosts] = useState([]);
  const [comments, setComments] = useState({});
  const [showComments, setShowComments] = useState({});
  const [newComment, setNewComment] = useState({});
  const [stats, setStats] = useState({
    totalPosts: 0,
    followers: 0,
    following: 0
  });
  const [loading, setLoading] = useState(true);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadingProfile, setUploadingProfile] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [newPost, setNewPost] = useState({
    caption: "",
    photo_url: "",
    gym_id: null,
    gym_name: null,
    visibility: "friends",
    show_gym_name: false
  });
  const [showFollowers, setShowFollowers] = useState(false);
  const [followersList, setFollowersList] = useState([]);
  const [followingList, setFollowingList] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const userData = await base44.auth.me();
      setUser(userData);
      
      // Carica post dalla community
      const posts = await base44.entities.CommunityPost.list("-created_date", 50);
      setFeedPosts(posts);
      
      // Carica commenti
      const allComments = await base44.entities.CommunityComment.list("-created_date");
      const commentsByPost = {};
      allComments.forEach(comment => {
        if (!commentsByPost[comment.post_id]) {
          commentsByPost[comment.post_id] = [];
        }
        commentsByPost[comment.post_id].push(comment);
      });
      setComments(commentsByPost);
      
      // Carica follower e following
      const followers = await base44.entities.UserFollow.filter({ following_email: userData.email });
      const following = await base44.entities.UserFollow.filter({ follower_email: userData.email });
      
      setFollowersList(followers);
      setFollowingList(following);
      
      setStats({
        totalPosts: posts.filter(p => p.user_email === userData.email).length,
        followers: followers.length,
        following: following.length
      });
    } catch (error) {
      console.error("Error loading data:", error);
    }
    setLoading(false);
  };

  const handleProfileImageUpload = async (file) => {
    if (!file) return;
    
    setUploadingProfile(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      await base44.auth.updateMe({ avatar_url: file_url });
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
    if (!newPost.photo_url) return;

    try {
      await base44.entities.CommunityPost.create({
        user_email: user.email,
        user_name: user.full_name,
        user_photo_url: user.avatar_url || null,
        media_url: newPost.photo_url,
        caption: newPost.caption || null,
        gym_id: newPost.gym_id || null,
        gym_name: newPost.gym_name || null,
        visibility: newPost.visibility,
        show_gym_name: newPost.show_gym_name,
        safety_score: 0,
        boost_count: 0,
        comment_count: 0,
        created_date: new Date().toISOString()
      });
      
      setNewPost({ caption: "", photo_url: "", gym_id: null, gym_name: null, visibility: "friends", show_gym_name: false });
      setShowCreatePost(false);
      await loadData();
    } catch (error) {
      console.error("Error creating post:", error);
    }
  };

  const handleBoost = async (postId) => {
    try {
      await base44.functions.invoke("createBoost", { postId });
      await loadData();
    } catch (error) {
      console.error("Error boosting post:", error);
    }
  };

  const handleAddComment = async (postId) => {
    const commentText = newComment[postId];
    if (!commentText?.trim()) return;

    try {
      await base44.entities.CommunityComment.create({
        post_id: postId,
        user_email: user.email,
        user_name: user.full_name,
        user_photo_url: user.avatar_url || null,
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

  const handleFollow = async (targetEmail) => {
    try {
      await base44.functions.invoke("createFollow", { targetUserEmail: targetEmail });
      await loadData();
    } catch (error) {
      console.error("Error following user:", error);
    }
  };

  const handleUnfollow = async (targetEmail) => {
    try {
      await base44.functions.invoke("unfollowUser", { targetUserEmail: targetEmail });
      await loadData();
    } catch (error) {
      console.error("Error unfollowing user:", error);
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
      <PullToRefresh onRefresh={loadData}>
      <div className="max-w-2xl mx-auto px-4 pt-4">
        {/* Header Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-4"
        >
          <Card className="overflow-hidden bg-[#111] border-white/5 rounded-2xl">
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
                    {user?.avatar_url ? (
                      <img src={user.avatar_url} alt={user.full_name} className="object-cover" />
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
                  {user?.subscription_type && user.subscription_type !== "none" && (
                    <Badge
                      className="mt-2 font-bold text-black text-sm px-3 py-1"
                      style={{ background: "#E8FF00" }}
                    >
                      {user.subscription_type.toUpperCase()}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-4 gap-3 mt-5">
                {[
                  { val: stats.totalPosts, label: "Post" },
                  { val: stats.followers, label: "Follower", clickable: true },
                  { val: stats.following, label: "Following", clickable: true },
                  { val: user?.total_boosts_received || 0, label: "Boost" },
                ].map((s) => (
                  <div 
                    key={s.label} 
                    className="bg-white/5 rounded-xl p-3 text-center cursor-pointer hover:bg-white/10 transition-all"
                    onClick={() => s.clickable && setShowFollowers(true)}
                  >
                    <div className="text-2xl font-black text-white">{s.val}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
                  </div>
                ))}
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
                    <Textarea
                      placeholder="Scrivi una didascalia..."
                      value={newPost.caption}
                      onChange={(e) => setNewPost({ ...newPost, caption: e.target.value })}
                      rows={2}
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

                    <Button type="submit" className="w-full text-black font-bold rounded-full" style={{ background: "#E8FF00" }} disabled={!newPost.photo_url}>
                      Pubblica
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Feed header */}
        <div className="sticky top-0 z-10 bg-[#0a0a0a]/95 backdrop-blur-sm py-3 mb-3 border-b border-white/5">
          <h2 className="text-lg font-bold text-white">Community Feed</h2>
        </div>

        {/* Feed */}
        <div className="space-y-3 pb-4">
          {feedPosts.map((post, index) => {
            const hasBoosted = post.boosted_by?.includes(user.email);
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
                      <Avatar className="h-10 w-10">
                        {post.user_photo_url ? (
                          <img src={post.user_photo_url} alt={post.user_name} className="object-cover" />
                        ) : (
                          <AvatarFallback className="text-sm font-bold text-black" style={{ background: "#E8FF00" }}>
                            {post.user_name?.charAt(0).toUpperCase() || 'U'}
                          </AvatarFallback>
                        )}
                      </Avatar>
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
                  <CardContent className="space-y-3 px-4 pb-3">
                    {post.caption && (
                      <p className="text-gray-300 text-sm leading-relaxed">{post.caption}</p>
                    )}
                    
                    {post.media_url && (
                      <img
                        src={post.media_url}
                        alt="Post"
                        className="w-full rounded-xl object-cover max-h-80"
                      />
                    )}
                    
                    {post.gym_name && post.show_gym_name && (
                      <div className="flex items-center gap-2 text-xs text-gray-500 bg-white/5 rounded-lg px-3 py-2">
                        <MapPin className="w-3 h-3" />
                        <span>{post.gym_name}</span>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex items-center gap-5 pt-1 border-t border-white/5">
                      <button
                        onClick={() => handleBoost(post.id)}
                        className={`flex items-center gap-1.5 text-sm transition-colors ${
                          hasBoosted ? 'text-[#E8FF00]' : 'text-gray-600 hover:text-[#E8FF00]'
                        }`}
                      >
                        <Heart className={`w-4 h-4 ${hasBoosted ? 'fill-[#E8FF00]' : ''}`} />
                        <span className="font-medium">{post.boost_count || 0}</span>
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

      {/* Followers/Following Modal */}
      <AnimatePresence>
        {showFollowers && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowFollowers(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-[#111] border border-white/10 rounded-2xl w-full max-w-md max-h-[70vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 border-b border-white/10 flex items-center justify-between">
                <h3 className="font-bold text-white text-lg">Social</h3>
                <Button variant="ghost" size="icon" onClick={() => setShowFollowers(false)} className="text-gray-500 hover:text-white">
                  <X className="w-5 h-5" />
                </Button>
              </div>
              <div className="p-4 overflow-y-auto max-h-[50vh]">
                <div className="mb-4">
                  <h4 className="font-semibold text-white text-sm mb-2 flex items-center gap-2">
                    <Users className="w-4 h-4 text-[#E8FF00]" />
                    Follower ({followersList.length})
                  </h4>
                  {followersList.length === 0 ? (
                    <p className="text-gray-500 text-sm">Nessun follower ancora</p>
                  ) : (
                    <div className="space-y-2">
                      {followersList.map((follow) => (
                        <div key={follow.id} className="flex items-center justify-between bg-white/5 rounded-xl p-3">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="text-xs font-bold text-black" style={{ background: "#E8FF00" }}>
                                {follow.follower_email?.charAt(0).toUpperCase() || 'U'}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-semibold text-white text-sm">{follow.follower_email}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <h4 className="font-semibold text-white text-sm mb-2 flex items-center gap-2">
                    <UserPlus className="w-4 h-4 text-[#E8FF00]" />
                    Following ({followingList.length})
                  </h4>
                  {followingList.length === 0 ? (
                    <p className="text-gray-500 text-sm">Non stai seguendo nessuno</p>
                  ) : (
                    <div className="space-y-2">
                      {followingList.map((follow) => (
                        <div key={follow.id} className="flex items-center justify-between bg-white/5 rounded-xl p-3">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="text-xs font-bold text-black" style={{ background: "#E8FF00" }}>
                                {follow.following_email?.charAt(0).toUpperCase() || 'U'}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-semibold text-white text-sm">{follow.following_email}</p>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleUnfollow(follow.following_email)}
                            className="border-white/20 text-white hover:bg-white/10"
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}