import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { targetUserEmail } = body;

    if (!targetUserEmail) {
      return Response.json({ error: 'targetUserEmail required' }, { status: 400 });
    }

    // Verifica se già segue
    const existingFollow = await base44.entities.UserFollow.filter({
      follower_email: user.email,
      following_email: targetUserEmail
    });

    if (existingFollow.length > 0) {
      return Response.json({ error: 'Already following' }, { status: 400 });
    }

    // Crea follow
    await base44.entities.UserFollow.create({
      follower_email: user.email,
      following_email: targetUserEmail,
      created_date: new Date().toISOString()
    });

    // Aggiorna contatori
    const targetUser = await base44.entities.User.get(targetUserEmail);
    await base44.entities.User.update(targetUserEmail, {
      followers_count: (targetUser?.followers_count || 0) + 1
    });

    const followingCount = await base44.entities.UserFollow.filter({ follower_email: user.email });
    await base44.auth.updateMe({ following_count: followingCount.length });

    return Response.json({ success: true });
  } catch (error) {
    console.error('Error creating follow:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});