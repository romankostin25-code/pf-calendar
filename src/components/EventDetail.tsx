import { format, parseISO } from 'date-fns';
import { CalendarEntry, CalendarEvent, EpisodeEvent, BrandDealEvent, ReminderEvent } from '../data/types';

interface Props {
  entry: CalendarEntry;
  allEvents: CalendarEvent[];
  onClose: () => void;
  onEdit: (event: CalendarEvent) => void;
  onDelete: (id: string) => void;
  onToggleReminderDone: (id: string) => void;
  onToggleChecklist: (episodeId: string, key: keyof EpisodeEvent['checklist']) => void;
}

const STAGE_LABELS: Record<string, string> = {
  negotiation: '🤝 Negotiation',
  contract: '📄 Contract',
  filming: '🎬 Filming',
  edit: '✂️ Edit',
  live: '🟢 Live',
  reporting: '📊 Reporting',
};

function fmt(date?: string) {
  if (!date) return '—';
  return format(parseISO(date), 'MMM d, yyyy');
}

export default function EventDetail({
  entry, allEvents, onClose, onEdit, onDelete, onToggleReminderDone, onToggleChecklist,
}: Props) {
  const ev = entry.event;

  return (
    <aside className="w-80 flex-shrink-0 bg-white border-l border-gray-200 flex flex-col h-screen overflow-y-auto">
      {/* Header */}
      <div className="flex items-start justify-between px-4 py-4 border-b border-gray-100">
        <div className="flex-1 min-w-0 pr-2">
          <span className={`chip ${entry.chipClass} mb-2`}>{entry.label}</span>
          <h2 className="font-bold text-gray-900 text-base leading-snug mt-1">
            {ev.type === 'episode' ? (ev as EpisodeEvent).episodeName || ev.title : ev.title}
          </h2>
          {ev.type === 'brand_deal' && (
            <div className="text-sm text-violet-700 font-medium">{(ev as BrandDealEvent).brand}</div>
          )}
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 text-lg leading-none flex-shrink-0 mt-0.5"
        >
          ✕
        </button>
      </div>

      <div className="flex-1 px-4 py-3 space-y-4 overflow-y-auto">
        {/* Brand deal specific */}
        {ev.type === 'brand_deal' && (() => {
          const bd = ev as BrandDealEvent;
          return (
            <>
              <Field label="Stage">
                <span className="text-sm font-medium text-violet-700">{STAGE_LABELS[bd.stage]}</span>
              </Field>
              <Field label="Rate"><span className="text-sm font-semibold text-green-700">${bd.rate.toLocaleString()}</span></Field>
              {bd.placement && <Field label="Placement"><span className="text-sm text-gray-700">{bd.placement}</span></Field>}
              {bd.linkedEpisodeId && (() => {
                const linked = allEvents.find(e => e.id === bd.linkedEpisodeId) as EpisodeEvent | undefined;
                return linked ? (
                  <Field label="Linked Episode">
                    <span className="text-sm text-blue-700">{linked.episodeName || linked.title}</span>
                  </Field>
                ) : null;
              })()}
              <Field label="Date"><span className="text-sm text-gray-700">{fmt(bd.date)}</span></Field>
            </>
          );
        })()}

        {/* Episode specific */}
        {ev.type === 'episode' && (() => {
          const ep = ev as EpisodeEvent;
          return (
            <>
              <Field label="Show"><span className="text-sm text-gray-700">{ep.show}</span></Field>
              {ep.theme && <Field label="Theme"><span className="text-sm text-gray-700">{ep.theme}</span></Field>}

              {/* Production pipeline */}
              <div>
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Production Pipeline</div>
                <div className="space-y-1">
                  <PipelineRow icon="✏️" label="Script Due" date={ep.scriptDueDate} done={ep.checklist.scriptApproved} />
                  <PipelineRow icon="🎬" label="Filming" date={ep.filmingDate} done={ep.checklist.filmingDone} />
                  <PipelineRow icon="✂️" label="Edit" date={ep.editDeadline} done={ep.checklist.editSent} />
                  <PipelineRow icon="🚀" label="Publish" date={ep.publishDate} done={ep.checklist.published} />
                </div>
              </div>

              {/* Checklist */}
              <div>
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Checklist</div>
                <div className="space-y-1.5">
                  {(Object.entries(ep.checklist) as [keyof EpisodeEvent['checklist'], boolean][]).map(([key, done]) => (
                    <label key={key} className="flex items-center gap-2 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={done}
                        onChange={() => onToggleChecklist(ep.id, key)}
                        className="w-4 h-4 accent-violet-600"
                      />
                      <span className={`text-sm ${done ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                        {CHECKLIST_LABELS[key]}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {ep.linkedDealIds.length > 0 && (
                <div>
                  <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Linked Deals</div>
                  {ep.linkedDealIds.map(id => {
                    const deal = allEvents.find(e => e.id === id) as BrandDealEvent | undefined;
                    return deal ? (
                      <div key={id} className="text-sm text-violet-700">{deal.brand}: {deal.title}</div>
                    ) : null;
                  })}
                </div>
              )}
            </>
          );
        })()}

        {/* Reminder specific */}
        {ev.type === 'reminder' && (() => {
          const rem = ev as ReminderEvent;
          return (
            <>
              <Field label="Due"><span className="text-sm text-gray-700">{fmt(rem.dueDate)}</span></Field>
              {rem.relatedTo && <Field label="Related To"><span className="text-sm text-gray-700">{rem.relatedTo}</span></Field>}
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rem.done}
                  onChange={() => onToggleReminderDone(rem.id)}
                  className="w-4 h-4 accent-amber-600"
                />
                <span className={`text-sm ${rem.done ? 'line-through text-gray-400' : 'text-amber-700 font-medium'}`}>
                  {rem.done ? 'Done' : 'Mark as done'}
                </span>
              </label>
            </>
          );
        })()}

        {/* Common fields */}
        {ev.assignees.length > 0 && (
          <Field label="Assignees">
            <div className="flex flex-wrap gap-1">
              {ev.assignees.map(a => (
                <span key={a} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{a}</span>
              ))}
            </div>
          </Field>
        )}
        {ev.notes && (
          <Field label="Notes">
            <p className="text-sm text-gray-600 whitespace-pre-wrap">{ev.notes}</p>
          </Field>
        )}
      </div>

      {/* Actions */}
      <div className="border-t border-gray-100 px-4 py-3 flex gap-2">
        <button
          onClick={() => onEdit(ev)}
          className="flex-1 bg-gray-900 hover:bg-gray-700 text-white text-sm font-medium py-2 rounded-lg transition-colors"
        >
          Edit
        </button>
        <button
          onClick={() => {
            if (confirm('Delete this event?')) onDelete(ev.id);
          }}
          className="px-4 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          Delete
        </button>
      </div>
    </aside>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-0.5">{label}</div>
      {children}
    </div>
  );
}

function PipelineRow({ icon, label, date, done }: { icon: string; label: string; date?: string; done: boolean }) {
  return (
    <div className={`flex items-center gap-2 text-sm ${done ? 'text-gray-400' : 'text-gray-700'}`}>
      <span>{icon}</span>
      <span className={`font-medium w-16 ${done ? 'line-through' : ''}`}>{label}</span>
      <span className="text-gray-400">{date ? format(parseISO(date), 'MMM d') : '—'}</span>
      {done && <span className="text-green-500 text-xs">✓</span>}
    </div>
  );
}

const CHECKLIST_LABELS: Record<keyof EpisodeEvent['checklist'], string> = {
  scriptApproved: 'Script approved',
  filmingDone: 'Filming done',
  editSent: 'Edit sent for review',
  published: 'Published',
};
