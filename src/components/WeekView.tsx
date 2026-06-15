import { startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, format, parseISO, isToday } from 'date-fns';
import { CalendarEvent, CalendarEntry } from '../data/types';
import { toCalendarEntries } from '../utils/calendarEntries';

interface Props {
  currentDate: Date;
  events: CalendarEvent[];
  onSelectEntry: (entry: CalendarEntry) => void;
}

export default function WeekView({ currentDate, events, onSelectEntry }: Props) {
  const weekStart = startOfWeek(currentDate);
  const weekEnd = endOfWeek(currentDate);
  const days = eachDayOfInterval({ start: weekStart, end: weekEnd });
  const allEntries = toCalendarEntries(events);

  function entriesForDay(day: Date): CalendarEntry[] {
    return allEntries.filter(e => isSameDay(parseISO(e.date), day));
  }

  return (
    <div className="h-full flex flex-col overflow-auto">
      {/* Day headers */}
      <div className="grid grid-cols-7 border-b border-gray-200 bg-white sticky top-0 z-10">
        {days.map(day => (
          <div
            key={day.toISOString()}
            className={`py-3 text-center border-r border-gray-100 last:border-r-0 ${isToday(day) ? 'bg-violet-50' : ''}`}
          >
            <div className="text-xs text-gray-400 uppercase tracking-wide font-medium">{format(day, 'EEE')}</div>
            <div className={`text-xl font-semibold mt-0.5 ${isToday(day) ? 'text-violet-600' : 'text-gray-800'}`}>
              {format(day, 'd')}
            </div>
          </div>
        ))}
      </div>

      {/* Day columns */}
      <div className="flex-1 grid grid-cols-7 border-l border-gray-200">
        {days.map(day => {
          const dayEntries = entriesForDay(day);
          return (
            <div
              key={day.toISOString()}
              className={`border-r border-b border-gray-200 p-2 flex flex-col gap-1.5 min-h-32 ${
                isToday(day) ? 'bg-violet-50/40' : 'bg-white'
              }`}
            >
              {dayEntries.length === 0 && (
                <span className="text-xs text-gray-300 italic">—</span>
              )}
              {dayEntries.map(entry => (
                <button
                  key={entry.key}
                  onClick={() => onSelectEntry(entry)}
                  className={`chip text-left w-full whitespace-normal leading-snug ${entry.chipClass}`}
                >
                  {entry.label}
                </button>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
