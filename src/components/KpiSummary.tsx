import React from 'react';
import {
  Flame,
  AlertOctagon,
  Truck,
  HeartPulse,
  Clock,
  ShieldCheck,
  TrendingUp,
  Activity,
} from 'lucide-react';
import { CrewMember, DispatchRecord, VehicleStatus } from '../types';

interface KpiSummaryProps {
  crews: CrewMember[];
  dispatches: DispatchRecord[];
  vehicles: VehicleStatus[];
}

export const KpiSummary: React.FC<KpiSummaryProps> = ({ crews, dispatches, vehicles }) => {
  const totalDispatches = dispatches.length;
  const fireDispatches = dispatches.filter((d) => d.type === '화재').length;
  const emsDispatches = dispatches.filter((d) => d.type === '일반구급' || d.type === '중증응급/CPR').length;
  const rescueDispatches = dispatches.filter((d) => d.type === '구조').length;

  const dangerCrews = crews.filter((c) => c.fatigueLevel === 'danger');
  const cautionCrews = crews.filter((c) => c.fatigueLevel === 'caution');
  const safeCrews = crews.filter((c) => c.fatigueLevel === 'safe');

  const activeVehicles = vehicles.filter((v) => v.status === '출동중').length;
  const readyVehicles = vehicles.filter((v) => v.status === '대기').length;
  const maintenanceVehicles = vehicles.filter((v) => v.status === '정비필요' || v.nextInspectionDDay <= 0).length;

  // 전체 대원 평균 피로도
  const avgFatigue = crews.length
    ? Math.round(crews.reduce((acc, c) => acc + c.fatigueScore, 0) / crews.length)
    : 0;

  return (
    <div id="kpi-summary-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. 금일 총 출동수 */}
      <div
        id="kpi-total-dispatch"
        className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-col justify-between shadow-sm relative overflow-hidden group hover:border-slate-700 transition"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400">금일 총 출동 현황</span>
          <div className="w-8 h-8 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400">
            <Flame className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white tracking-tight">{totalDispatches}</span>
            <span className="text-xs text-slate-400">건 출동</span>
          </div>
          <div className="flex items-center gap-2 mt-2 text-[11px] text-slate-400">
            <span className="px-1.5 py-0.5 rounded bg-red-950/60 text-red-300 border border-red-800/40">
              화재 {fireDispatches}
            </span>
            <span className="px-1.5 py-0.5 rounded bg-blue-950/60 text-blue-300 border border-blue-800/40">
              구급 {emsDispatches}
            </span>
            <span className="px-1.5 py-0.5 rounded bg-amber-950/60 text-amber-300 border border-amber-800/40">
              구조/기타 {rescueDispatches + (totalDispatches - fireDispatches - emsDispatches - rescueDispatches)}
            </span>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/5 rounded-full blur-2xl -z-10 group-hover:bg-orange-500/10 transition" />
      </div>

      {/* 2. 대원 피로도 위험/주의 현황 */}
      <div
        id="kpi-crew-fatigue"
        className={`bg-slate-900/90 border rounded-xl p-4 flex flex-col justify-between shadow-sm relative overflow-hidden transition ${
          dangerCrews.length > 0
            ? 'border-red-500/40 bg-red-950/10'
            : 'border-slate-800'
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400">피로도 위험 대원</span>
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              dangerCrews.length > 0
                ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
            }`}
          >
            <AlertOctagon className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="flex items-baseline gap-2">
            <span
              className={`text-2xl font-bold tracking-tight ${
                dangerCrews.length > 0 ? 'text-red-400' : 'text-emerald-400'
              }`}
            >
              {dangerCrews.length}
            </span>
            <span className="text-xs text-slate-400">명 위험 (🔴 80점+)</span>
          </div>
          <div className="flex items-center gap-2 mt-2 text-[11px]">
            <span className="text-amber-400 font-medium">🟡 주의 {cautionCrews.length}명</span>
            <span className="text-slate-500">|</span>
            <span className="text-emerald-400 font-medium">🟢 안전 {safeCrews.length}명</span>
          </div>
        </div>
      </div>

      {/* 3. 소방차량 가동 현황 */}
      <div
        id="kpi-vehicle-status"
        className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-col justify-between shadow-sm relative overflow-hidden group hover:border-slate-700 transition"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400">소방력/차량 가동</span>
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <Truck className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white tracking-tight">{readyVehicles}</span>
            <span className="text-xs text-slate-400">대 출동대기 중</span>
          </div>
          <div className="flex items-center gap-2 mt-2 text-[11px] text-slate-400">
            <span className="text-blue-400">🚨 출동중 {activeVehicles}대</span>
            <span className="text-slate-600">/</span>
            <span className={maintenanceVehicles > 0 ? 'text-rose-400 font-semibold' : 'text-slate-400'}>
              🛠️ 점검필요 {maintenanceVehicles}대
            </span>
          </div>
        </div>
      </div>

      {/* 4. 센터 평균 피로도 & 안전관리 지수 */}
      <div
        id="kpi-center-average"
        className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-col justify-between shadow-sm relative overflow-hidden group hover:border-slate-700 transition"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400">센터 평균 피로도</span>
          <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <Activity className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="flex items-baseline gap-2">
            <span
              className={`text-2xl font-bold tracking-tight ${
                avgFatigue >= 80 ? 'text-red-400' : avgFatigue >= 50 ? 'text-amber-400' : 'text-emerald-400'
              }`}
            >
              {avgFatigue}
            </span>
            <span className="text-xs text-slate-400">/ 100 pt</span>
          </div>
          <div className="flex items-center justify-between mt-2 text-[11px] text-slate-400">
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mr-2">
              <div
                className={`h-full rounded-full ${
                  avgFatigue >= 80 ? 'bg-red-500' : avgFatigue >= 50 ? 'bg-amber-500' : 'bg-emerald-500'
                }`}
                style={{ width: `${Math.min(100, avgFatigue)}%` }}
              />
            </div>
            <span className="font-semibold text-slate-300">
              {avgFatigue >= 80 ? '고위험' : avgFatigue >= 50 ? '주의' : '양호'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
