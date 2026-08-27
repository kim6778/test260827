import { AlgorithmWeights, CrewMember, DispatchRecord, FatigueLevel } from '../types';

export const DEFAULT_ALGORITHM_WEIGHTS: AlgorithmWeights = {
  heavyWeight: 1.8, // 중증/화재 (1.5 ~ 2.0)
  normalWeight: 1.0, // 일반 구급/구조
  minorWeight: 0.6, // 생활안전/오작동
  nightMultiplier: 1.3, // 심야 (00:00 ~ 06:00)
  consecutiveMultiplier: 1.15, // 연속 출동 시 회당 15% 가중
  restDecayRate: 0.15, // 분당 0.15점 휴식 감쇄 (1시간 휴식 시 9점 감소)
};

/**
 * 출동 유형별 가중치 반환
 */
export function getDispatchTypeWeight(type: string, weights: AlgorithmWeights): number {
  switch (type) {
    case '화재':
    case '중증응급/CPR':
      return weights.heavyWeight;
    case '일반구급':
    case '구조':
      return weights.normalWeight;
    case '생활안전':
    case '오작동/기타':
    default:
      return weights.minorWeight;
  }
}

/**
 * 단일 출동 건에 대한 원시 피로도 산출
 */
export function calculateSingleDispatchFatigue(
  dispatch: DispatchRecord,
  consecutiveCount: number,
  weights: AlgorithmWeights
): number {
  const typeWeight = getDispatchTypeWeight(dispatch.type, weights);
  const baseFatigue = typeWeight * dispatch.durationMinutes;

  let multiplier = 1.0;
  if (dispatch.isNightShift) {
    multiplier *= weights.nightMultiplier;
  }

  if (consecutiveCount > 1) {
    // 2회 연속: 1.15, 3회 연속: 1.30, etc.
    multiplier *= 1 + (consecutiveCount - 1) * (weights.consecutiveMultiplier - 1);
  }

  // 특수 스트레스 요소 (CPR, 극심 고온 등 가중)
  if (dispatch.isSpecialEvent) {
    multiplier *= 1.2;
  }

  return baseFatigue * multiplier;
}

/**
 * 대원의 실시간 누적 피로도 계산
 * 피로도 지수 = [출동 유형 가중치 × 활동 시간(분)] × 심야/연속출동 계수 - (귀소 후 휴식 시간 감쇄)
 */
export function calculateCrewFatigue(
  member: CrewMember,
  dispatches: DispatchRecord[],
  weights: AlgorithmWeights
): {
  score: number;
  level: FatigueLevel;
  badges: string[];
  breakdown: {
    baseDispatchesScore: number;
    consecutiveBonus: number;
    nightBonus: number;
    restDeduction: number;
  };
} {
  const memberDispatches = dispatches.filter((d) =>
    d.assignedCrewIds.includes(member.id)
  );

  let totalRawScore = 0;
  let consecutiveBonusSum = 0;
  let nightBonusSum = 0;
  const badges: string[] = [];

  let currentStreak = 0;
  let cprCount = 0;
  let heavyFireCount = 0;

  // 출동 목록 정렬 (시간순)
  const sortedDispatches = [...memberDispatches].sort(
    (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
  );

  sortedDispatches.forEach((dispatch, idx) => {
    currentStreak++;
    const typeWeight = getDispatchTypeWeight(dispatch.type, weights);
    const baseVal = typeWeight * dispatch.durationMinutes;

    let dispatchMult = 1.0;
    if (dispatch.isNightShift) {
      dispatchMult *= weights.nightMultiplier;
      nightBonusSum += baseVal * (weights.nightMultiplier - 1);
    }

    if (currentStreak > 1) {
      const streakRatio = (currentStreak - 1) * (weights.consecutiveMultiplier - 1);
      dispatchMult *= 1 + streakRatio;
      consecutiveBonusSum += baseVal * streakRatio;
    }

    if (dispatch.type === '중증응급/CPR' || dispatch.isSpecialEvent) {
      cprCount++;
    }
    if (dispatch.type === '화재') {
      heavyFireCount++;
    }

    totalRawScore += baseVal * dispatchMult;
  });

  // 휴식 감쇄 (귀소 후 휴식 시간 분 * restDecayRate)
  const restDeduction = member.restMinutesAfterLastDispatch * weights.restDecayRate;
  
  // 최종 점수 (최소 0점)
  const finalScore = Math.max(0, Math.round((totalRawScore - restDeduction) * 10) / 10);

  // 뱃지 부여
  if (cprCount > 0) {
    badges.push(`CPR ${cprCount}회 시행`);
  }
  if (heavyFireCount > 0) {
    badges.push(`화재진압 ${heavyFireCount}건`);
  }
  if (member.consecutiveDispatches >= 3) {
    badges.push(`연속 ${member.consecutiveDispatches}회 출동`);
  }
  if (member.totalActiveMinutes >= 180) {
    badges.push('3시간 초과 활동');
  }
  if (member.restMinutesAfterLastDispatch < 30 && member.todayDispatchCount > 0) {
    badges.push('휴식 부족');
  }

  // 상태 구분: 🟢안전(0~49), 🟡주의(50~79), 🔴위험(80+)
  let level: FatigueLevel = 'safe';
  if (finalScore >= 80) {
    level = 'danger';
  } else if (finalScore >= 50) {
    level = 'caution';
  } else {
    level = 'safe';
  }

  return {
    score: finalScore,
    level,
    badges,
    breakdown: {
      baseDispatchesScore: Math.round(totalRawScore * 10) / 10,
      consecutiveBonus: Math.round(consecutiveBonusSum * 10) / 10,
      nightBonus: Math.round(nightBonusSum * 10) / 10,
      restDeduction: Math.round(restDeduction * 10) / 10,
    },
  };
}

export function getFatigueColorClass(level: FatigueLevel): {
  bg: string;
  border: string;
  text: string;
  badgeBg: string;
  barColor: string;
  glow: string;
} {
  switch (level) {
    case 'danger':
      return {
        bg: 'bg-rose-50/90 dark:bg-rose-950/40',
        border: 'border-rose-300 dark:border-rose-800/60',
        text: 'text-rose-700 dark:text-rose-350',
        badgeBg: 'bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-200 border-rose-300',
        barColor: 'bg-rose-500',
        glow: 'shadow-rose-500/20',
      };
    case 'caution':
      return {
        bg: 'bg-amber-50/90 dark:bg-amber-950/40',
        border: 'border-amber-300 dark:border-amber-800/60',
        text: 'text-amber-700 dark:text-amber-350',
        badgeBg: 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-200 border-amber-300',
        barColor: 'bg-amber-500',
        glow: 'shadow-amber-500/20',
      };
    case 'safe':
    default:
      return {
        bg: 'bg-emerald-50/90 dark:bg-emerald-950/30',
        border: 'border-emerald-200 dark:border-emerald-800/50',
        text: 'text-emerald-700 dark:text-emerald-350',
        badgeBg: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200 border-emerald-300',
        barColor: 'bg-emerald-500',
        glow: 'shadow-emerald-500/20',
      };
  }
}
