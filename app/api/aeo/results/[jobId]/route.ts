import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db, aeoReports, aeoResponses, aeoAnalyses } from '@/lib/db';
import { generateRecommendations, type VisibilityScore } from '@/lib/aeo/analyzer';

export const runtime = 'edge';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  const { jobId } = await params;

  try {
    // Get report
    const report = await db.query.aeoReports.findFirst({
      where: eq(aeoReports.id, jobId),
    });

    if (!report) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }

    // Get responses
    const responses = await db.query.aeoResponses.findMany({
      where: eq(aeoResponses.reportId, jobId),
    });

    // Get analyses
    const analyses = await db.query.aeoAnalyses.findMany({
      where: eq(aeoAnalyses.reportId, jobId),
    });

    // Generate recommendations
    const visibilityScore: VisibilityScore = {
      score: report.visibilityScore || 0,
      components: {
        mentionRate: report.mentionRate || 0,
        positionScore: report.positionScore || 0,
        sentimentRate: report.sentimentRate || 0,
      },
      totalQueries: responses.length,
      mentionedCount: analyses.filter(a => a.companyMentioned).length,
    };

    const recommendations = generateRecommendations(
      visibilityScore,
      (report.engineScores || {}) as unknown as Record<string, VisibilityScore>,
      (report.competitorScores || {}) as unknown as Record<string, VisibilityScore>,
      (report.topCitations || []) as [string, number][]
    );

    // Get all responses with query types
    const allSampleResponses = responses
      .filter(r => r.responseText)
      .map(r => ({
        engine: r.engine,
        query: r.query,
        queryType: r.queryType,
        response: r.responseText || '',
      }));

    // Determine if results are gated
    const isGated = !report.unlocked && !report.email;

    // Build response
    const result = {
      id: report.id,
      company: report.company,
      competitors: report.competitors,
      category: report.category,
      engines: report.engines,
      status: report.status,
      createdAt: report.createdAt,
      completedAt: report.completedAt,

      // Visibility scores (always visible)
      visibilityScore: report.visibilityScore,
      mentionRate: report.mentionRate,
      positionScore: report.positionScore,
      sentimentRate: report.sentimentRate,

      // Gated content
      isGated,
      unlocked: report.unlocked,

      // These are only fully visible if unlocked
      engineScores: isGated
        ? Object.fromEntries(
            Object.entries(report.engineScores || {}).map(([k, v]) => [k, { score: (v as unknown as { score: number }).score }])
          )
        : report.engineScores,

      competitorScores: isGated
        ? Object.fromEntries(
            Object.entries(report.competitorScores || {}).map(([k, v]) => [k, { score: (v as unknown as { score: number }).score }])
          )
        : report.competitorScores,

      topCitations: isGated
        ? ((report.topCitations as [string, number][] | null) || []).slice(0, 3)
        : (report.topCitations as [string, number][] | null),

      recommendations: isGated
        ? recommendations.slice(0, 2)
        : recommendations,

      sampleResponses: isGated
        ? allSampleResponses.slice(0, 3)
        : allSampleResponses,

      // Metadata
      totalQueries: responses.length,
      successfulQueries: responses.filter(r => r.responseText).length,
      mentionedInQueries: analyses.filter(a => a.companyMentioned).length,
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error('Results error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch results' },
      { status: 500 }
    );
  }
}
