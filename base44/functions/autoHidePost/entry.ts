import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const AUTO_HIDE_THRESHOLD = 5; // N unique reports in 24h

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const payload = await req.json();

    // This is called by entity automation on UserReport create
    const { data } = payload;
    if (!data?.reported_post_id) {
      return Response.json({ skipped: true, reason: 'no post id' });
    }

    const postId = data.reported_post_id;
    const since24h = new Date(Date.now() - 24 * 3600 * 1000).toISOString();

    // Count unique reports on this post in last 24h
    const reports = await base44.asServiceRole.entities.UserReport.filter({
      reported_post_id: postId,
      target_type: 'post',
    });

    const recentUniqueReporters = new Set(
      reports
        .filter(r => r.created_date >= since24h)
        .map(r => r.reporter_email)
    );

    console.log(`Post ${postId}: ${recentUniqueReporters.size} unique reports in 24h`);

    if (recentUniqueReporters.size >= AUTO_HIDE_THRESHOLD) {
      await base44.asServiceRole.entities.CommunityPost.update(postId, {
        safety_score: -1, // negative = auto-hidden
      });
      console.log(`Post ${postId} auto-hidden (${recentUniqueReporters.size} reports)`);
      return Response.json({ hidden: true, postId, reportCount: recentUniqueReporters.size });
    }

    return Response.json({ hidden: false, postId, reportCount: recentUniqueReporters.size });
  } catch (error) {
    console.error('autoHidePost error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});