import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Funzione chiamata dall'automation quando viene creata una nuova palestra
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();

    const gymData = body.data;
    if (!gymData) {
      return Response.json({ error: 'No gym data' }, { status: 400 });
    }

    // Trova tutti gli admin
    const admins = await base44.asServiceRole.entities.User.filter({ role: 'admin' });

    // Notifica ogni admin
    for (const admin of admins) {
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: admin.email,
        subject: `🏋️ Nuova palestra registrata: ${gymData.name}`,
        body: `Ciao Admin,\n\nUna nuova palestra si è registrata su Fit ABB:\n\n📍 Nome: ${gymData.name}\n🏙️ Città: ${gymData.city}\n📧 Email gestore: ${gymData.manager_email || 'Non fornita'}\n💳 P.IVA: ${gymData.piva || 'Non fornita'}\n\nAccedi alla dashboard admin per approvare e completare l'onboarding.\n\nhttps://fitabb.com/AdminGyms\n\nIl sistema Fit ABB`
      });
    }

    // Invia email di benvenuto al gestore
    if (gymData.manager_email) {
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: gymData.manager_email,
        subject: `Benvenuto nel circuito Fit ABB! 🏋️`,
        body: `Ciao,\n\nAbbiamo ricevuto la registrazione della palestra "${gymData.name}".\n\nIl nostro team la verificherà entro 24-48 ore. Riceverai una conferma appena approvata.\n\nMentre aspetti, puoi accedere alla dashboard per completare il profilo:\nhttps://fitabb.com/GymDashboard\n\nPer qualsiasi domanda, rispondi a questa email.\n\nBenvenuto a bordo!\nIl team Fit ABB`
      });
    }

    console.log(`Notifica nuova palestra inviata: ${gymData.name}`);
    return Response.json({ success: true });
  } catch (error) {
    console.error('notifyNewGym error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});