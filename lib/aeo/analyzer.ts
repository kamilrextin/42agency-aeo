import type { ScraperResponse, Citation } from './scraper';

export interface Mention {
  company: string;
  isTarget: boolean;
  position: number;
  sentiment: 'positive' | 'negative' | 'neutral';
  context: string;
}

export interface ParsedCitation {
  url: string;
  domain: string;
  type: 'review_site' | 'social' | 'news' | 'analyst' | 'official' | 'other';
}

export interface ResponseAnalysis {
  engine: string;
  query: string;
  queryType: string;
  mentions: Mention[];
  citations: ParsedCitation[];
  companyMentioned: boolean;
  companyPosition: number | null;
  companySentiment: 'positive' | 'negative' | 'neutral' | 'not_mentioned';
}

export interface VisibilityScore {
  score: number;
  components: {
    mentionRate: number;
    positionScore: number;
    sentimentRate: number;
  };
  totalQueries: number;
  mentionedCount: number;
}

// Sentiment analysis keywords
const POSITIVE_WORDS = [
  'best', 'leading', 'top', 'excellent', 'great', 'recommended',
  'popular', 'trusted', 'powerful', 'comprehensive', 'innovative',
  'reliable', 'outstanding', 'superior', 'premier', 'award-winning',
];

const NEGATIVE_WORDS = [
  'limited', 'expensive', 'complex', 'difficult', 'issues',
  'problems', 'lacks', 'missing', 'concern', 'drawback',
  'outdated', 'slow', 'buggy', 'unreliable', 'disappointing',
];

// Citation classification
const REVIEW_SITES = ['g2.com', 'gartner.com', 'trustradius.com', 'capterra.com', 'softwareadvice.com', 'trustpilot.com'];
const SOCIAL_SITES = ['reddit.com', 'twitter.com', 'x.com', 'linkedin.com', 'facebook.com', 'quora.com'];
const NEWS_SITES = ['techcrunch.com', 'forbes.com', 'bloomberg.com', 'wsj.com', 'venturebeat.com', 'wired.com', 'theverge.com'];
const ANALYST_SITES = ['forrester.com', 'idc.com', 'mckinsey.com', 'deloitte.com', 'accenture.com'];

/**
 * Extract domain from URL
 */
export function extractDomain(url: string): string {
  try {
    const parsed = new URL(url);
    return parsed.hostname.replace('www.', '');
  } catch {
    // If URL parsing fails, try to extract domain manually
    const match = url.match(/(?:https?:\/\/)?(?:www\.)?([^\/]+)/);
    return match ? match[1].replace('www.', '') : url;
  }
}

/**
 * Classify citation source type
 */
export function classifySource(domain: string): ParsedCitation['type'] {
  const domainLower = domain.toLowerCase();

  if (REVIEW_SITES.some(site => domainLower.includes(site))) {
    return 'review_site';
  }
  if (SOCIAL_SITES.some(site => domainLower.includes(site))) {
    return 'social';
  }
  if (NEWS_SITES.some(site => domainLower.includes(site))) {
    return 'news';
  }
  if (ANALYST_SITES.some(site => domainLower.includes(site))) {
    return 'analyst';
  }
  return 'other';
}

/**
 * Simple keyword-based sentiment analysis
 */
export function analyzeSentiment(text: string): 'positive' | 'negative' | 'neutral' {
  const textLower = text.toLowerCase();

  const posCount = POSITIVE_WORDS.filter(word => textLower.includes(word)).length;
  const negCount = NEGATIVE_WORDS.filter(word => textLower.includes(word)).length;

  if (posCount > negCount) return 'positive';
  if (negCount > posCount) return 'negative';
  return 'neutral';
}

/**
 * Analyze a single response for mentions, sentiment, and citations
 */
export function analyzeResponse(
  response: ScraperResponse,
  company: string,
  competitors: string[],
  queryType: string
): ResponseAnalysis {
  const text = response.response || '';
  const textLower = text.toLowerCase();

  const allCompanies = [company, ...competitors];
  const mentions: Mention[] = [];

  // Find all company mentions
  for (const comp of allCompanies) {
    const compLower = comp.toLowerCase();
    const pos = textLower.indexOf(compLower);

    if (pos !== -1) {
      // Count how many companies are mentioned before this one
      let position = 1;
      for (const other of allCompanies) {
        if (other === comp) continue;
        const otherPos = textLower.indexOf(other.toLowerCase());
        if (otherPos !== -1 && otherPos < pos) {
          position++;
        }
      }

      // Extract context (100 chars before and after)
      const start = Math.max(0, pos - 100);
      const end = Math.min(text.length, pos + comp.length + 100);
      const context = text.slice(start, end).trim();

      // Analyze sentiment of context
      const sentiment = analyzeSentiment(context);

      mentions.push({
        company: comp,
        isTarget: comp.toLowerCase() === company.toLowerCase(),
        position,
        sentiment,
        context,
      });
    }
  }

  // Parse citations
  const citations: ParsedCitation[] = (response.citations || []).map((cite: Citation) => {
    const url = cite.url || '';
    const domain = extractDomain(url);
    return {
      url,
      domain,
      type: classifySource(domain),
    };
  });

  // Find company-specific results
  const companyMention = mentions.find(m => m.isTarget);

  return {
    engine: response.engine,
    query: response.prompt,
    queryType,
    mentions,
    citations,
    companyMentioned: !!companyMention,
    companyPosition: companyMention?.position ?? null,
    companySentiment: companyMention?.sentiment ?? 'not_mentioned',
  };
}

/**
 * Calculate visibility score from multiple analyses
 */
export function calculateVisibilityScore(analyses: ResponseAnalysis[]): VisibilityScore {
  if (analyses.length === 0) {
    return {
      score: 0,
      components: { mentionRate: 0, positionScore: 0, sentimentRate: 0 },
      totalQueries: 0,
      mentionedCount: 0,
    };
  }

  const total = analyses.length;
  const mentioned = analyses.filter(a => a.companyMentioned).length;

  // Brand mention rate (0-1)
  const mentionRate = mentioned / total;

  // Average position score (1st = 1.0, 2nd = 0.8, 3rd = 0.6, etc.)
  const positions = analyses
    .filter(a => a.companyPosition !== null)
    .map(a => a.companyPosition as number);

  let avgPositionScore = 0;
  if (positions.length > 0) {
    const positionScores = positions.map(p => Math.max(0, 1 - (p - 1) * 0.2));
    avgPositionScore = positionScores.reduce((a, b) => a + b, 0) / positionScores.length;
  }

  // Positive sentiment rate
  const sentiments = analyses
    .filter(a => a.companyMentioned)
    .map(a => a.companySentiment);

  const positiveCount = sentiments.filter(s => s === 'positive').length;
  const sentimentRate = sentiments.length > 0 ? positiveCount / sentiments.length : 0;

  // Calculate weighted score (0-100)
  // 40% mention rate, 30% position, 30% sentiment
  const score = Math.round(
    (mentionRate * 40) +
    (avgPositionScore * 30) +
    (sentimentRate * 30)
  );

  return {
    score,
    components: {
      mentionRate: Math.round(mentionRate * 100),
      positionScore: Math.round(avgPositionScore * 100),
      sentimentRate: Math.round(sentimentRate * 100),
    },
    totalQueries: total,
    mentionedCount: mentioned,
  };
}

/**
 * Calculate per-engine scores
 */
export function calculateEngineScores(
  analyses: ResponseAnalysis[],
  engines: string[]
): Record<string, VisibilityScore> {
  const engineScores: Record<string, VisibilityScore> = {};

  for (const engine of engines) {
    const engineAnalyses = analyses.filter(a => a.engine === engine);
    engineScores[engine] = calculateVisibilityScore(engineAnalyses);
  }

  return engineScores;
}

/**
 * Calculate competitor scores
 */
export function calculateCompetitorScores(
  responses: ScraperResponse[],
  company: string,
  competitors: string[]
): Record<string, VisibilityScore> {
  const competitorScores: Record<string, VisibilityScore> = {};

  for (const comp of competitors) {
    const compAnalyses: ResponseAnalysis[] = [];

    for (const response of responses) {
      if (!response.response) continue;

      // Re-analyze with competitor as target
      const allOthers = [company, ...competitors.filter(c => c !== comp)];
      const analysis = analyzeResponse(response, comp, allOthers, 'category');
      compAnalyses.push(analysis);
    }

    competitorScores[comp] = calculateVisibilityScore(compAnalyses);
  }

  return competitorScores;
}

/**
 * Aggregate citation domains across all analyses
 */
export function aggregateCitations(analyses: ResponseAnalysis[]): [string, number][] {
  const citationCounts: Record<string, number> = {};

  for (const analysis of analyses) {
    for (const citation of analysis.citations) {
      const domain = citation.domain;
      citationCounts[domain] = (citationCounts[domain] || 0) + 1;
    }
  }

  // Sort by count and return top 10
  return Object.entries(citationCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);
}

/**
 * Generate recommendations based on analysis
 */
export function generateRecommendations(
  visibilityScore: VisibilityScore,
  engineScores: Record<string, VisibilityScore>,
  competitorScores: Record<string, VisibilityScore>,
  topCitations: [string, number][]
): string[] {
  const recommendations: string[] = [];

  // Low mention rate
  if (visibilityScore.components.mentionRate < 50) {
    recommendations.push(
      'Create more category-focused content that AI engines can reference when answering "best X software" queries.'
    );
  }

  // Low position score
  if (visibilityScore.components.positionScore < 50) {
    recommendations.push(
      'Focus on appearing earlier in AI recommendations by strengthening your presence on frequently-cited sources.'
    );
  }

  // Low sentiment
  if (visibilityScore.components.sentimentRate < 50) {
    recommendations.push(
      'Improve sentiment by encouraging positive reviews on G2, Gartner, and other platforms that AI engines cite.'
    );
  }

  // Engine-specific recommendations
  for (const [engine, score] of Object.entries(engineScores)) {
    if (score.mentionedCount === 0) {
      recommendations.push(
        `You have zero mentions on ${engine}. Create content optimized for this platform's training data.`
      );
    }
  }

  // Competitor gap
  const competitorWithHighestScore = Object.entries(competitorScores)
    .sort((a, b) => b[1].score - a[1].score)[0];

  if (competitorWithHighestScore && competitorWithHighestScore[1].score > visibilityScore.score + 20) {
    recommendations.push(
      `${competitorWithHighestScore[0]} has significantly higher AI visibility. Analyze their content strategy and citation sources.`
    );
  }

  // Citation recommendations
  if (topCitations.length > 0) {
    const topSource = topCitations[0][0];
    recommendations.push(
      `Prioritize visibility on ${topSource} - it's the most frequently cited source in AI responses for your category.`
    );
  }

  // Build comparison pages
  if (Object.keys(competitorScores).length > 0) {
    const topCompetitor = Object.keys(competitorScores)[0];
    recommendations.push(
      `Create comparison pages like "Your Company vs ${topCompetitor}" to capture competitive search intent and feed AI training data.`
    );
  }

  return recommendations.slice(0, 5); // Return top 5 recommendations
}
