import React from 'react';
import {
  Truck,
  Wrench,
  Fuel,
  Gauge,
  CheckCircle2,
  AlertTriangle,
  Flame,
  BatteryCharging,
  Calendar,
} from 'lucide-react';
import { VehicleStatus } from '../types';

interface VehicleMaintenanceProps {
  vehicles: VehicleStatus[];
  onCompleteInspection: (vehicleId: string) => void;
}

export const VehicleMaintenance: React.FC<VehicleMaintenanceProps> = ({
  vehicles,
  onCompleteInspection,
}) => {
  return (
    <div id="vehicle-maintenance-section" className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <Truck className="w-4 h-4 text-blue-400" />
            소방차량 정비 주기 및 장비 점검 현황
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            차량별 정기점검 D-day, 유류량, 특수 펌프 가동 시간 및 적재 장비 모니터링
          </p>
        </div>
      </div>

      {/* Vehicle Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
        {vehicles.map((vehicle) => {
          const isOverdue = vehicle.nextInspectionDDay < 0;
          const isWarning = vehicle.nextInspectionDDay <= 3 && !isOverdue;

          return (
            <div
              key={vehicle.id}
              className={`bg-slate-950/80 border rounded-xl p-3.5 flex flex-col justify-between gap-3 relative transition ${
                isOverdue
                  ? 'border-rose-500/60 bg-rose-950/10'
                  : isWarning
                  ? 'border-amber-500/50 bg-amber-950/10'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              {/* Header: Name, Plate, Status */}
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-100 text-xs">{vehicle.name}</span>
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                    {vehicle.plateNumber}
                  </div>
                </div>

                {/* Status Badge */}
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                    vehicle.status === '출동중'
                      ? 'bg-blue-500/20 text-blue-300 border-blue-500/40 animate-pulse'
                      : vehicle.status === '대기'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                      : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                  }`}
                >
                  {vehicle.status}
                </span>
              </div>

              {/* D-Day Tag */}
              <div className="flex items-center justify-between bg-slate-900/90 p-2 rounded-lg border border-slate-800 text-xs">
                <span className="text-slate-400 text-[11px] flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-slate-400" />
                  정기점검 주기
                </span>
                <span
                  className={`font-extrabold text-xs px-2 py-0.5 rounded ${
                    isOverdue
                      ? 'bg-rose-500 text-white animate-bounce'
                      : isWarning
                      ? 'bg-amber-500 text-slate-950'
                      : 'bg-slate-800 text-slate-200 border border-slate-700'
                  }`}
                >
                  {isOverdue
                    ? `D+${Math.abs(vehicle.nextInspectionDDay)} (점검 초과)`
                    : vehicle.nextInspectionDDay === 0
                    ? 'D-Day (오늘 점검)'
                    : `D-${vehicle.nextInspectionDDay}`}
                </span>
              </div>

              {/* Fuel & Mileage */}
              <div className="space-y-1.5 text-xs text-slate-400">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="flex items-center gap-1">
                    <Fuel className="w-3 h-3 text-amber-400" /> 유류 잔량
                  </span>
                  <span className="font-semibold text-slate-200">{vehicle.fuelLevel}%</span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      vehicle.fuelLevel <= 30
                        ? 'bg-rose-500'
                        : vehicle.fuelLevel <= 60
                        ? 'bg-amber-500'
                        : 'bg-blue-500'
                    }`}
                    style={{ width: `${vehicle.fuelLevel}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] pt-1">
                  <span className="flex items-center gap-1">
                    <Gauge className="w-3 h-3 text-slate-400" /> 주행거리
                  </span>
                  <span className="font-mono text-slate-300">
                    {vehicle.currentMileageKm.toLocaleString()} km
                  </span>
                </div>

                {vehicle.pumpRunningHours !== undefined && (
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="flex items-center gap-1">
                      <Flame className="w-3 h-3 text-orange-400" /> 펌프 가동
                    </span>
                    <span className="font-mono text-orange-300">
                      {vehicle.pumpRunningHours} 시간
                    </span>
                  </div>
                )}
              </div>

              {/* Action Button */}
              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-[10px] text-slate-500">
                  최근: {vehicle.lastInspectionDate}
                </span>
                <button
                  type="button"
                  onClick={() => onCompleteInspection(vehicle.id)}
                  className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-300 hover:text-emerald-300 border border-slate-700 transition flex items-center gap-1"
                >
                  <Wrench className="w-3 h-3 text-emerald-400" /> 점검 완료
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
