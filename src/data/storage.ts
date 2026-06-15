import { CalendarEvent } from './types';
import { sampleEvents } from './sampleEvents';

const STORAGE_KEY = 'pf-calendar-events';

export function loadEvents(): CalendarEvent[] {
  try {
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
