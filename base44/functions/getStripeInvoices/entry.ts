import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import Stripe from 'npm:stripe@14.21.0';

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY"));

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Non autenticato' }, { status: 401 });
    }

    const invoices = [];

    // Se l'utente ha un customer Stripe, recupera le invoice
    if (user.stripe_customer_id) {
      const stripeInvoices = await stripe.invoices.list({
        customer: user.stripe_customer_id,
        limit: 24,
      });

      for (const inv of stripeInvoices.data) {
        invoices.push({
          id: inv.id,
          number: inv.number,
          amount_paid: inv.amount_paid / 100,
          currency: inv.currency.toUpperCase(),
          status: inv.status,
          period_start: inv.period_start ? new Date(inv.period_start * 1000).toISOString() : null,
          period_end: inv.period_end ? new Date(inv.period_end * 1000).toISOString() : null,
          created: new Date(inv.created * 1000).toISOString(),
          invoice_pdf: inv.invoice_pdf,
          hosted_invoice_url: inv.hosted_invoice_url,
          description: inv.lines?.data?.[0]?.description || 'Abbonamento Fit ABB',
        });
      }
    }

    return Response.json({ invoices });
  } catch (error) {
    console.error('Errore getStripeInvoices:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});