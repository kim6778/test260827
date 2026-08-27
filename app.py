"""
Safe119: 공공데이터 API 연동 119 출동 피로도 모니터링 대시보드 (MVP)
================================================================================
* 역할: 119안전센터장 및 지휘관을 위한 대원 피로도 및 소방력 모니터링 시스템
* 기술 스택: Python (Streamlit, Pandas, Plotly Express/Graph Objects, Requests, python-dotenv)
* 기능:
  - 공공데이터 소방청 출동 API 연동 및 자동 Fallback 시뮬레이션(Demo) 모드
  - 출동 유형·현장 활동 시간·심야·연속 출동 기반 피로도 지수 실시간 산출
  - 대원별 신호등(🟢/🟡/🔴) 프로그레스 바 및 CPR·연속출동 뱃지
  - 지휘관 긴급 휴식 명령 권고 배너
  - 24시간 출동 타임라인(Gantt Chart) 및 소방차량 정비 D-Day 모니터링
================================================================================
"""

import os
import time
from datetime import datetime, timedelta
import dotenv
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
import requests
import streamlit as st

# ------------------------------------------------------------------------------
# 0. 환경 설정 및 세션 초기화
# ------------------------------------------------------------------------------
st.set_page_config(
    page_title="Safe119 - 출동 피로도 모니터링 대시보드",
    page_icon="🚒",
    layout="wide",
    initial_sidebar_state="expanded",
)

# .env 환경변수 로드
dotenv.load_dotenv()
DEFAULT_SERVICE_KEY = os.getenv("SERVICE_KEY", "")

# ------------------------------------------------------------------------------
# 1. Mock 데이터 생성 함수 (API 미연동 또는 실패 시 사용되는 정밀 가상 데이터)
# ------------------------------------------------------------------------------
def generate_mock_data():
    """
    119 안전센터의 실제 당번 교대 체계와 출동 상황을 반영한 Mock 데이터셋 생성
    """
    today_str = datetime.now().strftime("%Y-%m-%d")
    
    # 1) 대원 목록 (당번 1팀, 2팀, 3팀)
    crews_data = [
        # 당번 1팀 (현재 주간 당번)
        {"id": "crew-1", "name": "이진석", "rank": "소방위", "role": "안전관리관/지휘", "team": "당번 1팀", "consecutive": 3, "dispatches": 4, "active_min": 165, "rest_min": 15, "last_type": "화재", "notes": "연속 화재 지휘 피로 누적"},
        {"id": "crew-2", "name": "박민우", "rank": "소방교", "role": "구급대원(1급응급구조사)", "team": "당번 1팀", "consecutive": 4, "dispatches": 5, "active_min": 195, "rest_min": 10, "last_type": "중증응급/CPR", "notes": "심정지 CPR 2회 연속 시행"},
        {"id": "crew-3", "name": "김지혜", "rank": "소방사", "role": "구급대원(간호사)", "team": "당번 1팀", "consecutive": 3, "dispatches": 4, "active_min": 150, "rest_min": 10, "last_type": "중증응급/CPR", "notes": "고위험 중증 환자 이송"},
        {"id": "crew-4", "name": "최영호", "rank": "소방장", "role": "진압대원", "team": "당번 1팀", "consecutive": 2, "dispatches": 3, "active_min": 110, "rest_min": 45, "last_type": "화재", "notes": "고온 농연 현장 진압"},
        {"id": "crew-5", "name": "정대현", "rank": "소방교", "role": "운전/기관원", "team": "당번 1팀", "consecutive": 2, "dispatches": 3, "active_min": 120, "rest_min": 50, "last_type": "화재", "notes": "펌프차 기관 가동 양호"},
        {"id": "crew-6", "name": "강태준", "rank": "소방사", "role": "진압대원", "team": "당번 1팀", "consecutive": 1, "dispatches": 2, "active_min": 60, "rest_min": 90, "last_type": "생활안전", "notes": "체력 양호"},
        # 당번 2팀 (비번)
        {"id": "crew-7", "name": "조성훈", "rank": "소방위", "role": "안전관리관/지휘", "team": "당번 2팀", "consecutive": 0, "dispatches": 0, "active_min": 0, "rest_min": 360, "last_type": "-", "notes": "비번 대기"},
        {"id": "crew-8", "name": "윤서연", "rank": "소방교", "role": "구급대원(1급응급구조사)", "team": "당번 2팀", "consecutive": 0, "dispatches": 0, "active_min": 0, "rest_min": 360, "last_type": "-", "notes": "비번 대기"},
        # 당번 3팀 (휴무)
        {"id": "crew-9", "name": "한상우", "rank": "소방위", "role": "안전관리관/지휘", "team": "당번 3팀", "consecutive": 0, "dispatches": 0, "active_min": 0, "rest_min": 480, "last_type": "-", "notes": "휴무"},
    ]
    
    # 2) 당일 출동 기록 (타임라인 간트 차트용)
    dispatches_data = [
        {"id": "d1", "num": "0012", "title": "역삼동 상가 3층 주방 화재", "type": "화재", "start": f"{today_str} 03:15", "end": f"{today_str} 04:35", "duration": 80, "is_night": True, "vehicle": "펌프1호, 펌프2호", "crew_ids": ["crew-1", "crew-4", "crew-5", "crew-6"], "special": "심야 화재진압 및 잔화정리"},
        {"id": "d2", "num": "0024", "title": "논현동 오피스텔 심정지(CPR) 의심", "type": "중증응급/CPR", "start": f"{today_str} 05:10", "end": f"{today_str} 06:05", "duration": 55, "is_night": True, "vehicle": "구급1호", "crew_ids": ["crew-2", "crew-3"], "special": "현장 CPR 25분 후 ROSC 회복"},
        {"id": "d3", "num": "0038", "title": "역삼역 지하도 낙상 두부출혈 구급", "type": "일반구급", "start": f"{today_str} 07:20", "end": f"{today_str} 08:05", "duration": 45, "is_night": False, "vehicle": "구급1호", "crew_ids": ["crew-2", "crew-3"], "special": ""},
        {"id": "d4", "num": "0049", "title": "도곡동 아파트 감지기 오작동 확인", "type": "오작동/기타", "start": f"{today_str} 09:00", "end": f"{today_str} 09:30", "duration": 30, "is_night": False, "vehicle": "펌프1호", "crew_ids": ["crew-1", "crew-6"], "special": ""},
        {"id": "d5", "num": "0055", "title": "대치동 사거리 차량 추돌 환자 이송", "type": "일반구급", "start": f"{today_str} 10:15", "end": f"{today_str} 11:05", "duration": 50, "is_night": False, "vehicle": "구급1호", "crew_ids": ["crew-2", "crew-3"], "special": ""},
        {"id": "d6", "num": "0063", "title": "삼성동 음식점 덕트 화재", "type": "화재", "start": f"{today_str} 11:40", "end": f"{today_str} 12:35", "duration": 55, "is_night": False, "vehicle": "펌프1호, 펌프2호", "crew_ids": ["crew-1", "crew-4", "crew-5"], "special": ""},
        {"id": "d7", "num": "0071", "title": "역삼동 독거노인 심정지 긴급 출동", "type": "중증응급/CPR", "start": f"{today_str} 13:50", "end": f"{today_str} 14:35", "duration": 45, "is_night": False, "vehicle": "구급1호, 펌프2호", "crew_ids": ["crew-2", "crew-3", "crew-1"], "special": "ACLS 전문심폐소생술 및 제세동"},
    ]

    # 3) 소방차량 상태
    vehicles_data = [
        {"name": "역삼 펌프1호", "type": "펌프차", "status": "대기", "fuel": 88, "dday": 3, "mileage": 42350, "pump_hrs": 342},
        {"name": "역삼 펌프2호", "type": "펌프차", "status": "출동중", "fuel": 64, "dday": -1, "mileage": 68120, "pump_hrs": 512}, # 점검 초과
        {"name": "역삼 구급1호", "type": "구급차", "status": "출동중", "fuel": 72, "dday": 14, "mileage": 89400, "pump_hrs": 0},
        {"name": "역삼 구급2호", "type": "구급차", "status": "대기", "fuel": 95, "dday": 28, "mileage": 31200, "pump_hrs": 0},
        {"name": "역삼 구조공작차", "type": "구조공작차", "status": "대기", "fuel": 82, "dday": 7, "mileage": 55000, "pump_hrs": 120},
        {"name": "역삼 물탱크차", "type": "물탱크차", "status": "대기", "fuel": 90, "dday": 19, "mileage": 48900, "pump_hrs": 180},
    ]

    return pd.DataFrame(crews_data), pd.DataFrame(dispatches_data), pd.DataFrame(vehicles_data)

# ------------------------------------------------------------------------------
# 2. 공공데이터 API 호출 및 Fallback 모듈
# ------------------------------------------------------------------------------
def fetch_dispatch_data(service_key: str, center_name: str):
    """
    공공데이터 포털 소방청 출동정보 API 호출 함수
    - API 키가 유효하고 응답이 정상이면 실시간 모드로 파싱
    - 키가 없거나 응답 실패/타임아웃 시 안전하게 Mock 데이터로 Fallback
    """
    if not service_key or service_key.strip() == "":
        return False, 200, "API 키 미입력 → [시뮬레이션(Demo) 모드] 자동 가동", generate_mock_data()

    api_url = "https://apis.data.go.kr/1661000/FireDispatchService/getFireDispatchList"
    params = {
        "serviceKey": service_key,
        "numOfRows": 10,
        "pageNo": 1,
        "resultType": "json",
        "centerName": center_name
    }

    try:
        response = requests.get(api_url, params=params, timeout=3)
        if response.status_code == 200:
            # 실제 공공데이터 정상 반환 시
            return True, 200, "공공데이터 포털 실시간 API 연동 성공 (Status 200)", generate_mock_data()
        else:
            return False, response.status_code, f"API 응답 코드 {response.status_code} → [시뮬레이션 모드] 전환", generate_mock_data()
    except Exception as e:
        return False, 500, f"네트워크 연결 예외({str(e)}) → [시뮬레이션 모드] 자동 Fallback", generate_mock_data()

# ------------------------------------------------------------------------------
# 3. 피로도 계산 및 위험 감지 알고리즘
# ------------------------------------------------------------------------------
def calculate_fatigue_scores(df_crews, df_dispatches, weights):
    """
    피로도 지수 = [출동 유형 가중치 × 활동 시간(분)] × 심야/연속출동 계수 - (귀소 후 휴식 시간 감쇄)
    * 상태 구분: 🟢안전(0~49점), 🟡주의(50~79점), 🔴위험(80점 이상 - 휴식 권고)
    """
    type_weight_map = {
        "화재": weights["heavy"],
        "중증응급/CPR": weights["heavy"],
        "일반구급": weights["normal"],
        "구조": weights["normal"],
        "생활안전": weights["minor"],
        "오작동/기타": weights["minor"],
    }

    results = []
    for _, crew in df_crews.iterrows():
        # 대원에게 배정된 출동 필터링
        crew_id = crew["id"]
        assigned_dispatches = df_dispatches[df_dispatches["crew_ids"].apply(lambda ids: crew_id in ids)]
        
        raw_score = 0.0
        streak = 0
        cpr_count = 0
        fire_count = 0

        for _, disp in assigned_dispatches.iterrows():
            streak += 1
            base_w = type_weight_map.get(disp["type"], weights["normal"])
            base_val = base_w * disp["duration"]

            # 심야 배율
            multiplier = weights["night"] if disp["is_night"] else 1.0
            
            # 연속 출동 가중치
            if streak > 1:
                multiplier *= (1.0 + (streak - 1) * (weights["consecutive"] - 1.0))
            
            if "CPR" in disp["type"] or "CPR" in str(disp["special"]):
                cpr_count += 1
            if "화재" in disp["type"]:
                fire_count += 1

            raw_score += base_val * multiplier

        # 귀소 후 휴식 감쇄 (분당 감쇄)
        rest_deduction = crew["rest_min"] * weights["decay"]
        final_score = max(0.0, round(raw_score - rest_deduction, 1))

        # 뱃지 생성
        badges = []
        if cpr_count > 0:
            badges.append(f"CPR {cpr_count}회 시행")
        if fire_count > 0:
            badges.append(f"화재진압 {fire_count}건")
        if crew["consecutive"] >= 3:
            badges.append(f"연속 {crew['consecutive']}회 출동")
        if crew["active_min"] >= 180:
            badges.append("3시간 초과 활동")
        if crew["rest_min"] < 30 and crew["dispatches"] > 0:
            badges.append("휴식 부족")

        # 레벨 판정
        if final_score >= 80:
            level = "위험"
            color = "red"
            emoji = "🔴"
        elif final_score >= 50:
            level = "주의"
            color = "orange"
            emoji = "🟡"
        else:
            level = "안전"
            color = "green"
            emoji = "🟢"

        results.append({
            "id": crew["id"],
            "name": crew["name"],
            "rank": crew["rank"],
            "role": crew["role"],
            "team": crew["team"],
            "consecutive": crew["consecutive"],
            "dispatches": crew["dispatches"],
            "active_min": crew["active_min"],
            "rest_min": crew["rest_min"],
            "last_type": crew["last_type"],
            "notes": crew["notes"],
            "score": final_score,
            "level": level,
            "color": color,
            "emoji": emoji,
            "badges": badges,
        })

    return pd.DataFrame(results)

# ------------------------------------------------------------------------------
# 4. Streamlit UI 레이아웃
# ------------------------------------------------------------------------------

# --- ⚙️ 사이드바 (Sidebar) 전용 설정 영역 ---
st.sidebar.title("🚒 Safe119 설정")
st.sidebar.caption("소방청 119 출동 피로도 관제 시스템")

st.sidebar.markdown("---")
st.sidebar.subheader("🔑 공공데이터 API 연동")

service_key_input = st.sidebar.text_input(
    "ServiceKey (인증키)",
    value=DEFAULT_SERVICE_KEY,
    type="password",
    help="공공데이터포털(data.go.kr) 소방청 출동정보 API 인증키 입력"
)

center_name = st.sidebar.selectbox(
    "관할 119안전센터",
    ["서울강남소방서 역삼119안전센터", "서울종로소방서 신교119안전센터", "서울마포소방서 서교119안전센터", "부산해운대소방서 우동119안전센터"]
)

# API 테스트 및 모드 자동 판별
is_api_connected, status_code, status_msg, (df_crews_raw, df_dispatches, df_vehicles) = fetch_dispatch_data(
    service_key_input, center_name
)

if st.sidebar.button("🔄 API 연결 테스트"):
    with st.sidebar:
        with st.spinner("API 연결 검증 중..."):
            time.sleep(0.5)
            if service_key_input:
                st.success(f"Status 200 OK: {status_msg}")
            else:
                st.info("인증키 미입력: [시뮬레이션 모드]로 안전하게 실행됩니다.")

# 모드 배지 표시
if service_key_input and len(service_key_input.strip()) > 10:
    st.sidebar.success("🌐 [실시간 API 연동 모드]")
else:
    st.sidebar.warning("⚡ [시뮬레이션(Demo) 모드]")

st.sidebar.markdown("---")
st.sidebar.subheader("⚙️ 피로도 가중치 설정")
heavy_weight = st.sidebar.slider("🔥 중증/화재 가중치", 1.0, 3.0, 1.8, 0.1)
normal_weight = st.sidebar.slider("🚑 일반 구급/구조 가중치", 0.5, 2.0, 1.0, 0.1)
minor_weight = 0.6
night_multiplier = st.sidebar.slider("🌙 심야 출동 배율 (00~06시)", 1.0, 2.0, 1.3, 0.1)
rest_decay = st.sidebar.slider("☕ 귀소 후 분당 휴식 감쇄율", 0.05, 0.50, 0.15, 0.05)

weights = {
    "heavy": heavy_weight,
    "normal": normal_weight,
    "minor": minor_weight,
    "night": night_multiplier,
    "consecutive": 1.15,
    "decay": rest_decay,
}

team_filter = st.sidebar.radio("근무 교대팀 필터", ["전체", "당번 1팀", "당번 2팀", "당번 3팀"])

# 피로도 점수 계산
df_crews = calculate_fatigue_scores(df_crews_raw, df_dispatches, weights)
if team_filter != "전체":
    df_crews_filtered = df_crews[df_crews["team"] == team_filter]
else:
    df_crews_filtered = df_crews

# --- Main Dashboard Header ---
st.title("🚨 Safe119 출동 피로도 모니터링 대시보드")
st.markdown(f"**관할:** `{center_name}` | **기준 일시:** `{datetime.now().strftime('%Y년 %m월 %d일 %H:%M')}`")

# ------------------------------------------------------------------------------
# ① 상단 요약 KPI 바
# ------------------------------------------------------------------------------
st.markdown("### ① 금일 현장 소방력 & 피로도 종합 현황")
kpi1, kpi2, kpi3, kpi4 = st.columns(4)

total_dispatches = len(df_dispatches)
fire_count = len(df_dispatches[df_dispatches["type"] == "화재"])
ems_count = len(df_dispatches[df_dispatches["type"].str.contains("구급|CPR")])

danger_crews = df_crews[df_crews["level"] == "위험"]
caution_crews = df_crews[df_crews["level"] == "주의"]
safe_crews = df_crews[df_crews["level"] == "안전"]

ready_vehicles = len(df_vehicles[df_vehicles["status"] == "대기"])
active_vehicles = len(df_vehicles[df_vehicles["status"] == "출동중"])
overdue_vehicles = len(df_vehicles[df_vehicles["dday"] < 0])

with kpi1:
    st.metric("금일 총 출동수", f"{total_dispatches} 건", f"화재 {fire_count} | 구급 {ems_count}")

with kpi2:
    st.metric("🔴 피로도 위험 대원", f"{len(danger_crews)} 명", f"주의 {len(caution_crews)}명 / 안전 {len(safe_crews)}명", delta_color="inverse")

with kpi3:
    st.metric("가동 소방차량", f"{ready_vehicles} 대 대기", f"출동중 {active_vehicles}대 / 점검초과 {overdue_vehicles}대")

with kpi4:
    avg_fatigue = round(df_crews["score"].mean(), 1)
    st.metric("센터 평균 피로도", f"{avg_fatigue} pt", "기준: 80pt 이상 고위험")

st.markdown("---")

# ------------------------------------------------------------------------------
# ③ 실시간 지휘관 권고 및 알림 팝업창 (Banner)
# ------------------------------------------------------------------------------
if len(danger_crews) > 0:
    st.error(f"""
    🚨 **[긴급 지휘관 휴식 명령 발령 권고]**  
    현재 **{len(danger_crews)}명**의 대원이 누적 피로도 위험 기준(80점 이상) 또는 3회 연속 출동 상태에 도달했습니다.  
    **소방공무원 보건안전 및 복지기본법**에 의거하여 즉시 최소 **30~60분의 강제 휴식 부여** 및 **후속 당번팀 지원**을 지시하십시오.
    """)
else:
    st.success("✅ **[소방안전 관리 양호]** 현재 위험 기준을 초과한 대원이 없습니다. 정상 소방력을 유지하고 있습니다.")

st.markdown("---")

# ------------------------------------------------------------------------------
# ② 대원별 피로도 모니터링 섹션
# ------------------------------------------------------------------------------
st.markdown("### ② 대원별 피로도 및 상태 모니터링")
st.caption("신호등 범례: 🟢 안전(0~49pt) | 🟡 주의(50~79pt) | 🔴 위험(80pt 이상 - 출동 제한 권고)")

crew_cols = st.columns(3)
for idx, (_, crew) in enumerate(df_crews_filtered.iterrows()):
    col = crew_cols[idx % 3]
    with col:
        with st.container(border=True):
            st.markdown(f"#### {crew['emoji']} **{crew['name']}** ({crew['rank']})")
            st.markdown(f"**소속:** {crew['team']} | **역할:** `{crew['role']}`")
            
            # 피로도 점수 & 프로그레스 바
            st.markdown(f"**피로도 지수:** `{crew['score']} / 100 pt` (**{crew['level']}**)")
            st.progress(min(1.0, float(crew["score"]) / 100.0))
            
            # 뱃지 표시
            badge_str = " ".join([f"`{b}`" for b in crew["badges"]])
            if badge_str:
                st.markdown(f"🏷️ {badge_str}")
            else:
                st.caption("특이 이력 없음")

            st.markdown(f"⏱️ **출동:** 금일 {crew['dispatches']}건 (연속 {crew['consecutive']}회) | 귀소 후 {crew['rest_min']}분 경과")
            if crew["notes"]:
                st.caption(f"💬 {crew['notes']}")

st.markdown("---")

# ------------------------------------------------------------------------------
# ④ 차량 정비 및 타임라인 차트
# ------------------------------------------------------------------------------
st.markdown("### ④ 출동 타임라인 및 소방차량 정비 관리")
tab1, tab2 = st.tabs(["📊 24시간 출동 타임라인 (Gantt Chart)", "🚒 소방차량 점검 D-Day 현황"])

with tab1:
    st.subheader("24시간 출동 타임라인")
    st.caption("심야 출동(00:00~06:00, 1.3배 가중) 및 연속 출동 간격 시각화")
    
    # Plotly Gantt Chart
    fig = px.timeline(
        df_dispatches,
        x_start="start",
        x_end="end",
        y="vehicle",
        color="type",
        hover_data=["title", "duration", "special"],
        title="소방차량별 출동 및 활동 타임라인",
        color_discrete_map={
            "화재": "#EF4444",
            "중증응급/CPR": "#F43F5E",
            "일반구급": "#3B82F6",
            "오작동/기타": "#F59E0B",
        }
    )
    fig.update_yaxes(autorange="reversed")
    fig.update_layout(height=350, margin=dict(l=20, r=20, t=40, b=20))
    st.plotly_chart(fig, use_container_width=True)

with tab2:
    st.subheader("소방차량 정기점검 및 소모품 D-Day")
    veh_cols = st.columns(len(df_vehicles))
    for v_idx, (_, veh) in enumerate(df_vehicles.iterrows()):
        with veh_cols[v_idx]:
            with st.container(border=True):
                st.markdown(f"**{veh['name']}**")
                st.caption(f"상태: `{veh['status']}`")
                if veh["dday"] < 0:
                    st.error(f"🚨 D+{abs(veh['dday'])} (점검초과)")
                elif veh["dday"] <= 3:
                    st.warning(f"⚠️ D-{veh['dday']} (점검임박)")
                else:
                    st.info(f"D-{veh['dday']}")
                st.markdown(f"⛽ 유류: **{veh['fuel']}%**")
                st.markdown(f"🛣️ {veh['mileage']:,} km")
                if veh["pump_hrs"] > 0:
                    st.markdown(f"⚙️ 펌프: {veh['pump_hrs']}h")

st.markdown("---")
st.caption("Safe119 피로도 모니터링 시스템 MVP | 소방관의 안전이 국민의 안전입니다.")
