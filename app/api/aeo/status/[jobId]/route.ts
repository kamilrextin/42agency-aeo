import { NextRequest } from 'next/server';
import { eq, isNull, and } from 'drizzle-orm';
import { db, aeoReports, aeoResponses, aeoAnalyses } from '@/lib/db';
import { pollProgress, getSnapshot, parseScraperResponse } from '@/lib/aeo/scraper';
import {
  analyzeResponse,
  calculateVisibilityScore,
  calculateEngineScores,
  calculateCompetitorScores,
  aggregateCitations,
  type ResponseAnalysis,
} from '@/lib/aeo/analyzer';

export const runtime = 'edge';
export const maxDuration = 300;

interface StatusUpdate {
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  currentStep: string;
  completedQueries: number;
  totalQueries: number;
  error?: string;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  const { jobId } = await params;

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: StatusUpdate) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };

      const startTime = Date.now();
      const MAX_RUNTIME_MS = 280000; // 280 seconds - leave buffer before 300s timeout

      try {
        const report = await db.query.aeoReports.findFirst({
          where: eq(aeoReports.id, jobId),
        });

        if (!report) {
          send({ status: 'failed', progress: 0, currentStep: 'Report not found', completedQueries: 0, totalQueries: 0, error: 'Report not found' });
          controller.close();
          return;
        }

        if (report.status === 'completed') {
          send({ status: 'completed', progress: 100, currentStep: 'Analysis complete', completedQueries: 0, totalQueries: 0 });
          controller.close();
          return;
        }

        if (report.status === 'failed') {
          send({ status: 'failed', progress: 0, currentStep: report.error || 'Analysis failed', completedQueries: 0, totalQueries: 0, error: report.error || 'Unknown error' });
          controller.close();
          return;
        }

        const responses = await db.query.aeoResponses.findMany({
          where: eq(aeoResponses.reportId, jobId),
        });

        const totalQueries = responses.length;
        let completedQueries = responses.filter(r => r.responseText !== null || r.error !== null).length;

        send({
          status: 'running',
          progress: Math.round((completedQueries / totalQueries) * 100),
          currentStep: 'Polling AI engines...',
          completedQueries,
          totalQueries,
        });

        // Get pending responses
        const pendingResponses = responses.filter(r => r.snapshotId && !r.responseText && !r.error);

        // Poll in batches of 5 concurrently
        const BATCH_SIZE = 5;
        const MAX_POLL_ATTEMPTS = 30; // 30 * 3s = 90 seconds max per response
        const POLL_INTERVAL_MS = 3000;

        for (let i = 0; i < pendingResponses.length; i += BATCH_SIZE) {
          // Check timeout
          if (Date.now() - startTime > MAX_RUNTIME_MS) {
            send({
              status: 'running',
              progress: Math.round((completedQueries / totalQueries) * 100),
              currentStep: 'Timeout - refresh to continue polling...',
              completedQueries,
              totalQueries,
            });
            controller.close();
            return;
          }

          const batch = pendingResponses.slice(i, i + BATCH_SIZE);

          // Process batch in parallel
          await Promise.all(batch.map(async (response) => {
            if (!response.snapshotId) return;

            for (let attempt = 0; attempt < MAX_POLL_ATTEMPTS; attempt++) {
              // Check timeout inside loop too
              if (Date.now() - startTime > MAX_RUNTIME_MS) return;

              const progress = await pollProgress(response.snapshotId);

              if (progress.status === 'ready') {
                const { data, error } = await getSnapshot(response.snapshotId);

                const scraperResponse = parseScraperResponse(
                  response.engine,
                  response.query,
                  response.snapshotId,
                  data,
                  error
                );

                await db.update(aeoResponses)
                  .set({
                    responseText: scraperResponse.response,
                    citations: scraperResponse.citations,
                    hyperlinks: scraperResponse.hyperlinks,
                    rawResponse: scraperResponse.rawData,
                    error: scraperResponse.error,
                    scrapedAt: new Date(),
                  })
                  .where(eq(aeoResponses.id, response.id));

                if (scraperResponse.response) {
                  const analysis = analyzeResponse(
                    scraperResponse,
                    report.company,
                    report.competitors as string[],
                    response.queryType
                  );

                  await db.insert(aeoAnalyses).values({
                    responseId: response.id,
                    reportId: report.id,
                    companyMentioned: analysis.companyMentioned,
                    companyPosition: analysis.companyPosition,
                    companySentiment: analysis.companySentiment,
                    mentions: analysis.mentions,
                    parsedCitations: analysis.citations,
                  });
                }

                completedQueries++;
                return;
              }

              if (progress.status === 'failed') {
                await db.update(aeoResponses)
                  .set({ error: progress.message || 'Scrape failed' })
                  .where(eq(aeoResponses.id, response.id));
                completedQueries++;
                return;
              }

              await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL_MS));
            }

            // Max attempts reached - mark as timeout
            await db.update(aeoResponses)
              .set({ error: 'Polling timeout' })
              .where(eq(aeoResponses.id, response.id));
            completedQueries++;
          }));

          // Send progress update after each batch
          send({
            status: 'running',
            progress: Math.round((completedQueries / totalQueries) * 100),
            currentStep: `Processed ${completedQueries}/${totalQueries} queries`,
            completedQueries,
            totalQueries,
          });
        }

        // Calculate final scores
        send({
          status: 'running',
          progress: 95,
          currentStep: 'Calculating visibility scores...',
          completedQueries: totalQueries,
          totalQueries,
        });

        const allAnalyses = await db.query.aeoAnalyses.findMany({
          where: eq(aeoAnalyses.reportId, jobId),
        });

        // Fetch ALL responses for the lookup map (including those with errors)
        const allResponsesForMap = await db.query.aeoResponses.findMany({
          where: eq(aeoResponses.reportId, jobId),
        });

        // Create response lookup map for joining with analyses
        const responseMap = new Map(allResponsesForMap.map(r => [r.id, r]));

        // Fetch only successful responses for competitor scoring
        const allResponses = allResponsesForMap.filter(r => !r.error);

        const analysisResults: ResponseAnalysis[] = allAnalyses.map(a => {
          const response = responseMap.get(a.responseId);
          return {
            engine: response?.engine || '',
            query: response?.query || '',
            queryType: response?.queryType || '',
            mentions: (a.mentions || []) as ResponseAnalysis['mentions'],
            citations: (a.parsedCitations || []) as ResponseAnalysis['citations'],
            companyMentioned: a.companyMentioned,
            companyPosition: a.companyPosition,
            companySentiment: a.companySentiment as ResponseAnalysis['companySentiment'],
          };
        });

        const visibilityScore = calculateVisibilityScore(analysisResults);
        const engineScores = calculateEngineScores(analysisResults, report.engines as string[]);

        const scraperResponses = allResponses.map(r => ({
          engine: r.engine,
          prompt: r.query,
          response: r.responseText,
          citations: r.citations || [],
          hyperlinks: r.hyperlinks || [],
          products: [],
          webSearchTriggered: false,
          snapshotId: r.snapshotId,
          rawData: r.rawResponse,
          scrapedAt: r.scrapedAt?.toISOString() || '',
          error: r.error,
        }));

        const competitorScores = calculateCompetitorScores(
          scraperResponses as Parameters<typeof calculateCompetitorScores>[0],
          report.company,
          report.competitors as string[]
        );

        const topCitations = aggregateCitations(analysisResults);

        await db.update(aeoReports)
          .set({
            status: 'completed',
            progress: 100,
            currentStep: 'Analysis complete',
            visibilityScore: visibilityScore.score,
            mentionRate: visibilityScore.components.mentionRate,
            positionScore: visibilityScore.components.positionScore,
            sentimentRate: visibilityScore.components.sentimentRate,
            engineScores,
            competitorScores,
            topCitations,
            completedAt: new Date(),
          })
          .where(eq(aeoReports.id, jobId));

        send({
          status: 'completed',
          progress: 100,
          currentStep: 'Analysis complete',
          completedQueries: totalQueries,
          totalQueries,
        });

      } catch (error) {
        console.error('Status error:', error);
        send({
          status: 'failed',
          progress: 0,
          currentStep: 'Error processing analysis',
          completedQueries: 0,
          totalQueries: 0,
          error: error instanceof Error ? error.message : 'Unknown error',
        });

        await db.update(aeoReports)
          .set({
            status: 'failed',
            error: error instanceof Error ? error.message : 'Unknown error',
          })
          .where(eq(aeoReports.id, jobId));
      }

      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
