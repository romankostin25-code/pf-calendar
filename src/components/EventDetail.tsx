import { format, parseISO } from 'date-fns';
import { CalendarEntry, CalendarEvent, EpisodeEvent, BrandDealEvent, ReminderEvent, ProductionStage, StageStatus, nextStatus } from '../data/types';

interface Props {
  entry: CalendarEntry;
  allEvents: CalendarEvent[];
  onClose: () => void;
  onEdit: (event: CalendarEvent) => void;
  onDelete: (id: string) => void;
  onToggleReminderDone: (id: string) => void;
  onCycleStageStatus: (episodeId: string, stageId: string, newStatus: StageStatus) => void;
}

const STAGE_LABELS: Record<string, string> = {
  negotiation: '🤝 Negotiation', contract: '📄 Contract', filming: '🎬 Filming',
  edit: '✂️ Edit', live: '🟢 Live', reporting: '📊 Reporting',
};

const STATUS_CHIP: Record<StageStatus, string> = {
  done: 'bg-green-100 text-green-700 border-green-200',
  in_progress: 'bg-blue-100 text-blue-700 border-blue-200',
  not_started: 'bg-gray-100 text-gray-400 border-gray-200',
};
const STATUS_LABEL: Record<StageStatus, string> = {
  done: '✓ Done',
  in_progress: '⏳ In progress',
  not_started: '○ Not started',
};

function fmt(date?: string) {
  if (!date) return '—';
  return format(parseISO(date), 'MMM d');
}

export default function EventDetail({ entry, allEvents, onClose, onEdit, onDelete, onToggleReminderDone, onCycleStageStatus }: Props) {
  const ev = entry.event;

  const episodeProgress = ev.type === 'episode' ? (() => {
    const ep = ev as EpisodeEvent;
    const done = ep.stages.filter(s => s.status === 'done').length;
    return { done, total: ep.stages.length };
  })() : null;

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
          {episodeProgress && (
            <div className="mt-2">
              <div className="flex justify-between text-xs text-gray-400 mb-1">
                <span>{episodeProgress.done}/{episodeProgress.total} stages done</span>
                <span>{Math.round((episodeProgress.done / Math.max(episodeProgress.total, 1)) * 100)}%</span>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-400 rounded-full transition-all"
                  style={{ width: `${(episodeProgress.done / Math.max(episodeProgress.total, 1)) * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-lg leading-none flex-shrink-0 mt-0.5">✕</button>
      </div>

      <div className="flex-1 px-4 py-3 space-y-4 overflow-y-auto">

        {/* Brand deal */}
        {ev.type === 'brand_deal' && (() => {
          const bd = ev as BrandDealEvent;
          return (
            <>
              <Field label="Stage"><span className="text-sm font-medium text-violet-700">{STAGE_LABELS[bd.stage]}</span></Field>
              <Field label="Rate"><span className="text-sm font-semibold text-green-700">${bd.rate.toLocaleString()}</span></Field>
              {bd.placement && <Field label="Placement"><span className="text-sm text-gray-700">{bd.placement}</span></Field>}
              <Field label="Delivery Date"><span className="text-sm text-gray-700">{fmt(bd.date)}</span></Field>
              {bd.linkedEpisodeId && (() => {
                const linked = allEvents.find(e => e.id === bd.linkedEpisodeId) as EpisodeEvent | undefined;
                return linked ? (
                  <Field label="Linked Episode">
                    <span className="text-sm text-blue-700">{linked.episodeName || linked.title}</span>
                  </Field>
                ) : null;
              })()}
            </>
          );
        })()}

        {/* Episode — stages */}
        {ev.type === 'episode' && (() => {
          const ep = ev as EpisodeEvent;
          return (
            <>
              <Field label="Show"><span className="text-sm text-gray-700">{ep.show}</span></Field>
              {ep.theme && <Field label="Theme"><span className="text-sm text-gray-700">{ep.theme}</span></Field>}
              <Field label="Publish Date"><span className="text-sm text-gray-700">{fmt(ep.date)}</span></Field>

              <div>
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Production Stages</div>
                <div className="space-y-1">
                  {ep.stages.map((stage: ProductionStage) => (
                    <div
                      key={stage.id}
                      className="flex items-center gap-2 py-1 px-2 rounded hover:bg-gray-50 group cursor-pointer"
                      onClick={() => onCycleStageStatus(ep.id, stage.id, nextStatus(stage.status))}
                      title="Click to cycle status"
                    >
                      <button
                        className={`flex-shrink-0 text-xs px-1.5 py-0.5 rounded border font-medium ${STATUS_CHIP[stage.status]} cursor-pointer`}
                      >
                        {STATUS_LABEL[stage.status]}
                      </button>
                      <span className={`text-sm flex-1 ${stage.status === 'done' ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                        {stage.name}
                      </span>
                      <div className="text-xs text-gray-400 text-right flex-shrink-0">
                        {stage.startDate && stage.endDate
                          ? `${fmt(stage.startDate)}→${fmt(stage.endDate)}`
                          : stage.endDate
                          ? `due ${fmt(stage.endDate)}`
                          : ''}
                      </div>
                    </div>
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

        {/* Reminder */}
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

        {/* Common */}
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
          onClick={() => { if (confirm('Delete this event?')) onDelete(ev.id); }}
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
