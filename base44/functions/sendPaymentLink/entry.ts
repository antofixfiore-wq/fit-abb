import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import { v4 as uuidv4 } from 'npm:uuid@9.0.0';

const PLANS = {
  gold: { name: 'Gold', price: '€40/mese' },
  plus: { name: 'Plus', price: '€70/mese' },
  annuale_gold: { name: 'Gold Annuale', price: '€365/anno' },
  annuale_plus: { name: 'Plus Annuale', price: '€650/anno' }
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    // Verifica che l'utente sia admin o gym manager
    if (!user || (user.role !== 'admin' && !user.is_gym_manager)) {
      return Response.json({ error: 'Unauthorized - Solo admin o gestori palestre' }, { status: 401 });
    }

    const body = await req.json();
    const { email, plan_type, custom_message } = body;

    if (!email || !plan_type) {
      return Response.json({ error: 'Email e piano sono obbligatori' }, { status: 400 });
    }

    if (!PLANS[plan_type]) {
      return Response.json({ error: 'Piano non valido' }, { status: 400 });
    }

    // Genera token unico
    const token = uuidv4();
    const createdAt = new Date();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // Scade in 7 giorni

    // Salva il token nel database
    await base44.entities.PaymentToken.create({
      token,
      email,
      plan_type,
      created_at: createdAt.toISOString(),
      expires_at: expiresAt.toISOString(),
      used: false
    });

    // Costruisci il link di pagamento
    const origin = req.headers.get('origin') || 'https://app.fit-abb.com';
    const paymentLink = `${origin}/payment?token=${token}`;

    // Invia email
    await base44.integrations.Core.SendEmail({
      to: email,
      subject: `Completa il tuo abbonamento Fit ABB - Piano ${PLANS[plan_type].name}`,
      body: `Ciao,

abbiamo ricevuto la tua richiesta di abbonamento al piano ${PLANS[plan_type].name} (${PLANS[plan_type].price}).

Per completare l'attivazione, clicca sul link sicuro qui sotto:

👉 ${paymentLink}

Il link è personale e scadrà il ${expiresAt.toLocaleDateString('it-IT', { timeZone: 'Europe/Rome' })}.

${custom_message ? custom_message + '\n\n' : ''}Cosa include il piano ${PLANS[plan_type].name}:
${plan_type === 'gold' ? '- Accesso illimitato a palestre Gold\n- Check-in illimitati\n- Supporto base' : ''}
${plan_type === 'plus' ? '- Accesso a palestre Gold + Plus\n- Check-in illimitati\n- Supporto prioritario\n- Contenuti premium' : ''}
${plan_type === 'annuale_gold' ? '- Tutti i benefit Gold\n- Risparmio del 20%\n- Pagamento unico annuale' : ''}
${plan_type === 'annuale_plus' ? '- Tutti i benefit Plus\n- Risparmio del 20%\n- Pagamento unico annuale' : ''}

Il pagamento è sicuro e gestito da Stripe®. Puoi cancellare l'abbonamento in qualsiasi momento.

Hai domande? Rispondi a questa email o contatta supporto@fit-abb.com

A presto,
Il team Fit ABB`
    });

    console.log(`Link di pagamento inviato a ${email} per piano ${plan_type}`);

    return Response.json({ 
      success: true, 
      message: 'Email di pagamento inviata con successo',
      token,
      payment_link: paymentLink
    });

  } catch (error) {
    console.error('sendPaymentLink error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});