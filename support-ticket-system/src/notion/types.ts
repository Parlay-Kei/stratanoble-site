import { z } from 'zod';

// Client enum
export const ClientSchema = z.enum(['DSLV', 'MsAudreysHouse', 'Strata Noble', 'Other']);
export type Client = z.infer<typeof ClientSchema>;

// Platform enum
export const PlatformSchema = z.enum(['DSLV', 'MsAudreysHouse', 'Direct Cuts', 'Strata Noble', 'Other']);
export type Platform = z.infer<typeof PlatformSchema>;

// Category enum
export const CategorySchema = z.enum(['Bug', 'Feature', 'Billing', 'Access/Auth', 'Data', 'UX', 'Question']);
export type Category = z.infer<typeof CategorySchema>;

// Severity enum
export const SeveritySchema = z.enum(['S1 Critical', 'S2 High', 'S3 Medium', 'S4 Low']);
export type Severity = z.infer<typeof SeveritySchema>;

// Status enum
export const StatusSchema = z.enum([
  'New',
  'Triaged',
  'In Progress',
  'Blocked',
  'Waiting on Client',
  'Ready for Release',
  'Released',
  "Won't Do"
]);
export type Status = z.infer<typeof StatusSchema>;

// Priority enum
export const PrioritySchema = z.enum(['P0', 'P1', 'P2', 'P3']);
export type Priority = z.infer<typeof PrioritySchema>;

// Intake Source enum
export const IntakeSourceSchema = z.enum(['Slack', 'Email', 'Call', 'Form']);
export type IntakeSource = z.infer<typeof IntakeSourceSchema>;

// Release Window enum
export const ReleaseWindowSchema = z.enum(['Next Patch', 'This Week', 'Next Week', 'Backlog']);
export type ReleaseWindow = z.infer<typeof ReleaseWindowSchema>;

// Create Ticket Input
export const CreateTicketInputSchema = z.object({
  summary: z.string().min(1, 'Summary is required'),
  client: ClientSchema,
  platform: PlatformSchema,
  category: CategorySchema,
  severity: SeveritySchema,
  impact: z.number().min(1).max(10),
  urgency: z.number().min(1).max(10),
  effort: z.number().min(0).optional().default(0),
  slackPermalink: z.string().url().optional(),
  notes: z.string().optional()
});
export type CreateTicketInput = z.infer<typeof CreateTicketInputSchema>;

// Ticket record from Notion
export interface Ticket {
  id: string;
  notionPageId: string;
  notionUrl: string;
  title: string;
  client: Client;
  platform: Platform;
  category: Category;
  severity: Severity;
  status: Status;
  priority: Priority | null;
  impact: number;
  urgency: number;
  effort: number;
  priorityScore: number;
  owner: string | null;
  intakeSource: IntakeSource;
  slackPermalink: string | null;
  releaseWindow: ReleaseWindow | null;
  dueDate: string | null;
  notes: string | null;
  createdTime: string;
  lastEditedTime: string;
}

// Digest report structure
export interface DigestReport {
  date: string;
  newTicketsByClient: Record<string, number>;
  topPriorityTickets: Ticket[];
  waitingOnClientOld: Ticket[];
  readyForRelease: Ticket[];
}
