import { CalendarEvent } from './types';

function sid(suffix: string) { return `sample-${suffix}`; }

export const sampleEvents: CalendarEvent[] = [

  // ─── EPISODES ────────────────────────────────────────────────────────────

  // S5E6 Business myths — In progress, publish 25/06/2026
  {
    id: sid('s5e6'),
    type: 'episode',
    title: 'S5E6 Business myths',
    date: '2026-06-25',
    notes: 'Draft 2 and Graphics in progress. Need to finish before June 20.',
    assignees: ['Victoria', 'Albina'],
    createdAt: '2026-05-14T10:00:00Z',
    show: 'Privileged Gossip',
    episodeName: 'S5E6 Business myths',
    theme: 'Business myths debunked',
    linkedDealIds: [],
    stages: [
      { id: sid('s5e6-d1'), name: 'Draft 1', startDate: '2026-05-14', endDate: '2026-05-19', status: 'done', responsible: 'Victoria' },
      { id: sid('s5e6-c1'), name: 'Comments', startDate: '2026-06-12', endDate: '2026-06-12', status: 'done', responsible: 'Albina' },
      { id: sid('s5e6-d2'), name: 'Draft 2', startDate: '2026-06-13', endDate: '2026-06-17', status: 'in_progress', responsible: 'Victoria' },
      { id: sid('s5e6-gr'), name: 'Graphics', startDate: '2026-06-15', endDate: '2026-06-17', status: 'in_progress', responsible: 'Victoria' },
      { id: sid('s5e6-c2'), name: 'Comments', startDate: '2026-06-17', endDate: '2026-06-17', status: 'not_started', responsible: 'Albina' },
      { id: sid('s5e6-d3'), name: 'Draft 3', startDate: '2026-06-18', endDate: '2026-06-21', status: 'not_started', responsible: 'Victoria' },
      { id: sid('s5e6-c3'), name: 'Comments', startDate: '2026-06-22', endDate: '2026-06-22', status: 'not_started', responsible: 'Albina' },
      { id: sid('s5e6-fn'), name: 'Final', startDate: '2026-06-22', endDate: '2026-06-23', status: 'not_started', responsible: 'Victoria' },
      { id: sid('s5e6-th'), name: 'Thumbnail', startDate: '2026-06-17', endDate: '2026-06-19', status: 'not_started', responsible: 'Victoria' },
    ],
  },

  // S6E1 29 Advice — In progress, publish 09/07/2026
  {
    id: sid('s6e1'),
    type: 'episode',
    title: 'S6E1 29 Advice',
    date: '2026-07-09',
    notes: 'Season 6 opener. Albina is writing the script.',
    assignees: ['Victoria', 'Albina'],
    createdAt: '2026-06-15T10:00:00Z',
    show: 'Privileged Gossip',
    episodeName: 'S6E1 29 Advice',
    theme: '29 pieces of advice before turning 30',
    linkedDealIds: [],
    stages: [
      { id: sid('s6e1-d1'), name: 'Draft 1', startDate: '2026-06-15', endDate: '2026-06-18', status: 'not_started', responsible: 'Victoria' },
      { id: sid('s6e1-c1'), name: 'Comments', startDate: '2026-06-19', endDate: '2026-06-19', status: 'not_started', responsible: 'Albina' },
      { id: sid('s6e1-d2'), name: 'Draft 2', startDate: '2026-06-22', endDate: '2026-06-25', status: 'not_started', responsible: 'Victoria' },
      { id: sid('s6e1-gr'), name: 'Graphics', startDate: '2026-06-22', endDate: '2026-06-24', status: 'not_started', responsible: 'Victoria' },
      { id: sid('s6e1-c2'), name: 'Comments', startDate: '2026-06-26', endDate: '2026-06-26', status: 'not_started', responsible: 'Albina' },
      { id: sid('s6e1-d3'), name: 'Draft 3', startDate: '2026-06-29', endDate: '2026-06-30', status: 'not_started', responsible: 'Victoria' },
      { id: sid('s6e1-c3'), name: 'Comments', startDate: '2026-07-01', endDate: '2026-07-01', status: 'not_started', responsible: 'Albina' },
      { id: sid('s6e1-fn'), name: 'Final', startDate: '2026-07-02', endDate: '2026-07-02', status: 'not_started', responsible: 'Victoria' },
      { id: sid('s6e1-th'), name: 'Thumbnail', startDate: '2026-06-29', endDate: '2026-07-03', status: 'not_started', responsible: 'Victoria' },
    ],
  },

  // ─── BRAND DEALS ─────────────────────────────────────────────────────────

  {
    id: sid('deal-001'),
    type: 'brand_deal',
    title: 'YouTube Integration — Business Myths',
    date: '2026-06-25',
    notes: 'Mid-roll 60-sec read. Talking points approved.',
    assignees: ['Roman'],
    createdAt: '2026-06-01T10:00:00Z',
    brand: 'Qure Skincare',
    stage: 'filming',
    placement: 'YouTube Episode Integration',
    rate: 3500,
    linkedEpisodeId: sid('s5e6'),
  },
  {
    id: sid('deal-002'),
    type: 'brand_deal',
    title: 'Pre-roll + Outro — S6E1',
    date: '2026-07-09',
    notes: 'Rate negotiation in progress. Brand wants exclusivity for 30 days.',
    assignees: ['Roman', 'Timur'],
    createdAt: '2026-06-08T10:00:00Z',
    brand: 'Bybit',
    stage: 'negotiation',
    placement: 'YouTube Pre-roll + Outro',
    rate: 5000,
    linkedEpisodeId: sid('s6e1'),
  },
  {
    id: sid('deal-003'),
    type: 'brand_deal',
    title: 'Standalone YT Short',
    date: '2026-06-19',
    notes: 'Contract signed. Deliverable: 60-sec YouTube Short.',
    assignees: ['Victoria'],
    createdAt: '2026-06-04T10:00:00Z',
    brand: 'MVMT Watches',
    stage: 'edit',
    placement: 'YouTube Shorts',
    rate: 1200,
  },

  // ─── REMINDERS ───────────────────────────────────────────────────────────

  {
    id: sid('rem-001'),
    type: 'reminder',
    title: 'Follow up with Bybit contract',
    date: '2026-06-17',
    notes: 'They promised to send the signed contract by end of week.',
    assignees: ['Roman', 'Timur'],
    createdAt: '2026-06-08T10:00:00Z',
    relatedTo: 'Bybit — S6E1 deal',
    dueDate: '2026-06-17',
    done: false,
  },
  {
    id: sid('rem-002'),
    type: 'reminder',
    title: 'Book filming studio for July',
    date: '2026-06-20',
    notes: 'We need the studio for at least 2 days in early July.',
    assignees: ['Production'],
    createdAt: '2026-06-05T10:00:00Z',
    relatedTo: 'July production schedule',
    dueDate: '2026-06-20',
    done: false,
  },
  {
    id: sid('rem-003'),
    type: 'reminder',
    title: 'Send 30-day report to Qure Skincare',
    date: '2026-07-25',
    notes: 'Include view count, click-through, screenshot of comments.',
    assignees: ['Roman'],
    createdAt: '2026-06-01T10:00:00Z',
    relatedTo: 'Qure Skincare — Business Myths deal',
    dueDate: '2026-07-25',
    done: false,
  },
];
