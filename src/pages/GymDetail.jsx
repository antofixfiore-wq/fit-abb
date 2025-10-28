import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, MapPin, Phone, Mail, Clock, Star, Building2, CheckCircle, AlertCircle, Calendar, Euro } from "lucide-react";
import { motion } from "framer-motion";

export default function GymDetail() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [gym, setGym] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [memberships, setMemberships] = useState([]);
  const [userSubscriptions, setUserSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadGymData();
  }, []);

  const loadGymData = async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const gymId = urlParams.get("id");

    if (!gymId) {
      navigate(createPageUrl("Gyms"));
      return;
    }

    try {
      const userData = await base44.auth.me();
      setUser(userData);

      const gymsData = await base44.entities.Gym.list();
      const gymData = gymsData.find(g => g.id === gymId);
      
      if (!gymData) {
        navigate(createPageUrl("Gyms"));
        return;
      }

      setGym(gymData);

      const reviewsData = await base44.entities.Review.filter({ gym_id: gymId }, "-created_date");
      setReviews(reviewsData);

      const membershipsData = await base44.entities.GymMembership.filter({ 
        gym_id: gymId,
        is_active: true 
      });
      setMemberships(membershipsData);

      if (userData) {
        const userSubsData = await base44.entities.GymSubscription.filter({
          user_id: userData.id,
          gym_id: gymId
        });
        setUserSubscriptions(userSubsData);
      }
    } catch (error) {
      console.error("Error loading gym:", error);
    }
    setLoading(false);
  };

  const handlePurchaseMembership = async (membership) => {
    if (!user) {
      base44.auth.redirectToLogin(window.location.href);
      return;
    }

    setPurchasing(true);
    setError(null);
    setSuccess(null);

    try {
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + membership.duration_days);

      await base44.entities.GymSubscription.create({
        user_id: user.id,
        gym_id: gym.id,
        membership_id: membership.id,
        start_date: startDate.toISOString().split('T')[0],
        end_date: endDate.toISOString().split('T')[0],
        status: "active",
        price_paid: membership.price
      });

      await loadGymData();
      setSuccess("Abbonamento acquistato con successo!");
    } catch (error) {
      setError("Errore nell'acquisto dell'abbonamento. Riprova.");
    }
    setPurchasing(false);
  };

  const hasActiveSubscription = () => {
    return userSubscriptions.some(s => s.status === "active");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!gym) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Image */}
      <div className="relative h-96 bg-gray-200">
        {gym.photos?.[0] ? (
          <img
            src={gym.photos[0]}
            alt={gym.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-orange-100">
            <Building2 className="w-32 h-32 text-blue-300" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        
        <div className="absolute top-6 left-6">
          <Button
            variant="secondary"
            size="icon"
            onClick={() => navigate(createPageUrl("Gyms"))}
            className="rounded-full"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4">{gym.name}</h1>
            <div className="flex items-center gap-4">
              {gym.google_rating && (
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                  <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold">{gym.google_rating}</span>
                  <span className="text-sm">Google</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                <span>{gym.city}</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {success && (
          <Alert className="mb-6 bg-green-50 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">{success}</AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full md:w-auto md:inline-grid grid-cols-4 gap-2">
            <TabsTrigger value="overview">Panoramica</TabsTrigger>
            <TabsTrigger value="memberships">Abbonamenti</TabsTrigger>
            <TabsTrigger value="gallery">Galleria</TabsTrigger>
            <TabsTrigger value="reviews">Recensioni</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                {gym.description && (
                  <Card>
                    <CardContent className="p-6">
                      <h2 className="text-2xl font-bold mb-4">Descrizione</h2>
                      <p className="text-gray-700 leading-relaxed">{gym.description}</p>
                    </CardContent>
                  </Card>
                )}

                {gym.amenities && gym.amenities.length > 0 && (
                  <Card>
                    <CardContent className="p-6">
                      <h2 className="text-2xl font-bold mb-4">Servizi Disponibili</h2>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {gym.amenities.map((amenity, i) => (
                          <Badge key={i} variant="secondary" className="justify-center py-2">
                            {amenity}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                <Card className="sticky top-6">
                  <CardContent className="p-6 space-y-4">
                    <h2 className="text-xl font-bold mb-4">Informazioni di Contatto</h2>
                    
                    {gym.address && (
                      <div className="flex items-start gap-3">
                        <MapPin className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                        <div>
                          <div className="font-medium">Indirizzo</div>
                          <div className="text-sm text-gray-600">{gym.address}</div>
                          <div className="text-sm text-gray-600">{gym.city}</div>
                        </div>
                      </div>
                    )}

                    {gym.phone && (
                      <div className="flex items-center gap-3">
                        <Phone className="w-5 h-5 text-blue-600" />
                        <div>
                          <div className="font-medium">Telefono</div>
                          <a href={`tel:${gym.phone}`} className="text-sm text-blue-600 hover:underline">
                            {gym.phone}
                          </a>
                        </div>
                      </div>
                    )}

                    {gym.email && (
                      <div className="flex items-center gap-3">
                        <Mail className="w-5 h-5 text-blue-600" />
                        <div>
                          <div className="font-medium">Email</div>
                          <a href={`mailto:${gym.email}`} className="text-sm text-blue-600 hover:underline">
                            {gym.email}
                          </a>
                        </div>
                      </div>
                    )}

                    {gym.opening_hours && (
                      <div className="flex items-start gap-3">
                        <Clock className="w-5 h-5 text-blue-600 mt-1" />
                        <div className="flex-1">
                          <div className="font-medium mb-2">Orari di Apertura</div>
                          <div className="text-sm text-gray-600 space-y-1">
                            {Object.entries(gym.opening_hours).map(([day, hours]) => (
                              <div key={day} className="flex justify-between">
                                <span className="capitalize">{day}:</span>
                                <span>{hours}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="pt-4 border-t space-y-2">
                      <div className="text-sm font-medium mb-2">Disponibile per:</div>
                      <div className="flex flex-wrap gap-2">
                        {gym.available_for_silver && (
                          <Badge className="bg-gray-200 text-gray-800">Silver</Badge>
                        )}
                        {gym.available_for_gold && (
                          <Badge className="bg-yellow-100 text-yellow-800">Gold</Badge>
                        )}
                        {gym.available_for_premium && (
                          <Badge className="bg-blue-200 text-blue-800">Premium</Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Memberships Tab */}
          <TabsContent value="memberships">
            <div className="max-w-5xl mx-auto">
              {hasActiveSubscription() && (
                <Alert className="mb-6 bg-green-50 border-green-200">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    Hai già un abbonamento attivo per questa palestra!
                  </AlertDescription>
                </Alert>
              )}

              {memberships.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {memberships.map((membership) => (
                    <Card key={membership.id} className="overflow-hidden hover:shadow-xl transition-shadow">
                      <div className="h-2 bg-gradient-to-r from-blue-600 to-orange-600"></div>
                      <CardHeader>
                        <CardTitle className="text-2xl">{membership.name}</CardTitle>
                        <div className="mt-4">
                          <span className="text-4xl font-bold">€{membership.price}</span>
                          <span className="text-gray-500 ml-2">/ {membership.duration_days} giorni</span>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {membership.description && (
                          <p className="text-gray-700 text-sm">{membership.description}</p>
                        )}
                        
                        {membership.benefits && membership.benefits.length > 0 && (
                          <ul className="space-y-2">
                            {membership.benefits.map((benefit, i) => (
                              <li key={i} className="flex items-start gap-2 text-sm">
                                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                                <span>{benefit}</span>
                              </li>
                            ))}
                          </ul>
                        )}

                        <Button
                          className="w-full bg-gradient-to-r from-blue-600 to-orange-600 hover:from-blue-700 hover:to-orange-700"
                          onClick={() => handlePurchaseMembership(membership)}
                          disabled={purchasing || hasActiveSubscription()}
                        >
                          {purchasing ? "Elaborazione..." : hasActiveSubscription() ? "Già Abbonato" : "Acquista"}
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-12">
                    <div className="text-center">
                      <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-gray-600 mb-2">
                        Nessun abbonamento disponibile
                      </h3>
                      <p className="text-gray-500">
                        Questa palestra non ha ancora configurato abbonamenti specifici
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Gallery Tab */}
          <TabsContent value="gallery">
            <Card>
              <CardHeader>
                <CardTitle>Galleria Foto ({gym.photos?.length || 0})</CardTitle>
              </CardHeader>
              <CardContent>
                {gym.photos && gym.photos.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {gym.photos.map((photo, i) => (
                      <div key={i} className="aspect-square rounded-lg overflow-hidden cursor-pointer hover:scale-105 transition-transform">
                        <img
                          src={photo}
                          alt={`${gym.name} - foto ${i + 1}`}
                          className="w-full h-full object-cover"
                          onClick={() => window.open(photo, '_blank')}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-gray-500 py-12">Nessuna foto disponibile</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reviews Tab */}
          <TabsContent value="reviews">
            <Card>
              <CardHeader>
                <CardTitle>Recensioni</CardTitle>
              </CardHeader>
              <CardContent>
                {reviews.length > 0 ? (
                  <div className="space-y-4">
                    {reviews.map((review) => (
                      <div key={review.id} className="border-b pb-4 last:border-0">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold">{review.user_name}</span>
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${
                                  i < review.rating
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        {review.comment && (
                          <p className="text-gray-700 text-sm">{review.comment}</p>
                        )}
                        {review.source === "google" && (
                          <Badge variant="outline" className="mt-2 text-xs">
                            Da Google
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-gray-500 py-8">
                    Nessuna recensione disponibile
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}