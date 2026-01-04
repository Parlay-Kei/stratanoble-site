import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Research & Sources | Strata Noble',
  description: 'Citations and sources for the statistics we use on our website.',
  robots: {
    index: false, // Don't need this page in search results
    follow: true,
  },
};

export default function ResearchPage() {
  return (
    <main className="container mx-auto py-12 px-4 max-w-3xl">
      <h1 className="text-3xl font-bold mb-8">Research & Sources</h1>

      <p className="text-muted-foreground mb-8">
        We cite third-party research to illustrate why speed-to-lead and consistent follow-up matter.
        Below are the sources and the exact claims we reference.
      </p>

      <div className="space-y-8">
        {/* Speed to Lead */}
        <section className="border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Speed-to-Lead Response Time</h2>

          <div className="space-y-4 text-sm">
            <div>
              <p className="font-medium">Claim we use:</p>
              <p className="text-muted-foreground">
                "21× higher qualification rate responding in 5 min vs 30 min"
              </p>
            </div>

            <div>
              <p className="font-medium">Source:</p>
              <p className="text-muted-foreground">
                Lead Response Management Study (InsideSales.com / MIT, 2007-2011)
              </p>
              <p className="text-muted-foreground mt-1">
                The study found that leads contacted within 5 minutes were 21 times more likely to
                qualify than those contacted after 30 minutes. The study also found 100× better
                contact rates at 5 minutes vs 30 minutes.
              </p>
            </div>

            <div>
              <p className="font-medium">Secondary citations:</p>
              <ul className="text-muted-foreground list-disc list-inside space-y-1">
                <li>
                  <a
                    href="https://blog.hubspot.com/sales/lead-response-time"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    HubSpot: "The Importance of Lead Response Time"
                  </a>
                </li>
                <li>
                  <a
                    href="https://content.marketingsherpa.com/data/public/reports/benchmark-reports/EXCERPT-BMR-2012-Lead-Gen.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    MarketingSherpa Lead Generation Benchmark Report
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <p className="font-medium">Date accessed:</p>
              <p className="text-muted-foreground">January 2025</p>
            </div>
          </div>
        </section>

        {/* Missed Calls */}
        <section className="border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Small Business Call Answer Rates</h2>

          <div className="space-y-4 text-sm">
            <div>
              <p className="font-medium">Claim we use:</p>
              <p className="text-muted-foreground">
                "~38% of small business calls answered (30-day study)"
              </p>
            </div>

            <div>
              <p className="font-medium">Source:</p>
              <p className="text-muted-foreground">
                Small business phone answering study conducted over 30 days, measuring answer rates
                across service businesses.
              </p>
            </div>

            <div>
              <p className="font-medium">Citations:</p>
              <ul className="text-muted-foreground list-disc list-inside space-y-1">
                <li>
                  <a
                    href="https://dialzara.com/blog/what-percentage-of-phone-calls-go-unanswered/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    Dialzara: Phone Call Answer Rate Research
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.ambscallcenter.com/the-telephone-answering-service-blog/research-small-businesses-answering-phone"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    Ambs Call Center: Small Business Phone Research
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <p className="font-medium">Note:</p>
              <p className="text-muted-foreground">
                The study reported approximately 37.8% of calls were answered over a 30-day period.
                We round to ~38% for clarity.
              </p>
            </div>

            <div>
              <p className="font-medium">Date accessed:</p>
              <p className="text-muted-foreground">January 2025</p>
            </div>
          </div>
        </section>

        {/* Disclaimer */}
        <section className="bg-muted/50 rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-3">How we use these statistics</h2>
          <p className="text-sm text-muted-foreground">
            These statistics illustrate industry-wide patterns in lead response and follow-up.
            Individual results vary based on industry, lead source, and business model. We use
            these figures to explain why pipeline infrastructure matters, not to guarantee specific
            outcomes.
          </p>
        </section>
      </div>

      <p className="text-xs text-muted-foreground mt-8">
        Last updated: January 2025
      </p>
    </main>
  );
}
