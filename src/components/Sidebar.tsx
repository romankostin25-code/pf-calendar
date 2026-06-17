import { CalendarEvent, EventType, FilterState, ShowName, TeamMember, SHOW_NAMES, TEAM_MEMBERS, ViewMode } from '../data/types';

interface Props {
  view: ViewMode;
  onViewChange: (v: ViewMode) => void;
  filters: FilterState;
  onFiltersChange: (f: FilterState) => void;
  events: CalendarEvent[];
  onNewEvent: () => void;
}

function toggle<T>(arr: T[], item: T): T[] {
  return arr.includes(item) ? arr.filter(x => x !== item) : [...arr, item];
}

const VIEW_LABELS: { id: ViewMode; label: string; icon: string }[] = [
  { id: 'month', label: 'Month', icon: '▦' },
  { id: 'week', label: 'Week', icon: '☰' },
  { id: 'list', label: 'List', icon: '≡' },
  { id: 'gantt', label: 'Gantt', icon: '▬' },
];

const TYPE_CONFIG: { id: EventType; label: string; color: string }[] = [
  { id: 'brand_deal', label: 'Brand Deals', color: 'bg-violet-500' },
  { id: 'episode', label: 'Episodes', color: 'bg-blue-500' },
  { id: 'reminder', label: 'Reminders', color: 'bg-amber-500' },
];

export default function Sidebar({ view, onViewChange, filters, onFiltersChange, events, onNewEvent }: Props) {
  const dueReminders = events.filter(
    e => e.type === 'reminder' && !e.done &&
    new Date(e.dueDate) <= new Date(Date.now() + 7 * 86400000)
  ).length;

  function toggleType(t: EventType) { onFiltersChange({ ...filters, types: toggle(filters.types, t) }); }
  function toggleShow(s: ShowName) { onFiltersChange({ ...filters, shows: toggle(filters.shows, s) }); }
  function toggleAssignee(a: TeamMember) { onFiltersChange({ ...filters, assignees: toggle(filters.assignees, a) }); }

  return (
    <aside className="w-56 flex-shrink-0 bg-gray-900 text-gray-200 flex flex-col h-screen overflow-y-auto">
      {/* Logo */}
      <div className="px-4 py-5 border-b border-gray-700">
        <div className="text-xs font-semibold tracking-widest text-gray-400 uppercase">Privileged Few</div>
        <div className="text-white font-bold text-lg leading-tight">Production</div>
        <div className="text-gray-400 text-sm">Calendar</div>
      </div>

      {/* New event */}
      <div className="px-4 pt-4">
        <button
          onClick={onNewEvent}
          className="w-full bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold py-2 px-3 rounded-lg transition-colors"
        >
          + New Event
        </button>
      </div>

      {/* Views */}
      <div className="px-4 pt-5">
        <div className="text-xs font-semibold tracking-wider text-gray-500 uppercase mb-2">View</div>
        {VIEW_LABELS.map(v => (
          <button
            key={v.id}
            onClick={() => onViewChange(v.id)}
            className={`w-full flex items-center gap-2 px-3 py-1.5 rounded text-sm mb-0.5 transition-colors ${
              view === v.id ? 'bg-gray-700 text-white font-semibold' : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
            }`}
          >
            <span className="text-base">{v.icon}</span>
            {v.label}
            {v.id === 'gantt' && <span className="ml-auto text-xs text-gray-500 bg-gray-800 px-1.5 py-0.5 rounded">post-prod</span>}
          </button>
        ))}
      </div>

      {/* Type filters */}
      <div className="px-4 pt-5">
        <div className="text-xs font-semibold tracking-wider text-gray-500 uppercase mb-2">Type</div>
        {TYPE_CONFIG.map(({ id, label, color }) => (
          <label key={id} className="flex items-center gap-2 px-1 py-1 cursor-pointer">
            <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${color} ${filters.types.includes(id) ? 'opacity-100' : 'opacity-30'}`} />
            <span className={`text-sm ${filters.types.includes(id) ? 'text-gray-200' : 'text-gray-500'}`}>{label}</span>
            <input type="checkbox" className="sr-only" checked={filters.types.includes(id)} onChange={() => toggleType(id)} />
          </label>
        ))}
      </div>

      {/* Show filters */}
      <div className="px-4 pt-4">
        <div className="text-xs font-semibold tracking-wider text-gray-500 uppercase mb-2">Shows</div>
        {SHOW_NAMES.map(s => (
          <label key={s} className="flex items-center gap-2 px-1 py-0.5 cursor-pointer">
            <input type="checkbox" className="w-3 h-3 accent-blue-500" checked={filters.shows.includes(s)} onChange={() => toggleShow(s)} />
            <span className={`text-xs ${filters.shows.includes(s) ? 'text-gray-300' : 'text-gray-600'}`}>{s}</span>
          </label>
        ))}
      </div>

      {/* Team filters */}
      <div className="px-4 pt-4">
        <div className="text-xs font-semibold tracking-wider text-gray-500 uppercase mb-2">Team</div>
        {TEAM_MEMBERS.map(a => (
          <label key={a} className="flex items-center gap-2 px-1 py-0.5 cursor-pointer">
            <input type="checkbox" className="w-3 h-3 accent-violet-500" checked={filters.assignees.includes(a)} onChange={() => toggleAssignee(a)} />
            <span className={`text-xs ${filters.assignees.includes(a) ? 'text-gray-300' : 'text-gray-600'}`}>{a}</span>
          </label>
        ))}
      </div>

      {/* Reminders badge */}
      {dueReminders > 0 && (
        <div className="mx-4 mt-auto mb-4 pt-4">
          <div className="bg-amber-900/40 border border-amber-700/50 rounded-lg px-3 py-2">
            <div className="text-amber-400 text-xs font-semibold">
              🔔 {dueReminders} reminder{dueReminders > 1 ? 's' : ''} due this week
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
