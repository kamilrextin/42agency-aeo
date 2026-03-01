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
export const maxDuration = 300; // 5 minutes max

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

  // Create SSE stream
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: StatusUpdate) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };

      try {
        // Get report
        const report = await db.query.aeoReports.findFirst({
          where: eq(aeoReports.id, jobId),
        });

        if (!report) {
          send({ status: 'failed', progress: 0, currentStep: 'Report not found', completedQueries: 0, totalQueries: 0, error: 'Report not found' });
          controller.close();
          return;
        }

        // If already completed, return immediately
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

        // Get all pending responses
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

        // Poll pending responses
        const pendingResponses = responses.filter(r => r.snapshotId && !r.responseText && !r.error);

        for (const response of pendingResponses) {
          if (!response.snapshotId) continue;

          let attempts = 0;
          const maxAttempts = 60;

          while (attempts < maxAttempts) {
            attempts++;

            const progress = await pollProgress(response.snapshotId);

            if (progress.status === 'ready') {
              // Get snapshot data
              const { data, error } = await getSnapshot(response.snapshotId);

              const scraperResponse = parseScraperResponse(
                response.engine,
                response.query,
                response.snapshotId,
                data,
                error
              );

              // Update response in database
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

              // Analyze response if we got text
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
              send({
                status: 'running',
                progress: Math.round((completedQueries / totalQueries) * 100),
                currentStep: `Processed ${completedQueries}/${totalQueries} queries`,
                completedQueries,
                totalQueries,
              });

              break;
            }

            if (progress.status === 'failed') {
              await db.update(aeoResponses)
                .set({ error: progress.message || 'Scrape failed' })
                .where(eq(aeoResponses.id, response.id));

              completedQueries++;
              break;
            }

            // Wait before next poll
            await new Promise(resolve => setTimeout(resolve, 5000));
          }
        }

        // Calculate final scores
        send({
          status: 'running',
          progress: 95,
          currentStep: 'Calculating visibility scores...',
          completedQueries: totalQueries,
          totalQueries,
        });

        // Fetch all analyses
        const allAnalyses = await db.query.aeoAnalyses.findMany({
          where: eq(aeoAnalyses.reportId, jobId),
        });

        // Fetch all responses for competitor analysis
        const allResponses = await db.query.aeoResponses.findMany({
          where: and(
            eq(aeoResponses.reportId, jobId),
            isNull(aeoResponses.error)
          ),
        });

        // Convert to ResponseAnalysis format
        const analysisResults: ResponseAnalysis[] = allAnalyses.map(a => ({
          engine: '',
          query: '',
          queryType: '',
          mentions: (a.mentions || []) as ResponseAnalysis['mentions'],
          citations: (a.parsedCitations || []) as ResponseAnalysis['citations'],
          companyMentioned: a.companyMentioned,
          companyPosition: a.companyPosition,
          companySentiment: a.companySentiment as ResponseAnalysis['companySentiment'],
        }));

        // Calculate scores
        const visibilityScore = calculateVisibilityScore(analysisResults);
        const engineScores = calculateEngineScores(analysisResults, report.engines as string[]);

        // For competitor scores, we need the raw responses
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

        // Update report with final scores
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

        // Update report status
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
