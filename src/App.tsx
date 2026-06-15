import { useState, useEffect } from 'react';
import { addMonths, subMonths, addWeeks, subWeeks, format } from 'date-fns';

import { CalendarEvent, CalendarEntry, EventType, EpisodeEvent, FilterState, ViewMode } from './data/types';
import { loadEvents, saveEvents } from './data/storage';

import Sidebar from './components/Sidebar';
import CalendarView from './components/CalendarView';
import WeekView from './components/WeekView';
import ListView from './components/ListView';
import EventModal from './components/EventModal';
import EventDetail from './components/EventDetail';

const DEFAULT_FILTERS: FilterState = {
  types: ['brand_deal', 'episode', 'reminder'],
  shows: ['PF Interviews', 'Rich Kid Explains', 'Albina IG/TikTok', 'Other'],
  assignees: ['Roman', 'Timur', 'Albina', 'Victoria', 'Production'],
};

export default function App() {
  const [events, setEvents] = useState<CalendarEvent[]>(loadEvents);
  const [view, setView] = useState<ViewMode>('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [selectedEntry, setSelectedEntry] = useState<CalendarEntry | null>(null);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [defaultModalType, setDefaultModalType] = useState<EventType>('episode');
  const [defaultModalDate, setDefaultModalDate] = useState<string>('');

  useEffect(() => { saveEvents(events); }, [events]);

  const filteredEvents = events.filter(ev => {
    if (!filters.types.includes(ev.type)) return false;
    if (ev.type === 'episode') {
      const ep = ev as EpisodeEvent;
      if (!filters.shows.includes(ep.show)) return false;
    }
    if (ev.assignees.length > 0 && !ev.assignees.some(a => filters.assignees.includes(a))) return false;
    return true;
  });

  function handleSave(event: CalendarEvent) {
    setEvents(prev => {
      const exists = prev.some(e => e.id === event.id);
      return exists ? prev.map(e => e.id === event.id ? event : e) : [...prev, event];
    });
    setShowModal(false);
    setEditingEvent(null);
  }

  function handleDelete(id: string) {
    setEvents(prev => prev.filter(e => e.id !== id));
    setSelectedEntry(null);
  }

  function handleToggleReminderDone(id: string) {
    setEvents(prev => prev.map(e =>
      e.id === id && e.type === 'reminder' ? { ...e, done: !e.done } : e
    ));
    // Refresh selected entry chip styling
    setSelectedEntry(null);
  }

  function handleToggleChecklist(episodeId: string, key: keyof EpisodeEvent['checklist']) {
    setEvents(prev => prev.map(e => {
      if (e.id !== episodeId || e.type !== 'episode') return e;
      const ep = e as EpisodeEvent;
      return { ...ep, checklist: { ...ep.checklist, [key]: !ep.checklist[key] } };
    }));
  }

  function openNew(type: EventType = 'episode', date?: Date) {
    setDefaultModalType(type);
    setDefaultModalDate(date ? date.toISOString().split('T')[0] : '');
    setEditingEvent(null);
    setShowModal(true);
  }

  function navigate(dir: 'prev' | 'next') {
    if (view === 'week') {
      setCurrentDate(prev => dir === 'next' ? addWeeks(prev, 1) : subWeeks(prev, 1));
    } else {
      setCurrentDate(prev => dir === 'next' ? addMonths(prev, 1) : subMonths(prev, 1));
    }
  }

  function navLabel() {
    if (view === 'week') {
      const ws = new Date(currentDate);
      ws.setDate(ws.getDate() - ws.getDay());
      const we = new Date(ws);
      we.setDate(we.getDate() + 6);
      return `${format(ws, 'MMM d')} – ${format(we, 'MMM d, yyyy')}`;
    }
    return format(currentDate, 'MMMM yyyy');
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar
        view={view}
        onViewChange={setView}
        filters={filters}
        onFiltersChange={setFilters}
        events={events}
        onNewEvent={() => openNew()}
      />

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="flex items-center justify-between px-5 py-3 bg-white border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('prev')}
              className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-800 transition-colors"
            >
              ◀
            </button>
            <h1 className="text-base font-bold text-gray-800 min-w-44 text-center">{navLabel()}</h1>
            <button
              onClick={() => navigate('next')}
              className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-800 transition-colors"
            >
              ▶
            </button>
            <button
              onClick={() => setCurrentDate(new Date())}
              className="ml-1 text-xs font-medium text-gray-500 hover:text-gray-800 px-2 py-1 rounded border border-gray-200 hover:border-gray-400 transition-colors"
            >
              Today
            </button>
          </div>

          <button
            onClick={() => openNew()}
            className="bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
          >
            + New Event
          </button>
        </header>

        {/* View */}
        <main className="flex-1 overflow-hidden">
          {view === 'month' && (
            <CalendarView
              currentDate={currentDate}
              events={filteredEvents}
              onSelectEntry={setSelectedEntry}
              onDayClick={date => openNew('episode', date)}
            />
          )}
          {view === 'week' && (
            <WeekView
              currentDate={currentDate}
              events={filteredEvents}
              onSelectEntry={setSelectedEntry}
            />
          )}
          {view === 'list' && (
            <ListView
              events={filteredEvents}
              onSelectEntry={setSelectedEntry}
            />
          )}
        </main>
      </div>

      {/* Detail panel */}
      {selectedEntry && (
        <EventDetail
          entry={selectedEntry}
          allEvents={events}
          onClose={() => setSelectedEntry(null)}
          onEdit={ev => {
            setEditingEvent(ev);
            setShowModal(true);
            setSelectedEntry(null);
          }}
          onDelete={handleDelete}
          onToggleReminderDone={handleToggleReminderDone}
          onToggleChecklist={handleToggleChecklist}
        />
      )}

      {/* Create / edit modal */}
      {showModal && (
        <EventModal
          editing={editingEvent}
          defaultType={defaultModalType}
          defaultDate={defaultModalDate}
          allEvents={events}
          onSave={handleSave}
          onClose={() => { setShowModal(false); setEditingEvent(null); }}
        />
      )}
    </div>
  );
}
