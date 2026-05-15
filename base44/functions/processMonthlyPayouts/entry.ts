import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

/**
 * Calcola e registra i report mensili di pagamento per le palestre.
 * Metodo 1: proporzionale alle visite (100% del valore abbonamento)
 * Metodo 2: fondo Comunion - utenti inattivi (90% alle palestre, 10% piattaforma)
 * 
 * NOTA: I trasferimenti Stripe saranno attivati quando Stripe Connect sarà configurato.
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Per automazione schedulata usiamo service role
    const base44Admin = base44.asServiceRole;

    const now = new Date();
    // Calcola per il mese precedente
    const reportDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const periodMonth = reportDate.getMonth() + 1;
    const periodYear = reportDate.getFullYear();
    const periodStart = new Date(periodYear, periodMonth - 1, 1).toISOString();
    const periodEnd = new Date(periodYear, periodMonth, 0, 23, 59, 59).toISOString();

    console.log(`Calcolo payout per ${periodMonth}/${periodYear}`);

    // 1. Prendi tutti i dati necessari
    const [gyms, accesses, users] = await Promise.all([
      base44Admin.entities.Gym.list(),
      base44Admin.entities.GymAccess.list(),
      base44Admin.entities.User.list()
    ]);

    // Filtra accessi nel periodo
    const periodAccesses = accesses.filter(a => {
      const d = new Date(a.access_date || a.created_date);
      return d >= new Date(periodStart) && d <= new Date(periodEnd) && a.access_granted;
    });

    // 2. Conta accessi per palestra nel periodo
    const gymVisitMap = {};
    const userVisitMap = {};
    periodAccesses.forEach(a => {
      gymVisitMap[a.gym_id] = (gymVisitMap[a.gym_id] || 0) + 1;
      userVisitMap[a.user_email] = (userVisitMap[a.user_email] || 0) + 1;
    });

    const totalNetworkVisits = periodAccesses.length;

    // 3. Identifica utenti attivi vs inattivi (con abbonamento)
    const activeUsers = users.filter(u => u.subscription_type && u.subscription_type !== "none" && u.subscription_end_date);
    
    const MONTHLY_PRICE = 2.99;
    const ANNUAL_PRICE = 29.99;
    const ANNUAL_MONTHLY_EQUIVALENT = ANNUAL_PRICE / 12;

    const activeUserEmails = new Set(activeUsers.map(u => u.email));
    const inactiveUsers = activeUsers.filter(u => !userVisitMap[u.email]);
    const visitingUsers = activeUsers.filter(u => userVisitMap[u.email] > 0);

    // Calcola valore mensile per ciascun utente attivo
    const getUserMonthlyValue = (u) => {
      return u.subscription_plan === "annual" ? ANNUAL_MONTHLY_EQUIVALENT : MONTHLY_PRICE;
    };

    // 4. FONDO COMUNION - utenti inattivi
    const comunionTotal = inactiveUsers.reduce((sum, u) => sum + getUserMonthlyValue(u), 0);
    const platformFee = comunionTotal * 0.10;
    const distributableComunion = comunionTotal * 0.90;

    // Salva fondo Comunion
    const existingFund = await base44Admin.entities.ComunionFund.filter({ period_month: periodMonth, period_year: periodYear });
    const fundData = {
      period_month: periodMonth,
      period_year: periodYear,
      total_inactive_users: inactiveUsers.length,
      total_collected: comunionTotal,
      platform_fee: platformFee,
      distributable_amount: distributableComunion,
      total_network_visits: totalNetworkVisits,
      status: "calculated"
    };

    if (existingFund.length > 0) {
      await base44Admin.entities.ComunionFund.update(existingFund[0].id, fundData);
    } else {
      await base44Admin.entities.ComunionFund.create(fundData);
    }

    // 5. METODO 1 - Calcola per ogni palestra il guadagno da visite
    const method1ByGym = {};
    visitingUsers.forEach(u => {
      const userVisits = userVisitMap[u.email] || 0;
      const userValue = getUserMonthlyValue(u);
      const gymsVisited = [...new Set(
        periodAccesses.filter(a => a.user_email === u.email).map(a => a.gym_id)
      )];
      const totalVisitsThisUser = userVisits;
      gymsVisited.forEach(gymId => {
        const visitsInThisGym = periodAccesses.filter(a => a.user_email === u.email && a.gym_id === gymId).length;
        const share = totalVisitsThisUser > 0 ? (visitsInThisGym / totalVisitsThisUser) * userValue : 0;
        method1ByGym[gymId] = (method1ByGym[gymId] || 0) + share;
      });
    });

    // 6. Genera report per ogni palestra
    const reportsCreated = [];
    for (const gym of gyms) {
      const gymVisits = gymVisitMap[gym.id] || 0;
      const method1Amount = method1ByGym[gym.id] || 0;
      const comunionSharePercent = totalNetworkVisits > 0 ? (gymVisits / totalNetworkVisits) * 100 : 0;
      const method2Amount = (distributableComunion * comunionSharePercent) / 100;
      const totalAmount = method1Amount + method2Amount;

      const reportData = {
        gym_id: gym.id,
        gym_name: gym.name,
        period_month: periodMonth,
        period_year: periodYear,
        total_visits: gymVisits,
        method1_amount: Math.round(method1Amount * 100) / 100,
        method2_amount: Math.round(method2Amount * 100) / 100,
        total_amount: Math.round(totalAmount * 100) / 100,
        stripe_account_id: gym.stripe_account_id || null,
        status: "pending",
        active_subscribers: activeUsers.length,
        comunion_share_percent: Math.round(comunionSharePercent * 100) / 100
      };

      // Controlla se esiste già
      const existing = await base44Admin.entities.GymPayoutReport.filter({
        gym_id: gym.id,
        period_month: periodMonth,
        period_year: periodYear
      });

      if (existing.length > 0) {
        await base44Admin.entities.GymPayoutReport.update(existing[0].id, reportData);
      } else {
        await base44Admin.entities.GymPayoutReport.create(reportData);
      }

      reportsCreated.push({ gym: gym.name, total: totalAmount.toFixed(2) });
    }

    // TODO: Quando Stripe Connect è configurato, aggiungere qui i trasferimenti
    // per ogni palestra con stripe_account_id e stripe_onboarding_complete = true

    return Response.json({
      success: true,
      period: `${periodMonth}/${periodYear}`,
      gyms_processed: gyms.length,
      comunion_fund: comunionTotal.toFixed(2),
      reports: reportsCreated
    });

  } catch (error) {
    console.error("Errore nel calcolo payout:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});