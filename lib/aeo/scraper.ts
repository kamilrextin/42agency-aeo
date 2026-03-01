import {
  BRIGHTDATA_API_KEY,
  BRIGHTDATA_API_BASE,
  DATASET_IDS,
  ENGINES,
} from './config';

export interface ScraperResponse {
  engine: string;
  prompt: string;
  response: string | null;
  citations: Citation[];
  hyperlinks: Hyperlink[];
  products: Product[];
  webSearchTriggered: boolean;
  snapshotId: string | null;
  rawData: Record<string, unknown> | null;
  scrapedAt: string;
  error: string | null;
}

export interface Citation {
  url: string;
  title?: string;
  domain?: string;
}

export interface Hyperlink {
  url: string;
  text?: string;
}

export interface Product {
  name?: string;
  url?: string;
  [key: string]: unknown;
}

export interface ScrapeProgress {
  status: 'pending' | 'running' | 'ready' | 'failed';
  progress?: number;
  message?: string;
}

/**
 * Trigger a scrape for a single AI engine query
 */
export async function triggerScrape(
  engine: string,
  prompt: string,
  country: string = 'us'
): Promise<{ snapshotId: string | null; error: string | null }> {
  if (!BRIGHTDATA_API_KEY) {
    return { snapshotId: null, error: 'BRIGHTDATA_API_KEY not set' };
  }

  const engineConfig = ENGINES[engine];
  if (!engineConfig) {
    return { snapshotId: null, error: `Unknown engine: ${engine}` };
  }

  const datasetId = DATASET_IDS[engine];
  if (!datasetId) {
    return {
      snapshotId: null,
      error: `No dataset_id configured for ${engine}. Set BD_${engine.toUpperCase()}_DATASET env var.`,
    };
  }

  try {
    const triggerUrl = `${BRIGHTDATA_API_BASE}/trigger?dataset_id=${datasetId}&format=json`;
    const triggerBody = [
      {
        url: `https://${engineConfig.domain}/`,
        prompt,
        country,
        web_search: true,
      },
    ];

    const response = await fetch(triggerUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${BRIGHTDATA_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(triggerBody),
    });

    if (!response.ok) {
      const text = await response.text();
      return {
        snapshotId: null,
        error: `Trigger failed: ${response.status} - ${text}`,
      };
    }

    const data = await response.json();
    const snapshotId = data.snapshot_id;

    if (!snapshotId) {
      return {
        snapshotId: null,
        error: `No snapshot_id in response: ${JSON.stringify(data)}`,
      };
    }

    return { snapshotId, error: null };
  } catch (error) {
    return {
      snapshotId: null,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Poll progress of a scrape
 */
export async function pollProgress(snapshotId: string): Promise<ScrapeProgress> {
  try {
    const progressUrl = `${BRIGHTDATA_API_BASE}/progress/${snapshotId}`;
    const response = await fetch(progressUrl, {
      headers: {
        Authorization: `Bearer ${BRIGHTDATA_API_KEY}`,
      },
    });

    if (!response.ok) {
      return { status: 'failed', message: `Progress check failed: ${response.status}` };
    }

    const data = await response.json();
    return {
      status: data.status || 'running',
      progress: data.progress,
      message: data.message,
    };
  } catch (error) {
    return {
      status: 'failed',
      message: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Get snapshot results
 */
export async function getSnapshot(snapshotId: string): Promise<{
  data: Record<string, unknown> | null;
  error: string | null;
}> {
  try {
    const snapshotUrl = `${BRIGHTDATA_API_BASE}/snapshot/${snapshotId}?format=json`;
    const response = await fetch(snapshotUrl, {
      headers: {
        Authorization: `Bearer ${BRIGHTDATA_API_KEY}`,
      },
    });

    if (!response.ok) {
      const text = await response.text();
      return {
        data: null,
        error: `Snapshot failed: ${response.status} - ${text}`,
      };
    }

    const results = await response.json();

    // Parse the first result (we only sent one query)
    const data = Array.isArray(results) && results.length > 0 ? results[0] : results;

    return { data, error: null };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Parse raw Bright Data response into our format
 */
export function parseScraperResponse(
  engine: string,
  prompt: string,
  snapshotId: string | null,
  rawData: Record<string, unknown> | null,
  error: string | null
): ScraperResponse {
  if (error || !rawData) {
    return {
      engine,
      prompt,
      response: null,
      citations: [],
      hyperlinks: [],
      products: [],
      webSearchTriggered: false,
      snapshotId,
      rawData,
      scrapedAt: new Date().toISOString(),
      error: error || 'No data received',
    };
  }

  // Bright Data returns response in various fields
  const responseText = (
    rawData.answer_text_markdown ||
    rawData.answer_text ||
    rawData.response ||
    rawData.content ||
    rawData.answer ||
    ''
  ) as string;

  // Citations come as a list of dicts with url, title, domain
  const rawCitations = (rawData.citations || rawData.sources || []) as Array<Citation | string>;
  const citations: Citation[] = rawCitations.map((cite) => {
    if (typeof cite === 'string') {
      return { url: cite };
    }
    return cite;
  });

  // Hyperlinks
  const rawHyperlinks = (rawData.links_attached || rawData.hyperlinks || []) as Array<Hyperlink | string>;
  const hyperlinks: Hyperlink[] = rawHyperlinks.map((link) => {
    if (typeof link === 'string') {
      return { url: link };
    }
    return link;
  });

  // Products
  const products = (rawData.recommendations || rawData.products || []) as Product[];

  return {
    engine,
    prompt,
    response: responseText,
    citations,
    hyperlinks,
    products,
    webSearchTriggered: Boolean(rawData.web_search_triggered),
    snapshotId,
    rawData,
    scrapedAt: new Date().toISOString(),
    error: null,
  };
}

/**
 * Query a single AI engine - full flow with polling
 */
export async function queryAIEngine(
  engine: string,
  prompt: string,
  country: string = 'us',
  maxAttempts: number = 60,
  pollIntervalMs: number = 5000
): Promise<ScraperResponse> {
  // Step 1: Trigger the scrape
  const { snapshotId, error: triggerError } = await triggerScrape(engine, prompt, country);

  if (triggerError || !snapshotId) {
    return parseScraperResponse(engine, prompt, null, null, triggerError);
  }

  // Step 2: Poll for completion
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    await new Promise((resolve) => setTimeout(resolve, pollIntervalMs));

    const progress = await pollProgress(snapshotId);

    if (progress.status === 'ready') {
      break;
    }

    if (progress.status === 'failed') {
      return parseScraperResponse(
        engine,
        prompt,
        snapshotId,
        null,
        progress.message || 'Scrape failed'
      );
    }
  }

  // Step 3: Get results
  const { data, error: snapshotError } = await getSnapshot(snapshotId);

  return parseScraperResponse(engine, prompt, snapshotId, data, snapshotError);
}

/**
 * Trigger multiple scrapes and return snapshot IDs for parallel polling
 */
export async function triggerMultipleScrapes(
  queries: Array<{ engine: string; query: string; queryType: string; queryLength: string }>,
  country: string = 'us'
): Promise<Array<{
  engine: string;
  query: string;
  queryType: string;
  queryLength: string;
  snapshotId: string | null;
  error: string | null;
}>> {
  const results = await Promise.all(
    queries.map(async ({ engine, query, queryType, queryLength }) => {
      const { snapshotId, error } = await triggerScrape(engine, query, country);
      return { engine, query, queryType, queryLength, snapshotId, error };
    })
  );

  return results;
}
