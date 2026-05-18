import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import Stripe from 'npm:stripe@14.21.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

// Mappa plan -> Stripe price ID
const PRICE_IDS = {
  gold: 'price_1TYMrSDL9ritAoOVEGrOmX3J',
  plus: 'price_1TYMrSDL9ritAoOVYTYACYgp',
  annuale_gold: 'price_1TYMrSDL9ritAoOVr5mBfcES',
  annuale_plus: 'price_1TYMrSDL9ritAoOVsUGaXEMI'
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { action } = body;

    // === CREA CHECKOUT SESSION ===
    if (action === 'create_checkout') {
      const { plan_type, success_url, cancel_url } = body;

      if (!PRICE_IDS[plan_type]) {
        return Response.json({ error: 'Piano non valido' }, { status: 400 });
      }

      // Cerca o crea customer Stripe
      let customerId = user.stripe_customer_id;
      if (!customerId) {
        const customer = await stripe.customers.create({
          email: user.email,
          name: user.full_name,
          metadata: { base44_user_id: user.id }
        });
        customerId = customer.id;
        await base44.auth.updateMe({ stripe_customer_id: customerId });
      }

      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        mode: 'subscription',
        payment_method_types: ['card'],
        line_items: [{ price: PRICE_IDS[plan_type], quantity: 1 }],
        success_url: success_url || `${Deno.env.get('APP_URL')}/Profile?subscription=success`,
        cancel_url: cancel_url || `${Deno.env.get('APP_URL')}/Subscription?plan=${plan_type}`,
        metadata: {
          base44_app_id: Deno.env.get('BASE44_APP_ID'),
          plan_type,
          user_id: user.id,
          user_email: user.email
        },
        subscription_data: {
          metadata: {
            plan_type,
            user_id: user.id,
            user_email: user.email
          }
        }
      });

      return Response.json({ checkout_url: session.url, session_id: session.id });
    }

    // === CANCELLA ABBONAMENTO (fine periodo) ===
    if (action === 'cancel_subscription') {
      if (!user.stripe_subscription_id) {
        return Response.json({ error: 'Nessun abbonamento Stripe attivo' }, { status: 400 });
      }

      // cancel_at_period_end = true → il cliente mantiene l'accesso fino alla scadenza
      await stripe.subscriptions.update(user.stripe_subscription_id, {
        cancel_at_period_end: true
      });

      await base44.auth.updateMe({ subscription_cancel_at_period_end: true });

      return Response.json({ success: true, message: 'Abbonamento impostato per la cancellazione a fine periodo' });
    }

    // === RIATTIVA (se aveva messo cancel_at_period_end) ===
    if (action === 'reactivate_subscription') {
      if (!user.stripe_subscription_id) {
        return Response.json({ error: 'Nessun abbonamento Stripe attivo' }, { status: 400 });
      }

      await stripe.subscriptions.update(user.stripe_subscription_id, {
        cancel_at_period_end: false
      });

      await base44.auth.updateMe({ subscription_cancel_at_period_end: false });

      return Response.json({ success: true, message: 'Abbonamento riattivato con successo' });
    }

    return Response.json({ error: 'Azione non valida' }, { status: 400 });

  } catch (error) {
    console.error('manageSubscription error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});