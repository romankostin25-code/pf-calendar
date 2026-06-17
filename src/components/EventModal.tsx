import { useState, useEffect } from 'react';
import {
  CalendarEvent, BrandDealEvent, EpisodeEvent, ReminderEvent,
  EventType, ProductionStage, StageStatus,
  TEAM_MEMBERS, SHOW_NAMES, BRAND_DEAL_STAGES, DEFAULT_STAGES,
  TeamMember, ShowName, BrandDealStage,
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

const STATUS_OPTIONS: { value: StageStatus; label: string }[] = [
  { value: 'not_started', label: '○ Not started' },
  { value: 'in_progress', label: '⏳ In progress' },
  { value: 'done', label: '✓ Done' },
];

function blankStages(): ProductionStage[] {
  return DEFAULT_STAGES.map(s => ({ ...s, id: generateId() }));
}

function blank(type: EventType, defaultDate: string): CalendarEvent {
  const base = {
    id: generateId(),
    title: '',
    date: defaultDate,
    notes: '',
    assignees: [] as TeamMember[],
    createdAt: new Date().toISOString(),
  };
  if (type === 'brand_deal') {
    return { ...base, type: 'brand_deal', brand: '', stage: 'negotiation', placement: '', rate: 0 };
  }
  if (type === 'reminder') {
    return { ...base, type: 'reminder', dueDate: defaultDate, done: false };
  }
  return {
    ...base,
    type: 'episode',
    show: 'Privileged Gossip',
    episodeName: '',
    theme: '',
    stages: blankStages(),
    linkedDealIds: [],
  };
}

export default function EventModal({ editing, defaultType, defaultDate, allEvents, onSave, onClose }: Props) {
  const today = new Date().toISOString().split('T')[0];
  const [type, setType] = useState<EventType>(editing?.type ?? defaultType);
  const [form, setForm] = useState<CalendarEvent>(editing ?? blank(defaultType, defaultDate ?? today));
  const [stagesOpen, setStagesOpen] = useState(true);

  useEffect(() => {
    if (!editing) setForm(blank(type, defaultDate ?? today));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type]);

  function setField<K extends keyof CalendarEvent>(key: K, value: CalendarEvent[K]) {
    setForm(prev => ({ ...prev, [key]: value }));
  }

  function toggleAssignee(a: TeamMember) {
    const cur = form.assignees;
    setField('assignees', cur.includes(a) ? cur.filter(x => x !== a) : [...cur, a]);
  }

  // Stage helpers (episode only)
  function updateStage(stageId: string, patch: Partial<ProductionStage>) {
    if (form.type !== 'episode') return;
    const ep = form as EpisodeEvent;
    setForm({ ...ep, stages: ep.stages.map(s => s.id === stageId ? { ...s, ...patch } : s) });
  }

  function removeStage(stageId: string) {
    if (form.type !== 'episode') return;
    const ep = form as EpisodeEvent;
    setForm({ ...ep, stages: ep.stages.filter(s => s.id !== stageId) });
  }

  function addStage() {
    if (form.type !== 'episode') return;
    const ep = form as EpisodeEvent;
    setForm({ ...ep, stages: [...ep.stages, { id: generateId(), name: '', status: 'not_started' }] });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
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
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[92vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 flex-shrink-0">
          <h2 className="font-bold text-gray-900 text-lg">{editing ? 'Edit Event' : 'New Event'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">✕</button>
        </div>

        {/* Type tabs (new only) */}
        {!editing && (
          <div className="flex gap-1 px-5 pt-4 flex-shrink-0">
            {TYPE_TABS.map(t => (
              <button
                key={t.id}
                type="button"
                onClick={() => setType(t.id)}
                className={`flex-1 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                  type === t.id ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        )}

        {/* Form body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-5 py-4 space-y-4">

          {/* ── EPISODE ── */}
          {ep && (
            <>
              <Row label="Episode Name *">
                <Input value={ep.episodeName} onChange={v => setForm({ ...ep, episodeName: v } as EpisodeEvent)} placeholder="e.g. S6E1 29 Advice" />
              </Row>
              <div className="grid grid-cols-2 gap-3">
                <Row label="Show">
                  <Select value={ep.show} onChange={v => setForm({ ...ep, show: v as ShowName } as EpisodeEvent)} options={[...SHOW_NAMES]} />
                </Row>
                <Row label="🚀 Publish Date">
                  <DateIn value={ep.date} onChange={v => setForm({ ...ep, date: v } as EpisodeEvent)} />
                </Row>
              </div>
              <Row label="Theme / Topic">
                <Input value={ep.theme} onChange={v => setForm({ ...ep, theme: v } as EpisodeEvent)} placeholder="e.g. 29 pieces of advice before turning 30" />
              </Row>

              {/* Production Stages */}
              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <button
                  type="button"
                  onClick={() => setStagesOpen(o => !o)}
                  className="w-full flex items-center justify-between px-3 py-2.5 bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                    Production Stages ({ep.stages.length})
                  </span>
                  <span className="text-gray-400 text-sm">{stagesOpen ? '▲' : '▼'}</span>
                </button>

                {stagesOpen && (
                  <div className="p-2 space-y-1.5">
                    {ep.stages.map((stage, idx) => (
                      <div key={stage.id} className="grid grid-cols-[1fr_90px_90px_100px_24px] gap-1.5 items-center">
                        <input
                          type="text"
                          value={stage.name}
                          onChange={e => updateStage(stage.id, { name: e.target.value })}
                          placeholder={`Stage ${idx + 1}`}
                          className="border border-gray-200 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-violet-400"
                        />
                        <input
                          type="date"
                          value={stage.startDate ?? ''}
                          onChange={e => updateStage(stage.id, { startDate: e.target.value || undefined })}
                          className="border border-gray-200 rounded px-1.5 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-violet-400"
                        />
                        <input
                          type="date"
                          value={stage.endDate ?? ''}
                          onChange={e => updateStage(stage.id, { endDate: e.target.value || undefined })}
                          className="border border-gray-200 rounded px-1.5 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-violet-400"
                        />
                        <select
                          value={stage.status}
                          onChange={e => updateStage(stage.id, { status: e.target.value as StageStatus })}
                          className="border border-gray-200 rounded px-1.5 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-violet-400 bg-white"
                        >
                          {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                        <button type="button" onClick={() => removeStage(stage.id)} className="text-gray-300 hover:text-red-400 text-sm leading-none">✕</button>
                      </div>
                    ))}
                    {/* Column labels */}
                    <div className="grid grid-cols-[1fr_90px_90px_100px_24px] gap-1.5 pt-0.5">
                      <span className="text-xs text-gray-400">Stage name</span>
                      <span className="text-xs text-gray-400">Start</span>
                      <span className="text-xs text-gray-400">End</span>
                      <span className="text-xs text-gray-400">Status</span>
                      <span />
                    </div>
                    <button
                      type="button"
                      onClick={addStage}
                      className="mt-1 text-xs text-violet-600 hover:text-violet-800 font-medium"
                    >
                      + Add stage
                    </button>
                  </div>
                )}
              </div>
            </>
          )}

          {/* ── BRAND DEAL ── */}
          {bd && (
            <>
              <Row label="Title *">
                <Input value={bd.title} onChange={v => setField('title' as keyof CalendarEvent, v as CalendarEvent[keyof CalendarEvent])} placeholder="e.g. YouTube Integration — Business Myths" />
              </Row>
              <Row label="Brand *">
                <Input value={bd.brand} onChange={v => setForm({ ...bd, brand: v } as BrandDealEvent)} placeholder="e.g. Qure Skincare" />
              </Row>
              <div className="grid grid-cols-2 gap-3">
                <Row label="Stage">
                  <Select value={bd.stage} onChange={v => setForm({ ...bd, stage: v as BrandDealStage } as BrandDealEvent)} options={[...BRAND_DEAL_STAGES]} />
                </Row>
                <Row label="Rate ($)">
                  <input
                    type="number"
                    value={bd.rate || ''}
                    onChange={e => setForm({ ...bd, rate: Number(e.target.value) } as BrandDealEvent)}
                    placeholder="3500"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
                  />
                </Row>
              </div>
              <Row label="Placement">
                <Input value={bd.placement} onChange={v => setForm({ ...bd, placement: v } as BrandDealEvent)} placeholder="e.g. YouTube Episode Integration" />
              </Row>
              <Row label="Delivery Date">
                <DateIn value={bd.date} onChange={v => setField('date' as keyof CalendarEvent, v as CalendarEvent[keyof CalendarEvent])} />
              </Row>
              <Row label="Linked Episode">
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
              </Row>
            </>
          )}

          {/* ── REMINDER ── */}
          {rem && (
            <>
              <Row label="Reminder Title *">
                <Input value={rem.title} onChange={v => setField('title' as keyof CalendarEvent, v as CalendarEvent[keyof CalendarEvent])} placeholder="e.g. Send 30-day report to brand" />
              </Row>
              <Row label="Due Date">
                <DateIn value={rem.dueDate} onChange={v => setForm({ ...rem, dueDate: v, date: v } as ReminderEvent)} />
              </Row>
              <Row label="Related To (optional)">
                <Input value={rem.relatedTo ?? ''} onChange={v => setForm({ ...rem, relatedTo: v } as ReminderEvent)} placeholder="e.g. Bybit deal" />
              </Row>
            </>
          )}

          {/* Common */}
          <Row label="Notes">
            <textarea
              value={form.notes}
              onChange={e => setField('notes' as keyof CalendarEvent, e.target.value as CalendarEvent[keyof CalendarEvent])}
              placeholder="Any notes..."
              rows={2}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 resize-none"
            />
          </Row>
          <Row label="Assignees">
            <div className="flex flex-wrap gap-2">
              {TEAM_MEMBERS.map(a => (
                <label key={a} className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium cursor-pointer border transition-colors ${
                  form.assignees.includes(a) ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400'
                }`}>
                  <input type="checkbox" checked={form.assignees.includes(a)} onChange={() => toggleAssignee(a)} className="sr-only" />
                  {a}
                </label>
              ))}
            </div>
          </Row>
        </form>

        {/* Footer */}
        <div className="border-t border-gray-100 px-5 py-3 flex gap-2 justify-end flex-shrink-0">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">Cancel</button>
          <button onClick={handleSubmit} className="px-5 py-2 bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold rounded-lg transition-colors">
            {editing ? 'Save Changes' : 'Create'}
          </button>
        </div>
      </div>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-500 mb-1">{label}</label>
      {children}
    </div>
  );
}
function Input({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <input type="text" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400" />
  );
}
function DateIn({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <input type="date" value={value} onChange={e => onChange(e.target.value)}
      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400" />
  );
}
function Select({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)}
      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 bg-white">
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}
