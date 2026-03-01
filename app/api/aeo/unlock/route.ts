import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { Resend } from 'resend';
import { db, aeoReports } from '@/lib/db';

export const runtime = 'edge';

// Lazy-initialize Resend client
let _resend: Resend | null = null;
function getResend(): Resend {
  if (!_resend) {
    _resend = new Resend(process.env.RESEND_API_KEY);
  }
  return _resend;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { jobId, email } = body;

    if (!jobId || !email) {
      return NextResponse.json({ error: 'Job ID and email are required' }, { status: 400 });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }

    // Get report
    const report = await db.query.aeoReports.findFirst({
      where: eq(aeoReports.id, jobId),
    });

    if (!report) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }

    // Update report with email and unlock
    await db.update(aeoReports)
      .set({
        email,
        unlocked: true,
      })
      .where(eq(aeoReports.id, jobId));

    // Send results email via Resend
    const emailSent = await sendResultsEmail(email, report);

    // Push to HubSpot
    const hubspotPushed = await pushToHubSpot(email, report);

    // Add to Resend Audience
    const audienceAdded = await addToResendAudience(email);

    return NextResponse.json({
      success: true,
      emailSent,
      hubspotPushed,
      audienceAdded,
    });
  } catch (error) {
    console.error('Unlock error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to unlock results' },
      { status: 500 }
    );
  }
}

async function sendResultsEmail(
  email: string,
  report: {
    company: string;
    category: string;
    visibilityScore: number | null;
    id: string;
  }
): Promise<boolean> {
  try {
    const score = report.visibilityScore || 0;
    const scoreColor = score >= 60 ? '#10B981' : score >= 40 ? '#F59E0B' : '#EF4444';
    const scoreLabel = score >= 60 ? 'Good' : score >= 40 ? 'Average' : 'Critical';

    await getResend().emails.send({
      from: '42 Agency <noreply@42agency.com>',
      to: email,
      subject: `Your AEO Analysis: ${report.company} - Score ${score}/100`,
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; background: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background: white;">
    <tr>
      <td style="padding: 32px; border-bottom: 2px solid #1a1a1a;">
        <img src="https://intel.42agency.com/42-logo.png" alt="42 Agency" style="height: 28px;">
      </td>
    </tr>
    <tr>
      <td style="padding: 40px 32px;">
        <h1 style="margin: 0 0 8px; font-size: 28px; font-weight: 800; color: #1a1a1a;">
          Your AEO Analysis is Ready
        </h1>
        <p style="margin: 0 0 32px; color: #4a4a4a; font-size: 16px;">
          Here's how ${report.company} performs across AI answer engines for "${report.category}" queries.
        </p>

        <!-- Score Card -->
        <table width="100%" cellpadding="0" cellspacing="0" style="background: #f5f5f5; border: 2px solid #1a1a1a; border-radius: 12px; margin-bottom: 32px;">
          <tr>
            <td style="padding: 32px; text-align: center;">
              <p style="margin: 0 0 8px; font-size: 12px; font-weight: 700; text-transform: uppercase; color: #6b6b6b;">
                AI Visibility Score
              </p>
              <div style="font-size: 64px; font-weight: 800; color: ${scoreColor}; line-height: 1;">
                ${score}<span style="font-size: 24px; color: #6b6b6b;">/100</span>
              </div>
              <p style="margin: 8px 0 0; font-size: 14px; color: #6b6b6b;">
                ${scoreLabel}
              </p>
            </td>
          </tr>
        </table>

        <p style="margin: 0 0 24px; color: #4a4a4a; font-size: 16px;">
          View your full analysis including:
        </p>
        <ul style="margin: 0 0 32px; padding-left: 24px; color: #4a4a4a;">
          <li style="margin-bottom: 8px;">Engine-by-engine breakdown (ChatGPT, Perplexity, Gemini)</li>
          <li style="margin-bottom: 8px;">Competitor comparison</li>
          <li style="margin-bottom: 8px;">Top citation sources</li>
          <li style="margin-bottom: 8px;">Actionable recommendations</li>
        </ul>

        <a href="https://intel.42agency.com/aeo/${report.id}" style="display: inline-block; padding: 16px 32px; background: #DFFE68; color: #1a1a1a; font-weight: 700; text-decoration: none; border-radius: 8px; border: 2px solid #1a1a1a;">
          View Full Results
        </a>
      </td>
    </tr>
    <tr>
      <td style="padding: 32px; background: #1a1a1a;">
        <p style="margin: 0 0 16px; color: #DFFE68; font-size: 14px; font-weight: 600;">
          Need help improving your AI visibility?
        </p>
        <p style="margin: 0 0 16px; color: #999; font-size: 14px;">
          42 Agency specializes in AEO strategies for B2B companies. Let us help you get discovered by AI-powered search.
        </p>
        <a href="https://42agency.com/contact" style="color: #fff; text-decoration: underline; font-size: 14px;">
          Book a strategy call →
        </a>
      </td>
    </tr>
  </table>
</body>
</html>
      `,
    });

    return true;
  } catch (error) {
    console.error('Email send error:', error);
    return false;
  }
}

async function pushToHubSpot(
  email: string,
  report: {
    company: string;
    category: string;
    visibilityScore: number | null;
    mentionRate: number | null;
    positionScore: number | null;
    sentimentRate: number | null;
  }
): Promise<boolean> {
  const hubspotToken = process.env.HUBSPOT_ACCESS_TOKEN;
  if (!hubspotToken) {
    console.log('HUBSPOT_ACCESS_TOKEN not set, skipping HubSpot push');
    return false;
  }

  try {
    // Search for existing contact
    const searchResponse = await fetch(
      'https://api.hubapi.com/crm/v3/objects/contacts/search',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${hubspotToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filterGroups: [
            {
              filters: [
                { propertyName: 'email', operator: 'EQ', value: email },
              ],
            },
          ],
        }),
      }
    );

    const searchData = await searchResponse.json();
    const existingContact = searchData.results?.[0];

    const properties = {
      email,
      aeo_company_analyzed: report.company,
      aeo_category: report.category,
      aeo_visibility_score: report.visibilityScore?.toString() || '0',
      aeo_mention_rate: report.mentionRate?.toString() || '0',
      aeo_position_score: report.positionScore?.toString() || '0',
      aeo_sentiment_rate: report.sentimentRate?.toString() || '0',
      aeo_analysis_date: new Date().toISOString().split('T')[0],
    };

    if (existingContact) {
      // Update existing contact
      await fetch(
        `https://api.hubapi.com/crm/v3/objects/contacts/${existingContact.id}`,
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${hubspotToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ properties }),
        }
      );
    } else {
      // Create new contact
      await fetch('https://api.hubapi.com/crm/v3/objects/contacts', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${hubspotToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ properties }),
      });
    }

    return true;
  } catch (error) {
    console.error('HubSpot push error:', error);
    return false;
  }
}

async function addToResendAudience(email: string): Promise<boolean> {
  const audienceId = process.env.RESEND_AUDIENCE_ID;
  if (!audienceId) {
    console.log('RESEND_AUDIENCE_ID not set, skipping audience add');
    return false;
  }

  try {
    await getResend().contacts.create({
      audienceId,
      email,
      unsubscribed: false,
    });
    return true;
  } catch (error) {
    console.error('Resend audience error:', error);
    return false;
  }
}
