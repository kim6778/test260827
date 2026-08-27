import React, { useState } from 'react';
import {
  User,
  HeartPulse,
  Flame,
  Shield,
  Coffee,
  AlertCircle,
  CheckCircle,
  HelpCircle,
  Plus,
  Clock,
  Sparkles,
  Phone,
} from 'lucide-react';
import { CrewMember, DutyTeam, FatigueLevel } from '../types';
import { getFatigueColorClass } from '../utils/fatigueAlgorithm';

interface FatigueMonitorProps {
  crews: CrewMember[];
  onAssignRest: (crewId: string, minutes: number) => void;
  selectedTeam: DutyTeam | '전체';
}

export const FatigueMonitor: React.FC<FatigueMonitorProps> = ({
  crews,
  onAssignRest,
  selectedTeam,
}) => {
  const [selectedCrew, setSelectedCrew] = useState<CrewMember | null>(null);

  const filteredCrews = crews.filter((c) => {
    if (selectedTeam === '전체') return true;
    return c.team === selectedTeam;
  });

  return (
    <div id="fatigue-monitor-section" className="space-y-4">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <span>대원별 실시간 출동 피로도 모니터링</span>
            <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 font-normal">
              {filteredCrews.length}명 관리 중
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            신호등 지표: 🟢 안전(0~49점) | 🟡 주의(50~79점) | 🔴 위험(80점 이상 - 출동 제한 권고)
          </p>
        </div>
      </div>

      {/* Crew Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5">
        {filteredCrews.map((crew) => {
          const colors = getFatigueColorClass(crew.fatigueLevel);
          const scorePercent = Math.min(100, Math.max(0, crew.fatigueScore));

          return (
            <div
              key={crew.id}
              id={`crew-card-${crew.id}`}
              className={`bg-slate-900/90 border rounded-xl p-4 flex flex-col justify-between gap-3 relative transition-all duration-200 hover:shadow-lg ${
                crew.fatigueLevel === 'danger'
                  ? 'border-red-500/50 shadow-red-950/20 ring-1 ring-red-500/20'
                  : crew.fatigueLevel === 'caution'
                  ? 'border-amber-500/40'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              {/* Header: Name, Rank, Team, Status Badge */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-xs ${
                      crew.fatigueLevel === 'danger'
                        ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                        : crew.fatigueLevel === 'caution'
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    }`}
                  >
                    {crew.rank.slice(0, 2)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-100 text-sm">{crew.name}</span>
                      <span className="text-[11px] text-slate-400 font-medium">{crew.rank}</span>
                    </div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                      <span className="text-orange-400 font-medium">{crew.team}</span>
                      <span className="text-slate-600">·</span>
                      <span className="text-slate-300">{crew.role}</span>
                    </div>
                  </div>
                </div>

                {/* Status Traffic Light Badge */}
                <div
                  className={`px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 border ${colors.badgeBg}`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      crew.fatigueLevel === 'danger'
                        ? 'bg-red-500 animate-ping'
                        : crew.fatigueLevel === 'caution'
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                    }`}
                  />
                  <span>
                    {crew.fatigueLevel === 'danger'
                      ? '🔴 위험'
                      : crew.fatigueLevel === 'caution'
                      ? '🟡 주의'
                      : '🟢 안전'}
                  </span>
                </div>
              </div>

              {/* Fatigue Progress Bar & Score Display */}
              <div className="space-y-1.5 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80">
                <div className="flex items-baseline justify-between text-xs">
                  <span className="text-slate-400 text-[11px] font-medium flex items-center gap-1">
                    <HeartPulse className="w-3 h-3 text-red-400" /> 누적 피로도 지수
                  </span>
                  <div className="flex items-baseline gap-1">
                    <span
                      className={`text-lg font-extrabold ${
                        crew.fatigueLevel === 'danger'
                          ? 'text-red-400'
                          : crew.fatigueLevel === 'caution'
                          ? 'text-amber-400'
                          : 'text-emerald-400'
                      }`}
                    >
                      {crew.fatigueScore}
                    </span>
                    <span className="text-[10px] text-slate-500">/ 100 pt</span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden relative">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      crew.fatigueLevel === 'danger'
                        ? 'bg-gradient-to-r from-red-600 to-rose-500'
                        : crew.fatigueLevel === 'caution'
                        ? 'bg-gradient-to-r from-amber-600 to-yellow-500'
                        : 'bg-gradient-to-r from-emerald-600 to-teal-500'
                    }`}
                    style={{ width: `${scorePercent}%` }}
                  />
                  {/* Danger threshold line (80%) */}
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-red-400/80 z-10"
                    style={{ left: '80%' }}
                    title="위험 기준선 (80점)"
                  />
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-500 pt-0.5">
                  <span>0 pt (정상)</span>
                  <span className="text-amber-500/80">50 (주의)</span>
                  <span className="text-red-400/90 font-bold">80 (출동제한)</span>
                  <span>100</span>
                </div>
              </div>

              {/* Special Badges (CPR, Continuous Dispatches, Heat, etc.) */}
              <div className="flex flex-wrap gap-1.5 min-h-[24px]">
                {crew.badges.map((badge, idx) => (
                  <span
                    key={idx}
                    className={`text-[10px] px-2 py-0.5 rounded-md font-semibold border ${
                      badge.includes('CPR')
                        ? 'bg-red-950/80 text-red-300 border-red-700/60 shadow-xs'
                        : badge.includes('화재진압')
                        ? 'bg-orange-950/80 text-orange-300 border-orange-700/60'
                        : badge.includes('연속')
                        ? 'bg-purple-950/80 text-purple-300 border-purple-700/60'
                        : 'bg-slate-800 text-slate-300 border-slate-700'
                    }`}
                  >
                    {badge}
                  </span>
                ))}
                {crew.badges.length === 0 && (
                  <span className="text-[10px] text-slate-500 italic">특이 고위험 이력 없음</span>
                )}
              </div>

              {/* Activity Stats & Rest Control */}
              <div className="pt-2 border-t border-slate-800 text-xs flex items-center justify-between text-slate-400">
                <div className="space-y-0.5">
                  <div className="text-[11px]">
                    금일 출동 <span className="font-semibold text-slate-200">{crew.todayDispatchCount}건</span>
                    {' '}(연속 <span className="font-semibold text-amber-400">{crew.consecutiveDispatches}회</span>)
                  </div>
                  <div className="text-[10px] text-slate-500 flex items-center gap-1">
                    <Clock className="w-2.5 h-2.5" />
                    귀소 후 {crew.restMinutesAfterLastDispatch}분 경과 (활동 {crew.totalActiveMinutes}분)
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => onAssignRest(crew.id, 30)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-300 hover:text-emerald-300 border border-slate-700 text-[11px] flex items-center gap-1 transition"
                    title="대원에게 30분 휴식 부여 (피로도 감쇄)"
                  >
                    <Coffee className="w-3 h-3 text-emerald-400" />
                    +30분 휴식
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
