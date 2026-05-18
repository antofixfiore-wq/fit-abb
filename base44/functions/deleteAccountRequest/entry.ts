import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized - Devi essere autenticato' }, { status: 401 });
    }

    const body = await req.json();
    const { confirmation_text } = body;

    // Verifica che l'utente abbia confermato
    if (confirmation_text !== 'ELIMINA') {
      return Response.json({ error: 'Conferma non valida' }, { status: 400 });
    }

    // Invia email al supporto
    await base44.integrations.Core.SendEmail({
      to: "supporto@fit-abb.com",
      subject: `Richiesta eliminazione account: ${user.email}`,
      body: `L'utente ${user.full_name} (${user.email}) ha richiesto l'eliminazione del proprio account e di tutti i dati associati tramite il modulo in-app.

ID Utente: ${user.id}
Data richiesta: ${new Date().toLocaleString("it-IT", { timeZone: "Europe/Rome" })}
Tipo account: ${user.role || 'user'}
Abbonamento attivo: ${user.subscription_type || 'none'}

IMPORTANTE: Verificare se l'utente ha abbonamenti Stripe attivi e procedere con la cancellazione prima di eliminare l'account.

Questa richiesta è stata generata automaticamente dal sistema Fit ABB.`,
    });

    // Log della richiesta (opzionale, per tracciamento)
    console.log(`Richiesta eliminazione account ricevuta per: ${user.email}`);

    return Response.json({ 
      success: true, 
      message: 'Richiesta inviata al supporto' 
    });

  } catch (error) {
    console.error('deleteAccountRequest error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});