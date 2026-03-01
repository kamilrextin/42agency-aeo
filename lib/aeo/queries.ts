// Query templates for AEO analysis
// Mix of short-tail (broad) and long-tail (specific) queries

export type QueryType =
  | 'category_head'      // Broad category queries
  | 'category_longtail'  // Specific category queries with context
  | 'brand'              // Brand awareness queries
  | 'comparison'         // Direct comparisons
  | 'problem'            // Problem-driven queries
  | 'use_case'           // Specific use case queries
  | 'evaluation'         // Buyer evaluation queries
  | 'switching';         // Looking to switch/replace

export type QueryLength = 'short' | 'medium' | 'long';

export interface QueryTemplate {
  type: QueryType;
  length: QueryLength;
  template: string;
}

// Templates organized by type and length
export const QUERY_TEMPLATES: QueryTemplate[] = [
  // === CATEGORY HEAD (Short-tail, high volume) ===
  { type: 'category_head', length: 'short', template: 'Best {category} software' },
  { type: 'category_head', length: 'short', template: 'Top {category} tools' },
  { type: 'category_head', length: 'short', template: '{category} platforms' },

  // === CATEGORY LONG-TAIL (Specific, lower volume but higher intent) ===
  { type: 'category_longtail', length: 'medium', template: 'Best {category} software for startups' },
  { type: 'category_longtail', length: 'medium', template: 'Best {category} tools for enterprise' },
  { type: 'category_longtail', length: 'medium', template: '{category} software for small business' },
  { type: 'category_longtail', length: 'long', template: 'What {category} tool should I use for a mid-size company?' },
  { type: 'category_longtail', length: 'long', template: 'Best {category} platform for companies with 100-500 employees' },
  { type: 'category_longtail', length: 'long', template: 'Affordable {category} software for early stage startups' },

  // === BRAND (Awareness + consideration) ===
  { type: 'brand', length: 'short', template: 'What is {company}?' },
  { type: 'brand', length: 'short', template: '{company} reviews' },
  { type: 'brand', length: 'medium', template: 'Is {company} good for {category}?' },
  { type: 'brand', length: 'medium', template: '{company} pricing and features' },
  { type: 'brand', length: 'long', template: 'What do customers say about {company} for {category}?' },
  { type: 'brand', length: 'long', template: 'Is {company} worth it for a growing company?' },

  // === COMPARISON (Direct head-to-head) ===
  { type: 'comparison', length: 'short', template: '{company} vs {competitor}' },
  { type: 'comparison', length: 'medium', template: '{company} vs {competitor} comparison' },
  { type: 'comparison', length: 'medium', template: 'Which is better {company} or {competitor}?' },
  { type: 'comparison', length: 'long', template: 'Should I choose {company} or {competitor} for my business?' },
  { type: 'comparison', length: 'long', template: 'Detailed comparison between {company} and {competitor} for {category}' },

  // === PROBLEM-DRIVEN (Natural language, conversational) ===
  { type: 'problem', length: 'medium', template: 'How do I solve {category} challenges?' },
  { type: 'problem', length: 'medium', template: 'How to automate {category}' },
  { type: 'problem', length: 'long', template: 'We are struggling with {category}, what tools can help?' },
  { type: 'problem', length: 'long', template: 'My team needs help with {category}, what should we use?' },
  { type: 'problem', length: 'long', template: 'What is the best way to handle {category} for a B2B company?' },

  // === USE CASE (Specific scenarios) ===
  { type: 'use_case', length: 'medium', template: '{category} for SaaS companies' },
  { type: 'use_case', length: 'medium', template: '{category} for remote teams' },
  { type: 'use_case', length: 'long', template: 'Best {category} solution for a fast-growing tech company' },
  { type: 'use_case', length: 'long', template: 'What {category} tool works best for distributed teams?' },

  // === EVALUATION (Buyer research phase) ===
  { type: 'evaluation', length: 'medium', template: 'How to choose {category} software' },
  { type: 'evaluation', length: 'medium', template: 'What to look for in {category} tools' },
  { type: 'evaluation', length: 'long', template: 'Key features to consider when evaluating {category} platforms' },
  { type: 'evaluation', length: 'long', template: 'Questions to ask when buying {category} software' },

  // === SWITCHING (Replacement intent) ===
  { type: 'switching', length: 'medium', template: '{competitor} alternatives' },
  { type: 'switching', length: 'medium', template: 'Tools like {competitor}' },
  { type: 'switching', length: 'long', template: 'Looking for a better alternative to {competitor}' },
  { type: 'switching', length: 'long', template: 'Companies that switched from {competitor}, what did they use instead?' },
];

export interface GeneratedQuery {
  type: QueryType;
  length: QueryLength;
  query: string;
}

export function generateQueries(
  company: string,
  competitors: string[],
  category: string
): GeneratedQuery[] {
  const queries: GeneratedQuery[] = [];

  for (const template of QUERY_TEMPLATES) {
    // Skip comparison and switching templates if no competitors
    if ((template.type === 'comparison' || template.type === 'switching') &&
        template.template.includes('{competitor}')) {
      // Generate for each competitor
      for (const competitor of competitors) {
        queries.push({
          type: template.type,
          length: template.length,
          query: template.template
            .replace(/{company}/g, company)
            .replace(/{competitor}/g, competitor)
            .replace(/{category}/g, category),
        });
      }
    } else {
      // Non-competitor template
      queries.push({
        type: template.type,
        length: template.length,
        query: template.template
          .replace(/{company}/g, company)
          .replace(/{category}/g, category),
      });
    }
  }

  return queries;
}

// Get query stats for reporting
export function getQueryStats(queries: GeneratedQuery[]): {
  byType: Record<QueryType, number>;
  byLength: Record<QueryLength, number>;
  total: number;
} {
  const byType: Record<string, number> = {};
  const byLength: Record<string, number> = {};

  for (const q of queries) {
    byType[q.type] = (byType[q.type] || 0) + 1;
    byLength[q.length] = (byLength[q.length] || 0) + 1;
  }

  return {
    byType: byType as Record<QueryType, number>,
    byLength: byLength as Record<QueryLength, number>,
    total: queries.length,
  };
}
