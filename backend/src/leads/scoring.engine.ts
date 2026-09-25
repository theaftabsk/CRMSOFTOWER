export interface ScoringInput {
  job_title?: string | null;
  budget?: number | null;
  budget_verified?: boolean;
  authority_level?: string | null;
  authority_verified?: boolean;
  industry?: string | null;
  website?: string | null;
  city?: string | null;
  activities?: {
    type: string;
    status?: string | null;
    direction?: string | null;
    created_at: Date | string;
    metadata?: any;
  }[];
  created_date?: Date | string;
}

export interface ScoringResult {
  fit_score: number;
  engagement_score: number;
  lead_score: number;
  score_tier: 'HOT' | 'WARM' | 'COLD';
  ai_summary: string;
  next_best_action: string;
  next_action_priority: 'HIGH' | 'MEDIUM' | 'LOW';
}

export class ScoringEngine {
  /**
   * Evaluates enterprise fit and event-based engagement
   */
  static calculateScore(input: ScoringInput): ScoringResult {
    // 1. FIT SCORE CALCULATION (Firmographics, BANT & Authority)
    let fitScore = 0;
    const title = (input.job_title || '').toLowerCase();

    if (title.includes('ceo') || title.includes('founder') || title.includes('managing director') || title.includes('president') || title.includes('owner')) {
      fitScore += 25;
    } else if (title.includes('vp') || title.includes('director') || title.includes('head') || title.includes('cto') || title.includes('cfo')) {
      fitScore += 20;
    } else if (title.includes('manager') || title.includes('lead')) {
      fitScore += 12;
    } else if (title.length > 0) {
      fitScore += 5;
    }

    if (input.authority_level === 'DECISION_MAKER') {
      fitScore += 20;
    } else if (input.authority_level === 'INFLUENCER') {
      fitScore += 12;
    } else if (input.authority_level === 'EVALUATOR') {
      fitScore += 8;
    }

    const budget = Number(input.budget) || 0;
    if (budget >= 100000) {
      fitScore += input.budget_verified ? 25 : 18;
    } else if (budget >= 50000) {
      fitScore += input.budget_verified ? 18 : 12;
    } else if (budget > 0) {
      fitScore += 10;
    }

    const industry = (input.industry || '').toLowerCase();
    const highValueIndustries = ['it', 'software', 'healthcare', 'finance', 'fintech', 'manufacturing', 'saas', 'enterprise'];
    if (highValueIndustries.some(ind => industry.includes(ind))) {
      fitScore += 15;
    } else if (industry.length > 0) {
      fitScore += 8;
    }

    if (input.website && input.city) {
      fitScore += 15;
    } else if (input.website || input.city) {
      fitScore += 8;
    }

    fitScore = Math.min(100, Math.max(0, fitScore));

    // 2. ENGAGEMENT SCORE CALCULATION (Granular Event-Based Interactions)
    let engagementScore = 0;
    const activities = input.activities || [];

    let hasMeeting = false;
    let hasConnectedCall = false;
    let hasWhatsAppReply = false;
    let hasEmailReply = false;
    let lastActivityDate: Date | null = null;

    activities.forEach(act => {
      const actDate = new Date(act.created_at);
      if (!lastActivityDate || actDate > lastActivityDate) {
        lastActivityDate = actDate;
      }

      if (act.type === 'MEETING') {
        engagementScore += 25;
        hasMeeting = true;
      } else if (act.type === 'CALL') {
        if (act.status === 'CONNECTED' || (act.metadata && act.metadata.duration_seconds > 60)) {
          engagementScore += 20;
          hasConnectedCall = true;
        } else {
          engagementScore += 5; // Call attempted
        }
      } else if (act.type === 'WHATSAPP') {
        if (act.status === 'REPLIED' || act.direction === 'INBOUND') {
          engagementScore += 15;
          hasWhatsAppReply = true;
        } else if (act.status === 'READ') {
          engagementScore += 7;
        } else if (act.status === 'DELIVERED') {
          engagementScore += 5;
        } else {
          engagementScore += 3; // Sent
        }
      } else if (act.type === 'EMAIL') {
        if (act.status === 'REPLIED' || act.direction === 'INBOUND') {
          engagementScore += 15;
          hasEmailReply = true;
        } else if (act.status === 'CLICKED') {
          engagementScore += 7;
        } else if (act.status === 'OPENED') {
          engagementScore += 3;
        } else {
          engagementScore += 2; // Sent
        }
      } else if (act.type === 'STAGE_CHANGE') {
        engagementScore += 5;
      }
    });

    // Inactivity penalty: -10 if no touchpoint for > 14 days
    const now = Date.now();
    const daysSinceLastTouch = lastActivityDate 
      ? Math.floor((now - lastActivityDate.getTime()) / (1000 * 60 * 60 * 24))
      : 0;

    if (daysSinceLastTouch >= 14) {
      engagementScore -= 10;
    }

    engagementScore = Math.min(100, Math.max(0, engagementScore));

    // 3. COMPOSITE SCORE & TIER
    const leadScore = Math.round(fitScore * 0.5 + engagementScore * 0.5);
    const scoreTier: 'HOT' | 'WARM' | 'COLD' = 
      leadScore >= 75 ? 'HOT' : leadScore >= 40 ? 'WARM' : 'COLD';

    // 4. RULE-BACKED AI INSIGHT & NEXT BEST ACTION
    const insights: string[] = [];
    if (fitScore >= 70) insights.push('Strong firmographic and ICP fit');
    if (input.authority_level === 'DECISION_MAKER') insights.push('Decision Maker contact identified');
    if (budget >= 100000) insights.push(`High commercial deal potential (₹${budget.toLocaleString('en-IN')})`);
    if (hasMeeting) insights.push('Product consultation / demo attended');
    if (hasWhatsAppReply || hasEmailReply) insights.push('Demonstrated two-way inbound response');

    const aiSummary = insights.length > 0 
      ? `Lead exhibits strong buying signals: ${insights.join(', ')}. Probability of closing is elevated.`
      : 'Early stage lead. Needs progressive discovery calls and firmographic qualification.';

    let nextAction = 'Reach out via WhatsApp or phone for initial discovery.';
    let priority: 'HIGH' | 'MEDIUM' | 'LOW' = 'MEDIUM';

    if (scoreTier === 'HOT') {
      priority = 'HIGH';
      if (!hasMeeting) {
        nextAction = 'Schedule high-priority Google Meet commercial demo within 24 hours.';
      } else {
        nextAction = 'Send commercial pricing proposal and initiate Deal conversion.';
      }
    } else if (daysSinceLastTouch >= 7) {
      priority = 'HIGH';
      nextAction = 'Send WhatsApp follow-up re-engagement touchpoint; lead is at risk of going stale.';
    } else if (scoreTier === 'WARM') {
      nextAction = 'Conduct discovery call to verify budget authority and project timeline.';
    }

    return {
      fit_score: fitScore,
      engagement_score: engagementScore,
      lead_score: leadScore,
      score_tier: scoreTier,
      ai_summary: aiSummary,
      next_best_action: nextAction,
      next_action_priority: priority,
    };
  }
}
