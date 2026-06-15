import { CalendarEvent, CalendarEntry, EpisodeEvent } from '../data/types';

const CHIP = {
  brand_deal: 'bg-violet-100 text-violet-800 border-violet-200',
  script: 'bg-pink-100 text-pink-800 border-pink-200',
  filming: 'bg-blue-100 text-blue-800 border-blue-200',
  edit: 'bg-sky-100 text-sky-800 border-sky-200',
  publish: 'bg-green-100 text-green-800 border-green-200',
  reminder: 'bg-amber-100 text-amber-800 border-amber-200',
};

function episodeEntries(ep: EpisodeEvent): CalendarEntry[] {
  const entries: CalendarEntry[] = [];

  if (ep.scriptDueDate) {
    entries.push({
      key: `${ep.id}-script`,
      date: ep.scriptDueDate,
      event: ep,
      milestone: 'script',
      label: `✏️ Script: ${ep.episodeName || ep.title}`,
      chipClass: CHIP.script,
    });
  }
  if (ep.filmingDate) {
    entries.push({
      key: `${ep.id}-filming`,
      date: ep.filmingDate,
      event: ep,
      milestone: 'filming',
      label: `🎬 Film: ${ep.episodeName || ep.title}`,
      chipClass: CHIP.filming,
    });
  }
  if (ep.editDeadline) {
    entries.push({
      key: `${ep.id}-edit`,
      date: ep.editDeadline,
      event: ep,
      milestone: 'edit',
      label: `✂️ Edit: ${ep.episodeName || ep.title}`,
      chipClass: CHIP.edit,
    });
  }
  if (ep.publishDate) {
    entries.push({
      key: `${ep.id}-publish`,
      date: ep.publishDate,
      event: ep,
      milestone: 'publish',
      label: `🚀 Publish: ${ep.episodeName || ep.title}`,
      chipClass: CHIP.publish,
    });
  }

  // Fallback: if no milestone dates, show on main date
  if (entries.length === 0) {
    entries.push({
      key: ep.id,
      date: ep.date,
      event: ep,
      label: `📺 ${ep.episodeName || ep.title}`,
      chipClass: CHIP.filming,
    });
  }

  return entries;
}

export function toCalendarEntries(events: CalendarEvent[]): CalendarEntry[] {
  const entries: CalendarEntry[] = [];

  for (const ev of events) {
    if (ev.type === 'episode') {
      entries.push(...episodeEntries(ev));
    } else if (ev.type === 'brand_deal') {
      entries.push({
        key: ev.id,
        date: ev.date,
        event: ev,
        label: `💼 ${ev.brand}: ${ev.title}`,
        chipClass: CHIP.brand_deal,
      });
    } else if (ev.type === 'reminder') {
      entries.push({
        key: ev.id,
        date: ev.dueDate,
        event: ev,
        label: `🔔 ${ev.title}`,
        chipClass: ev.done ? 'bg-gray-100 text-gray-400 border-gray-200 line-through' : CHIP.reminder,
      });
    }
  }

  return entries;
}
