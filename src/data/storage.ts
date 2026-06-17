import { CalendarEvent } from './types';
import { sampleEvents } from './sampleEvents';

const STORAGE_KEY = 'pf-calendar-events';
const VERSION_KEY = 'pf-calendar-version';
const VERSION = 'v2'; // bump when data model changes to force fresh sample data

export function loadEvents(): CalendarEvent[] {
  try {
    const version = localStorage.getItem(VERSION_KEY);
    if (version !== VERSION) {
      // Model changed — clear old data and load fresh samples
      localStorage.removeItem(STORAGE_KEY);
      localStorage.setItem(VERSION_KEY, VERSION);
      saveEvents(sampleEvents);
      return sampleEvents;
    }
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      saveEvents(sampleEvents);
      return sampleEvents;
    }
    return JSON.parse(raw) as CalendarEvent[];
  } catch {
    return sampleEvents;
  }
}

export function saveEvents(events: CalendarEvent[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}
