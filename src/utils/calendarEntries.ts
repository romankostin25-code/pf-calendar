import { CalendarEvent, CalendarEntry, EpisodeEvent } from '../data/types';

const CHIP = {
  brand_deal: 'bg-violet-100 text-violet-800 border-violet-200',
  reminder: 'bg-amber-100 text-amber-800 border-amber-200',
  reminder_done: 'bg-gray-100 text-gray-400 border-gray-200 line-through',
  stage_done: 'bg-green-100 text-green-700 border-green-200',
  stage_in_progress: 'bg-blue-100 text-blue-800 border-blue-200',
  stage_not_started: 'bg-gray-100 text-gray-500 border-gray-200',
};

function stageChipClass(status: string): string {
  if (status === 'done') return CHIP.stage_done;
  if (status === 'in_progress') return CHIP.stage_in_progress;
  return CHIP.stage_not_started;
}

const STAGE_ICONS: Record<string, string> = {
  'Draft 1': '📝', 'Draft 2': '📝', 'Draft 3': '📝', 'Draft 4': '📝', 'Draft 5': '📝',
  'Comments': '💬', 'Comments 1': '💬', 'Comments 2': '💬', 'Comments 3': '💬',
  'Final': '✅', 'Final draft': '✅',
  'Graphics': '🎨',
  'Thumbnail': '🖼️',
  'Insets': '🔲',
  'Publishing': '🚀',
  'Filming': '🎬',
  'Color Grading': '🎨',
  'Editing': '✂️',
};

function stageIcon(name: string): string {
  return STAGE_ICONS[name] ?? '•';
}

function episodeEntries(ep: EpisodeEvent): CalendarEntry[] {
  const entries: CalendarEntry[] = [];

  for (const stage of ep.stages) {
    const date = stage.endDate;
    if (!date) continue;
    entries.push({
      key: `${ep.id}-${stage.id}`,
      date,
      event: ep,
      stage,
      label: `${stageIcon(stage.name)} ${stage.name}: ${ep.episodeName || ep.title}`,
      chipClass: stageChipClass(stage.status),
    });
  }

  // Fallback: if no stages have dates, show episode on its main date
  if (entries.length === 0) {
    entries.push({
      key: ep.id,
      date: ep.date,
      event: ep,
      label: `📺 ${ep.episodeName || ep.title}`,
      chipClass: CHIP.stage_not_started,
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
        chipClass: ev.done ? CHIP.reminder_done : CHIP.reminder,
      });
    }
  }

  return entries;
}
