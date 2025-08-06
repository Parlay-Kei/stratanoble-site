// Deliverable Templates System for Solution Services
// Integrates with Notion for template storage and Zapier for automated delivery

export interface DeliverableTemplate {
  id: string;
  name: string;
  description: string;
  packageType: 'lite' | 'core' | 'premium';
  fileType: 'pdf' | 'docx' | 'notion' | 'google-doc';
  notionPageId?: string;
  googleDocId?: string;
  downloadUrl?: string;
  zapierWebhookUrl?: string;
}

// Solution Services deliverable templates
export const SOLUTION_SERVICES_DELIVERABLES: DeliverableTemplate[] = [
  // Lite Package Deliverables
  {
    id: 'lite-business-model-canvas',
    name: 'Business Model Canvas',
    description: 'Strategic framework to visualize and develop your business model',
    packageType: 'lite',
    fileType: 'pdf',
    notionPageId: 'lite-business-model-canvas-page-id',
    zapierWebhookUrl: 'https://hooks.zapier.com/hooks/catch/lite-business-model-canvas'
  },
  {
    id: 'lite-30-day-action-plan',
    name: '30-Day Action Plan',
    description: 'Detailed step-by-step plan for your first 30 days of execution',
    packageType: 'lite',
    fileType: 'notion',
    notionPageId: 'lite-30-day-action-plan-page-id',
    zapierWebhookUrl: 'https://hooks.zapier.com/hooks/catch/lite-30-day-action-plan'
  },
  {
    id: 'lite-strategy-session-notes',
    name: 'Strategy Session Notes',
    description: 'Comprehensive notes and insights from your 2-hour strategy session',
    packageType: 'lite',
    fileType: 'google-doc',
    googleDocId: 'lite-strategy-session-notes-doc-id',
    zapierWebhookUrl: 'https://hooks.zapier.com/hooks/catch/lite-strategy-session-notes'
  },

  // Core Package Deliverables
  {
    id: 'core-market-analysis-report',
    name: 'Market Analysis Report',
    description: 'In-depth analysis of your target market, competition, and opportunities',
    packageType: 'core',
    fileType: 'pdf',
    notionPageId: 'core-market-analysis-report-page-id',
    zapierWebhookUrl: 'https://hooks.zapier.com/hooks/catch/core-market-analysis-report'
  },
  {
    id: 'core-revenue-model-design',
    name: 'Revenue Model Design',
    description: 'Detailed revenue streams and pricing strategy framework',
    packageType: 'core',
    fileType: 'notion',
    notionPageId: 'core-revenue-model-design-page-id',
    zapierWebhookUrl: 'https://hooks.zapier.com/hooks/catch/core-revenue-model-design'
  },
  {
    id: 'core-90-day-roadmap',
    name: '90-Day Strategic Roadmap',
    description: 'Quarterly roadmap with milestones, KPIs, and success metrics',
    packageType: 'core',
    fileType: 'google-doc',
    googleDocId: 'core-90-day-roadmap-doc-id',
    zapierWebhookUrl: 'https://hooks.zapier.com/hooks/catch/core-90-day-roadmap'
  },

  // Premium Package Deliverables
  {
    id: 'premium-full-strategy-document',
    name: 'Complete Strategy Document',
    description: 'Comprehensive strategy document with implementation guidelines',
    packageType: 'premium',
    fileType: 'pdf',
    notionPageId: 'premium-full-strategy-document-page-id',
    zapierWebhookUrl: 'https://hooks.zapier.com/hooks/catch/premium-full-strategy-document'
  },
  {
    id: 'premium-implementation-playbook',
    name: 'Implementation Playbook',
    description: 'Step-by-step playbook for executing your strategy',
    packageType: 'premium',
    fileType: 'notion',
    notionPageId: 'premium-implementation-playbook-page-id',
    zapierWebhookUrl: 'https://hooks.zapier.com/hooks/catch/premium-implementation-playbook'
  },
  {
    id: 'premium-success-metrics-dashboard',
    name: 'Success Metrics Dashboard',
    description: 'Custom dashboard for tracking your progress and KPIs',
    packageType: 'premium',
    fileType: 'google-doc',
    googleDocId: 'premium-success-metrics-dashboard-doc-id',
    zapierWebhookUrl: 'https://hooks.zapier.com/hooks/catch/premium-success-metrics-dashboard'
  }
];

// Get deliverables for a specific package
export function getDeliverablesForPackage(packageType: 'lite' | 'core' | 'premium'): DeliverableTemplate[] {
  return SOLUTION_SERVICES_DELIVERABLES.filter(
    deliverable => deliverable.packageType === packageType
  );
}

// Trigger automated delivery via Zapier
export async function triggerDeliverableDelivery(
  customerEmail: string,
  customerName: string,
  packageType: 'lite' | 'core' | 'premium',
  deliverableId: string
): Promise<boolean> {
  try {
    const deliverable = SOLUTION_SERVICES_DELIVERABLES.find(d => d.id === deliverableId);
    
    if (!deliverable || !deliverable.zapierWebhookUrl) {
      // console.error('Deliverable not found or no webhook URL configured');
      return false;
    }

    const payload = {
      customer_email: customerEmail,
      customer_name: customerName,
      package_type: packageType,
      deliverable_id: deliverableId,
      deliverable_name: deliverable.name,
      notion_page_id: deliverable.notionPageId,
      google_doc_id: deliverable.googleDocId,
      timestamp: new Date().toISOString()
    };

    const response = await fetch(deliverable.zapierWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      return true;
    } else {
      // console.error(`Failed to trigger deliverable delivery: ${deliverableId}`);
      return false;
    }
  } catch {
    // console.error('Error triggering deliverable delivery:', _error);
    return false;
  }
}

// Deliver all deliverables for a package
export async function deliverAllPackageDeliverables(
  customerEmail: string,
  customerName: string,
  packageType: 'lite' | 'core' | 'premium'
): Promise<{ success: boolean; delivered: string[]; failed: string[] }> {
  const deliverables = getDeliverablesForPackage(packageType);
  const delivered: string[] = [];
  const failed: string[] = [];

  for (const deliverable of deliverables) {
    const success = await triggerDeliverableDelivery(
      customerEmail,
      customerName,
      packageType,
      deliverable.id
    );

    if (success) {
      delivered.push(deliverable.id);
    } else {
      failed.push(deliverable.id);
    }
  }

  return {
    success: failed.length === 0,
    delivered,
    failed
  };
}

// Get Notion page URL for a deliverable
export function getNotionPageUrl(notionPageId: string): string {
  return `https://notion.so/${notionPageId.replace(/-/g, '')}`;
}

// Get Google Doc URL for a deliverable
export function getGoogleDocUrl(googleDocId: string): string {
  return `https://docs.google.com/document/d/${googleDocId}/edit`;
} 