import { parseISO, format, isBefore, startOfDay } from 'date-fns';
import { CalendarEvent, CalendarEntry } from '../data/types';
import { toCalendarEntries } from '../utils/calendarEntries';

interface Props {
  events: CalendarEvent[];
  onSelectEntry: (entry: CalendarEntry) => void;
}

const STAGE_COLORS: Record<string, string> = {
  negotiation: 'bg-gray-100 text-gray-600',
  contract: 'bg-yellow-100 text-yellow-700',
  filming: 'bg-blue-100 text-blue-700',
  edit: 'bg-sky-100 text-sky-700',
  live: 'bg-green-100 text-green-700',
  reporting: 'bg-purple-100 text-purple-700',
};

export default function ListView({ events, onSelectEntry }: Props) {
  const entries = toCalendarEntries(events)
    .sort((a, b) => a.date.localeCompare(b.date));

  const today = startOfDay(new Date());
  const past = entries.filter(e => isBefore(parseISO(e.date), today));
  const upcoming = entries.filter(e => !isBefore(parseISO(e.date), today));

  function renderEntry(entry: CalendarEntry) {
    const ev = entry.event;
    return (
      <button
        key={entry.key}
        onClick={() => onSelectEntry(entry)}
        className="w-full text-left flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
      >
        {/* Date column */}
        <div className="flex-shrink-0 w-16 text-right">
          <div className="text-sm font-semibold text-gray-700">{format(parseISO(entry.date), 'MMM d')}</div>
          <div className="text-xs text-gray-400">{format(parseISO(entry.date), 'EEE')}</div>
        </div>

        {/* Chip + details */}
        <div className="flex-1 min-w-0">
          <span className={`chip ${entry.chipClass} mb-1`}>{entry.label}</span>

          {ev.type === 'brand_deal' && (
            <div className="flex items-center gap-2 mt-1">
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STAGE_COLORS[ev.stage]}`}>
                {ev.stage}
              </span>
              <span className="text-xs text-gray-400">${ev.rate.toLocaleString()}</span>
            </div>
          )}
          {ev.type === 'episode' && (
            <div className="text-xs text-gray-400 mt-0.5">{ev.show}</div>
          )}
          {ev.type === 'reminder' && ev.relatedTo && (
            <div className="text-xs text-gray-400 mt-0.5 truncate">{ev.relatedTo}</div>
          )}

          {ev.notes && (
            <div className="text-xs text-gray-500 mt-1 line-clamp-1">{ev.notes}</div>
          )}
          {ev.assignees.length > 0 && (
            <div className="flex gap-1 mt-1 flex-wrap">
              {ev.assignees.map(a => (
                <span key={a} className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">{a}</span>
              ))}
            </div>
          )}
        </div>
      </button>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      {upcoming.length > 0 && (
        <section>
          <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-2">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Upcoming</span>
          </div>
          {upcoming.map(renderEntry)}
        </section>
      )}

      {past.length > 0 && (
        <section className="opacity-60">
          <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-2">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Past</span>
          </div>
          {past.map(renderEntry)}
        </section>
      )}

      {entries.length === 0 && (
        <div className="flex items-center justify-center h-64 text-gray-400">
          <div className="text-center">
            <div className="text-4xl mb-2">📭</div>
            <div className="text-sm">No events match the current filters</div>
          </div>
        </div>
      )}
    </div>
  );
}
