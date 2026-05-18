import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user?.role || user.role === 'user') {
      return Response.json({ error: 'Only gym managers can validate' }, { status: 403 });
    }

    const body = await req.json();
    const { token, numeric_code, gym_id } = body;

    if (!gym_id || (!token && !numeric_code)) {
      return Response.json({
        error: 'token or numeric_code and gym_id required',
        validation_status: 'denied'
      }, { status: 400 });
    }

    // Cerca AccessPass per token o codice numerico
    let accessPass;
    if (token) {
      const passes = await base44.asServiceRole.entities.AccessPass.filter({ token });
      accessPass = passes[0];
    } else if (numeric_code) {
      const passes = await base44.asServiceRole.entities.AccessPass.filter({ numeric_code });
      accessPass = passes[0];
    }

    if (!accessPass) {
      return Response.json({
        validation_status: 'denied',
        denial_reason: 'codice_errato',
        message: 'Codice o QR non trovato'
      }, { status: 404 });
    }

    // Verifica se è stato già usato
    if (accessPass.used) {
      return Response.json({
        validation_status: 'denied',
        denial_reason: 'codice_gia_utilizzato',
        message: 'Questo QR/codice è stato già utilizzato'
      }, { status: 403 });
    }

    // Verifica scadenza
    const now = new Date();
    if (new Date(accessPass.expires_at) < now) {
      return Response.json({
        validation_status: 'denied',
        denial_reason: 'codice_scaduto',
        message: 'QR/codice scaduto'
      }, { status: 403 });
    }

    // Verifica che la palestra corrisponda
    if (accessPass.gym_id !== gym_id) {
      return Response.json({
        validation_status: 'denied',
        denial_reason: 'palestra_non_corrisponde',
        message: 'Questo pass non è valido per questa palestra'
      }, { status: 403 });
    }

    // Verifica abbonamento ancora attivo
    const clientUser = await base44.asServiceRole.entities.User.filter({ email: accessPass.client_email });
    const client = clientUser[0];
    const validTypes = ['gold', 'plus', 'premium'];
    if (!client || !validTypes.includes(client.subscription_type)) {
      return Response.json({
        validation_status: 'denied',
        denial_reason: 'abbonamento_non_attivo',
        message: 'Abbonamento del cliente non attivo'
      }, { status: 403 });
    }

    // Verifica scadenza abbonamento
    if (client.subscription_end_date) {
      const endDate = new Date(client.subscription_end_date);
      endDate.setHours(23, 59, 59, 999);
      if (endDate < now) {
        return Response.json({
          validation_status: 'denied',
          denial_reason: 'abbonamento_scaduto',
          message: 'Abbonamento del cliente scaduto'
        }, { status: 403 });
      }
    }

    // Verifica stato abbonamento (es. past_due)
    if (client.subscription_status === 'past_due' || client.subscription_status === 'cancelled') {
      return Response.json({
        validation_status: 'denied',
        denial_reason: 'abbonamento_non_valido',
        message: `Abbonamento non valido (stato: ${client.subscription_status})`
      }, { status: 403 });
    }

    // Verifica che la palestra accetti il piano del cliente
    const gym = await base44.asServiceRole.entities.Gym.get(accessPass.gym_id);
    const availabilityField = `available_for_${client.subscription_type}`;
    if (gym && gym[availabilityField] === false) {
      return Response.json({
        validation_status: 'denied',
        denial_reason: 'piano_non_valido_palestra',
        message: `Questa palestra non accetta il piano ${client.subscription_type}`
      }, { status: 403 });
    }

    // Tutti i controlli passati - accesso consentito
    const validation_method = token ? 'qr' : 'numeric_code';
    const validated_at = now.toISOString();

    // Marca come usato
    await base44.asServiceRole.entities.AccessPass.update(accessPass.id, {
      used: true,
      validated_at,
      validation_method,
      status: 'used'
    });

    // Crea record GymAccess
    const checkInCode = `CHK-${Date.now().toString().slice(-6)}`;
    await base44.asServiceRole.entities.GymAccess.create({
      user_email: accessPass.client_email,
      gym_id,
      gym_name: accessPass.gym_name,
      access_date: validated_at,
      subscription_type: accessPass.subscription_type,
      access_granted: true
    });

    return Response.json({
      validation_status: 'accepted',
      client_name: accessPass.client_name,
      client_photo_url: accessPass.client_photo_url,
      subscription_type: accessPass.subscription_type,
      gym_name: accessPass.gym_name,
      check_in_code: checkInCode,
      validated_at,
      message: 'Accesso consentito'
    });
  } catch (error) {
    console.error('Error in validateAccessPass:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});