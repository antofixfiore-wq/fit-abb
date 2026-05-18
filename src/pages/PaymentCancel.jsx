import React from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { XCircle, ArrowLeft } from "lucide-react";

export default function PaymentCancel() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
      <Card className="max-w-md w-full bg-[#1a1a1a] border-white/10">
        <CardHeader className="text-center">
          <XCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <CardTitle className="text-white text-2xl">Pagamento Annullato</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-gray-400">
            Il pagamento è stato annullato. Il tuo link di pagamento è ancora valido e puoi riprovare quando vuoi.
          </p>
          <div className="flex gap-3">
            <Button 
              onClick={() => navigate(-1)}
              variant="outline"
              className="flex-1 border-white/20 text-white"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Torna indietro
            </Button>
            <Button 
              onClick={() => navigate('/')}
              className="flex-1"
              style={{ background: "#E8FF00", color: "#000" }}
            >
              Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}