// Server-only configuration - contains secrets
// DO NOT import this file in client components ('use client')

// Re-export ENGINES for backwards compatibility in server code
export { ENGINES } from './engines';

// Bright Data API Configuration
// API key must be set via environment variable - never hardcode secrets
export const BRIGHTDATA_API_KEY = process.env.BRIGHTDATA_API_KEY || '';
export const BRIGHTDATA_API_BASE = 'https://api.brightdata.com/datasets/v3';

// Dataset IDs for each AI engine - set via environment variables
export const DATASET_IDS: Record<string, string> = {
  chatgpt: process.env.BD_CHATGPT_DATASET || '',
  perplexity: process.env.BD_PERPLEXITY_DATASET || '',
  gemini: process.env.BD_GEMINI_DATASET || '',
  grok: process.env.BD_GROK_DATASET || '',
  copilot: process.env.BD_COPILOT_DATASET || '',
  google_ai: process.env.BD_GOOGLE_AI_DATASET || '',
};
