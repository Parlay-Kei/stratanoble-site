import { getNotionClient, getDatabaseId } from './client.js';
import type {
  Ticket,
  CreateTicketInput,
  Client as ClientType,
  Status,
  DigestReport
} from './types.js';

export async function createTicket(input: CreateTicketInput): Promise<Ticket> {
  const notion = getNotionClient();
  const databaseId = getDatabaseId();

  const response = await notion.pages.create({
    parent: { database_id: databaseId },
    properties: {
      'Ticket': {
        title: [{ text: { content: input.summary } }]
      },
      'Client': {
        select: { name: input.client }
      },
      'Platform': {
        select: { name: input.platform }
      },
      'Category': {
        select: { name: input.category }
      },
      'Severity': {
        select: { name: input.severity }
      },
      'Status': {
        select: { name: 'New' }
      },
      'Impact': {
        number: input.impact
      },
      'Urgency': {
        number: input.urgency
      },
      'Effort': {
        number: input.effort || 0
      },
      'Intake Source': {
        select: { name: 'Slack' }
      },
      'Release Window': {
        select: { name: 'Next Patch' }
      },
      ...(input.slackPermalink && {
        'Slack Permalink': {
          url: input.slackPermalink
        }
      }),
      ...(input.notes && {
        'Notes': {
          rich_text: [{ text: { content: input.notes } }]
        }
      })
    }
  });

  return parseTicketFromPage(response);
}

export async function updateTicketStatus(pageId: string, status: Status): Promise<Ticket> {
  const notion = getNotionClient();

  const response = await notion.pages.update({
    page_id: pageId,
    properties: {
      'Status': {
        select: { name: status }
      }
    }
  });

  return parseTicketFromPage(response);
}

export async function getTicket(pageId: string): Promise<Ticket> {
  const notion = getNotionClient();
  const response = await notion.pages.retrieve({ page_id: pageId });
  return parseTicketFromPage(response);
}

export async function queryTickets(filter: {
  status?: Status | Status[];
  client?: ClientType;
}): Promise<Ticket[]> {
  const notion = getNotionClient();
  const databaseId = getDatabaseId();

  const filters: any[] = [];

  if (filter.status) {
    if (Array.isArray(filter.status)) {
      filters.push({
        or: filter.status.map(s => ({
          property: 'Status',
          select: { equals: s }
        }))
      });
    } else {
      filters.push({
        property: 'Status',
        select: { equals: filter.status }
      });
    }
  }

  if (filter.client) {
    filters.push({
      property: 'Client',
      select: { equals: filter.client }
    });
  }

  const response = await notion.databases.query({
    database_id: databaseId,
    filter: filters.length > 0 ? { and: filters } : undefined,
    sorts: [
      { property: 'Severity', direction: 'ascending' },
      { property: 'Priority Score', direction: 'descending' }
    ]
  });

  return response.results.map(page => parseTicketFromPage(page));
}

export async function getNewTicketsByClient(): Promise<Record<string, number>> {
  const tickets = await queryTickets({ status: 'New' });
  const counts: Record<string, number> = {
    'DSLV': 0,
    'MsAudreysHouse': 0,
    'Strata Noble': 0,
    'Other': 0
  };

  for (const ticket of tickets) {
    counts[ticket.client] = (counts[ticket.client] || 0) + 1;
  }

  return counts;
}

export async function getTopPriorityTickets(limit: number = 5): Promise<Ticket[]> {
  const tickets = await queryTickets({ status: ['New', 'Triaged'] });
  return tickets.slice(0, limit);
}

export async function getWaitingOnClientOld(days: number = 3): Promise<Ticket[]> {
  const allWaiting = await queryTickets({ status: 'Waiting on Client' });
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  return allWaiting.filter(ticket => {
    const lastEdited = new Date(ticket.lastEditedTime);
    return lastEdited < cutoffDate;
  });
}

export async function getReadyForRelease(): Promise<Ticket[]> {
  return queryTickets({ status: 'Ready for Release' });
}

export async function generateDigestReport(): Promise<DigestReport> {
  const [
    newTicketsByClient,
    topPriorityTickets,
    waitingOnClientOld,
    readyForRelease
  ] = await Promise.all([
    getNewTicketsByClient(),
    getTopPriorityTickets(5),
    getWaitingOnClientOld(3),
    getReadyForRelease()
  ]);

  return {
    date: new Date().toISOString().split('T')[0],
    newTicketsByClient,
    topPriorityTickets,
    waitingOnClientOld,
    readyForRelease
  };
}

function parseTicketFromPage(page: any): Ticket {
  const props = page.properties;

  const getTitle = (prop: any): string => {
    return prop?.title?.[0]?.text?.content || '';
  };

  const getSelect = (prop: any): string | null => {
    return prop?.select?.name || null;
  };

  const getStatusValue = (prop: any): string | null => {
    return prop?.select?.name || prop?.status?.name || null;
  };

  const getNumber = (prop: any): number => {
    return prop?.number || 0;
  };

  const getFormula = (prop: any): number => {
    return prop?.formula?.number || 0;
  };

  const getUrl = (prop: any): string | null => {
    return prop?.url || null;
  };

  const getRichText = (prop: any): string | null => {
    return prop?.rich_text?.[0]?.text?.content || null;
  };

  const getDate = (prop: any): string | null => {
    return prop?.date?.start || null;
  };

  const getPerson = (prop: any): string | null => {
    return prop?.people?.[0]?.name || prop?.people?.[0]?.id || null;
  };

  return {
    id: page.id.replace(/-/g, ''),
    notionPageId: page.id,
    notionUrl: page.url,
    title: getTitle(props['Ticket']),
    client: (getSelect(props['Client']) as ClientType) || 'Other',
    platform: getSelect(props['Platform']) as any || 'Other',
    category: getSelect(props['Category']) as any || 'Question',
    severity: getSelect(props['Severity']) as any || 'S4 Low',
    status: (getStatusValue(props['Status']) as Status) || 'New',
    priority: getSelect(props['Priority']) as any,
    impact: getNumber(props['Impact']),
    urgency: getNumber(props['Urgency']),
    effort: getNumber(props['Effort']),
    priorityScore: getFormula(props['Priority Score']),
    owner: getPerson(props['Owner']),
    intakeSource: getSelect(props['Intake Source']) as any || 'Slack',
    slackPermalink: getUrl(props['Slack Permalink']),
    releaseWindow: getSelect(props['Release Window']) as any,
    dueDate: getDate(props['Due Date']),
    notes: getRichText(props['Notes']),
    createdTime: page.created_time,
    lastEditedTime: page.last_edited_time
  };
}
