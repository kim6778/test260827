import React, { useState } from 'react';
import {
  Key,
  Shield,
  Radio,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Building2,
  Flame,
  Code2,
  Eye,
  EyeOff,
  RefreshCw,
  Clock,
} from 'lucide-react';
import { AlgorithmWeights, ApiConfig, DutyTeam } from '../types';
import { DEFAULT_ALGORITHM_WEIGHTS } from '../utils/fatigueAlgorithm';
import { SAFETY_CENTERS } from '../data/mockData';

interface SidebarProps {
  apiConfig: ApiConfig;
  setApiConfig: React.Dispatch<React.SetStateAction<ApiConfig>>;
  weights: AlgorithmWeights;
  setWeights: React.Dispatch<React.SetStateAction<AlgorithmWeights>>;
  selectedTeam: DutyTeam | '전체';
  setSelectedTeam: (team: DutyTeam | '전체') => void;
  selectedCenter: string;
  setSelectedCenter: (center: string) => void;
  onTestApi: () => void;
  isTesting: boolean;
  onOpenSimulateModal: () => void;
  onOpenPythonModal: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  apiConfig,
  setApiConfig,
  weights,
  setWeights,
  selectedTeam,
  setSelectedTeam,
  selectedCenter,
  setSelectedCenter,
  onTestApi,
  isTesting,
  onOpenSimulateModal,
  onOpenPythonModal,
}) => {
  const [showKey, setShowKey] = useState(false);

  const handleKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    const isRealApi = val.trim().length > 10;
    setApiConfig((prev) => ({
      ...prev,
      serviceKey: val,
      isApiMode: isRealApi,
      connectionStatus: isRealApi ? 'connected' : 'disconnected',
    }));
  };

  const handleResetWeights = () => {
    setWeights(DEFAULT_ALGORITHM_WEIGHTS);
  };

  return (
    <aside
      id="safe119-sidebar"
      className="w-full lg:w-80 flex-shrink-0 bg-slate-900 text-slate-100 border-r border-slate-800 p-5 flex flex-col gap-6 overflow-y-auto"
    >
      {/* App Branding & Mode Badge */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-red-600 via-orange-500 to-amber-400 flex items-center justify-center shadow-lg shadow-orange-500/20">
            <Flame className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-tight text-white">Safe119</span>
              <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-red-500/20 text-red-400 border border-red-500/30">
                MVP
              </span>
            </div>
            <p className="text-xs text-slate-400">119 대원 출동 피로도 관제</p>
          </div>
        </div>

        {/* Real-time vs Demo Mode Indicator */}
        <div
          id="mode-indicator"
          className={`mt-2 p-3 rounded-xl border flex items-center justify-between transition-all ${
            apiConfig.isApiMode
              ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
              : 'bg-amber-950/40 border-amber-500/40 text-amber-300'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div
              className={`w-2.5 h-2.5 rounded-full animate-pulse ${
                apiConfig.isApiMode ? 'bg-emerald-400' : 'bg-amber-400'
              }`}
            />
            <div className="flex flex-col">
              <span className="text-xs font-bold uppercase tracking-wider">
                {apiConfig.isApiMode ? '실시간 API 연동 모드' : '시뮬레이션(Demo) 모드'}
              </span>
              <span className="text-[11px] text-slate-400">
                {apiConfig.isApiMode ? '공공데이터 포털 Live' : '소방 출동 가상 데이터셋'}
              </span>
            </div>
          </div>
          <Radio className="w-4 h-4 opacity-75" />
        </div>
      </div>

      {/* 1. API Key Setup Section */}
      <div id="api-key-section" className="space-y-3 pt-2 border-t border-slate-800">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <Key className="w-3.5 h-3.5 text-orange-400" />
            공공데이터 ServiceKey 인증키
          </label>
          <span className="text-[10px] text-slate-400">data.go.kr</span>
        </div>

        <div className="relative">
          <input
            id="service-key-input"
            type={showKey ? 'text' : 'password'}
            value={apiConfig.serviceKey}
            onChange={handleKeyChange}
            placeholder="공공데이터 인증키 입력 또는 .env"
            className="w-full bg-slate-950/90 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 pr-16"
          />
          <button
            type="button"
            onClick={() => setShowKey(!showKey)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 p-1"
            title={showKey ? '키 숨기기' : '키 보기'}
          >
            {showKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* API Test Button & Status */}
        <div className="flex items-center gap-2">
          <button
            id="api-test-button"
            type="button"
            onClick={onTestApi}
            disabled={isTesting}
            className="flex-1 bg-slate-800 hover:bg-slate-700 active:scale-[0.98] text-slate-200 text-xs py-2 px-3 rounded-lg border border-slate-700 flex items-center justify-center gap-1.5 font-medium transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin text-orange-400' : ''}`} />
            {isTesting ? 'API 응답 검증 중...' : 'API 연결 테스트'}
          </button>
        </div>

        {apiConfig.lastSyncTime && (
          <div className="text-[11px] text-slate-400 flex items-center gap-1">
            <Clock className="w-3 h-3 text-slate-500" />
            최근 동기화: {apiConfig.lastSyncTime} (HTTP {apiConfig.statusCode || 200})
          </div>
        )}
      </div>

      {/* 2. Station & Team Filter */}
      <div id="station-filter-section" className="space-y-3 pt-2 border-t border-slate-800">
        <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
          <Building2 className="w-3.5 h-3.5 text-blue-400" />
          관할 119안전센터 선택
        </label>
        <select
          id="center-select"
          value={selectedCenter}
          onChange={(e) => setSelectedCenter(e.target.value)}
          className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
        >
          {SAFETY_CENTERS.map((center) => (
            <option key={center} value={center}>
              {center}
            </option>
          ))}
        </select>

        <div className="space-y-1.5">
          <span className="text-xs font-semibold text-slate-300">근무 교대팀 (당번/비번)</span>
          <div className="grid grid-cols-4 gap-1">
            {(['전체', '당번 1팀', '당번 2팀', '당번 3팀'] as const).map((team) => (
              <button
                key={team}
                type="button"
                onClick={() => setSelectedTeam(team)}
                className={`text-[11px] py-1.5 px-1 rounded-md font-medium text-center transition ${
                  selectedTeam === team
                    ? 'bg-orange-600 text-white shadow-sm'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
                }`}
              >
                {team.replace('당번 ', '')}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Fatigue Algorithm Weights Adjuster */}
      <div id="weights-section" className="space-y-3 pt-2 border-t border-slate-800">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-amber-400" />
            피로도 알고리즘 가중치 설정
          </label>
          <button
            type="button"
            onClick={handleResetWeights}
            className="text-[10px] text-slate-400 hover:text-amber-400 flex items-center gap-1"
            title="기본 가중치로 초기화"
          >
            <RotateCcw className="w-3 h-3" /> 초기화
          </button>
        </div>

        {/* Sliders */}
        <div className="space-y-2.5 text-xs">
          <div>
            <div className="flex justify-between text-slate-400 mb-1 text-[11px]">
              <span>🔥 중증/화재 가중치</span>
              <span className="font-semibold text-orange-400">{weights.heavyWeight.toFixed(1)}x</span>
            </div>
            <input
              type="range"
              min="1.0"
              max="3.0"
              step="0.1"
              value={weights.heavyWeight}
              onChange={(e) =>
                setWeights((prev) => ({ ...prev, heavyWeight: parseFloat(e.target.value) }))
              }
              className="w-full accent-orange-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-slate-400 mb-1 text-[11px]">
              <span>🚑 일반 구급/구조</span>
              <span className="font-semibold text-slate-200">{weights.normalWeight.toFixed(1)}x</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="2.0"
              step="0.1"
              value={weights.normalWeight}
              onChange={(e) =>
                setWeights((prev) => ({ ...prev, normalWeight: parseFloat(e.target.value) }))
              }
              className="w-full accent-slate-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-slate-400 mb-1 text-[11px]">
              <span>🌙 심야 출동 배율 (00~06시)</span>
              <span className="font-semibold text-purple-400">{weights.nightMultiplier.toFixed(1)}x</span>
            </div>
            <input
              type="range"
              min="1.0"
              max="2.0"
              step="0.1"
              value={weights.nightMultiplier}
              onChange={(e) =>
                setWeights((prev) => ({ ...prev, nightMultiplier: parseFloat(e.target.value) }))
              }
              className="w-full accent-purple-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-slate-400 mb-1 text-[11px]">
              <span>☕ 귀소 후 휴식 감쇄 (분당)</span>
              <span className="font-semibold text-emerald-400">-{weights.restDecayRate.toFixed(2)}점</span>
            </div>
            <input
              type="range"
              min="0.05"
              max="0.50"
              step="0.05"
              value={weights.restDecayRate}
              onChange={(e) =>
                setWeights((prev) => ({ ...prev, restDecayRate: parseFloat(e.target.value) }))
              }
              className="w-full accent-emerald-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* 4. Action Triggers */}
      <div className="space-y-2 pt-2 border-t border-slate-800 mt-auto">
        <button
          id="trigger-simulate-dispatch-btn"
          type="button"
          onClick={onOpenSimulateModal}
          className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white text-xs font-semibold py-2.5 px-3 rounded-lg shadow-md shadow-red-900/30 flex items-center justify-center gap-2 transition active:scale-[0.98]"
        >
          <Flame className="w-4 h-4 text-amber-200" />
          긴급 출동 시뮬레이션 발령
        </button>

        <button
          id="open-python-code-btn"
          type="button"
          onClick={onOpenPythonModal}
          className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium py-2 px-3 rounded-lg border border-slate-700 flex items-center justify-center gap-2 transition"
        >
          <Code2 className="w-4 h-4 text-emerald-400" />
          Python app.py 소스코드 & 실행 가이드
        </button>
      </div>
    </aside>
  );
};
