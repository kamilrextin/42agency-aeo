import {
  pgTable,
  text,
  timestamp,
  jsonb,
  integer,
  boolean,
  real,
  uuid,
  pgEnum,
} from 'drizzle-orm/pg-core';

// Enums
export const reportStatusEnum = pgEnum('report_status', [
  'pending',
  'running',
  'completed',
  'failed',
]);

export const sentimentEnum = pgEnum('sentiment', [
  'positive',
  'negative',
  'neutral',
  'not_mentioned',
]);

// Main report entity
export const aeoReports = pgTable('aeo_reports', {
  id: uuid('id').primaryKey().defaultRandom(),

  // Input fields
  company: text('company').notNull(),
  competitors: jsonb('competitors').$type<string[]>().notNull().default([]),
  category: text('category').notNull(),
  engines: jsonb('engines').$type<string[]>().notNull().default(['chatgpt', 'perplexity', 'gemini']),

  // Status
  status: reportStatusEnum('status').notNull().default('pending'),
  progress: integer('progress').notNull().default(0),
  currentStep: text('current_step'),
  error: text('error'),

  // Visibility scores (calculated after completion)
  visibilityScore: real('visibility_score'),
  mentionRate: real('mention_rate'),
  positionScore: real('position_score'),
  sentimentRate: real('sentiment_rate'),

  // Aggregated data - stored as generic JSON to allow flexibility
  engineScores: jsonb('engine_scores'),
  competitorScores: jsonb('competitor_scores'),
  topCitations: jsonb('top_citations'),

  // Lead capture
  email: text('email'),
  unlocked: boolean('unlocked').notNull().default(false),

  // Timestamps
  createdAt: timestamp('created_at').notNull().defaultNow(),
  completedAt: timestamp('completed_at'),
});

// Raw scraper responses
export const aeoResponses = pgTable('aeo_responses', {
  id: uuid('id').primaryKey().defaultRandom(),
  reportId: uuid('report_id').notNull().references(() => aeoReports.id, { onDelete: 'cascade' }),

  // Query details
  engine: text('engine').notNull(),
  query: text('query').notNull(),
  queryType: text('query_type').notNull(), // 'category_head', 'category_longtail', 'brand', 'comparison', 'problem', 'use_case', 'evaluation', 'switching'
  queryLength: text('query_length').notNull().default('medium'), // 'short', 'medium', 'long'

  // Response data
  responseText: text('response_text'),
  citations: jsonb('citations').$type<{
    url: string;
    title?: string;
    domain?: string;
  }[]>(),
  hyperlinks: jsonb('hyperlinks').$type<{
    url: string;
    text?: string;
  }[]>(),

  // Bright Data metadata
  snapshotId: text('snapshot_id'),
  rawResponse: jsonb('raw_response'),
  error: text('error'),

  // Timestamps
  scrapedAt: timestamp('scraped_at').notNull().defaultNow(),
});

// Processed analysis per response
export const aeoAnalyses = pgTable('aeo_analyses', {
  id: uuid('id').primaryKey().defaultRandom(),
  responseId: uuid('response_id').notNull().references(() => aeoResponses.id, { onDelete: 'cascade' }),
  reportId: uuid('report_id').notNull().references(() => aeoReports.id, { onDelete: 'cascade' }),

  // Company mention analysis
  companyMentioned: boolean('company_mentioned').notNull().default(false),
  companyPosition: integer('company_position'), // 1st, 2nd, 3rd, etc.
  companySentiment: sentimentEnum('company_sentiment').notNull().default('not_mentioned'),

  // All mentions in this response
  mentions: jsonb('mentions').$type<{
    company: string;
    isTarget: boolean;
    position: number;
    sentiment: string;
    context: string;
  }[]>(),

  // Parsed citations
  parsedCitations: jsonb('parsed_citations').$type<{
    url: string;
    domain: string;
    type: string; // 'review_site', 'social', 'news', 'other'
  }[]>(),

  // Timestamps
  analyzedAt: timestamp('analyzed_at').notNull().defaultNow(),
});

// Type exports for TypeScript
export type AeoReport = typeof aeoReports.$inferSelect;
export type NewAeoReport = typeof aeoReports.$inferInsert;
export type AeoResponse = typeof aeoResponses.$inferSelect;
export type NewAeoResponse = typeof aeoResponses.$inferInsert;
export type AeoAnalysis = typeof aeoAnalyses.$inferSelect;
export type NewAeoAnalysis = typeof aeoAnalyses.$inferInsert;
