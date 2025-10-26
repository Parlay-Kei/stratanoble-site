import { sendEmail } from './mailer';

interface EmailData {
  email: string;
  idea: string;
  analysis: any;
}

export async function sendValidationEmail({ email, idea, analysis }: EmailData) {
  const resultsUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/get-started`;
  const siteUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://stratanoble.com';

  const htmlContent = `
  <div style="font-family: Arial, sans-serif; line-height:1.6;">
    <div style="background:#003366;color:#fff;padding:24px;border-radius:12px 12px 0 0;text-align:center;">
      <h1 style="margin:0;font-size:22px;">Your Business Idea Analysis</h1>
      <p style="margin:8px 0 12px;opacity:.9;">"${idea}"</p>
      <div style="font-size:42px;font-weight:700;color:#50C878;">${analysis.viabilityScore}/100</div>
      <div style="opacity:.9;">Viability Score</div>
    </div>
    <div style="background:#f7f9fb;padding:24px;border-radius:0 0 12px 12px;border:1px solid #e6eef5;border-top:none;">
      <h2 style="color:#003366;margin:0 0 12px;">Highlights</h2>
      <div style="background:#fff;border-left:4px solid #50C878;padding:16px;border-radius:8px;margin-bottom:12px;">
        <div><strong>Market Size:</strong> ${analysis.marketSize}</div>
        <div><strong>Competition:</strong> ${analysis.competition}</div>
        <div><strong>Opportunity:</strong> ${analysis.opportunity}</div>
      </div>
      <div style="background:#fff;border-left:4px solid #50C878;padding:16px;border-radius:8px;margin-bottom:12px;">
        <div><strong>Startup Costs:</strong> ${analysis.startupCosts}</div>
        <div><strong>Price Range:</strong> ${analysis.priceRange}</div>
        <div><strong>Time to First Sale:</strong> ${analysis.timeToFirstSale}</div>
      </div>
      <div style="text-align:center;margin-top:20px;">
        <a href="${resultsUrl}" style="display:inline-block;background:#50C878;color:#fff;padding:12px 24px;border-radius:24px;text-decoration:none;font-weight:700;">View Full Analysis & Get Started</a>
      </div>
      <p style="text-align:center;color:#667;margin-top:20px;font-size:13px;">Questions? Reply to this email or visit <a href="${siteUrl}">stratanoble.com</a></p>
    </div>
  </div>`;

  await sendEmail(
    email,
    `Your Business Idea Analysis: ${analysis.viabilityScore}/100 Score`,
    htmlContent
  );
}
