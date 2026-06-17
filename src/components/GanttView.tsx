import {
  differenceInDays, parseISO, format, startOfMonth, endOfMonth,
  eachMonthOfInterval, isToday, addMonths, subMonths,
} from 'date-fns';
import { CalendarEvent, EpisodeEvent, ProductionStage, StageStatus } from '../data/types';

interface Props {
  events: CalendarEvent[];
  ganttDate: Date; // the "anchor" month for the visible window
  onGanttDateChange: (d: Date) => void;
  onSelectEvent: (event: CalendarEvent) => void;
}

const DAY_W = 26; // px per day
const EP_ROW_H = 36;
const STAGE_ROW_H = 26;
const LABEL_W = 220;

const STATUS_BAR: Record<StageStatus, string> = {
  done: 'bg-green-400 border-green-500',
  in_progress: 'bg-blue-500 border-blue-600',
  not_started: 'bg-gray-200 border-gray-300',
};
const STATUS_TEXT: Record<StageStatus, string> = {
  done: '✓',
  in_progress: '⏳',
  not_started: '○',
};

export default function GanttView({ events, ganttDate, onGanttDateChange, onSelectEvent }: Props) {
  const episodes = events.filter(e => e.type === 'episode') as EpisodeEvent[];

  // Compute date range: show 3 months centred on ganttDate
  const rangeStart = startOfMonth(subMonths(ganttDate, 0));
  const rangeEnd = endOfMonth(addMonths(ganttDate, 2));
  const totalDays = differenceInDays(rangeEnd, rangeStart) + 1;
  const totalWidth = totalDays * DAY_W;
  const months = eachMonthOfInterval({ start: rangeStart, end: rangeEnd });

  function xFor(dateStr: string): number {
    const d = parseISO(dateStr);
    const diff = differenceInDays(d, rangeStart);
    return Math.max(0, diff) * DAY_W;
  }

  function barWidth(startStr: string, endStr: string): number {
    const days = Math.max(1, differenceInDays(parseISO(endStr), parseISO(startStr)) + 1);
    return days * DAY_W;
  }

  const todayX = differenceInDays(new Date(), rangeStart) * DAY_W + DAY_W / 2;
  const showTodayLine = todayX >= 0 && todayX <= totalWidth;

  function episodeBarRange(ep: EpisodeEvent): { start: string; end: string } | null {
    const dates = ep.stages.flatMap(s => [s.startDate, s.endDate].filter(Boolean) as string[]);
    if (dates.length === 0) return null;
    return {
      start: dates.reduce((a, b) => (a < b ? a : b)),
      end: dates.reduce((a, b) => (a > b ? a : b)),
    };
  }

  if (episodes.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400">
        <div className="text-center">
          <div className="text-4xl mb-2">📊</div>
          <div className="text-sm">No episodes to show in Gantt view</div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col overflow-hidden bg-white">
      {/* Navigation bar */}
      <div className="flex items-center gap-3 px-4 py-2 border-b border-gray-200 flex-shrink-0">
        <button onClick={() => onGanttDateChange(subMonths(ganttDate, 1))} className="p-1.5 hover:bg-gray-100 rounded text-gray-500">◀</button>
        <span className="text-sm font-semibold text-gray-600 w-48">
          {format(rangeStart, 'MMM yyyy')} – {format(rangeEnd, 'MMM yyyy')}
        </span>
        <button onClick={() => onGanttDateChange(addMonths(ganttDate, 1))} className="p-1.5 hover:bg-gray-100 rounded text-gray-500">▶</button>
        <button onClick={() => onGanttDateChange(new Date())} className="text-xs border border-gray-200 hover:border-gray-400 px-2 py-1 rounded text-gray-500">Today</button>

        {/* Legend */}
        <div className="ml-auto flex items-center gap-4 text-xs text-gray-500">
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-green-400 inline-block" /> Done</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-blue-500 inline-block" /> In progress</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-gray-200 border border-gray-300 inline-block" /> Not started</span>
        </div>
      </div>

      {/* Main scrollable area */}
      <div className="flex-1 overflow-auto">
        <div style={{ width: LABEL_W + totalWidth, minWidth: '100%' }}>

          {/* ── Month header row ── */}
          <div className="flex sticky top-0 z-20 bg-white border-b border-gray-200">
            {/* Label column header */}
            <div
              className="flex-shrink-0 sticky left-0 z-30 bg-gray-50 border-r border-gray-200 flex items-center px-3"
              style={{ width: LABEL_W, height: 40 }}
            >
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Episode</span>
            </div>

            {/* Month cells */}
            {months.map(month => {
              const mStart = month < rangeStart ? rangeStart : month;
              const mEnd = endOfMonth(month) > rangeEnd ? rangeEnd : endOfMonth(month);
              const mDays = differenceInDays(mEnd, mStart) + 1;
              return (
                <div
                  key={month.toISOString()}
                  style={{ width: mDays * DAY_W, minWidth: mDays * DAY_W }}
                  className="border-r border-gray-200 flex items-center px-2 bg-gray-50"
                >
                  <span className="text-xs font-semibold text-gray-600">{format(month, 'MMMM yyyy')}</span>
                </div>
              );
            })}
          </div>

          {/* ── Episode rows ── */}
          {episodes.map(ep => {
            const epRange = episodeBarRange(ep);
            return (
              <div key={ep.id}>
                {/* Episode header row */}
                <div className="flex border-b border-gray-100 hover:bg-gray-50 transition-colors group">
                  {/* Label */}
                  <div
                    className="flex-shrink-0 sticky left-0 z-10 bg-white group-hover:bg-gray-50 border-r border-gray-200 flex items-center px-3 gap-2 cursor-pointer"
                    style={{ width: LABEL_W, height: EP_ROW_H }}
                    onClick={() => onSelectEvent(ep)}
                  >
                    <span className="text-xs font-bold text-gray-800 truncate">{ep.episodeName || ep.title}</span>
                    <span className="text-xs text-gray-400 whitespace-nowrap">{ep.show.split(' ')[0]}</span>
                  </div>

                  {/* Episode span bar */}
                  <div className="relative flex-1" style={{ height: EP_ROW_H }}>
                    {showTodayLine && (
                      <div className="absolute top-0 bottom-0 w-px bg-red-400 opacity-40 z-10 pointer-events-none" style={{ left: todayX }} />
                    )}
                    {epRange && (
                      <div
                        className="absolute top-2 rounded flex items-center px-2 cursor-pointer bg-slate-100 border border-slate-300 hover:bg-slate-200 transition-colors"
                        style={{
                          left: xFor(epRange.start),
                          width: barWidth(epRange.start, epRange.end),
                          height: EP_ROW_H - 8,
                        }}
                        onClick={() => onSelectEvent(ep)}
                        title={`${ep.episodeName}: ${epRange.start} → ${epRange.end}`}
                      >
                        <span className="text-xs font-semibold text-slate-600 truncate">{ep.episodeName || ep.title}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Stage rows */}
                {ep.stages.map((stage: ProductionStage) => (
                  <div key={stage.id} className="flex border-b border-gray-50">
                    {/* Stage label */}
                    <div
                      className="flex-shrink-0 sticky left-0 z-10 bg-white border-r border-gray-100 flex items-center gap-1.5 pl-7 pr-2"
                      style={{ width: LABEL_W, height: STAGE_ROW_H }}
                    >
                      <span className="text-xs text-gray-400">{STATUS_TEXT[stage.status]}</span>
                      <span className={`text-xs truncate ${stage.status === 'done' ? 'line-through text-gray-400' : 'text-gray-600'}`}>
                        {stage.name}
                      </span>
                      {stage.responsible && (
                        <span className="text-xs text-gray-300 ml-auto">{stage.responsible.slice(0, 2)}</span>
                      )}
                    </div>

                    {/* Stage bar */}
                    <div className="relative flex-1" style={{ height: STAGE_ROW_H }}>
                      {showTodayLine && (
                        <div className="absolute top-0 bottom-0 w-px bg-red-400 opacity-30 z-10 pointer-events-none" style={{ left: todayX }} />
                      )}
                      {stage.startDate && stage.endDate && (
                        <div
                          className={`absolute top-1.5 rounded border ${STATUS_BAR[stage.status]}`}
                          style={{
                            left: xFor(stage.startDate),
                            width: barWidth(stage.startDate, stage.endDate),
                            height: STAGE_ROW_H - 6,
                          }}
                          title={`${stage.name}: ${stage.startDate} → ${stage.endDate} (${stage.status})`}
                        />
                      )}
                      {/* endDate-only mark */}
                      {!stage.startDate && stage.endDate && (
                        <div
                          className={`absolute top-1.5 w-3 h-3 rounded-full border-2 ${STATUS_BAR[stage.status]}`}
                          style={{ left: xFor(stage.endDate) - 6, top: STAGE_ROW_H / 2 - 6 }}
                          title={`${stage.name}: due ${stage.endDate}`}
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
