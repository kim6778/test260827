import React from 'react';
import {
  Clock,
  Flame,
  HeartPulse,
  Truck,
  AlertCircle,
  MapPin,
  Users,
  Moon,
  Sun,
} from 'lucide-react';
import { DispatchRecord } from '../types';

interface DispatchTimelineProps {
  dispatches: DispatchRecord[];
}

export const DispatchTimeline: React.FC<DispatchTimelineProps> = ({ dispatches }) => {
  // 24시간 눈금 (00시부터 23시까지)
  const hours = Array.from({ length: 24 }, (_, i) => i);

  // 시간 문자열(HH:mm)을 24시간 백분율로 변환
  const timeToPercent = (timeStr: string) => {
    const [h, m] = timeStr.split(':').map(Number);
    const totalMinutes = (h || 0) * 60 + (m || 0);
    return Math.min(100, Math.max(0, (totalMinutes / 1440) * 100));
  };

  return (
    <div id="dispatch-timeline-section" className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <Clock className="w-4 h-4 text-orange-400" />
            24시간 출동 타임라인 (간트 차트)
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            심야 시간대(00:00~06:00, 1.3배 가중치 적용 구간) 및 연속 출동 간격 시각화
          </p>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5 text-slate-300">
            <span className="w-3 h-3 rounded bg-red-500" /> 화재
          </div>
          <div className="flex items-center gap-1.5 text-slate-300">
            <span className="w-3 h-3 rounded bg-rose-400" /> CPR/중증
          </div>
          <div className="flex items-center gap-1.5 text-slate-300">
            <span className="w-3 h-3 rounded bg-blue-500" /> 일반구급
          </div>
          <div className="flex items-center gap-1.5 text-slate-300">
            <span className="w-3 h-3 rounded bg-amber-500" /> 오작동/생활
          </div>
          <div className="flex items-center gap-1.5 text-purple-300 bg-purple-950/60 px-2 py-0.5 rounded border border-purple-800/40">
            <Moon className="w-3 h-3" /> 심야 집중구간 (00~06시)
          </div>
        </div>
      </div>

      {/* 24-Hour Gantt Timeline Canvas */}
      <div className="space-y-2 pt-2">
        {/* Hour Axis */}
        <div className="relative h-6 border-b border-slate-800 flex items-end">
          {/* Night Shift Shade Overlay (00:00 to 06:00 -> 0% to 25%) */}
          <div
            className="absolute top-0 bottom-0 left-0 bg-purple-950/30 border-r border-purple-800/40 rounded-l"
            style={{ width: '25%' }}
            title="심야 가중치 적용 구간 (00:00 ~ 06:00)"
          />

          {hours.map((hour) => (
            <div
              key={hour}
              className="flex-1 text-center text-[10px] text-slate-500 font-mono select-none"
            >
              {hour % 3 === 0 ? `${hour.toString().padStart(2, '0')}` : '·'}
            </div>
          ))}
        </div>

        {/* Dispatch Gantt Bars */}
        <div className="space-y-2.5 py-2">
          {dispatches.map((dispatch) => {
            const startPct = timeToPercent(dispatch.startTime);
            const endPct = timeToPercent(dispatch.endTime);
            const widthPct = Math.max(3.5, endPct - startPct);

            let barColor = 'bg-blue-600 hover:bg-blue-500 border-blue-400';
            if (dispatch.type === '화재') {
              barColor = 'bg-red-600 hover:bg-red-500 border-red-400';
            } else if (dispatch.type === '중증응급/CPR') {
              barColor = 'bg-rose-600 hover:bg-rose-500 border-rose-400';
            } else if (dispatch.type === '오작동/기타' || dispatch.type === '생활안전') {
              barColor = 'bg-amber-600 hover:bg-amber-500 border-amber-400';
            }

            return (
              <div key={dispatch.id} className="relative h-9 flex items-center group">
                {/* Night background overlay per row */}
                <div
                  className="absolute top-0 bottom-0 left-0 bg-purple-950/20 pointer-events-none"
                  style={{ width: '25%' }}
                />

                {/* Gantt Bar */}
                <div
                  className={`absolute h-7 rounded-md border text-[11px] font-medium text-white px-2 flex items-center justify-between cursor-pointer transition-all shadow-md overflow-hidden ${barColor}`}
                  style={{
                    left: `${startPct}%`,
                    width: `${widthPct}%`,
                  }}
                  title={`${dispatch.title} (${dispatch.startTime}~${dispatch.endTime}, ${dispatch.durationMinutes}분)`}
                >
                  <span className="truncate flex items-center gap-1 font-semibold">
                    {dispatch.type === '화재' && <Flame className="w-3 h-3 flex-shrink-0" />}
                    {dispatch.type === '중증응급/CPR' && <HeartPulse className="w-3 h-3 flex-shrink-0" />}
                    {dispatch.type} : {dispatch.title}
                  </span>
                  <span className="text-[10px] opacity-90 font-mono ml-2 hidden sm:inline flex-shrink-0">
                    {dispatch.durationMinutes}분
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Dispatches List View */}
      <div className="pt-3 border-t border-slate-800">
        <h4 className="text-xs font-semibold text-slate-300 mb-2">금일 세부 출동 내역 (소방청 표준 연동)</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
          {dispatches.map((d) => (
            <div
              key={d.id}
              className="bg-slate-950/80 border border-slate-800/80 rounded-lg p-2.5 text-xs flex flex-col justify-between gap-1.5 hover:border-slate-700 transition"
            >
              <div className="flex items-start justify-between gap-2">
                <span className="font-semibold text-slate-200 line-clamp-1">{d.title}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded font-bold flex-shrink-0 ${
                    d.type === '화재'
                      ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                      : d.type === '중증응급/CPR'
                      ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                  }`}
                >
                  {d.type}
                </span>
              </div>

              <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-400 gap-y-1">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-500" />
                  {d.startTime} ~ {d.endTime} ({d.durationMinutes}분 활동)
                  {d.isNightShift && <span className="text-purple-400 font-semibold">(심야)</span>}
                </span>
                <span className="text-orange-400 font-medium">{d.vehicle}</span>
              </div>

              {d.specialEventDescription && (
                <div className="text-[10px] bg-red-950/40 text-red-300/90 px-2 py-1 rounded border border-red-800/30 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 flex-shrink-0 text-red-400" />
                  {d.specialEventDescription}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
