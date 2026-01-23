---
name: vendor-ops
description: Vendor and procurement operations - tool/vendor selection, renewals, cost optimization
version: 1.0.0
level: 3
owner: A3
skillId: S9
triggers:
  - vendor
  - procurement
  - tool selection
  - renewal
  - subscription cost
  - vendor audit
---

# vendor-ops Skill

Manage vendor relationships and procurement. Tool selection, renewals, cost optimization. Owned by CFO Agent (A3).

## Quick Commands

| Command | Action |
|---------|--------|
| `list` | List active vendors |
| `evaluate` | Evaluate vendor/tool |
| `renewal` | Process renewal |
| `cost` | Analyze costs |
| `compare` | Compare alternatives |
| `audit` | Audit vendor spend |

---

## Level 1: Vendor Registry

### getVendorRegistry()
```javascript
/**
 * Get current vendor registry
 */
async function getVendorRegistry() {
  return {
    version: '1.0',
    lastAudit: new Date().toISOString(),
    vendors: [
      {
        id: 'V001',
        name: 'Supabase',
        category: 'infrastructure',
        service: 'Database/Auth/Storage',
        tier: 'pro',
        monthlyCost: 25,
        renewalDate: '2026-02-01',
        contract: 'month-to-month',
        owner: 'A7',
        criticality: 'critical',
        alternatives: ['Firebase', 'Neon', 'PlanetScale']
      },
      {
        id: 'V002',
        name: 'Vercel',
        category: 'infrastructure',
        service: 'Hosting/Deployment',
        tier: 'pro',
        monthlyCost: 20,
        renewalDate: '2026-02-01',
        contract: 'month-to-month',
        owner: 'A7',
        criticality: 'critical',
        alternatives: ['Netlify', 'Railway', 'Render']
      },
      {
        id: 'V003',
        name: 'Stripe',
        category: 'payments',
        service: 'Payment Processing',
        tier: 'standard',
        monthlyCost: 0, // Transaction-based
        transactionFee: '2.9% + $0.30',
        renewalDate: null,
        contract: 'ongoing',
        owner: 'A3',
        criticality: 'critical',
        alternatives: ['Square', 'PayPal']
      },
      {
        id: 'V004',
        name: 'GitHub',
        category: 'development',
        service: 'Source Control/CI',
        tier: 'team',
        monthlyCost: 4,
        renewalDate: '2026-02-01',
        contract: 'month-to-month',
        owner: 'A7',
        criticality: 'critical',
        alternatives: ['GitLab', 'Bitbucket']
      },
      {
        id: 'V005',
        name: 'Anthropic',
        category: 'ai',
        service: 'AI/Claude API',
        tier: 'api',
        monthlyCost: 100, // Variable
        renewalDate: null,
        contract: 'usage-based',
        owner: 'A1',
        criticality: 'high',
        alternatives: ['OpenAI', 'Google AI']
      }
    ],
    categories: ['infrastructure', 'payments', 'development', 'ai', 'marketing', 'support'],
    totalMonthlyCost: 149
  };
}
```

---

## Level 2: Vendor Evaluation

### evaluateVendor()
```javascript
/**
 * Evaluate a vendor or tool
 */
function evaluateVendor(vendor, requirements) {
  const evaluation = {
    vendor: vendor.name,
    evaluatedAt: new Date().toISOString(),
    scores: {},
    totalScore: 0,
    recommendation: null
  };

  // Scoring criteria
  const criteria = [
    { name: 'functionality', weight: 0.25, description: 'Meets functional requirements' },
    { name: 'cost', weight: 0.20, description: 'Cost effectiveness' },
    { name: 'reliability', weight: 0.20, description: 'Uptime and reliability' },
    { name: 'security', weight: 0.15, description: 'Security posture' },
    { name: 'support', weight: 0.10, description: 'Support quality' },
    { name: 'integration', weight: 0.10, description: 'Integration ease' }
  ];

  let totalWeight = 0;
  let weightedScore = 0;

  for (const criterion of criteria) {
    const score = requirements[criterion.name] || 0;
    const normalizedScore = Math.min(Math.max(score, 0), 10);

    evaluation.scores[criterion.name] = {
      score: normalizedScore,
      weight: criterion.weight,
      weighted: normalizedScore * criterion.weight
    };

    weightedScore += normalizedScore * criterion.weight;
    totalWeight += criterion.weight;
  }

  evaluation.totalScore = Math.round((weightedScore / totalWeight) * 10);

  // Recommendation
  if (evaluation.totalScore >= 8) {
    evaluation.recommendation = 'STRONGLY_RECOMMEND';
  } else if (evaluation.totalScore >= 6) {
    evaluation.recommendation = 'RECOMMEND';
  } else if (evaluation.totalScore >= 4) {
    evaluation.recommendation = 'CONSIDER_ALTERNATIVES';
  } else {
    evaluation.recommendation = 'NOT_RECOMMENDED';
  }

  return evaluation;
}

/**
 * Compare vendors
 */
function compareVendors(vendors, requirements) {
  const comparisons = vendors.map(v => evaluateVendor(v, requirements[v.name] || {}));

  // Sort by score
  comparisons.sort((a, b) => b.totalScore - a.totalScore);

  return {
    comparedAt: new Date().toISOString(),
    vendorCount: vendors.length,
    winner: comparisons[0]?.vendor,
    rankings: comparisons.map((c, i) => ({
      rank: i + 1,
      vendor: c.vendor,
      score: c.totalScore,
      recommendation: c.recommendation
    })),
    details: comparisons
  };
}
```

---

## Level 3: Renewal Management

### processRenewal()
```javascript
/**
 * Process vendor renewal
 */
async function processRenewal(vendorId, options = {}) {
  const registry = await getVendorRegistry();
  const vendor = registry.vendors.find(v => v.id === vendorId);

  if (!vendor) {
    throw new Error(`Vendor not found: ${vendorId}`);
  }

  const renewal = {
    id: `REN-${vendorId}-${Date.now()}`,
    vendorId,
    vendorName: vendor.name,
    currentTier: vendor.tier,
    currentCost: vendor.monthlyCost,
    renewalDate: vendor.renewalDate,
    processedAt: new Date().toISOString(),
    decision: null,
    newTerms: null
  };

  // Evaluate renewal options
  const evaluation = {
    currentValue: calculateVendorValue(vendor),
    marketAlternatives: await getMarketAlternatives(vendor.category),
    usageMetrics: await getUsageMetrics(vendorId),
    costTrend: await getCostTrend(vendorId)
  };

  // Determine recommendation
  if (evaluation.currentValue >= 8 && evaluation.costTrend.direction !== 'increasing') {
    renewal.decision = 'RENEW';
    renewal.recommendation = 'Continue with current terms';
  } else if (evaluation.marketAlternatives.betterOptionExists) {
    renewal.decision = 'EVALUATE_ALTERNATIVES';
    renewal.recommendation = `Consider switching to ${evaluation.marketAlternatives.best.name}`;
  } else if (options.negotiate) {
    renewal.decision = 'NEGOTIATE';
    renewal.recommendation = 'Request discount based on loyalty/volume';
  } else {
    renewal.decision = 'RENEW';
    renewal.recommendation = 'No better options available';
  }

  // Check approval thresholds
  const annualCost = vendor.monthlyCost * 12;
  if (annualCost > 5000) {
    renewal.requiresApproval = true;
    renewal.approver = 'Steve';
  } else if (annualCost > 500) {
    renewal.requiresApproval = true;
    renewal.approver = 'A3';
  } else {
    renewal.requiresApproval = false;
    renewal.autoApproved = true;
  }

  return renewal;
}

function calculateVendorValue(vendor) {
  // Simple value calculation based on criticality and cost
  const criticalityScore = { critical: 10, high: 8, medium: 5, low: 2 };
  const base = criticalityScore[vendor.criticality] || 5;

  // Adjust for cost efficiency
  const costEfficiency = vendor.monthlyCost < 50 ? 1.2 : (vendor.monthlyCost < 200 ? 1.0 : 0.8);

  return Math.round(base * costEfficiency);
}

async function getMarketAlternatives(category) {
  // Simplified - would query market data
  return {
    betterOptionExists: false,
    alternatives: [],
    best: null
  };
}

async function getUsageMetrics(vendorId) {
  return { utilization: 75, trend: 'stable' };
}

async function getCostTrend(vendorId) {
  return { direction: 'stable', change: 0 };
}
```

---

## Level 4: Cost Analysis

### analyzeCosts()
```javascript
/**
 * Analyze vendor costs
 */
async function analyzeCosts(options = {}) {
  const registry = await getVendorRegistry();

  const analysis = {
    analyzedAt: new Date().toISOString(),
    period: options.period || 'monthly',
    summary: {
      totalMonthly: 0,
      totalAnnual: 0,
      byCategory: {},
      byCriticality: {}
    },
    vendors: [],
    insights: [],
    recommendations: []
  };

  // Calculate totals
  for (const vendor of registry.vendors) {
    const monthly = vendor.monthlyCost || 0;
    const annual = monthly * 12;

    analysis.summary.totalMonthly += monthly;
    analysis.summary.totalAnnual += annual;

    // By category
    if (!analysis.summary.byCategory[vendor.category]) {
      analysis.summary.byCategory[vendor.category] = 0;
    }
    analysis.summary.byCategory[vendor.category] += monthly;

    // By criticality
    if (!analysis.summary.byCriticality[vendor.criticality]) {
      analysis.summary.byCriticality[vendor.criticality] = 0;
    }
    analysis.summary.byCriticality[vendor.criticality] += monthly;

    // Vendor detail
    analysis.vendors.push({
      id: vendor.id,
      name: vendor.name,
      category: vendor.category,
      monthly,
      annual,
      percentOfTotal: 0 // Calculate after totals
    });
  }

  // Calculate percentages
  for (const v of analysis.vendors) {
    v.percentOfTotal = Math.round((v.monthly / analysis.summary.totalMonthly) * 100);
  }

  // Sort by cost
  analysis.vendors.sort((a, b) => b.monthly - a.monthly);

  // Generate insights
  if (analysis.summary.byCategory.infrastructure > analysis.summary.totalMonthly * 0.5) {
    analysis.insights.push('Infrastructure costs exceed 50% of total vendor spend');
  }

  const topVendor = analysis.vendors[0];
  if (topVendor && topVendor.percentOfTotal > 30) {
    analysis.insights.push(`${topVendor.name} represents ${topVendor.percentOfTotal}% of total spend - concentration risk`);
  }

  // Generate recommendations
  for (const vendor of analysis.vendors) {
    if (vendor.monthly > 100 && vendor.percentOfTotal > 20) {
      analysis.recommendations.push({
        vendor: vendor.name,
        action: 'Review for cost optimization or volume discounts',
        potentialSavings: Math.round(vendor.monthly * 0.1)
      });
    }
  }

  return analysis;
}

/**
 * Generate vendor spend report
 */
function generateSpendReport(analysis) {
  return `# Vendor Spend Report

**Generated**: ${analysis.analyzedAt}
**Period**: ${analysis.period}

---

## Summary

| Metric | Value |
|--------|-------|
| Total Monthly | $${analysis.summary.totalMonthly} |
| Total Annual | $${analysis.summary.totalAnnual} |
| Vendor Count | ${analysis.vendors.length} |

## Spend by Category

| Category | Monthly |
|----------|---------|
${Object.entries(analysis.summary.byCategory).map(([k, v]) => `| ${k} | $${v} |`).join('\n')}

## Top Vendors by Spend

| Rank | Vendor | Monthly | % of Total |
|------|--------|---------|------------|
${analysis.vendors.slice(0, 5).map((v, i) => `| ${i + 1} | ${v.name} | $${v.monthly} | ${v.percentOfTotal}% |`).join('\n')}

## Insights

${analysis.insights.map(i => `- ${i}`).join('\n') || 'No significant insights'}

## Recommendations

${analysis.recommendations.map(r => `- **${r.vendor}**: ${r.action} (potential savings: $${r.potentialSavings}/mo)`).join('\n') || 'No immediate recommendations'}

---

*Generated by vendor-ops skill*
`;
}
```

---

## MCP Tool Interface

```javascript
const vendorOpsTool = {
  name: 'vendor_ops',
  description: 'Manage vendors, evaluate tools, optimize costs',
  inputSchema: {
    type: 'object',
    properties: {
      action: {
        type: 'string',
        enum: ['list', 'evaluate', 'renewal', 'cost', 'compare', 'audit'],
        description: 'Vendor operation to perform'
      },
      vendorId: {
        type: 'string',
        description: 'Vendor ID for specific operations'
      },
      category: {
        type: 'string',
        description: 'Filter by category'
      }
    },
    required: ['action']
  }
};
```

---

## Usage Examples

```bash
# List all vendors
vendor-ops list

# Evaluate a vendor
vendor-ops evaluate --vendor Supabase --requirements reqs.json

# Process renewal
vendor-ops renewal --vendor V001

# Analyze costs
vendor-ops cost --period monthly

# Compare alternatives
vendor-ops compare --category infrastructure
```

---

## Success Criteria

- All vendors tracked in registry
- Renewals processed 30 days before expiration
- Cost analysis available on demand
- No surprise vendor charges
- Vendor spend within budget
