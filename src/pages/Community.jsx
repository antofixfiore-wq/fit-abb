import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Users,
  Calendar,
  Bell,
  Heart,
  MessageCircle,
  MapPin,
  Clock,
  UserPlus,
  UserCheck,
  Tag,
  TrendingUp
} from "lucide-react";
import { motion } from "framer-motion";

export default function Community() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [gyms, setGyms] = useState([]);
  const [gymPosts, setGymPosts] = useState([]);
  const [gymEvents, setGymEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const userData = await base44.auth.me();
      setUser(userData);
      
      const [gymsData, postsData, eventsData] = await Promise.all([
        base44.entities.Gym.list(),
        base44.entities.GymPost.list("-created_date", 50),
        base44.entities.GymEvent.filter({ is_active: true }, "-event_date", 50)
      ]);
      
      setGyms(gymsData);
      setGymPosts(postsData);
      setGymEvents(eventsData);
    } catch (error) {
      console.error("Error loading data:", error);
    }
    setLoading(false);
  };

  const handleFollowGym = async (gymId) => {
    const isFollowing = user.followed_gyms?.includes(gymId);
    const updatedFollowed = isFollowing
      ? user.followed_gyms.filter(id => id !== gymId)
      : [...(user.followed_gyms || []), gymId];
    
    await base44.auth.updateMe({ followed_gyms: updatedFollowed });
    await loadData();
  };

  const handleLikePost = async (post) => {
    const hasLiked = post.liked_by?.includes(user.email);
    const updatedLikedBy = hasLiked
      ? post.liked_by.filter(email => email !== user.email)
      : [...(post.liked_by || []), user.email];
    
    await base44.entities.GymPost.update(post.id, {
      likes: updatedLikedBy.length,
      liked_by: updatedLikedBy
    });
    await loadData();
  };

  const handleRegisterEvent = async (event) => {
    const isRegistered = event.registered_users?.includes(user.email);
    if (isRegistered) {
      const updatedUsers = event.registered_users.filter(email => email !== user.email);
      await base44.entities.GymEvent.update(event.id, { registered_users: updatedUsers });
    } else {
      if (event.max_participants && event.registered_users?.length >= event.max_participants) {
        alert("Evento al completo!");
        return;
      }
      const updatedUsers = [...(event.registered_users || []), user.email];
      await base44.entities.GymEvent.update(event.id, { registered_users: updatedUsers });
    }
    await loadData();
  };

  const getPostTypeColor = (type) => {
    const colors = {
      update: "from-blue-500 to-blue-600",
      promotion: "from-green-500 to-emerald-600",
      schedule: "from-orange-500 to-orange-600",
      announcement: "from-purple-500 to-purple-600"
    };
    return colors[type] || "from-gray-500 to-gray-600";
  };

  const getPostTypeLabel = (type) => {
    const labels = {
      update: "Aggiornamento",
      promotion: "Promozione",
      schedule: "Orario",
      announcement: "Comunicazione"
    };
    return labels[type] || type;
  };

  const followedGymPosts = gymPosts.filter(post => 
    user?.followed_gyms?.includes(post.gym_id)
  );

  const followedGymEvents = gymEvents.filter(event => 
    user?.followed_gyms?.includes(event.gym_id)
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-blue-600 to-orange-600 text-white py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-3 mb-2">
              <Users className="w-10 h-10" />
              <h1 className="text-3xl md:text-4xl font-bold">Comunità</h1>
            </div>
            <p className="text-blue-100">
              Seguendo {user?.followed_gyms?.length || 0} palestre
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <Tabs defaultValue="feed" className="space-y-6">
          <TabsList className="grid w-full md:w-auto md:inline-grid grid-cols-3 gap-4">
            <TabsTrigger value="feed">
              <Bell className="w-4 h-4 mr-2" />
              Feed
            </TabsTrigger>
            <TabsTrigger value="events">
              <Calendar className="w-4 h-4 mr-2" />
              Eventi
            </TabsTrigger>
            <TabsTrigger value="gyms">
              <MapPin className="w-4 h-4 mr-2" />
              Palestre
            </TabsTrigger>
          </TabsList>

          {/* Feed Tab */}
          <TabsContent value="feed" className="space-y-4">
            {followedGymPosts.length === 0 ? (
              <Card className="p-12">
                <CardContent className="text-center">
                  <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">
                    Nessun aggiornamento
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Segui le tue palestre preferite per vedere i loro post
                  </p>
                </CardContent>
              </Card>
            ) : (
              followedGymPosts.map((post, index) => {
                const hasLiked = post.liked_by?.includes(user.email);
                return (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                  >
                    <Card className="hover:shadow-lg transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${getPostTypeColor(post.type)} flex items-center justify-center`}>
                              <MapPin className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <h3 
                                className="font-semibold text-gray-900 cursor-pointer hover:text-blue-600"
                                onClick={() => navigate(`${createPageUrl("GymDetail")}?id=${post.gym_id}`)}
                              >
                                {post.gym_name}
                              </h3>
                              <p className="text-sm text-gray-500">
                                {new Date(post.created_date).toLocaleDateString('it-IT', { 
                                  day: 'numeric', 
                                  month: 'long'
                                })}
                              </p>
                            </div>
                          </div>
                          <Badge className={`bg-gradient-to-r ${getPostTypeColor(post.type)} text-white`}>
                            {getPostTypeLabel(post.type)}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <h4 className="font-semibold text-lg mb-2">{post.title}</h4>
                          <p className="text-gray-700">{post.content}</p>
                        </div>

                        {post.image_url && (
                          <img
                            src={post.image_url}
                            alt={post.title}
                            className="w-full rounded-lg object-cover max-h-96"
                          />
                        )}

                        {post.valid_until && (
                          <div className="flex items-center gap-2 text-sm text-orange-600 bg-orange-50 rounded-lg p-3">
                            <Clock className="w-4 h-4" />
                            <span>Valido fino al {new Date(post.valid_until).toLocaleDateString('it-IT')}</span>
                          </div>
                        )}

                        <div className="flex items-center gap-6 pt-3 border-t">
                          <button
                            onClick={() => handleLikePost(post)}
                            className={`flex items-center gap-2 transition-colors ${
                              hasLiked ? 'text-red-600' : 'text-gray-600 hover:text-red-600'
                            }`}
                          >
                            <Heart className={`w-5 h-5 ${hasLiked ? 'fill-red-600' : ''}`} />
                            <span className="text-sm font-medium">{post.likes || 0}</span>
                          </button>
                          <button className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors">
                            <MessageCircle className="w-5 h-5" />
                          </button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })
            )}
          </TabsContent>

          {/* Events Tab */}
          <TabsContent value="events" className="space-y-4">
            {followedGymEvents.length === 0 ? (
              <Card className="p-12">
                <CardContent className="text-center">
                  <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">
                    Nessun evento
                  </h3>
                  <p className="text-gray-500">
                    Le palestre che segui non hanno eventi in programma
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {followedGymEvents.map((event, index) => {
                  const isRegistered = event.registered_users?.includes(user.email);
                  const isFull = event.max_participants && event.registered_users?.length >= event.max_participants;
                  
                  return (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.05 }}
                    >
                      <Card className="h-full hover:shadow-lg transition-shadow">
                        {event.image_url && (
                          <div className="h-48 bg-gray-200">
                            <img
                              src={event.image_url}
                              alt={event.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-3">
                            <h3 className="font-bold text-xl">{event.title}</h3>
                            {isFull && !isRegistered && (
                              <Badge variant="destructive">Completo</Badge>
                            )}
                          </div>
                          
                          <p 
                            className="text-blue-600 font-semibold mb-3 cursor-pointer hover:underline"
                            onClick={() => navigate(`${createPageUrl("GymDetail")}?id=${event.gym_id}`)}
                          >
                            {event.gym_name}
                          </p>
                          
                          <p className="text-gray-700 mb-4">{event.description}</p>
                          
                          <div className="space-y-2 mb-4">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Calendar className="w-4 h-4" />
                              <span>{new Date(event.event_date).toLocaleDateString('it-IT', {
                                weekday: 'long',
                                day: 'numeric',
                                month: 'long',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}</span>
                            </div>
                            {event.location && (
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <MapPin className="w-4 h-4" />
                                <span>{event.location}</span>
                              </div>
                            )}
                            {event.max_participants && (
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Users className="w-4 h-4" />
                                <span>{event.registered_users?.length || 0} / {event.max_participants} partecipanti</span>
                              </div>
                            )}
                          </div>

                          <Button
                            onClick={() => handleRegisterEvent(event)}
                            disabled={isFull && !isRegistered}
                            className={isRegistered 
                              ? "w-full bg-green-600 hover:bg-green-700"
                              : "w-full bg-gradient-to-r from-blue-600 to-orange-600 hover:from-blue-700 hover:to-orange-700"
                            }
                          >
                            {isRegistered ? (
                              <>
                                <UserCheck className="w-4 h-4 mr-2" />
                                Registrato
                              </>
                            ) : (
                              <>
                                <UserPlus className="w-4 h-4 mr-2" />
                                Registrati
                              </>
                            )}
                          </Button>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* Gyms Tab */}
          <TabsContent value="gyms" className="space-y-4">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {gyms.map((gym, index) => {
                const isFollowing = user?.followed_gyms?.includes(gym.id);
                
                return (
                  <motion.div
                    key={gym.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                  >
                    <Card className="hover:shadow-lg transition-shadow h-full">
                      <div className="relative h-40 bg-gray-200">
                        {gym.photos?.[0] ? (
                          <img
                            src={gym.photos[0]}
                            alt={gym.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-orange-100">
                            <MapPin className="w-12 h-12 text-blue-300" />
                          </div>
                        )}
                      </div>
                      <CardContent className="p-4">
                        <h3 
                          className="font-bold text-lg mb-2 cursor-pointer hover:text-blue-600"
                          onClick={() => navigate(`${createPageUrl("GymDetail")}?id=${gym.id}`)}
                        >
                          {gym.name}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                          <MapPin className="w-4 h-4" />
                          <span>{gym.city}</span>
                        </div>
                        
                        <Button
                          onClick={() => handleFollowGym(gym.id)}
                          variant={isFollowing ? "default" : "outline"}
                          className={isFollowing 
                            ? "w-full bg-gradient-to-r from-blue-600 to-orange-600 hover:from-blue-700 hover:to-orange-700"
                            : "w-full"
                          }
                        >
                          {isFollowing ? (
                            <>
                              <UserCheck className="w-4 h-4 mr-2" />
                              Stai seguendo
                            </>
                          ) : (
                            <>
                              <UserPlus className="w-4 h-4 mr-2" />
                              Segui
                            </>
                          )}
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}