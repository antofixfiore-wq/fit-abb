import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  MapPin, 
  Star, 
  Award, 
  Calendar, 
  FileText, 
  ShoppingCart,
  CheckCircle
} from "lucide-react";
import { motion } from "framer-motion";

export default function PTProfile() {
  const navigate = useNavigate();
  const [trainer, setTrainer] = useState(null);
  const [services, setServices] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const trainerId = urlParams.get('id');
      
      if (!trainerId) {
        navigate("/");
        return;
      }

      const userData = await base44.auth.me();
      setUser(userData);

      const trainerData = await base44.entities.PersonalTrainer.filter({ id: trainerId });
      if (!trainerData || trainerData.length === 0) {
        navigate("/");
        return;
      }
      setTrainer(trainerData[0]);

      const [servicesData, reviewsData] = await Promise.all([
        base44.entities.PTService.filter({ pt_email: trainerData[0].user_email, is_active: true }),
        base44.entities.PTReview.filter({ pt_email: trainerData[0].user_email }, "-created_date")
      ]);

      setServices(servicesData);
      setReviews(reviewsData);
    } catch (error) {
      console.error("Error loading data:", error);
    }
    setLoading(false);
  };

  const handlePurchaseService = async (service) => {
    if (!user) {
      base44.auth.redirectToLogin();
      return;
    }

    const commission = service.price * 0.05;
    const ptEarning = service.price - commission;

    await base44.entities.ServicePurchase.create({
      service_id: service.id,
      pt_email: service.pt_email,
      customer_email: user.email,
      customer_name: user.full_name,
      service_title: service.title,
      price_paid: service.price,
      commission: commission,
      pt_earning: ptEarning,
      status: "completed"
    });

    await base44.entities.PTService.update(service.id, {
      total_sales: (service.total_sales || 0) + 1
    });

    alert("Servizio acquistato con successo!");
    await loadData();
  };

  const getCategoryLabel = (category) => {
    const labels = {
      scheda_allenamento: "Scheda Allenamento",
      programma_mensile: "Programma Mensile",
      consulenza_online: "Consulenza Online",
      piano_nutrizionale: "Piano Nutrizionale",
      coaching_personalizzato: "Coaching Personalizzato"
    };
    return labels[category] || category;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0a0a0a]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  if (!trainer) return null;

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Header */}
      <div className="relative">
        <div className="h-64 bg-gradient-to-br from-blue-600 to-orange-600 overflow-hidden">
          {trainer.cover_image_url && (
            <img src={trainer.cover_image_url} alt={trainer.full_name} className="w-full h-full object-cover" />
          )}
        </div>
        
        <div className="max-w-6xl mx-auto px-6 relative -mt-20">
          <div className="bg-[#1a1a1a] rounded-xl border border-white/10 p-6">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white/10 bg-gray-800 flex-shrink-0">
                {trainer.profile_image_url ? (
                  <img src={trainer.profile_image_url} alt={trainer.full_name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-orange-500 text-white text-4xl font-bold">
                    {trainer.full_name?.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              
              <div className="flex-1">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <h1 className="text-3xl font-black text-white">{trainer.full_name}</h1>
                      {trainer.is_verified && (
                        <Badge className="bg-blue-600 text-white">
                          <Award className="w-3 h-3 mr-1" />
                          Verificato
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-gray-400 mb-2">
                      <MapPin className="w-4 h-4" />
                      <span>{trainer.city}</span>
                    </div>
                    {trainer.rating > 0 && (
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          <Star className="w-5 h-5 fill-yellow-500 text-yellow-500" />
                          <span className="text-white font-bold">{trainer.rating.toFixed(1)}</span>
                        </div>
                        <span className="text-gray-400">({trainer.total_reviews} recensioni)</span>
                      </div>
                    )}
                  </div>
                </div>

                {trainer.bio && (
                  <p className="text-gray-300 mb-4">{trainer.bio}</p>
                )}

                {trainer.specializations && trainer.specializations.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {trainer.specializations.map((spec, i) => (
                      <Badge key={i} className="bg-white/10 text-white border-white/20">
                        {spec}
                      </Badge>
                    ))}
                  </div>
                )}

                {trainer.certifications && trainer.certifications.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-gray-400">Certificazioni</h3>
                    <div className="flex flex-wrap gap-2">
                      {trainer.certifications.map((cert, i) => (
                        <Badge key={i} variant="outline" className="bg-white/5 text-white border-white/20">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          {cert}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12">
        <Tabs defaultValue="services">
          <TabsList className="bg-[#1a1a1a] border border-white/10 mb-8">
            <TabsTrigger value="services" className="data-[state=active]:bg-white data-[state=active]:text-black">
              <ShoppingCart className="w-4 h-4 mr-2" />
              Servizi ({services.length})
            </TabsTrigger>
            <TabsTrigger value="reviews" className="data-[state=active]:bg-white data-[state=active]:text-black">
              <Star className="w-4 h-4 mr-2" />
              Recensioni ({reviews.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="services">
            {services.length > 0 ? (
              <div className="grid md:grid-cols-2 gap-6">
                {services.map((service) => (
                  <motion.div
                    key={service.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <Card className="bg-[#1a1a1a] border-white/10 hover:bg-[#222] transition-all h-full">
                      {service.image_url && (
                        <div className="h-48 overflow-hidden">
                          <img src={service.image_url} alt={service.title} className="w-full h-full object-cover" />
                        </div>
                      )}
                      <CardHeader>
                        <div className="flex items-start justify-between mb-2">
                          <Badge className="bg-gradient-to-r from-blue-600 to-orange-600 text-white">
                            {getCategoryLabel(service.category)}
                          </Badge>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-white">€{service.price}</div>
                            {service.duration_days && (
                              <div className="text-xs text-gray-400">{service.duration_days} giorni</div>
                            )}
                          </div>
                        </div>
                        <CardTitle className="text-white">{service.title}</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <p className="text-gray-300 text-sm">{service.description}</p>
                        
                        {service.includes && service.includes.length > 0 && (
                          <div>
                            <h4 className="text-sm font-semibold text-white mb-2">Include:</h4>
                            <ul className="space-y-1">
                              {service.includes.map((item, i) => (
                                <li key={i} className="flex items-center gap-2 text-sm text-gray-400">
                                  <CheckCircle className="w-4 h-4 text-green-500" />
                                  {item}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {service.total_sales > 0 && (
                          <div className="text-sm text-gray-400">
                            {service.total_sales} persone hanno acquistato
                          </div>
                        )}

                        <Button
                          onClick={() => handlePurchaseService(service)}
                          className="w-full bg-gradient-to-r from-blue-600 to-orange-600 hover:from-blue-700 hover:to-orange-700 rounded-full"
                        >
                          <ShoppingCart className="w-4 h-4 mr-2" />
                          Acquista Ora
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            ) : (
              <Card className="bg-[#1a1a1a] border-white/10 py-12">
                <CardContent className="text-center">
                  <FileText className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">Nessun servizio disponibile al momento</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="reviews">
            {reviews.length > 0 ? (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <Card key={review.id} className="bg-[#1a1a1a] border-white/10">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <Avatar>
                          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-orange-500 text-white">
                            {review.customer_name?.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold text-white">{review.customer_name}</h4>
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-4 h-4 ${i < review.rating ? 'fill-yellow-500 text-yellow-500' : 'text-gray-600'}`}
                                />
                              ))}
                            </div>
                          </div>
                          {review.comment && (
                            <p className="text-gray-300">{review.comment}</p>
                          )}
                          <div className="text-xs text-gray-500 mt-2">
                            {new Date(review.created_date).toLocaleDateString('it-IT')}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="bg-[#1a1a1a] border-white/10 py-12">
                <CardContent className="text-center">
                  <Star className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">Nessuna recensione ancora</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}