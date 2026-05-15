import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import crypto from 'node:crypto';

function generateToken() {
  return crypto.randomBytes(16).toString('hex');
}

function generateNumericCode() {
  return Math.floor(Math.random() * 900000 + 100000).toString();
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { gym_id } = body;

    if (!gym_id) {
      return Response.json({ error: 'gym_id required' }, { status: 400 });
    }

    // Verifica che il cliente abbia un abbonamento attivo
    const userSubscription = await base44.auth.me();
    if (!userSubscription.subscription_type || userSubscription.subscription_type === 'none') {
      return Response.json({
        error: 'Abbonamento non attivo',
        validation_status: 'denied',
        denial_reason: 'abbonamento_non_attivo'
      }, { status: 403 });
    }

    // Verifica che la palestra sia convenzionata
    const gym = await base44.asServiceRole.entities.Gym.get(gym_id);
    if (!gym) {
      return Response.json({
        error: 'Palestra non trovata',
        validation_status: 'denied',
        denial_reason: 'palestra_non_trovata'
      }, { status: 404 });
    }

    // Verifica disponibilità per tipo abbonamento
    const subscription_type = userSubscription.subscription_type;
    const availabilityField = `available_for_${subscription_type}`;
    if (gym[availabilityField] === false) {
      return Response.json({
        error: `Palestra non disponibile per piano ${subscription_type}`,
        validation_status: 'denied',
        denial_reason: 'piano_non_valido_palestra'
      }, { status: 403 });
    }

    // Genera token e codice
    const token = generateToken();
    const numeric_code = generateNumericCode();
    const now = new Date();
    const expires_at = new Date(now.getTime() + 5 * 60000); // 5 minuti

    // Salva AccessPass
    const accessPass = await base44.entities.AccessPass.create({
      token,
      numeric_code,
      client_email: user.email,
      client_name: user.full_name,
      client_photo_url: userSubscription.profile_image_url || '',
      gym_id,
      gym_name: gym.name,
      subscription_type,
      generated_at: now.toISOString(),
      expires_at: expires_at.toISOString(),
      status: 'pending'
    });

    return Response.json({
      id: accessPass.id,
      token,
      numeric_code,
      client_name: user.full_name,
      client_photo_url: userSubscription.profile_image_url || '',
      gym_name: gym.name,
      subscription_type,
      expires_at: expires_at.toISOString(),
      validation_status: 'pending'
    });
  } catch (error) {
    console.error('Error in generateAccessPass:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});