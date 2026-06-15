import { useState, useEffect } from 'react';
import {
  CalendarEvent, BrandDealEvent, EpisodeEvent, ReminderEvent,
  EventType, TEAM_MEMBERS, SHOW_NAMES, BRAND_DEAL_STAGES, TeamMember, ShowName, BrandDealStage,
} from '../data/types';
import { generateId } from '../data/storage';

interface Props {
  editing: CalendarEvent | null;
  defaultType: EventType;
  defaultDate?: string;
  allEvents: CalendarEvent[];
  onSave: (event: CalendarEvent) => void;
  onClose: () => void;
}

const TYPE_TABS: { id: EventType; label: string }[] = [
  { id: 'episode', label: '📺 Episode' },
  { id: 'brand_deal', label: '💼 Brand Deal' },
  { id: 'reminder', label: '🔔 Reminder' },
];

function blank(type: EventType, defaultDate: string): CalendarEvent {
  const base = {
    id: generateId(),
    title: '',
    date: defaultDate,
    notes: '',
    assignees: [] as TeamMember[],
    createdAt: new Date().toISOString(),
  };
  if (type === 'brand_deal') return { ...base, type: 'brand_deal', brand: '', stage: 'negotiation', placement: '', rate: 0 };
  if (type === 'reminder') return { ...base, type: 'reminder', dueDate: defaultDate, done: false };
  return {
    ...base,
    type: 'episode',
    show: 'PF Interviews',
    episodeName: '',
    theme: '',
    scriptDueDate: '',
    filmingDate: '',
    editDeadline: '',
    publishDate: defaultDate,
    checklist: { scriptApproved: false, filmingDone: false, editSent: false, published: false },
    linkedDealIds: [],
  };
}

export default function EventModal({ editing, defaultType, defaultDate, allEvents, onSave, onClose }: Props) {
  const today = new Date().toISOString().split('T')[0];
  const [type, setType] = useState<EventType>(editing?.type ?? defaultType);
  const [form, setForm] = useState<CalendarEvent>(editing ?? blank(defaultType, defaultDate ?? today));

  useEffect(() => {
    if (!editing) setForm(blank(type, defaultDate ?? today));
  }, [type]);

  function setField<K extends keyof CalendarEvent>(key: K, value: CalendarEvent[K]) {
    setForm(prev => ({ ...prev, [key]: value }));
  }

  function toggleAssignee(a: TeamMember) {
    const cur = form.assignees;
    setField('assignees', cur.includes(a) ? cur.filter(x => x !== a) : [...cur, a]);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim() && form.type !== 'episode') return;
    const finalTitle = form.type === 'episode'
      ? ((form as EpisodeEvent).episodeName || form.title || 'Untitled Episode')
      : (form.title || 'Untitled');
    onSave({ ...form, title: finalTitle });
  }

  const ep = form.type === 'episode' ? form as EpisodeEvent : null;
  const bd = form.type === 'brand_deal' ? form as BrandDealEvent : null;
  const rem = form.type === 'reminder' ? form as ReminderEvent : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-900 text-lg">{editing ? 'Edit Event' : 'New Event'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">✕</button>
        </div>

        {/* Type tabs (only for new events) */}
        {!editing && (
          <div className="flex gap-1 px-5 pt-4">
            {TYPE_TABS.map(t => (
              <button
                key={t.id}
                type="button"
                onClick={() => setType(t.id)}
                className={`flex-1 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                  type === t.id
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {/* Episode fields */}
          {ep && (
            <>
              <FormRow label="Episode Name *">
                <Input value={ep.episodeName} onChange={v => setForm({ ...ep, episodeName: v } as EpisodeEvent)} placeholder="e.g. CEO Who Built From Nothing" />
              </FormRow>
              <FormRow label="Show">
                <Select value={ep.show} onChange={v => setForm({ ...ep, show: v as ShowName } as EpisodeEvent)} options={SHOW_NAMES} />
              </FormRow>
              <FormRow label="Theme / Topic">
                <Input value={ep.theme} onChange={v => setForm({ ...ep, theme: v } as EpisodeEvent)} placeholder="e.g. Entrepreneurship & Wealth" />
              </FormRow>
              <div className="grid grid-cols-2 gap-3">
                <FormRow label="✏️ Script Due">
                  <DateInput value={ep.scriptDueDate ?? ''} onChange={v => setForm({ ...ep, scriptDueDate: v } as EpisodeEvent)} />
                </FormRow>
                <FormRow label="🎬 Filming Date">
                  <DateInput value={ep.filmingDate ?? ''} onChange={v => setForm({ ...ep, filmingDate: v } as EpisodeEvent)} />
                </FormRow>
                <FormRow label="✂️ Edit Deadline">
                  <DateInput value={ep.editDeadline ?? ''} onChange={v => setForm({ ...ep, editDeadline: v } as EpisodeEvent)} />
                </FormRow>
                <FormRow label="🚀 Publish Date">
                  <DateInput value={ep.publishDate ?? ''} onChange={v => setForm({ ...ep, publishDate: v, date: v } as EpisodeEvent)} />
                </FormRow>
              </div>
            </>
          )}

          {/* Brand deal fields */}
          {bd && (
            <>
              <FormRow label="Title *">
                <Input value={bd.title} onChange={v => setField('title' as keyof CalendarEvent, v as CalendarEvent[keyof CalendarEvent])} placeholder="e.g. YouTube Integration — CEO Episode" />
              </FormRow>
              <FormRow label="Brand *">
                <Input value={bd.brand} onChange={v => setForm({ ...bd, brand: v } as BrandDealEvent)} placeholder="e.g. Qure Skincare" />
              </FormRow>
              <div className="grid grid-cols-2 gap-3">
                <FormRow label="Stage">
                  <Select value={bd.stage} onChange={v => setForm({ ...bd, stage: v as BrandDealStage } as BrandDealEvent)} options={[...BRAND_DEAL_STAGES]} />
                </FormRow>
                <FormRow label="Rate ($)">
                  <input
                    type="number"
                    value={bd.rate || ''}
                    onChange={e => setForm({ ...bd, rate: Number(e.target.value) } as BrandDealEvent)}
                    placeholder="3500"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
                  />
                </FormRow>
              </div>
              <FormRow label="Placement">
                <Input value={bd.placement} onChange={v => setForm({ ...bd, placement: v } as BrandDealEvent)} placeholder="e.g. YouTube Episode Integration" />
              </FormRow>
              <FormRow label="Date">
                <DateInput value={bd.date} onChange={v => setField('date' as keyof CalendarEvent, v as CalendarEvent[keyof CalendarEvent])} />
              </FormRow>
              <FormRow label="Linked Episode">
                <select
                  value={bd.linkedEpisodeId ?? ''}
                  onChange={e => setForm({ ...bd, linkedEpisodeId: e.target.value || undefined } as BrandDealEvent)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 bg-white"
                >
                  <option value="">— None —</option>
                  {allEvents.filter(e => e.type === 'episode').map(e => (
                    <option key={e.id} value={e.id}>
                      {(e as EpisodeEvent).episodeName || e.title}
                    </option>
                  ))}
                </select>
              </FormRow>
            </>
          )}

          {/* Reminder fields */}
          {rem && (
            <>
              <FormRow label="Reminder Title *">
                <Input value={rem.title} onChange={v => setField('title' as keyof CalendarEvent, v as CalendarEvent[keyof CalendarEvent])} placeholder="e.g. Send 30-day report to brand" />
              </FormRow>
              <FormRow label="Due Date">
                <DateInput value={rem.dueDate} onChange={v => setForm({ ...rem, dueDate: v, date: v } as ReminderEvent)} />
              </FormRow>
              <FormRow label="Related To (optional)">
                <Input value={rem.relatedTo ?? ''} onChange={v => setForm({ ...rem, relatedTo: v } as ReminderEvent)} placeholder="e.g. Qure Skincare deal" />
              </FormRow>
            </>
          )}

          {/* Common fields */}
          <FormRow label="Notes">
            <textarea
              value={form.notes}
              onChange={e => setField('notes' as keyof CalendarEvent, e.target.value as CalendarEvent[keyof CalendarEvent])}
              placeholder="Any notes..."
              rows={2}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 resize-none"
            />
          </FormRow>
          <FormRow label="Assignees">
            <div className="flex flex-wrap gap-2">
              {TEAM_MEMBERS.map(a => (
                <label key={a} className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium cursor-pointer border transition-colors ${
                  form.assignees.includes(a)
                    ? 'bg-gray-900 text-white border-gray-900'
                    : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400'
                }`}>
                  <input type="checkbox" checked={form.assignees.includes(a)} onChange={() => toggleAssignee(a)} className="sr-only" />
                  {a}
                </label>
              ))}
            </div>
          </FormRow>
        </form>

        {/* Footer */}
        <div className="border-t border-gray-100 px-5 py-3 flex gap-2 justify-end">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-5 py-2 bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold rounded-lg transition-colors"
          >
            {editing ? 'Save Changes' : 'Create'}
          </button>
        </div>
      </div>
    </div>
  );
}

function FormRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-500 mb-1">{label}</label>
      {children}
    </div>
  );
}

function Input({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <input
      type="text"
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
    />
  );
}

function DateInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <input
      type="date"
      value={value}
      onChange={e => onChange(e.target.value)}
      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
    />
  );
}

function Select({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: readonly string[] }) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 bg-white"
    >
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}
