import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import Stripe from 'npm:stripe@14';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

// Mappa plan_type → Stripe price_id
const PRICE_MAP = {
  gold:         'price_1TYMrSDL9ritAoOVEGrOmX3J',
  annuale_gold: 'price_1TYMrSDL9ritAoOVr5mBfcES',
  plus:         'price_1TYMrSDL9ritAoOVYTYACYgp',
  annuale_plus: 'price_1TYMrSDL9ritAoOVsUGaXEMI',
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { plan_type, success_url, cancel_url } = await req.json();

    if (!plan_type || !PRICE_MAP[plan_type]) {
      return Response.json({ error: 'Piano non valido' }, { status: 400 });
    }

    const priceId = PRICE_MAP[plan_type];

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      customer_email: user.email,
      success_url: success_url || `${req.headers.get('origin')}/Subscription?plan=${plan_type}&success=true`,
      cancel_url: cancel_url || `${req.headers.get('origin')}/Subscription?plan=${plan_type}`,
      metadata: {
        base44_app_id: Deno.env.get('BASE44_APP_ID'),
        user_email: user.email,
        plan_type,
      },
      subscription_data: {
        metadata: {
          user_email: user.email,
          plan_type,
        }
      }
    });

    return Response.json({ url: session.url, session_id: session.id });
  } catch (error) {
    console.error('createCheckoutSession error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});