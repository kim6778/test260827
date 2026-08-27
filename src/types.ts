export type DutyTeam = '당번 1팀' | '당번 2팀' | '당번 3팀';

export type DispatchType = '화재' | '중증응급/CPR' | '일반구급' | '구조' | '생활안전' | '오작동/기타';

export type FatigueLevel = 'safe' | 'caution' | 'danger'; // 🟢안전(0~49), 🟡주의(50~79), 🔴위험(80+)

export interface DispatchRecord {
  id: string;
  dispatchNumber: string;
  title: string;
  type: DispatchType;
  location: string;
  vehicle: string;
  team: DutyTeam;
  assignedCrewIds: string[];
  startTime: string; // ISO or HH:mm
  endTime: string;
  durationMinutes: number;
  isNightShift: boolean; // 00:00 ~ 06:00
  isSpecialEvent: boolean; // CPR, 고온현장, 맹렬화재 등
  specialEventDescription?: string;
}

export interface CrewMember {
  id: string;
  name: string;
  rank: '소방사' | '소방교' | '소방장' | '소방위' | '소방경';
  role: '진압대원' | '구급대원(1급응급구조사)' | '구급대원(간호사)' | '운전/기관원' | '구조대원' | '안전관리관/지휘';
  team: DutyTeam;
  consecutiveDispatches: number; // 연속 출동 횟수
  todayDispatchCount: number;
  totalActiveMinutes: number;
  restMinutesAfterLastDispatch: number;
  lastDispatchType?: DispatchType;
  badges: string[]; // ['CPR 시행', '고온 노출', '연속 3회 출동']
  fatigueScore: number; // 0 ~ 100+
  fatigueLevel: FatigueLevel;
  healthNote?: string;
  phone?: string;
}

export interface VehicleStatus {
  id: string;
  name: string;
  plateNumber: string;
  type: '펌프차' | '물탱크차' | '구급차' | '구조공작차' | '지휘차' | '화학차';
  status: '대기' | '출동중' | '정비필요' | '소독중';
  fuelLevel: number; // %
  currentMileageKm: number;
  nextInspectionDDay: number; // D-day (e.g. 3, -1)
  lastInspectionDate: string;
  pumpRunningHours?: number; // 펌프 가동 누적 시간
  criticalSuppliesCheck: boolean; // 산소통, AED, 유압절단기 등
}

export interface AlgorithmWeights {
  heavyWeight: number; // 중증/화재 가중치 (1.5 ~ 2.0)
  normalWeight: number; // 일반 구급/구조 가중치 (1.0)
  minorWeight: number; // 생활안전/오작동 가중치 (0.6)
  nightMultiplier: number; // 심야 출동 배율 (1.3)
  consecutiveMultiplier: number; // 연속 출동 가산 계수 (1.15 per streak)
  restDecayRate: number; // 분당 휴식 감쇄 (0.15점/분)
}

export interface ApiConfig {
  serviceKey: string;
  endpointUrl: string;
  centerName: string;
  isApiMode: boolean; // true: 실시간 API, false: 시뮬레이션 Demo
  connectionStatus: 'disconnected' | 'testing' | 'connected' | 'error';
  lastSyncTime?: string;
  statusCode?: number;
  errorMessage?: string;
}

export interface CommanderAlert {
  id: string;
  timestamp: string;
  level: 'danger' | 'caution' | 'info';
  targetCrewName: string;
  title: string;
  actionRequired: string;
  acknowledged: boolean;
}
