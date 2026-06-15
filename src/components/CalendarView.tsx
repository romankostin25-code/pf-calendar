import {
  startOfMonth, endOfMonth, eachDayOfInterval, getDay,
  isSameDay, isSameMonth, format, parseISO,
} from 'date-fns';
import { CalendarEvent, CalendarEntry } from '../data/types';
import { toCalendarEntries } from '../utils/calendarEntries';

interface Props {
  currentDate: Date;
  events: CalendarEvent[];
  onSelectEntry: (entry: CalendarEntry) => void;
  onDayClick: (date: Date) => void;
}

const DAY_HEADERS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function CalendarView({ currentDate, events, onSelectEntry, onDayClick }: Props) {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const leadCount = getDay(monthStart);
  const trailCount = (7 - ((leadCount + days.length) % 7)) % 7;
  const cells: (Date | null)[] = [
    ...Array(leadCount).fill(null),
    ...days,
    ...Array(trailCount).fill(null),
  ];

  const allEntries = toCalendarEntries(events);
  const today = new Date();

  function entriesForDay(day: Date): CalendarEntry[] {
    return allEntries.filter(e => isSameDay(parseISO(e.date), day));
  }

  return (
    <div className="h-full flex flex-col">
      {/* Day-of-week headers */}
      <div className="grid grid-cols-7 border-b border-gray-200 bg-white">
        {DAY_HEADERS.map(d => (
          <div key={d} className="py-2 text-center text-xs font-semibold text-gray-400 uppercase tracking-wide">
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="flex-1 grid grid-cols-7 auto-rows-fr border-l border-t border-gray-200 overflow-hidden">
        {cells.map((day, i) => {
          if (!day) {
            return <div key={`empty-${i}`} className="border-r border-b border-gray-100 bg-gray-50/50" />;
          }

          const dayEntries = entriesForDay(day);
          const isToday = isSameDay(day, today);
          const isCurrentMonth = isSameMonth(day, currentDate);
          const MAX_VISIBLE = 3;
          const visible = dayEntries.slice(0, MAX_VISIBLE);
          const overflow = dayEntries.length - MAX_VISIBLE;

          return (
            <div
              key={day.toISOString()}
              className={`border-r border-b border-gray-200 p-1 flex flex-col min-h-0 ${
                isCurrentMonth ? 'bg-white' : 'bg-gray-50'
              }`}
            >
              {/* Day number */}
              <button
                onClick={() => onDayClick(day)}
                className={`w-6 h-6 flex items-center justify-center text-xs font-medium rounded-full mb-0.5 flex-shrink-0 self-end ${
                  isToday
                    ? 'bg-violet-600 text-white'
                    : isCurrentMonth
                    ? 'text-gray-700 hover:bg-gray-100'
                    : 'text-gray-300'
                }`}
              >
                {format(day, 'd')}
              </button>

              {/* Event chips */}
              <div className="flex flex-col gap-0.5 overflow-hidden">
                {visible.map(entry => (
                  <button
                    key={entry.key}
                    onClick={e => { e.stopPropagation(); onSelectEntry(entry); }}
                    className={`chip text-left w-full ${entry.chipClass}`}
                    title={entry.label}
                  >
                    {entry.label}
                  </button>
                ))}
                {overflow > 0 && (
                  <span className="text-xs text-gray-400 pl-1">+{overflow} more</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
