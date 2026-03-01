import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db, aeoReports, aeoResponses } from '@/lib/db';
import { generateQueries } from '@/lib/aeo/queries';
import { triggerMultipleScrapes } from '@/lib/aeo/scraper';

export const runtime = 'edge';
export const maxDuration = 30;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { company, competitors = [], category, engines = ['chatgpt', 'perplexity', 'gemini'] } = body;

    // Validation
    if (!company || typeof company !== 'string' || company.trim().length === 0) {
      return NextResponse.json({ error: 'Company name is required' }, { status: 400 });
    }

    if (!category || typeof category !== 'string' || category.trim().length === 0) {
      return NextResponse.json({ error: 'Category is required' }, { status: 400 });
    }

    if (!Array.isArray(engines) || engines.length === 0) {
      return NextResponse.json({ error: 'At least one engine must be selected' }, { status: 400 });
    }

    // Create report record
    const [report] = await db.insert(aeoReports).values({
      company: company.trim(),
      competitors: competitors.map((c: string) => c.trim()).filter(Boolean),
      category: category.trim(),
      engines,
      status: 'pending',
      progress: 0,
    }).returning();

    // Generate all queries
    const queries = generateQueries(
      company.trim(),
      competitors.map((c: string) => c.trim()).filter(Boolean),
      category.trim()
    );

    // Prepare scrape requests for all engine/query combinations
    const scrapeRequests: Array<{ engine: string; query: string; queryType: string; queryLength: string }> = [];

    for (const q of queries) {
      for (const engine of engines) {
        scrapeRequests.push({
          engine,
          query: q.query,
          queryType: q.type,
          queryLength: q.length,
        });
      }
    }

    // Trigger all scrapes in parallel (non-blocking - we'll poll for results)
    const scrapeResults = await triggerMultipleScrapes(scrapeRequests);

    // Store response records with snapshot IDs for polling
    const responseInserts = scrapeResults.map(result => ({
      reportId: report.id,
      engine: result.engine,
      query: result.query,
      queryType: result.queryType,
      queryLength: result.queryLength,
      snapshotId: result.snapshotId,
      error: result.error,
    }));

    if (responseInserts.length > 0) {
      await db.insert(aeoResponses).values(responseInserts);
    }

    // Update report to running status
    await db.update(aeoReports)
      .set({ status: 'running', currentStep: 'Scraping AI engines...' })
      .where(eq(aeoReports.id, report.id));

    return NextResponse.json({
      jobId: report.id,
      totalQueries: scrapeRequests.length,
      message: 'Analysis started',
    });
  } catch (error) {
    console.error('Trigger error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to start analysis' },
      { status: 500 }
    );
  }
}
