// Public engine configuration - safe for client-side use
// This file contains NO secrets

export const ENGINES: Record<string, {
  domain: string;
  name: string;
  features: string[];
  blockedRegions?: string[];
}> = {
  chatgpt: {
    domain: 'chatgpt.com',
    name: 'ChatGPT',
    features: ['hyperlinks', 'citations', 'products', 'maps'],
  },
  perplexity: {
    domain: 'perplexity.ai',
    name: 'Perplexity',
    features: ['citations'],
  },
  gemini: {
    domain: 'gemini.google.com',
    name: 'Gemini',
    features: ['citations'],
    blockedRegions: ['EU'],
  },
  grok: {
    domain: 'grok.com',
    name: 'Grok',
    features: ['citations'],
  },
  copilot: {
    domain: 'copilot.microsoft.com',
    name: 'Copilot',
    features: ['citations'],
  },
  google_ai: {
    domain: 'google.com',
    name: 'Google AI Mode',
    features: [],
  },
};
