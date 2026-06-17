export type EventType = 'brand_deal' | 'episode' | 'reminder';
export type BrandDealStage = 'negotiation' | 'contract' | 'filming' | 'edit' | 'live' | 'reporting';
export type ShowName = 'Privileged Gossip' | 'PF Interviews' | 'RGM' | 'Albina IG/TikTok' | 'Other';
export type TeamMember = 'Roman' | 'Timur' | 'Albina' | 'Victoria' | 'Production';
export type StageStatus = 'not_started' | 'in_progress' | 'done';

export interface ProductionStage {
  id: string;
  name: string;
  startDate?: string; // ISO date
  endDate?: string;   // ISO date — this is the "deadline" shown on calendar
  status: StageStatus;
  responsible?: TeamMember;
}

export interface BaseEvent {
  id: string;
  type: EventType;
  title: string;
  date: string; // ISO date — publish/delivery date for episodes, main date for others
  endDate?: string;
  notes: string;
  assignees: TeamMember[];
  createdAt: string;
}

export interface BrandDealEvent extends BaseEvent {
  type: 'brand_deal';
  brand: string;
  stage: BrandDealStage;
  placement: string;
  rate: number;
  trelloCardId?: string;
  linkedEpisodeId?: string;
}

export interface EpisodeEvent extends BaseEvent {
  type: 'episode';
  show: ShowName;
  episodeName: string;
  theme: string;
  // Production pipeline — flexible stages matching real Notion workflow
  // (Draft 1, Comments, Draft 2, Final, Graphics, Thumbnail, Publishing, etc.)
  stages: ProductionStage[];
  linkedDealIds: string[];
}

export interface ReminderEvent extends BaseEvent {
  type: 'reminder';
  relatedTo?: string;
  dueDate: string;
  done: boolean;
}

export type CalendarEvent = BrandDealEvent | EpisodeEvent | ReminderEvent;
export type ViewMode = 'month' | 'week' | 'list' | 'gantt';

export interface FilterState {
  types: EventType[];
  shows: ShowName[];
  assignees: TeamMember[];
}

// A resolved calendar entry — one chip per visible date
export interface CalendarEntry {
  key: string;
  date: string;
  event: CalendarEvent;
  stage?: ProductionStage; // set for episode stage deadlines
  label: string;
  chipClass: string;
}

export const TEAM_MEMBERS: TeamMember[] = ['Roman', 'Timur', 'Albina', 'Victoria', 'Production'];
export const SHOW_NAMES: ShowName[] = ['Privileged Gossip', 'PF Interviews', 'RGM', 'Albina IG/TikTok', 'Other'];
export const BRAND_DEAL_STAGES: BrandDealStage[] = ['negotiation', 'contract', 'filming', 'edit', 'live', 'reporting'];

export const DEFAULT_STAGES: Omit<ProductionStage, 'id'>[] = [
  { name: 'Draft 1', status: 'not_started' },
  { name: 'Comments', status: 'not_started' },
  { name: 'Draft 2', status: 'not_started' },
  { name: 'Comments', status: 'not_started' },
  { name: 'Draft 3', status: 'not_started' },
  { name: 'Comments', status: 'not_started' },
  { name: 'Final', status: 'not_started' },
  { name: 'Graphics', status: 'not_started' },
  { name: 'Thumbnail', status: 'not_started' },
];

export const STAGE_STATUS_CYCLE: StageStatus[] = ['not_started', 'in_progress', 'done'];

export function nextStatus(current: StageStatus): StageStatus {
  const idx = STAGE_STATUS_CYCLE.indexOf(current);
  return STAGE_STATUS_CYCLE[(idx + 1) % STAGE_STATUS_CYCLE.length];
}
