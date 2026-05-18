import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import Stripe from 'npm:stripe@14.21.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

// Mappa price_id -> plan_type interno
const PRICE_TO_PLAN = {
  'price_1TYOfQDL9ritAoOVfOk2nmRe': 'gold',
  'price_1TYOfQDL9ritAoOVQkmBWTNq': 'plus',
  'price_1TYOfQDL9ritAoOVBnGNt8p5': 'annuale_gold',
  'price_1TYOfQDL9ritAoOV07DBCrGN': 'annuale_plus'
};

// Mappa plan -> subscription_type sul profilo utente
const PLAN_TO_SUB_TYPE = {
  gold: 'gold',
  plus: 'plus',
  annuale_gold: 'gold',
  annuale_plus: 'plus'
};

Deno.serve(async (req) => {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature');
  const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');

  let event;
  try {
    event = await stripe.webhooks.constructEventAsync(body, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  const base44 = createClientFromRequest(req);

  try {
    switch (event.type) {

      // Pagamento abbonamento completato (prima attivazione o rinnovo)
      // Salva stripe_customer_id al completamento del checkout
      case 'checkout.session.completed': {
        const session = event.data.object;
        const userEmail = session.metadata?.user_email;
        const customerId = session.customer;
        const planType = session.metadata?.plan_type;
        if (userEmail && customerId) {
          const users = await base44.asServiceRole.entities.User.filter({ email: userEmail });
          if (users[0]) {
            const updateData = {
              stripe_customer_id: customerId
            };
            // Imposta stato attivo se non esiste già
            if (!users[0].subscription_status) {
              updateData.subscription_status = 'active';
            }
            if (planType && !users[0].subscription_plan) {
              updateData.subscription_plan = planType;
              updateData.subscription_type = PLAN_TO_SUB_TYPE[planType] || planType;
            }
            await base44.asServiceRole.entities.User.update(users[0].id, updateData);
            console.log(`Checkout completato per ${userEmail}: customer_id=${customerId}, plan=${planType}`);
          }
        }
        break;
      }

      case 'invoice.paid': {
        const invoice = event.data.object;
        if (invoice.billing_reason === 'subscription_create' || invoice.billing_reason === 'subscription_cycle') {
          const subscription = await stripe.subscriptions.retrieve(invoice.subscription);
          const planType = subscription.metadata?.plan_type;
          const paymentToken = subscription.metadata?.payment_token;
          const userEmail = subscription.metadata?.user_email;

          if (!userEmail || !planType) break;

          const subType = PLAN_TO_SUB_TYPE[planType] || planType;
          const endDate = new Date(subscription.current_period_end * 1000).toISOString().split('T')[0];
          const startDate = new Date(subscription.current_period_start * 1000).toISOString().split('T')[0];

          // Aggiorna utente
          const users = await base44.asServiceRole.entities.User.filter({ email: userEmail });
          if (users[0]) {
            await base44.asServiceRole.entities.User.update(users[0].id, {
              subscription_type: subType,
              subscription_plan: planType,
              stripe_subscription_id: subscription.id,
              subscription_start_date: startDate,
              subscription_end_date: endDate,
              subscription_cancel_at_period_end: false,
              subscription_status: 'active'
            });
          }

          // Marca il token come usato
          if (paymentToken) {
            const tokens = await base44.asServiceRole.entities.PaymentToken.filter({ token: paymentToken });
            if (tokens[0] && !tokens[0].used) {
              await base44.asServiceRole.entities.PaymentToken.update(tokens[0].id, {
                used: true,
                subscription_id: subscription.id
              });
              console.log(`Token ${paymentToken} marcato come usato`);
            }
          }

          console.log(`Abbonamento attivato/rinnovato per ${userEmail}: ${planType} fino al ${endDate}`);
        }
        break;
      }

      // Pagamento fallito
      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        const subscription = await stripe.subscriptions.retrieve(invoice.subscription);
        const userEmail = subscription.metadata?.user_email;

        if (userEmail) {
          const users = await base44.asServiceRole.entities.User.filter({ email: userEmail });
          if (users[0]) {
            await base44.asServiceRole.entities.User.update(users[0].id, {
              subscription_status: 'past_due'
            });
          }
          console.log(`Pagamento fallito per ${userEmail}`);
        }
        break;
      }

      // Abbonamento cancellato definitivamente
      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        const userEmail = subscription.metadata?.user_email;

        if (userEmail) {
          const users = await base44.asServiceRole.entities.User.filter({ email: userEmail });
          if (users[0]) {
            await base44.asServiceRole.entities.User.update(users[0].id, {
              subscription_type: 'none',
              subscription_status: 'cancelled',
              stripe_subscription_id: null,
              subscription_cancel_at_period_end: false
            });
          }
          console.log(`Abbonamento cancellato per ${userEmail}`);
        }
        break;
      }

      // Abbonamento aggiornato (es. cancel_at_period_end cambiato)
      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        const userEmail = subscription.metadata?.user_email;

        if (userEmail) {
          const users = await base44.asServiceRole.entities.User.filter({ email: userEmail });
          if (users[0]) {
            await base44.asServiceRole.entities.User.update(users[0].id, {
              subscription_cancel_at_period_end: subscription.cancel_at_period_end
            });
          }
        }
        break;
      }

      default:
        console.log(`Evento non gestito: ${event.type}`);
    }

    return Response.json({ received: true });

  } catch (error) {
    console.error('Webhook handler error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});