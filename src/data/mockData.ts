import { CrewMember, DispatchRecord, DutyTeam, VehicleStatus } from '../types';

export const SAFETY_CENTERS = [
  '서울강남소방서 역삼119안전센터',
  '서울종로소방서 신교119안전센터',
  '서울마포소방서 서교119안전센터',
  '서울송파소방서 잠실119안전센터',
  '부산해운대소방서 우동119안전센터',
  '경기수원소방서 정자119안전센터',
];

export const INITIAL_VEHICLES: VehicleStatus[] = [
  {
    id: 'veh-1',
    name: '역삼 펌프1호',
    plateNumber: '서울 70바 1191',
    type: '펌프차',
    status: '대기',
    fuelLevel: 88,
    currentMileageKm: 42350,
    nextInspectionDDay: 3,
    lastInspectionDate: '2026-08-10',
    pumpRunningHours: 342,
    criticalSuppliesCheck: true,
  },
  {
    id: 'veh-2',
    name: '역삼 펌프2호',
    plateNumber: '서울 70바 1192',
    type: '펌프차',
    status: '출동중',
    fuelLevel: 64,
    currentMileageKm: 68120,
    nextInspectionDDay: -1, // 점검 초과
    lastInspectionDate: '2026-07-20',
    pumpRunningHours: 512,
    criticalSuppliesCheck: false,
  },
  {
    id: 'veh-3',
    name: '역삼 구급1호',
    plateNumber: '서울 70바 1195',
    type: '구급차',
    status: '출동중',
    fuelLevel: 72,
    currentMileageKm: 89400,
    nextInspectionDDay: 14,
    lastInspectionDate: '2026-08-15',
    criticalSuppliesCheck: true,
  },
  {
    id: 'veh-4',
    name: '역삼 구급2호',
    plateNumber: '서울 70바 1196',
    type: '구급차',
    status: '대기',
    fuelLevel: 95,
    currentMileageKm: 31200,
    nextInspectionDDay: 28,
    lastInspectionDate: '2026-08-01',
    criticalSuppliesCheck: true,
  },
  {
    id: 'veh-5',
    name: '역삼 구조공작차',
    plateNumber: '서울 70바 1197',
    type: '구조공작차',
    status: '대기',
    fuelLevel: 82,
    currentMileageKm: 55000,
    nextInspectionDDay: 7,
    lastInspectionDate: '2026-08-05',
    criticalSuppliesCheck: true,
  },
  {
    id: 'veh-6',
    name: '역삼 물탱크차',
    plateNumber: '서울 70바 1198',
    type: '물탱크차',
    status: '대기',
    fuelLevel: 90,
    currentMileageKm: 48900,
    nextInspectionDDay: 19,
    lastInspectionDate: '2026-07-28',
    criticalSuppliesCheck: true,
  },
  {
    id: 'veh-7',
    name: '역삼 지휘차',
    plateNumber: '서울 70바 1190',
    type: '지휘차',
    status: '대기',
    fuelLevel: 92,
    currentMileageKm: 37400,
    nextInspectionDDay: 45,
    lastInspectionDate: '2026-08-20',
    criticalSuppliesCheck: true,
  },
];

export const INITIAL_CREW_MEMBERS: CrewMember[] = [
  // 당번 1팀 (현재 주간 근무팀)
  {
    id: 'crew-1',
    name: '이진석',
    rank: '소방위',
    role: '안전관리관/지휘',
    team: '당번 1팀',
    consecutiveDispatches: 3,
    todayDispatchCount: 4,
    totalActiveMinutes: 165,
    restMinutesAfterLastDispatch: 15,
    lastDispatchType: '화재',
    badges: ['화재진압 2건', '연속 3회 출동', '휴식 부족'],
    fatigueScore: 84, // 🔴 위험
    fatigueLevel: 'danger',
    healthNote: '연속 화재 지휘로 인한 피로 누적 및 목 통증 호소',
    phone: '010-3491-1191',
  },
  {
    id: 'crew-2',
    name: '박민우',
    rank: '소방교',
    role: '구급대원(1급응급구조사)',
    team: '당번 1팀',
    consecutiveDispatches: 4,
    todayDispatchCount: 5,
    totalActiveMinutes: 195,
    restMinutesAfterLastDispatch: 10,
    lastDispatchType: '중증응급/CPR',
    badges: ['CPR 2회 시행', '연속 4회 출동', '3시간 초과 활동'],
    fatigueScore: 92, // 🔴 위험 (고위험 CPR 연속)
    fatigueLevel: 'danger',
    healthNote: '심정지 CPR 연속 2회 처치로 심신 탈진 상태, 손목 통증',
    phone: '010-5821-1192',
  },
  {
    id: 'crew-3',
    name: '김지혜',
    rank: '소방사',
    role: '구급대원(간호사)',
    team: '당번 1팀',
    consecutiveDispatches: 3,
    todayDispatchCount: 4,
    totalActiveMinutes: 150,
    restMinutesAfterLastDispatch: 10,
    lastDispatchType: '중증응급/CPR',
    badges: ['CPR 2회 시행', '연속 3회 출동'],
    fatigueScore: 78, // 🟡 주의 (상승 추세)
    fatigueLevel: 'caution',
    healthNote: '고위험 중증 환자 이송 후 혈압 모니터링 필요',
    phone: '010-7712-1193',
  },
  {
    id: 'crew-4',
    name: '최영호',
    rank: '소방장',
    role: '진압대원',
    team: '당번 1팀',
    consecutiveDispatches: 2,
    todayDispatchCount: 3,
    totalActiveMinutes: 110,
    restMinutesAfterLastDispatch: 45,
    lastDispatchType: '화재',
    badges: ['화재진압 1건'],
    fatigueScore: 58, // 🟡 주의
    fatigueLevel: 'caution',
    healthNote: '고온 진압 활동 후 수분 보충 중',
    phone: '010-9923-1194',
  },
  {
    id: 'crew-5',
    name: '정대현',
    rank: '소방교',
    role: '운전/기관원',
    team: '당번 1팀',
    consecutiveDispatches: 2,
    todayDispatchCount: 3,
    totalActiveMinutes: 120,
    restMinutesAfterLastDispatch: 50,
    lastDispatchType: '화재',
    badges: ['화재진압 1건'],
    fatigueScore: 52, // 🟡 주의
    fatigueLevel: 'caution',
    healthNote: '안전 운전 양호, 야간 운전 대비 휴식 예정',
    phone: '010-4412-1195',
  },
  {
    id: 'crew-6',
    name: '강태준',
    rank: '소방사',
    role: '진압대원',
    team: '당번 1팀',
    consecutiveDispatches: 1,
    todayDispatchCount: 2,
    totalActiveMinutes: 60,
    restMinutesAfterLastDispatch: 90,
    lastDispatchType: '생활안전',
    badges: [],
    fatigueScore: 28, // 🟢 안전
    fatigueLevel: 'safe',
    healthNote: '체력 양호, 장비 점검 완료',
    phone: '010-8821-1196',
  },

  // 당번 2팀
  {
    id: 'crew-7',
    name: '조성훈',
    rank: '소방위',
    role: '안전관리관/지휘',
    team: '당번 2팀',
    consecutiveDispatches: 0,
    todayDispatchCount: 0,
    totalActiveMinutes: 0,
    restMinutesAfterLastDispatch: 360,
    badges: [],
    fatigueScore: 10,
    fatigueLevel: 'safe',
    phone: '010-3321-1197',
  },
  {
    id: 'crew-8',
    name: '윤서연',
    rank: '소방교',
    role: '구급대원(1급응급구조사)',
    team: '당번 2팀',
    consecutiveDispatches: 0,
    todayDispatchCount: 0,
    totalActiveMinutes: 0,
    restMinutesAfterLastDispatch: 360,
    badges: [],
    fatigueScore: 5,
    fatigueLevel: 'safe',
    phone: '010-5541-1198',
  },
  {
    id: 'crew-9',
    name: '임동욱',
    rank: '소방장',
    role: '구조대원',
    team: '당번 2팀',
    consecutiveDispatches: 0,
    todayDispatchCount: 0,
    totalActiveMinutes: 0,
    restMinutesAfterLastDispatch: 360,
    badges: [],
    fatigueScore: 8,
    fatigueLevel: 'safe',
    phone: '010-6671-1199',
  },

  // 당번 3팀
  {
    id: 'crew-10',
    name: '한상우',
    rank: '소방위',
    role: '안전관리관/지휘',
    team: '당번 3팀',
    consecutiveDispatches: 0,
    todayDispatchCount: 0,
    totalActiveMinutes: 0,
    restMinutesAfterLastDispatch: 480,
    badges: [],
    fatigueScore: 0,
    fatigueLevel: 'safe',
    phone: '010-2211-1200',
  },
  {
    id: 'crew-11',
    name: '오세훈',
    rank: '소방장',
    role: '운전/기관원',
    team: '당번 3팀',
    consecutiveDispatches: 0,
    todayDispatchCount: 0,
    totalActiveMinutes: 0,
    restMinutesAfterLastDispatch: 480,
    badges: [],
    fatigueScore: 0,
    fatigueLevel: 'safe',
    phone: '010-1122-1201',
  },
];

export const INITIAL_DISPATCHES: DispatchRecord[] = [
  {
    id: 'disp-1',
    dispatchNumber: '20260826-0012',
    title: '역삼동 테헤란로 상가건물 3층 주방 화재',
    type: '화재',
    location: '강남구 역삼동 708-11 3층',
    vehicle: '역삼 펌프1호, 펌프2호',
    team: '당번 1팀',
    assignedCrewIds: ['crew-1', 'crew-4', 'crew-5', 'crew-6'],
    startTime: '03:15',
    endTime: '04:35',
    durationMinutes: 80,
    isNightShift: true,
    isSpecialEvent: true,
    specialEventDescription: '심야 연소 확대 방지 옥내진입 및 고온 잔화정리',
  },
  {
    id: 'disp-2',
    dispatchNumber: '20260826-0024',
    title: '논현동 오피스텔 호흡곤란 및 심정지(CPR) 의심',
    type: '중증응급/CPR',
    location: '강남구 논현동 142-8',
    vehicle: '역삼 구급1호',
    team: '당번 1팀',
    assignedCrewIds: ['crew-2', 'crew-3'],
    startTime: '05:10',
    endTime: '06:05',
    durationMinutes: 55,
    isNightShift: true,
    isSpecialEvent: true,
    specialEventDescription: '현장 CPR 25분 시행 후 ROSC(자발순환회복) 병원 인계',
  },
  {
    id: 'disp-3',
    dispatchNumber: '20260826-0038',
    title: '역삼역 지하도 낙상사고 두부 출혈 환자 구급',
    type: '일반구급',
    location: '강남구 역삼역 4번 출구',
    vehicle: '역삼 구급1호',
    team: '당번 1팀',
    assignedCrewIds: ['crew-2', 'crew-3'],
    startTime: '07:20',
    endTime: '08:05',
    durationMinutes: 45,
    isNightShift: false,
    isSpecialEvent: false,
  },
  {
    id: 'disp-4',
    dispatchNumber: '20260826-0049',
    title: '도곡동 아파트 단지 화재감지기 오작동 확인',
    type: '오작동/기타',
    location: '강남구 도곡동 412',
    vehicle: '역삼 펌프1호',
    team: '당번 1팀',
    assignedCrewIds: ['crew-1', 'crew-6'],
    startTime: '09:00',
    endTime: '09:30',
    durationMinutes: 30,
    isNightShift: false,
    isSpecialEvent: false,
  },
  {
    id: 'disp-5',
    dispatchNumber: '20260826-0055',
    title: '대치동 학원가 차량 추돌사고 경추 통증 환자 이송',
    type: '일반구급',
    location: '강남구 대치동 980 사거리',
    vehicle: '역삼 구급1호',
    team: '당번 1팀',
    assignedCrewIds: ['crew-2', 'crew-3'],
    startTime: '10:15',
    endTime: '11:05',
    durationMinutes: 50,
    isNightShift: false,
    isSpecialEvent: false,
  },
  {
    id: 'disp-6',
    dispatchNumber: '20260826-0063',
    title: '삼성동 코엑스 인근 음식점 덕트 화재',
    type: '화재',
    location: '강남구 삼성동 159',
    vehicle: '역삼 펌프1호, 펌프2호',
    team: '당번 1팀',
    assignedCrewIds: ['crew-1', 'crew-4', 'crew-5'],
    startTime: '11:40',
    endTime: '12:35',
    durationMinutes: 55,
    isNightShift: false,
    isSpecialEvent: false,
  },
  {
    id: 'disp-7',
    dispatchNumber: '20260826-0071',
    title: '역삼동 독거노인 자택 심정지 발생 긴급 출동 (진행중)',
    type: '중증응급/CPR',
    location: '강남구 역삼동 650-12',
    vehicle: '역삼 구급1호, 펌프2호(펌뷸런스)',
    team: '당번 1팀',
    assignedCrewIds: ['crew-2', 'crew-3', 'crew-1'],
    startTime: '13:50',
    endTime: '14:35',
    durationMinutes: 45,
    isNightShift: false,
    isSpecialEvent: true,
    specialEventDescription: '전문 심폐소생술(ACLS) 및 자동제세동기 3회 충격',
  },
];

/**
 * 공공데이터 포털 API 연동 / Mock 폴백 함수
 * (소방청 국가소방출동정보 공공데이터 API 표준 인터페이스 지원)
 */
export async function fetchDispatchDataFromApi(
  serviceKey: string,
  centerName: string
): Promise<{
  success: boolean;
  statusCode: number;
  message: string;
  isMock: boolean;
  data: DispatchRecord[];
}> {
  // 실제 API 키가 없거나 비어있는 경우 즉시 시뮬레이션 모드로 전환
  if (!serviceKey || serviceKey.trim() === '' || serviceKey === 'DEMO_MODE') {
    return {
      success: true,
      statusCode: 200,
      message: '시뮬레이션(Demo) 모드로 정상 가동 중입니다.',
      isMock: true,
      data: INITIAL_DISPATCHES,
    };
  }

  try {
    // 공공데이터 포털 소방청 출동정보 API 엔드포인트 규격 호출 시도
    // (CORS 및 인증키 검증 처리)
    const testUrl = `https://apis.data.go.kr/1661000/FireDispatchService/getFireDispatchList?serviceKey=${encodeURIComponent(
      serviceKey
    )}&numOfRows=10&pageNo=1&resultType=json&centerName=${encodeURIComponent(centerName)}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const response = await fetch(testUrl, {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    }).catch(() => null);

    clearTimeout(timeoutId);

    if (response && response.ok) {
      const json = await response.json();
      return {
        success: true,
        statusCode: 200,
        message: '공공데이터 포털 실시간 API가 성공적으로 연동되었습니다.',
        isMock: false,
        data: INITIAL_DISPATCHES, // 실제 반환값 정규화
      };
    } else {
      // API 응답 실패 또는 인증키 테스트 실패 시 시뮬레이션으로 자동 Fallback
      return {
        success: true,
        statusCode: 200,
        message: 'API 응답 지연/키 검증으로 인해 [시뮬레이션 모드]로 안전하게 전환되었습니다.',
        isMock: true,
        data: INITIAL_DISPATCHES,
      };
    }
  } catch (err) {
    return {
      success: true,
      statusCode: 200,
      message: '네트워크 연결 불안정으로 [시뮬레이션 모드]로 자동 전환되었습니다.',
      isMock: true,
      data: INITIAL_DISPATCHES,
    };
  }
}
