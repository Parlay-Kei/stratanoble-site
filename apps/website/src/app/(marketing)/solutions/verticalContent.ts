import type { LucideIcon } from 'lucide-react';
import { Mail, FileSpreadsheet, UserX, KeyRound, PhoneOff, ClipboardList, Wallet, Share2, Building2, CalendarX, Star, BarChart3 } from 'lucide-react';

export type VerticalSlug = 'consultants' | 'home-services' | 'real-estate' | 'appointment-businesses';

export interface VerticalPain {
  title: string;
  description: string;
  Icon: LucideIcon;
}

export interface VerticalScenario {
  clientType: string;
  industry: string;
  problem: string;
  fix: string;
  result: string;
  timeline: string;
}

export interface VerticalContent {
  slug: VerticalSlug;
  headline: string;
  subheadline: string;
  pains: VerticalPain[];
  modules: string[];
  installed: string[];
  scenario: VerticalScenario;
  offerPath: string;
  primaryCta: string;
  primaryHref: string;
  secondaryCta: string;
  secondaryHref: string;
}

export const verticalContent: Record<VerticalSlug, VerticalContent> = {
  consultants: {
    slug: 'consultants',
    headline: 'Operational Infrastructure for Consulting Firms and Agencies',
    subheadline:
      'You close deals, manage clients, and deliver work — but your operations run on spreadsheets, email, and memory. We install the systems that give you control.',
    pains: [
      {
        title: 'Client lifecycle in email threads',
        description: 'No single place for status, next steps, or who owns the follow-up.',
        Icon: Mail,
      },
      {
        title: 'Invoices drift for weeks',
        description: 'AR is reactive — you invoice when you remember, not when the work ships.',
        Icon: FileSpreadsheet,
      },
      {
        title: 'No weekly operating rhythm',
        description: 'The founder is the dashboard — nothing runs unless you personally check it.',
        Icon: UserX,
      },
      {
        title: 'Credentials in Slack or text',
        description: 'Client logins and tool access live in channels with no audit trail.',
        Icon: KeyRound,
      },
    ],
    modules: ['Q-ICMS', 'Q-ARI', 'Q-CC', 'Q-VAULT'],
    installed: [
      'Client lifecycle and engagement tracking in Q-ICMS',
      'Invoice and AR visibility in Q-ARI',
      'Executive review rhythm and activity feeds in Q-CC',
      'Governed credential and asset storage in Q-VAULT',
    ],
    scenario: {
      clientType: 'Consulting / professional services',
      industry: 'Advisory firm (12 active clients)',
      problem:
        'Managing clients across spreadsheets and email. Invoices sent manually, sometimes weeks late. No view of who was current, overdue, or at risk.',
      fix:
        'Q-ICMS for lifecycle and engagement, Q-ARI for AR dashboard, weekly rhythm via Q-CC — the same pattern as our consulting case study delivery model.',
      result:
        'AR visibility in real time, late invoicing eliminated, and a repeatable weekly operating cadence.',
      timeline: '21 days (Operations Buildout)',
    },
    offerPath:
      'You already have leads and delivery pressure — the gap is operations. Most clients start with Operations Buildout so intake, AR, and visibility land together.',
    primaryCta: 'Apply for Operations Buildout',
    primaryHref: '/operations-buildout',
    secondaryCta: 'Talk through scope',
    secondaryHref: '/contact',
  },
  'home-services': {
    slug: 'home-services',
    headline: 'Operational Infrastructure for Home Service Businesses',
    subheadline:
      'Leads from Google, Yelp, and referrals — but no system to capture, follow up, or track them. We fix that.',
    pains: [
      {
        title: 'Voicemail and slow follow-up',
        description: 'Calls stack up; nobody gets back within the window that wins the job.',
        Icon: PhoneOff,
      },
      {
        title: 'Leads on paper or in someone’s head',
        description: "The office manager is the CRM — and they're already underwater.",
        Icon: ClipboardList,
      },
      {
        title: 'No pipeline truth',
        description: 'You cannot see which estimates closed, which are pending, or what fell off.',
        Icon: BarChart3,
      },
      {
        title: 'Invoicing is manual',
        description: 'Revenue timing is a surprise because billing is not tied to job status.',
        Icon: Wallet,
      },
    ],
    modules: ['Q-ICMS', 'Q-CC', 'Q-ARI'],
    installed: [
      'Lead capture and pipeline tracking in Q-ICMS',
      'Speed-to-lead and call routing patterns via Q-CC',
      'Invoice and payment visibility in Q-ARI',
    ],
    scenario: {
      clientType: 'Home service operator',
      industry: 'HVAC / plumbing',
      problem:
        '40+ leads a month from Google Ads with weak follow-up. Office tracking on paper. After-hours calls unanswered.',
      fix:
        'Q-ICMS for intake and pipeline, Q-CC for speed-to-lead, structured follow-up for every inquiry — matching how we deploy for high-volume local trades.',
      result:
        'Response time from hours to minutes, close rate up, pipeline visible for the first time.',
      timeline: '21 days (Operations Buildout)',
    },
    offerPath:
      'When the leak is follow-up and intake, start with a Systems Audit, then move into Operations Buildout to lock in CRM, automations, and dashboards.',
    primaryCta: 'Start with Systems Audit',
    primaryHref: '/systems-audit',
    secondaryCta: 'Plan a full buildout',
    secondaryHref: '/operations-buildout',
  },
  'real-estate': {
    slug: 'real-estate',
    headline: 'Operational Infrastructure for Real Estate Teams',
    subheadline:
      'Multiple lead sources, multiple agents, zero central pipeline. We consolidate your operation.',
    pains: [
      {
        title: 'Leads scattered across platforms',
        description: 'Zillow, Meta, referrals — no single intake or assignment rules.',
        Icon: Share2,
      },
      {
        title: 'Personal phones, no log',
        description: 'Calls and texts are not tied to the deal record or the team view.',
        Icon: PhoneOff,
      },
      {
        title: 'MLS and tool credentials everywhere',
        description: 'Passwords and shared logins live in text threads.',
        Icon: KeyRound,
      },
      {
        title: 'Team lead is blind',
        description: 'No visibility into per-agent pipelines without asking around.',
        Icon: Building2,
      },
    ],
    modules: ['Q-ICMS', 'Q-CC', 'Q-VAULT'],
    installed: [
      'Central pipeline and intake in Q-ICMS',
      'Call and follow-up infrastructure via Q-CC',
      'Credential governance for MLS, CRM, and marketing tools in Q-VAULT',
    ],
    scenario: {
      clientType: 'Real estate team',
      industry: '4-person buyer/seller team',
      problem:
        'Leads from three platforms with no central pipeline. Agents on personal phones. MLS and marketing credentials in group texts.',
      fix:
        'Systems Audit to centralize intake, Q-VAULT for governed access, pipeline in Q-ICMS — same stack as our real-estate delivery scenario.',
      result:
        'Single intake, audit-trailed credentials, and a team-visible pipeline for the lead agent.',
      timeline: '48 hours + extended engagement',
    },
    offerPath:
      'Unify intake fast with Systems Audit, then extend into Operations Buildout for full CRM, automations, and team dashboards.',
    primaryCta: 'Start with Systems Audit',
    primaryHref: '/systems-audit',
    secondaryCta: 'Apply for Operations Buildout',
    secondaryHref: '/operations-buildout',
  },
  'appointment-businesses': {
    slug: 'appointment-businesses',
    headline: 'Operational Infrastructure for Appointment-Based Businesses',
    subheadline:
      'Bookings, no-shows, follow-ups, and reviews — running on disconnected tools. We install the system that ties it together.',
    pains: [
      {
        title: 'Bookings split across tools',
        description: 'Calendly, phone, walk-ins — no unified view of the schedule or funnel.',
        Icon: CalendarX,
      },
      {
        title: 'No-show follow-up dies',
        description: 'Reminders are manual or inconsistent; slots go empty with no recovery sequence.',
        Icon: UserX,
      },
      {
        title: 'Reviews when someone remembers',
        description: 'Reputation work is ad hoc instead of part of the client journey.',
        Icon: Star,
      },
      {
        title: 'No booking-to-cash clarity',
        description: 'You cannot see conversion from booked appointment to paid service.',
        Icon: BarChart3,
      },
    ],
    modules: ['Q-ICMS', 'Q-CC', 'Q-ARI'],
    installed: [
      'Client and appointment lifecycle in Q-ICMS',
      'Follow-up and reminder cadences via Q-CC',
      'Revenue and payment tracking in Q-ARI',
    ],
    scenario: {
      clientType: 'Appointment-based operator',
      industry: 'Med spa (constructed scenario)',
      problem:
        'High no-show rate on injectable appointments. Bookings spread across a front-desk sheet, Instagram DMs, and a generic calendar. Review asks only when the owner has time.',
      fix:
        'Central intake in Q-ICMS, automated reminder and recovery sequences through Q-CC, AR visibility for deposits and packages in Q-ARI.',
      result:
        'Fewer empty chairs, consistent follow-up, and a clear line from booked slot to collected revenue.',
      timeline: 'Systems Audit first, then buildout as needed',
    },
    offerPath:
      'When the pain is leakage at the booking and follow-up layer, we usually start with a Systems Audit to stabilize intake, then expand scope from there.',
    primaryCta: 'Start with Systems Audit',
    primaryHref: '/systems-audit',
    secondaryCta: 'Discuss a buildout',
    secondaryHref: '/contact',
  },
};
