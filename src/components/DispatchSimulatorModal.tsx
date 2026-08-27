import React, { useState } from 'react';
import {
  X,
  Flame,
  HeartPulse,
  Truck,
  AlertTriangle,
  Clock,
  Send,
  MapPin,
  Moon,
  Users,
} from 'lucide-react';
import { CrewMember, DispatchRecord, DispatchType, DutyTeam } from '../types';

interface DispatchSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  crews: CrewMember[];
  onAddDispatch: (newDispatch: DispatchRecord) => void;
}

export const DispatchSimulatorModal: React.FC<DispatchSimulatorModalProps> = ({
  isOpen,
  onClose,
  crews,
  onAddDispatch,
}) => {
  if (!isOpen) return null;

  const [type, setType] = useState<DispatchType>('중증응급/CPR');
  const [title, setTitle] = useState('역삼동 상가 심정지(CPR) 발생 긴급 출동');
  const [location, setLocation] = useState('서울 강남구 역삼동 730-22');
  const [vehicle, setVehicle] = useState('역삼 구급1호, 펌프1호(펌뷸런스)');
  const [durationMinutes, setDurationMinutes] = useState(50);
  const [isNightShift, setIsNightShift] = useState(false);
  const [isSpecialEvent, setIsSpecialEvent] = useState(true);
  const [selectedCrewIds, setSelectedCrewIds] = useState<string[]>(['crew-2', 'crew-3']);

  const handleTypeChange = (newType: DispatchType) => {
    setType(newType);
    if (newType === '화재') {
      setTitle('역삼동 오피스텔 지하 1층 주차장 화재');
      setVehicle('역삼 펌프1호, 펌프2호, 물탱크차');
      setDurationMinutes(70);
      setIsSpecialEvent(true);
      setSelectedCrewIds(['crew-1', 'crew-4', 'crew-5']);
    } else if (newType === '중증응급/CPR') {
      setTitle('역삼동 상가 심정지(CPR) 발생 긴급 출동');
      setVehicle('역삼 구급1호, 펌프2호(펌뷸런스)');
      setDurationMinutes(50);
      setIsSpecialEvent(true);
      setSelectedCrewIds(['crew-2', 'crew-3']);
    } else if (newType === '일반구급') {
      setTitle('강남대로 버스정류장 낙상 골절 환자 이송');
      setVehicle('역삼 구급1호');
      setDurationMinutes(40);
      setIsSpecialEvent(false);
      setSelectedCrewIds(['crew-2', 'crew-3']);
    } else {
      setTitle('단독주택 단독경보형감지기 오작동 확인');
      setVehicle('역삼 펌프1호');
      setDurationMinutes(25);
      setIsSpecialEvent(false);
      setSelectedCrewIds(['crew-1', 'crew-6']);
    }
  };

  const toggleCrew = (id: string) => {
    if (selectedCrewIds.includes(id)) {
      setSelectedCrewIds(selectedCrewIds.filter((cid) => cid !== id));
    } else {
      setSelectedCrewIds([...selectedCrewIds, id]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const now = new Date();
    const startH = now.getHours().toString().padStart(2, '0');
    const startM = now.getMinutes().toString().padStart(2, '0');

    // 계산된 종료 시간
    const endMinutesTotal = now.getHours() * 60 + now.getMinutes() + durationMinutes;
    const endH = Math.floor(endMinutesTotal / 60) % 24;
    const endM = endMinutesTotal % 60;
    const endStr = `${endH.toString().padStart(2, '0')}:${endM.toString().padStart(2, '0')}`;

    const newDispatch: DispatchRecord = {
      id: `disp-${Date.now()}`,
      dispatchNumber: `20260826-${Math.floor(1000 + Math.random() * 9000)}`,
      title,
      type,
      location,
      vehicle,
      team: '당번 1팀',
      assignedCrewIds: selectedCrewIds,
      startTime: `${startH}:${startM}`,
      endTime: endStr,
      durationMinutes,
      isNightShift,
      isSpecialEvent,
      specialEventDescription: isSpecialEvent
        ? type === '중증응급/CPR'
          ? '전문 심폐소생술 및 심장충격기 가동'
          : '고열 농연 옥내 진입 진압'
        : undefined,
    };

    onAddDispatch(newDispatch);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-500/20 border border-red-500/30 flex items-center justify-center text-red-400">
              <Flame className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">긴급 출동 시뮬레이션 발령</h3>
              <p className="text-xs text-slate-400">
                새로운 출동을 가상 발령하여 대원 누적 피로도 점수 변화를 즉시 시뮬레이션합니다.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Dispatch Type Selector */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1.5">출동 유형 선택</label>
            <div className="grid grid-cols-4 gap-2">
              {(['중증응급/CPR', '화재', '일반구급', '오작동/기타'] as DispatchType[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => handleTypeChange(t)}
                  className={`py-2 px-2 rounded-lg font-medium text-center border transition ${
                    type === t
                      ? 'bg-orange-600 text-white border-orange-500 shadow-sm'
                      : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Dispatch Title & Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">지령명 (상황)</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200 focus:border-orange-500 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">출동 위치</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200 focus:border-orange-500 focus:outline-none"
                required
              />
            </div>
          </div>

          {/* Duration & Multipliers */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-950/70 p-3 rounded-xl border border-slate-800">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">현장 활동 시간</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="10"
                  max="300"
                  step="5"
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(parseInt(e.target.value) || 30)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-200 font-bold"
                />
                <span className="text-slate-400">분</span>
              </div>
            </div>

            <div className="flex items-center justify-between sm:flex-col sm:items-start gap-1">
              <label className="text-slate-300 font-semibold">심야 출동 (00~06시)</label>
              <label className="flex items-center gap-2 cursor-pointer mt-1">
                <input
                  type="checkbox"
                  checked={isNightShift}
                  onChange={(e) => setIsNightShift(e.target.checked)}
                  className="accent-purple-500 w-4 h-4"
                />
                <span className="text-slate-300 text-[11px]">1.3배 가중</span>
              </label>
            </div>

            <div className="flex items-center justify-between sm:flex-col sm:items-start gap-1">
              <label className="text-slate-300 font-semibold">고위험 스트레스</label>
              <label className="flex items-center gap-2 cursor-pointer mt-1">
                <input
                  type="checkbox"
                  checked={isSpecialEvent}
                  onChange={(e) => setIsSpecialEvent(e.target.checked)}
                  className="accent-red-500 w-4 h-4"
                />
                <span className="text-slate-300 text-[11px]">CPR/고열 가중</span>
              </label>
            </div>
          </div>

          {/* Crew Selection */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1.5 flex items-center justify-between">
              <span>출동 투입 대원 선택 ({selectedCrewIds.length}명 선택됨)</span>
              <span className="text-[11px] text-slate-400">클릭하여 토글</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-40 overflow-y-auto pr-1">
              {crews.map((c) => {
                const isSelected = selectedCrewIds.includes(c.id);
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => toggleCrew(c.id)}
                    className={`p-2 rounded-lg text-left border flex items-center justify-between transition ${
                      isSelected
                        ? 'bg-orange-950/60 border-orange-500/70 text-orange-200'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-[11px] text-slate-200">
                        {c.name} {c.rank}
                      </div>
                      <div className="text-[10px] text-slate-400">{c.role}</div>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        c.fatigueScore >= 80
                          ? 'bg-red-500/20 text-red-400'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {c.fatigueScore}pt
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Submit */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 font-medium"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white font-semibold flex items-center gap-1.5 shadow-md shadow-red-900/30"
            >
              <Send className="w-3.5 h-3.5" />
              출동 지령 발령 및 피로도 갱신
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
