import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import Stripe from 'npm:stripe@14.21.0';
import { v4 as uuidv4 } from 'npm:uuid@9.0.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

// Mappa plan -> Stripe price ID
const PRICE_IDS = {
  gold: 'price_1TYNVlDL9ritAoOVVjBYgr25',
  plus: 'price_1TYNVlDL9ritAoOVpTOMnYoj',
  annuale_gold: 'price_1TYNVlDL9ritAoOVR03zYG5m',
  annuale_plus: 'price_1TYNVlDL9ritAoOV8pihahMe'
};

const PLANS = {
  gold: { name: 'Gold', price: '€40/mese' },
  plus: { name: 'Plus', price: '€70/mese' },
  annuale_gold: { name: 'Gold Annuale', price: '€480/anno' },
  annuale_plus: { name: 'Plus Annuale', price: '€840/anno' }
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const url = new URL(req.url);
    const token = url.searchParams.get('token');

    if (!token) {
      return Response.json({ error: 'Token non fornito' }, { status: 400 });
    }

    // Verifica il token nel database
    const paymentTokens = await base44.entities.PaymentToken.filter({ token });
    
    if (paymentTokens.length === 0) {
      return Response.json({ error: 'Token non valido o scaduto' }, { status: 404 });
    }

    const tokenData = paymentTokens[0];
    
    // Verifica scadenza
    if (new Date(tokenData.expires_at) < new Date()) {
      return Response.json({ error: 'Token scaduto' }, { status: 400 });
    }

    // Verifica se già usato
    if (tokenData.used) {
      return Response.json({ error: 'Token già utilizzato' }, { status: 400 });
    }

    const body = await req.json();
    const { action } = body;

    // === CREA CHECKOUT SESSION ===
    if (action === 'create_checkout') {
      const { plan_type } = body;

      if (!PRICE_IDS[plan_type]) {
        return Response.json({ error: 'Piano non valido' }, { status: 400 });
      }

      const origin = req.headers.get('origin') || 'https://app.fit-abb.com';
      const successUrl = `${origin}/payment-success?token=${token}`;
      const cancelUrl = `${origin}/payment-cancel?token=${token}`;

      const session = await stripe.checkout.sessions.create({
        mode: 'subscription',
        payment_method_types: ['card'],
        line_items: [{ price: PRICE_IDS[plan_type], quantity: 1 }],
        success_url: successUrl,
        cancel_url: cancelUrl,
        customer_email: tokenData.email,
        metadata: {
          base44_app_id: Deno.env.get('BASE44_APP_ID'),
          plan_type,
          payment_token: token,
          user_email: tokenData.email
        },
        subscription_data: {
          metadata: {
            plan_type,
            payment_token: token,
            user_email: tokenData.email
          }
        }
      });

      return Response.json({ checkout_url: session.url, session_id: session.id });
    }

    return Response.json({ error: 'Azione non valida' }, { status: 400 });

  } catch (error) {
    console.error('createPaymentSession error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});