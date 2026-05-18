import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import Stripe from 'npm:stripe@14.21.0';
import { v4 as uuidv4 } from 'npm:uuid@9.0.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

// Mappa plan -> Stripe price ID
const PRICE_IDS = {
  gold: 'price_1TYOfQDL9ritAoOVfOk2nmRe',
  plus: 'price_1TYOfQDL9ritAoOVQkmBWTNq',
  annuale_gold: 'price_1TYOfQDL9ritAoOVBnGNt8p5',
  annuale_plus: 'price_1TYOfQDL9ritAoOV07DBCrGN'
};

const PLANS = {
  gold: { name: 'Gold', price: '€40/mese' },
  plus: { name: 'Plus', price: '€70/mese' },
  annuale_gold: { name: 'Gold Annuale', price: '€365/anno' },
  annuale_plus: { name: 'Plus Annuale', price: '€650/anno' }
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Leggi il body una sola volta
    const body = await req.json().catch(() => null);
    
    // Prendi il token dal payload o dall'URL
    const url = new URL(req.url);
    let token = body?.token || url.searchParams.get('token');

    if (!token) {
      return Response.json({ error: 'Token non fornito' }, { status: 400 });
    }

    // Verifica il token nel database
    const paymentTokens = await base44.entities.PaymentToken.filter({ token });
    
    if (paymentTokens.length === 0) {
      return Response.json({ error: 'Token non valido o scaduto' }, { status: 404 });
    }

    const paymentToken = paymentTokens[0];
    
    // Verifica scadenza (7 giorni dalla creazione)
    const now = new Date();
    const expiresAt = new Date(paymentToken.expires_at);
    if (expiresAt < now) {
      console.log(`Token scaduto: ${token}, scadenza: ${expiresAt}`);
      return Response.json({ error: 'Token scaduto' }, { status: 400 });
    }

    // Verifica se già usato
    if (paymentToken.used) {
      console.log(`Token già usato: ${token}`);
      return Response.json({ error: 'Token già utilizzato' }, { status: 400 });
    }

    // Verifica che l'email esista nell'entity User
    const users = await base44.asServiceRole.entities.User.filter({ email: paymentToken.email });
    if (users.length === 0) {
      console.error(`Email nel token non trovata: ${paymentToken.email}`);
      return Response.json({ error: 'Email non valida' }, { status: 400 });
    }

    const { action } = body || {};

    // === VALIDA TOKEN ===
    if (action === 'validate_token' || !action) {
      // Ritorna i dati del token per la UI
      return Response.json({ 
        email: paymentToken.email,
        plan_type: paymentToken.plan_type,
        expires_at: paymentToken.expires_at
      });
    }

    // === CREA CHECKOUT SESSION ===
    if (action === 'create_checkout') {
      const { plan_type } = body;

      if (!PRICE_IDS[plan_type]) {
        return Response.json({ error: 'Piano non valido' }, { status: 400 });
      }

      // Impedisce checkout se token sta per scadere (meno di 24 ore)
      const hoursUntilExpiry = (new Date(paymentToken.expires_at) - now) / (1000 * 60 * 60);
      if (hoursUntilExpiry < 24) {
        return Response.json({ error: 'Token in scadenza. Richiedi un nuovo link.' }, { status: 400 });
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
        customer_email: paymentToken.email,
        metadata: {
          base44_app_id: Deno.env.get('BASE44_APP_ID'),
          plan_type,
          payment_token: token,
          user_email: paymentToken.email
        },
        subscription_data: {
          metadata: {
            plan_type,
            payment_token: token,
            user_email: paymentToken.email
          }
        }
      });

      // Salva session_id nel token per tracking
      await base44.asServiceRole.entities.PaymentToken.update(paymentToken.id, {
        subscription_id: session.id
      });

      return Response.json({ checkout_url: session.url, session_id: session.id });
    }

    return Response.json({ error: 'Azione non valida' }, { status: 400 });

  } catch (error) {
    console.error('createPaymentSession error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});