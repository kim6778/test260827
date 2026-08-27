import React from 'react';
import {
  AlertTriangle,
  Bell,
  Coffee,
  Check,
  ShieldAlert,
  ArrowRight,
  UserCheck,
  HeartCrack,
} from 'lucide-react';
import { CrewMember } from '../types';

interface CommanderAlertsProps {
  crews: CrewMember[];
  onAssignRest: (crewId: string, minutes: number) => void;
}

export const CommanderAlerts: React.FC<CommanderAlertsProps> = ({ crews, onAssignRest }) => {
  const highFatigueCrews = crews.filter(
    (c) => c.fatigueScore >= 75 || c.consecutiveDispatches >= 3
  );

  if (highFatigueCrews.length === 0) {
    return (
      <div
        id="commander-alerts-banner"
        className="bg-emerald-950/20 border border-emerald-500/30 rounded-xl p-4 flex items-center justify-between text-xs text-emerald-300"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Check className="w-4 h-4" />
          </div>
          <div>
            <div className="font-semibold text-emerald-200">
              [현장 지휘관 안전 정상] 현재 위험 기준(75점 이상)을 초과한 연속 출동 대원이 없습니다.
            </div>
            <p className="text-emerald-400/80 mt-0.5">
              관내 소방력 정상 가동 중이며, 당번 대원들의 적정 휴식 주기가 유지되고 있습니다.
            </p>
          </div>
        </div>
        <span className="text-[11px] px-2.5 py-1 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 font-medium">
          소방안전 관리 양호
        </span>
      </div>
    );
  }

  return (
    <div
      id="commander-alerts-banner"
      className="bg-rose-950/30 border border-rose-500/40 rounded-xl p-4 space-y-3 shadow-md shadow-red-950/20"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400 animate-pulse">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-rose-200">
                [긴급 지휘관 권고] 연속 고위험 출동 대원 휴식 명령 발령 필요
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 font-semibold animate-pulse">
                {highFatigueCrews.length}명 조치 필요
              </span>
            </div>
            <p className="text-xs text-rose-300/80 mt-0.5">
              소방공무원 보건안전 및 복지기본법에 의거, 피로도 80점 초과 또는 3회 연속 출동 시 즉시 최소 30~60분 휴식 권고 대상입니다.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
        {highFatigueCrews.map((crew) => (
          <div
            key={crew.id}
            className="bg-slate-900/90 border border-rose-500/30 rounded-lg p-3 flex flex-col justify-between gap-2"
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-100 text-xs">
                    {crew.team} {crew.rank} {crew.name}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 font-semibold">
                    피로도 {crew.fatigueScore}점
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  담당: <span className="text-slate-300">{crew.role}</span> | 최근 출동:{' '}
                  <span className="text-rose-400 font-medium">{crew.lastDispatchType || '출동'}</span>
                </p>
                {crew.healthNote && (
                  <p className="text-[11px] text-amber-300/90 mt-1 flex items-center gap-1">
                    <HeartCrack className="w-3 h-3 flex-shrink-0 text-amber-400" />
                    {crew.healthNote}
                  </p>
                )}
              </div>
            </div>

            {/* Quick Commander Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
              <span className="text-[11px] text-slate-400">
                연속 {crew.consecutiveDispatches}회 / 귀소 후 {crew.restMinutesAfterLastDispatch}분 경과
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => onAssignRest(crew.id, 45)}
                  className="px-2.5 py-1 rounded-md bg-rose-600/80 hover:bg-rose-600 text-white text-[11px] font-medium flex items-center gap-1 transition"
                >
                  <Coffee className="w-3 h-3" />
                  45분 휴식 지시
                </button>
                <button
                  type="button"
                  onClick={() => onAssignRest(crew.id, 90)}
                  className="px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-medium border border-slate-700 transition"
                >
                  90분 교대
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
