import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Limits: post=10/day, comment=30/hour, friend_request=60/day
const LIMITS = {
  post: { max: 10, windowHours: 24 },
  comment: { max: 30, windowHours: 1 },
  friend_request: { max: 60, windowHours: 24 },
};

Deno.serve(async (req) => {
  try {
    // Read body FIRST before any other async call that might consume the stream
    const body = await req.json();
    const { action } = body;

    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    if (!LIMITS[action]) return Response.json({ error: 'Invalid action' }, { status: 400 });

    const limit = LIMITS[action];
    const windowStart = new Date(Date.now() - limit.windowHours * 3600 * 1000).toISOString();

    // Use service role to reliably read/write rate limit records
    const records = await base44.asServiceRole.entities.RateLimit.filter({
      user_email: user.email,
      action,
    });

    const current = records.find(r => r.window_start >= windowStart);

    if (current) {
      if (current.count >= limit.max) {
        return Response.json({
          allowed: false,
          count: current.count,
          limit: limit.max,
          message: `Limite raggiunto: max ${limit.max} ${action} ogni ${limit.windowHours}h`
        });
      }
      await base44.asServiceRole.entities.RateLimit.update(current.id, { count: current.count + 1 });
      return Response.json({ allowed: true, count: current.count + 1, limit: limit.max });
    } else {
      await base44.asServiceRole.entities.RateLimit.create({
        user_email: user.email,
        action,
        window_start: new Date().toISOString(),
        count: 1,
      });
      return Response.json({ allowed: true, count: 1, limit: limit.max });
    }
  } catch (error) {
    console.error('checkRateLimit error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});