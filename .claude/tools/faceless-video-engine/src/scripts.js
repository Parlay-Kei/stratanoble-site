// Week 1 TikTok Scripts mapped for video generation

export const SCRIPTS = {
  P01: {
    id: 'P01',
    title: 'Automation Fails Quietly',
    hook: "Your automation is lying to you.",
    story: "That dashboard says 'all systems operational' while errors pile up in hidden logs.",
    insight: "Silent failures compound until they become crises.",
    cta: "What's failing quietly in your business right now?",
    duration: 35, // seconds
    pillar: 'Proof'
  },

  P02: {
    id: 'P02',
    title: 'Manual Steps Drift',
    hook: "Every manual step is a future failure.",
    story: "A simple task that takes 5 minutes today becomes 45 minutes in 6 months.",
    insight: "Process drift is invisible until it's expensive.",
    cta: "Which of your processes have drifted this year?",
    duration: 35,
    pillar: 'Cost'
  },

  P03: {
    id: 'P03',
    title: 'Dashboards Give False Comfort',
    hook: "Your dashboard is theater.",
    story: "Beautiful metrics display while the actual business struggles behind the scenes.",
    insight: "Dashboards show what you measure, not what matters.",
    cta: "What critical metrics aren't on your dashboard?",
    duration: 35,
    pillar: 'Proof'
  },

  P04: {
    id: 'P04',
    title: 'Busy Looks Like Progress',
    hook: "Being busy isn't being productive.",
    story: "Teams celebrate task completion while strategic goals remain untouched.",
    insight: "Activity without alignment is expensive motion.",
    cta: "What keeps you busy but doesn't move you forward?",
    duration: 35,
    pillar: 'Decisions'
  }
};

// Get script by ID
export const getScript = (id) => {
  return SCRIPTS[id] || SCRIPTS.P01;
};