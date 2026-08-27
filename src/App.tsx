import React, { useState, useEffect, useMemo } from 'react';
import {
  Flame,
  Shield,
  Activity,
  Radio,
  Clock,
  Code2,
  Bell,
  RefreshCw,
  Sparkles,
  Download,
  CheckCircle2,
  Sliders,
  Building2,
  Calendar,
  AlertTriangle,
  HeartPulse,
} from 'lucide-react';
import {
  AlgorithmWeights,
  ApiConfig,
  CrewMember,
  DispatchRecord,
  DutyTeam,
  VehicleStatus,
} from './types';
import {
  DEFAULT_ALGORITHM_WEIGHTS,
  calculateCrewFatigue,
} from './utils/fatigueAlgorithm';
import {
  INITIAL_CREW_MEMBERS,
  INITIAL_DISPATCHES,
  INITIAL_VEHICLES,
  SAFETY_CENTERS,
  fetchDispatchDataFromApi,
} from './data/mockData';
import { Sidebar } from './components/Sidebar';
import { KpiSummary } from './components/KpiSummary';
import { CommanderAlerts } from './components/CommanderAlerts';
import { FatigueMonitor } from './components/FatigueMonitor';
import { DispatchTimeline } from './components/DispatchTimeline';
import { VehicleMaintenance } from './components/VehicleMaintenance';
import { DispatchSimulatorModal } from './components/DispatchSimulatorModal';
import { PythonCodeModal } from './components/PythonCodeModal';

const PYTHON_CODE_STRING = `"""
Safe119: 공공데이터 API 연동 119 출동 피로도 모니터링 대시보드 (MVP)
================================================================================
* 기술 스택: Python (Streamlit, Pandas, Plotly, Requests, python-dotenv)
* 실행 명령어: streamlit run app.py
================================================================================
"""

import os
import time
from datetime import datetime
import dotenv
import pandas as pd
import plotly.express as px
import requests
import streamlit as st

st.set_page_config(page_title="Safe119 피로도 대시보드", page_icon="🚒", layout="wide")
dotenv.load_dotenv()
DEFAULT_KEY = os.getenv("SERVICE_KEY", "")

# 1. Mock 데이터 및 알고리즘
def generate_mock_data():
    today = datetime.now().strftime("%Y-%m-%d")
    crews = [
        {"id": "c1", "name": "이진석", "rank": "소방위", "role": "지휘관", "team": "당번 1팀", "consecutive": 3, "dispatches": 4, "active_min": 165, "rest_min": 15, "last_type": "화재"},
        {"id": "c2", "name": "박민우", "rank": "소방교", "role": "구급(1급응급구조사)", "team": "당번 1팀", "consecutive": 4, "dispatches": 5, "active_min": 195, "rest_min": 10, "last_type": "중증응급/CPR"},
        {"id": "c3", "name": "김지혜", "rank": "소방사", "role": "구급(간호사)", "team": "당번 1팀", "consecutive": 3, "dispatches": 4, "active_min": 150, "rest_min": 10, "last_type": "중증응급/CPR"},
        {"id": "c4", "name": "최영호", "rank": "소방장", "role": "진압대원", "team": "당번 1팀", "consecutive": 2, "dispatches": 3, "active_min": 110, "rest_min": 45, "last_type": "화재"},
    ]
    dispatches = [
        {"id": "d1", "title": "역삼동 상가 3층 주방 화재", "type": "화재", "start": f"{today} 03:15", "end": f"{today} 04:35", "duration": 80, "vehicle": "펌프1호", "is_night": True, "crew_ids": ["c1", "c4"]},
        {"id": "d2", "title": "논현동 심정지(CPR) 긴급출동", "type": "중증응급/CPR", "start": f"{today} 05:10", "end": f"{today} 06:05", "duration": 55, "vehicle": "구급1호", "is_night": True, "crew_ids": ["c2", "c3"]},
        {"id": "d3", "title": "대치동 추돌사고 환자 이송", "type": "일반구급", "start": f"{today} 10:15", "end": f"{today} 11:05", "duration": 50, "vehicle": "구급1호", "is_night": False, "crew_ids": ["c2", "c3"]},
    ]
    vehicles = [
        {"name": "역삼 펌프1호", "status": "대기", "fuel": 88, "dday": 3, "mileage": 42350},
        {"name": "역삼 펌프2호", "status": "출동중", "fuel": 64, "dday": -1, "mileage": 68120},
        {"name": "역삼 구급1호", "status": "출동중", "fuel": 72, "dday": 14, "mileage": 89400},
    ]
    return pd.DataFrame(crews), pd.DataFrame(dispatches), pd.DataFrame(vehicles)

# 사이드바 설정
st.sidebar.title("🚒 Safe119 설정")
service_key = st.sidebar.text_input("ServiceKey (인증키)", value=DEFAULT_KEY, type="password")
center_name = st.sidebar.selectbox("관할 센터", ["서울강남소방서 역삼119안전센터", "서울종로소방서 신교119안전센터"])

if service_key and len(service_key.strip()) > 10:
    st.sidebar.success("🌐 [실시간 API 연동 모드]")
else:
    st.sidebar.warning("⚡ [시뮬레이션(Demo) 모드]")

heavy_w = st.sidebar.slider("🔥 중증/화재 가중치", 1.0, 3.0, 1.8, 0.1)
night_mult = st.sidebar.slider("🌙 심야 배율 (00~06시)", 1.0, 2.0, 1.3, 0.1)
decay_rate = st.sidebar.slider("☕ 휴식 감쇄율", 0.05, 0.50, 0.15, 0.05)

df_crews, df_dispatches, df_vehicles = generate_mock_data()

# 메인 KPI
st.title("🚨 Safe119 출동 피로도 모니터링 대시보드")
st.markdown(f"**관할:** {center_name}")

k1, k2, k3 = st.columns(3)
k1.metric("금일 총 출동수", f"{len(df_dispatches)} 건")
k2.metric("🔴 위험 대원수", "2 명", delta="휴식 권고 대상", delta_color="inverse")
k3.metric("소방차량 대기", f"{len(df_vehicles[df_vehicles['status']=='대기'])} 대")

st.markdown("---")
st.error("🚨 [긴급 지휘관 권고] 박민우 소방교(구급), 이진석 소방위(지휘): 피로도 80점 초과 → 즉시 30~60분 강제 휴식 지시 필요")

# 타임라인 차트
fig = px.timeline(df_dispatches, x_start="start", x_end="end", y="vehicle", color="type", title="24시간 출동 타임라인 (간트 차트)")
fig.update_yaxes(autorange="reversed")
st.plotly_chart(fig, use_container_width=True)
`;

export default function App() {
  const [apiConfig, setApiConfig] = useState<ApiConfig>({
    serviceKey: '',
    endpointUrl: 'https://apis.data.go.kr/1661000/FireDispatchService/getFireDispatchList',
    centerName: SAFETY_CENTERS[0],
    isApiMode: false,
    connectionStatus: 'disconnected',
    lastSyncTime: '방금 전 (자동 모의 연동)',
    statusCode: 200,
  });

  const [weights, setWeights] = useState<AlgorithmWeights>(DEFAULT_ALGORITHM_WEIGHTS);
  const [selectedTeam, setSelectedTeam] = useState<DutyTeam | '전체'>('당번 1팀');
  const [selectedCenter, setSelectedCenter] = useState<string>(SAFETY_CENTERS[0]);
  const [isTestingApi, setIsTestingApi] = useState(false);

  const [dispatches, setDispatches] = useState<DispatchRecord[]>(INITIAL_DISPATCHES);
  const [vehicles, setVehicles] = useState<VehicleStatus[]>(INITIAL_VEHICLES);
  const [rawCrews, setRawCrews] = useState<CrewMember[]>(INITIAL_CREW_MEMBERS);

  // Modals
  const [isSimulateModalOpen, setIsSimulateModalOpen] = useState(false);
  const [isPythonModalOpen, setIsPythonModalOpen] = useState(false);

  // Live Time clock
  const [currentTime, setCurrentTime] = useState<string>('');
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleDateString('ko-KR', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          weekday: 'short',
        }) +
          ' ' +
          now.toLocaleTimeString('ko-KR', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Dynamically calculate fatigue score for all crews based on current dispatches and weights
  const crews = useMemo(() => {
    return rawCrews.map((crew) => {
      const { score, level, badges } = calculateCrewFatigue(crew, dispatches, weights);
      return {
        ...crew,
        fatigueScore: score,
        fatigueLevel: level,
        badges,
      };
    });
  }, [rawCrews, dispatches, weights]);

  // API Connection Test Handler
  const handleTestApi = async () => {
    setIsTestingApi(true);
    const res = await fetchDispatchDataFromApi(apiConfig.serviceKey, selectedCenter);
    setIsTestingApi(false);

    const nowStr = new Date().toLocaleTimeString('ko-KR');
    setApiConfig((prev) => ({
      ...prev,
      connectionStatus: res.success ? 'connected' : 'error',
      lastSyncTime: nowStr,
      statusCode: res.statusCode,
      isApiMode: !res.isMock,
    }));
  };

  // Commander Assigns Rest (increases rest minutes, reducing fatigue)
  const handleAssignRest = (crewId: string, minutes: number) => {
    setRawCrews((prev) =>
      prev.map((c) => {
        if (c.id === crewId) {
          return {
            ...c,
            restMinutesAfterLastDispatch: c.restMinutesAfterLastDispatch + minutes,
            consecutiveDispatches: Math.max(0, c.consecutiveDispatches - 1),
          };
        }
        return c;
      })
    );
  };

  // Add new emergency dispatch from Simulator
  const handleAddDispatch = (newDispatch: DispatchRecord) => {
    setDispatches((prev) => [newDispatch, ...prev]);

    // Update assigned crews' consecutive and active minutes
    setRawCrews((prev) =>
      prev.map((c) => {
        if (newDispatch.assignedCrewIds.includes(c.id)) {
          return {
            ...c,
            consecutiveDispatches: c.consecutiveDispatches + 1,
            todayDispatchCount: c.todayDispatchCount + 1,
            totalActiveMinutes: c.totalActiveMinutes + newDispatch.durationMinutes,
            restMinutesAfterLastDispatch: 0, // 출동 직후 휴식 시간 리셋
            lastDispatchType: newDispatch.type,
          };
        }
        return c;
      })
    );
  };

  // Complete vehicle inspection
  const handleCompleteInspection = (vehicleId: string) => {
    setVehicles((prev) =>
      prev.map((v) => {
        if (v.id === vehicleId) {
          return {
            ...v,
            nextInspectionDDay: 30, // 30일 후로 리셋
            lastInspectionDate: new Date().toISOString().split('T')[0],
            status: '대기',
          };
        }
        return v;
      })
    );
  };

  return (
    <div id="safe119-app" className="min-h-screen bg-slate-950 text-slate-100 flex flex-col lg:flex-row">
      {/* 1. Left Control Sidebar */}
      <Sidebar
        apiConfig={apiConfig}
        setApiConfig={setApiConfig}
        weights={weights}
        setWeights={setWeights}
        selectedTeam={selectedTeam}
        setSelectedTeam={setSelectedTeam}
        selectedCenter={selectedCenter}
        setSelectedCenter={setSelectedCenter}
        onTestApi={handleTestApi}
        isTesting={isTestingApi}
        onOpenSimulateModal={() => setIsSimulateModalOpen(true)}
        onOpenPythonModal={() => setIsPythonModalOpen(true)}
      />

      {/* 2. Main Command Dashboard */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Command Bar */}
        <header
          id="command-top-bar"
          className="bg-slate-900/90 border-b border-slate-800 px-6 py-3.5 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-20 backdrop-blur-md"
        >
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
            <div>
              <h1 className="text-sm font-bold text-white flex items-center gap-2">
                <span>{selectedCenter}</span>
                <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-orange-400 border border-slate-700 font-mono">
                  {selectedTeam} 실시간 관제
                </span>
              </h1>
              <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                <Clock className="w-3 h-3 text-slate-500" />
                <span>{currentTime || '2026년 8월 27일'}</span>
                <span className="text-slate-600">|</span>
                <span>현장 안전관리 기준 준수율: <strong className="text-emerald-400">98.5%</strong></span>
              </div>
            </div>
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setIsSimulateModalOpen(true)}
              className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-red-950/40 transition active:scale-95"
            >
              <Flame className="w-3.5 h-3.5 text-amber-200" />
              긴급 출동 발령
            </button>

            <button
              type="button"
              onClick={() => setIsPythonModalOpen(true)}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 flex items-center gap-1.5 transition"
            >
              <Code2 className="w-3.5 h-3.5 text-emerald-400" />
              Python app.py
            </button>
          </div>
        </header>

        {/* Dashboard Content Canvas */}
        <div className="p-5 md:p-6 space-y-6 max-w-7xl mx-auto w-full">
          {/* ① 상단 요약 KPI 바 */}
          <section id="section-kpi-summary">
            <KpiSummary crews={crews} dispatches={dispatches} vehicles={vehicles} />
          </section>

          {/* ③ 실시간 지휘관 권고 및 긴급 알림 배너 */}
          <section id="section-commander-alerts">
            <CommanderAlerts crews={crews} onAssignRest={handleAssignRest} />
          </section>

          {/* ② 대원별 피로도 모니터링 섹션 */}
          <section id="section-fatigue-monitor">
            <FatigueMonitor
              crews={crews}
              onAssignRest={handleAssignRest}
              selectedTeam={selectedTeam}
            />
          </section>

          {/* ④ 차량 정비 및 출동 타임라인 (간트 차트) */}
          <div className="grid grid-cols-1 gap-6">
            <section id="section-dispatch-timeline">
              <DispatchTimeline dispatches={dispatches} />
            </section>

            <section id="section-vehicle-maintenance">
              <VehicleMaintenance
                vehicles={vehicles}
                onCompleteInspection={handleCompleteInspection}
              />
            </section>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-auto border-t border-slate-900 px-6 py-4 text-center text-xs text-slate-500">
          <p>
            Safe119 119 출동 피로도 모니터링 대시보드 MVP | 소방청 공공데이터 API 표준 연동 규격 준수
          </p>
          <p className="text-[11px] text-slate-600 mt-1">
            소방공무원 보건안전 및 복지기본법 제10조(소방활동 안전관리) 기반 대원 보호 알고리즘
          </p>
        </footer>
      </main>

      {/* Simulator Modal */}
      <DispatchSimulatorModal
        isOpen={isSimulateModalOpen}
        onClose={() => setIsSimulateModalOpen(false)}
        crews={crews}
        onAddDispatch={handleAddDispatch}
      />

      {/* Python Source Code Modal */}
      <PythonCodeModal
        isOpen={isPythonModalOpen}
        onClose={() => setIsPythonModalOpen(false)}
        pythonCode={PYTHON_CODE_STRING}
      />
    </div>
  );
}
