export type EventType = 'brand_deal' | 'episode' | 'reminder';
export type BrandDealStage = 'negotiation' | 'contract' | 'filming' | 'edit' | 'live' | 'reporting';
export type ShowName = 'PF Interviews' | 'Rich Kid Explains' | 'Albina IG/TikTok' | 'Other';
export type TeamMember = 'Roman' | 'Timur' | 'Albina' | 'Victoria' | 'Production';
export type EpisodeMilestone = 'script' | 'filming' | 'edit' | 'publish';

export interface BaseEvent {
  id: string;
  type: EventType;
  title: string;
  date: string; // ISO date — primary date (publish date for episodes)
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
  // Production pipeline dates — each shows as its own chip on the calendar
  scriptDueDate?: string;
  filmingDate?: string;
  editDeadline?: string;
  publishDate?: string;
  checklist: {
    scriptApproved: boolean;
    filmingDone: boolean;
    editSent: boolean;
    published: boolean;
  };
  linkedDealIds: string[];
}

export interface ReminderEvent extends BaseEvent {
  type: 'reminder';
  relatedTo?: string;
  dueDate: string;
  done: boolean;
}

export type CalendarEvent = BrandDealEvent | EpisodeEvent | ReminderEvent;
export type ViewMode = 'month' | 'week' | 'list';

export interface FilterState {
  types: EventType[];
  shows: ShowName[];
  assignees: TeamMember[];
}

// A resolved calendar entry — one per visible date chip
export interface CalendarEntry {
  key: string;
  date: string; // ISO date string
  event: CalendarEvent;
  milestone?: EpisodeMilestone; // set for episode sub-dates
  label: string;
  chipClass: string; // tailwind bg+text classes
}

export const TEAM_MEMBERS: TeamMember[] = ['Roman', 'Timur', 'Albina', 'Victoria', 'Production'];
export const SHOW_NAMES: ShowName[] = ['PF Interviews', 'Rich Kid Explains', 'Albina IG/TikTok', 'Other'];
export const BRAND_DEAL_STAGES: BrandDealStage[] = ['negotiation', 'contract', 'filming', 'edit', 'live', 'reporting'];
