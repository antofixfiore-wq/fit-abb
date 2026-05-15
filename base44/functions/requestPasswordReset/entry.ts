import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import crypto from 'node:crypto';

Deno.serve(async (req) => {
  try {
    const { email } = await req.json();

    if (!email) {
      return Response.json({ error: 'Email required' }, { status: 400 });
    }

    const base44 = createClientFromRequest(req);

    // Verifica che l'utente esista
    const users = await base44.asServiceRole.entities.User.filter({ email });
    if (!users || users.length === 0) {
      // Per sicurezza, non rivelare se l'email esiste
      return Response.json({ message: 'Se l\'email è registrata, riceverai un link per resettare la password' });
    }

    // Genera token casuale (32 byte = 64 char hex)
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 3600000); // 1 ora

    // Salva il token su entity (crea se non esiste)
    await base44.asServiceRole.entities.PasswordReset.create({
      email,
      token,
      expires_at: expiresAt.toISOString(),
      used: false
    });

    // Manda email con link reset
    const resetUrl = `${Deno.env.get('APP_URL') || 'https://fitabb.app'}/reset-password?token=${token}&email=${encodeURIComponent(email)}`;

    await base44.integrations.Core.SendEmail({
      to: email,
      subject: 'Reimposta la tua password - Fit ABB',
      body: `Ciao!\n\nHai richiesto di resettare la tua password. Clicca il link qui sotto:\n\n${resetUrl}\n\nIl link è valido per 1 ora.\n\nSe non hai fatto questa richiesta, ignora questo email.\n\nTeam Fit ABB`
    });

    return Response.json({ message: 'Se l\'email è registrata, riceverai un link per resettare la password' });
  } catch (error) {
    console.error('Password reset error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});