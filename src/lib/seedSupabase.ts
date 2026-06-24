import { supabase } from './supabase';
import type { HandoverInput } from './types';

interface SeedRecord {
  author: string;
  input: HandoverInput;
}

const SEED_RECORDS: SeedRecord[] = [
  {
    author: '익명',
    input: {
      department: '예산법무과',
      taskName: '본예산 편성',
      priority: '높음',
      schedules: [
        { cycle: '연간', description: '8~9월 부서별 예산 요구서 취합 및 시의회 제출 (11월 의결)' },
        { cycle: '분기', description: '분기별 집행률 점검 및 부서 피드백 작성' },
        { cycle: '상시', description: '예산 변경 요청 검토 및 전용·이용 결재 처리' },
      ],
      description:
        '시 전체 세입·세출 예산안을 편성하고 시의회에 제출하는 핵심 재정 업무입니다. ' +
        '부서별 수요 조사 → 재원 배분 협의 → 예산안 작성 → 의회 제출 순으로 진행됩니다.',
      checklist: [
        '기획재정부 지침 변경 사항 확인',
        '전년도 이월·불용액 현황 파악',
        '주요 투자사업 우선순위 부서장 보고',
        'e호조 예산편성 모듈 권한 이관',
      ],
      systems: ['e호조', '온나라'],
      laws: '지방재정법 제36조(예산의 편성), 지방자치단체 예산편성 운영기준(행안부 훈령)',
      cautions:
        '의회 제출 기한(11월 15일)은 법정 기한이므로 절대 지연 불가. ' +
        '국·도비 보조사업은 교부결정 전 예산 반영 시 집행 불가로 추후 삭감 대상이 됨.',
      knowhow:
        '재원 배분 협의 시 부서장 회의 전 주요 과장들과 사전 조율해두면 공식 회의에서 마찰이 줄어듦. ' +
        'e호조 예산편성 마감일 전날 반드시 모든 부서 입력 완료 여부를 문자로 재확인할 것.',
      attachments: ['공유드라이브/예산법무과/본예산편성/연도별자료', '시의회 제출용 표준 양식.xlsx'],
      relatedIds: [],
      status: 'active',
    },
  },
  {
    author: '익명',
    input: {
      department: '일자리경제과',
      taskName: '지역화폐(시루) 운영 관리',
      priority: '높음',
      schedules: [
        { cycle: '상시', description: '가맹점 등록·해지 심사 및 민원 응대' },
        { cycle: '월간', description: '발행실적·환전실적 현황 보고 (매월 10일 이내)' },
        { cycle: '반기', description: '과다 환전 의심 가맹점 모니터링 및 현지조사' },
      ],
      description:
        '시흥시 지역화폐 "시루"의 발행·유통·환전 전 과정을 관리합니다. ' +
        '운영대행사(KT)와의 협력, 가맹점 관리, 할인 재원 교부금 집행이 핵심입니다.',
      checklist: [
        '운영대행사 월별 보고서 수신 및 검토',
        '경기도 교부금 신청(반기)',
        '가맹점 DB 최신화 확인',
      ],
      systems: ['정부24', '복지로'],
      laws: '지역사랑상품권 이용 활성화에 관한 법률, 경기도 지역화폐 운영 지침',
      cautions:
        '환전 한도 초과 가맹점 방치 시 감사 지적 사항. 경기도 교부금 신청 기한 놓치면 재원 부족으로 할인율 축소.',
      knowhow:
        '가맹점 불만 민원 대부분이 환전 처리 지연 문제임. 운영대행사에 매주 월요일 현황 공유 요청해두면 민원 선제 대응 가능.',
      attachments: ['공유드라이브/일자리경제과/시루/운영실적'],
      relatedIds: [],
      status: 'active',
    },
  },
  {
    author: '익명',
    input: {
      department: '시민안전과',
      taskName: '재난안전대책본부 운영',
      priority: '높음',
      schedules: [
        { cycle: '상시', description: '기상특보·재난 상황 모니터링 및 비상연락망 유지' },
        { cycle: '연간', description: '을지연습, 민방위훈련 등 정기훈련 계획·진행' },
        { cycle: '수시', description: '태풍·폭설·폭염 등 위기 시 대책본부 즉시 가동' },
      ],
      description:
        '자연재난 및 사회재난 발생 시 시장 주재 대책본부를 운영하고, 평시에는 재난 예방·대비 업무를 수행합니다.',
      checklist: [
        'NDMS 비상연락망 최신화 (인사이동 후 즉시)',
        '재난 대응 물자 재고 확인 (분기)',
        '읍면동 재난담당자 연락처 업데이트',
      ],
      systems: ['NDMS', '온나라'],
      laws: '재난 및 안전관리 기본법 제16조(지역대책본부), 시흥시 재난관리 조례',
      cautions:
        '기상특보 문자를 받는 즉시 과장·부시장에게 선보고 후 상황 판단. 대책본부 가동 기준을 임의로 완화하면 안 됨.',
      knowhow:
        '태풍 시즌(7~9월)에는 매주 금요일 오후에 관련 부서장과 비공식 점검 전화를 돌리면 실제 대책본부 가동 시 혼선이 줄어듦.',
      attachments: ['공유드라이브/시민안전과/대책본부/상황보고서_양식', 'NDMS 비상연락망 목록.xlsx'],
      relatedIds: [],
      status: 'active',
    },
  },
  {
    author: '최수연',
    input: {
      department: '노인복지과',
      taskName: '기초연금 지급',
      priority: '높음',
      schedules: [
        { cycle: '월간', description: '매월 25일 정기 지급 (은행 이체 처리)' },
        { cycle: '상시', description: '신규 신청·해지·변경 사항 처리 (복지로 연계)' },
        { cycle: '분기', description: '부정수급 의심자 현황 파악 및 수급 적정성 검토' },
      ],
      description:
        '만 65세 이상 저소득 어르신께 기초연금을 선정·지급합니다. 보건복지부-경기도-시흥시 3단계 전산 연계로 운영됩니다.',
      checklist: [
        '행복e음 수급자 명단 확정 (매월 18일까지)',
        '이달 신규·변경·탈락자 개별 안내 문자 발송',
        '이의신청 처리 기한(30일) 준수 여부 확인',
      ],
      systems: ['행복e음', '복지로', '정부24'],
      laws: '기초연금법, 기초연금법 시행령, 보건복지부 기초연금 사업안내',
      cautions:
        '사망자 계좌로 연금이 지급될 경우 환수 절차가 매우 복잡함. 주민등록 사망 정보와 행복e음 연계를 매월 확인해야 함.',
      knowhow:
        '신청 폭증 시기(1~2월, 65세 생일 전후)에는 민원 처리에 2~3주 추가 소요. 읍면동에 미리 공문 발송해 서류 완비 안내를 부탁하면 반려 건수가 줄어듦.',
      attachments: ['공유드라이브/노인복지과/기초연금/사업안내_최신본'],
      relatedIds: [],
      status: 'active',
    },
  },
  {
    author: '익명',
    input: {
      department: '교통행정과',
      taskName: '버스 준공영제 정산',
      priority: '높음',
      schedules: [
        { cycle: '월간', description: '전월 운송수입금·운행실적 검증 및 재정지원금 정산 지급' },
        { cycle: '반기', description: '버스업체 원가 실사 및 적정원가 검토' },
        { cycle: '연간', description: '준공영제 운영 성과 보고(시의회)' },
      ],
      description:
        '시내버스 운영회사의 운송수입 부족분을 시가 보전하는 준공영제를 운영합니다. ' +
        '표준원가 산정, 실적 검증, 재정지원금 집행이 핵심입니다.',
      checklist: [
        '버스회사 월별 운행기록부 수령 및 검토',
        '경기도 교부금 신청·수령 현황 확인',
        '노선별 수입금 이상치 검토',
      ],
      systems: ['e호조', '온나라'],
      laws: '여객자동차 운수사업법 제50조, 경기도 시내버스 준공영제 운영 기준',
      cautions:
        '운행 실적 허위 기재 의혹 시 즉시 교통안전공단에 GPS 기록 요청 필요. 지연 지급 시 업체가 서비스를 임의 축소할 수 있음.',
      knowhow:
        '정산 회의 전에 담당 주무관이 업체 실무자와 비공식 사전 확인을 하면 공식 회의에서 수정 요청이 크게 줄어듦.',
      attachments: ['공유드라이브/교통행정과/준공영제/정산자료'],
      relatedIds: [],
      status: 'active',
    },
  },
  {
    author: '익명',
    input: {
      department: '생활보장과',
      taskName: '국민기초생활 급여 관리',
      priority: '높음',
      schedules: [
        { cycle: '월간', description: '생계·의료·주거·교육급여 지급 적정성 점검' },
        { cycle: '상시', description: '신규 신청 접수, 조사, 결정 (30일 이내 처리)' },
        { cycle: '반기', description: '금융정보 조회를 통한 재산변동 확인 (행복e음)' },
      ],
      description:
        '기준중위소득 이하 저소득 가구에 생계·의료·주거·교육급여를 지급하는 국가 최후의 사회안전망을 운영합니다.',
      checklist: [
        '행복e음 신청 건 법정 처리기한 준수 여부 일별 확인',
        '탈수급자 자활 연계 여부 확인',
        '긴급복지지원 연계 검토 (수급 탈락자)',
      ],
      systems: ['행복e음', '복지로'],
      laws: '국민기초생활 보장법, 보건복지부 국민기초생활보장 사업안내(매년 개정)',
      cautions:
        '사업안내는 매년 1월 개정 배포됨. 구버전 기준으로 처리하면 선정 오류 발생. 개정본 수령 즉시 팀 공유 필수.',
      knowhow:
        '읍면동 담당자가 조사를 완료해도 행복e음 전송을 빠뜨리는 경우가 많음. 주 1회 미전송 건 확인 루틴을 만들면 처리 지연 예방 가능.',
      attachments: ['공유드라이브/생활보장과/기초생활/사업안내_최신본'],
      relatedIds: [],
      status: 'active',
    },
  },
  {
    author: '익명',
    input: {
      department: '정보통신과',
      taskName: '정보시스템 운영 관리',
      priority: '보통',
      schedules: [
        { cycle: '상시', description: '청사 네트워크·서버 장애 대응 및 유지보수 업무 처리' },
        { cycle: '월간', description: '시스템 사용 현황 및 장애이력 보고' },
        { cycle: '연간', description: '정보화 사업 수요조사 및 예산 요청' },
      ],
      description: '시 행정망, 내부 시스템, 보안 장비 등 IT 인프라 전반을 운영·관리합니다.',
      checklist: [
        '유지보수 계약 만료 일정 관리 (2개월 전 재계약 착수)',
        '개인정보보호 교육 이수율 확인 (연 1회)',
        '서버 백업 정상 여부 주 1회 확인',
      ],
      systems: ['온나라', '정부24'],
      laws: '전자정부법, 개인정보 보호법, 국가정보보안 기본지침',
      cautions:
        '보안 업데이트 미적용 시스템은 감사 지적사항. 패치 적용 전 주요 업무부서에 사전 공지 필수.',
      knowhow:
        '야간 긴급 장애 대응 시 외부 유지보수업체 담당자 개인 연락처를 별도로 보관해둘 것. 공식 채널은 야간에 응답이 느림.',
      attachments: ['공유드라이브/정보통신과/인프라/장비목록_현행화'],
      relatedIds: [],
      status: 'active',
    },
  },
  {
    author: '익명',
    input: {
      department: '복지정책과',
      taskName: '사회보장 신설·변경 협의',
      priority: '보통',
      schedules: [
        { cycle: '수시', description: '신규 복지 사업 발굴 시 보건복지부 협의 신청 (사전 필수)' },
        { cycle: '연간', description: '기존 사업 일몰 검토 및 유사 사업 정비' },
      ],
      description:
        '사회보장기본법에 따라 시 자체 복지사업을 신설·변경할 때 보건복지부와 사전 협의하는 절차를 운영합니다.',
      checklist: [
        '협의 대상 여부 사전 검토 (복지부 지침 기준)',
        '신청서 제출 → 90일 이내 결과 수령',
        '협의 결과에 따른 예산·조례 반영',
      ],
      systems: ['복지로', '온나라'],
      laws: '사회보장기본법 제26조(사회보장제도 신설·변경 시 협의)',
      cautions:
        '협의 없이 사업 시행 시 국·도비 환수 및 시정명령 대상. 사업 기획 단계에서 반드시 협의 필요성을 먼저 확인해야 함.',
      knowhow:
        '협의 신청 전 복지부 담당자에게 비공식 사전 문의를 하면 신청서 보완 사항을 미리 파악할 수 있어 반려율이 낮아짐.',
      attachments: [],
      relatedIds: [],
      status: 'active',
    },
  },
  {
    author: '익명',
    input: {
      department: '문화예술과',
      taskName: '공연·전시 지원 사업 운영',
      priority: '보통',
      schedules: [
        { cycle: '연간', description: '공모 계획 수립 → 접수 → 심사 → 지원금 교부 (상반기)' },
        { cycle: '상시', description: '지원 단체 정산 서류 검토 및 보조금 관리시스템 입력' },
      ],
      description: '지역 문화예술 단체의 공연·전시를 지원하는 보조금 사업을 운영합니다.',
      checklist: [
        '보조금 공모 공고 시 법제 검토 완료 여부',
        '심사위원 위촉 및 이해충돌 확인',
        '정산 완료 후 보조금 관리시스템 마감 처리',
      ],
      systems: ['온나라'],
      laws: '보조금 관리에 관한 법률, 시흥시 문화예술 지원 조례',
      cautions:
        '보조금법 개정으로 목적 외 사용 시 형사처벌 조항 강화. 단체에 반드시 집행 기준 사전 안내 후 협약 체결.',
      knowhow:
        '공모 심사 후 결과 미선정 단체의 이의 민원이 매년 반복됨. 심사 점수표와 의견서를 공개 가능 수준으로 정리해 두면 대응이 쉬워짐.',
      attachments: ['공유드라이브/문화예술과/지원사업/공모서류_양식모음'],
      relatedIds: [],
      status: 'active',
    },
  },
  {
    author: '오지현',
    input: {
      department: '대야동',
      taskName: '찾아가는 복지서비스 (방문상담)',
      priority: '높음',
      schedules: [
        { cycle: '상시', description: '복지 사각지대 발굴 대상 가구 방문상담 및 서비스 연계' },
        { cycle: '월간', description: '방문상담 실적 행복e음 입력 및 읍면동 종합보고' },
      ],
      description:
        '경제적·사회적 위기 가구를 발굴하여 필요한 복지서비스를 직접 찾아가서 연결합니다. ' +
        '위기가구, 1인 노인, 장애인 가구 등을 우선 방문합니다.',
      checklist: [
        '방문 전 행복e음 기존 수급 이력 확인',
        '방문 결과 당일 행복e음 입력 (미입력 시 실적 불인정)',
        '긴급복지 대상 판단 시 과장 즉시 보고',
      ],
      systems: ['행복e음', '복지로'],
      laws: '사회보장급여의 이용·제공 및 수급권자 발굴에 관한 법률',
      cautions:
        '방문 거부 가구를 무단 진입하면 안 됨. 지속 거부 시 이웃·통장 협조 요청 후 기록 남길 것.',
      knowhow:
        '방문 전에 주민 통장님께 사전 연락해두면 대문을 열어주시는 경우가 많음. 또한 방문 시간대는 오전 10~11시가 가장 재가율이 높음.',
      attachments: [],
      relatedIds: [],
      status: 'active',
    },
  },
  {
    author: '익명',
    input: {
      department: '정왕1동',
      taskName: '주민자치회 운영 지원',
      priority: '보통',
      schedules: [
        { cycle: '월간', description: '주민자치회 정기회의 지원 및 회의록 보관' },
        { cycle: '분기', description: '주민자치 프로그램 참여 현황 보고(시 본청)' },
        { cycle: '연간', description: '주민총회 개최 지원 (예산·공간·홍보)' },
      ],
      description:
        '주민이 직접 마을 의제를 결정하는 주민자치회의 행정적 지원 업무입니다. ' +
        '프로그램 기획·예산 관리·회의 운영을 지원합니다.',
      checklist: [
        '주민자치회 위원 임기 관리 (2년, 연임 1회)',
        '자치회 예산 집행 적정성 확인',
        '회의록 법정 보존기간(5년) 관리',
      ],
      systems: ['온나라'],
      laws: '지방자치법 제28조, 시흥시 주민자치회 설치 및 운영 조례',
      cautions:
        '자치회 예산을 동장 판단으로 임의 집행하면 안 됨. 반드시 주민자치회 의결 후 집행.',
      knowhow:
        '주민총회 개최 시 참여율이 관건. 지역 SNS 채널(카카오 오픈채팅, 아파트 공지)을 활용하면 홍보 효과가 높음.',
      attachments: ['공유드라이브/정왕1동/주민자치회/회의록모음'],
      relatedIds: [],
      status: 'active',
    },
  },
  {
    author: '황민아',
    input: {
      department: '배곧1동',
      taskName: '전입·전출 민원 처리',
      priority: '낮음',
      schedules: [
        { cycle: '상시', description: '전입·전출 신고 접수 및 주민등록 전산 처리' },
        { cycle: '월간', description: '주민등록 직권말소·거주불명자 정비 현황 보고' },
      ],
      description:
        '세대별 전입·전출 신고를 처리하고 주민등록 전산을 최신 상태로 유지합니다.',
      checklist: [
        '전입 시 세대주 동의서 필요 여부 확인',
        '외국인 등록증 사본 보관 (외국인 전입 시)',
        '직권말소 대상자 이의신청 기간(30일) 안내',
      ],
      systems: ['정부24', '행복e음'],
      laws: '주민등록법, 주민등록법 시행령',
      cautions:
        '세대분리 시 건강보험 피부양자 자격 상실 등 파생 민원 안내 필수. 당사자가 모르고 불이익 당하는 경우 많음.',
      knowhow:
        '신학기(2~3월) 및 이사 성수기(1·6월)에 민원이 급증함. 이 시기에는 점심시간에도 순번제로 창구를 유지하면 민원인 대기가 줄어듦.',
      attachments: [],
      relatedIds: [],
      status: 'active',
    },
  },
  {
    author: '서재영',
    input: {
      department: '징수과',
      taskName: '지방세 체납 관리 및 징수',
      priority: '높음',
      schedules: [
        { cycle: '상시', description: '체납자 재산 조회 및 압류·공매 집행 (위택스 연계)' },
        { cycle: '분기', description: '체납액 징수 실적 보고 및 목표 달성율 점검' },
        { cycle: '연간', description: '고액·장기 체납자 명단 공개 (11월)' },
      ],
      description:
        '취득세·재산세 등 지방세 체납액을 징수하기 위해 재산 압류·공매·금융재산 압류 등 체납처분을 집행합니다.',
      checklist: [
        '압류 집행 전 법정 독촉 기간 준수 여부 확인',
        '공매 진행 건 한국자산관리공사(캠코) 연계 처리',
        '고액 체납자 명단 공개 요건 충족 여부 사전 확인',
      ],
      systems: ['위택스', 'e호조'],
      laws: '지방세징수법, 지방세법, 국세징수법(준용)',
      cautions:
        '압류 후 이의신청이 들어오면 처분 효력이 정지될 수 있음. 법령 해석이 불명확한 경우 예산법무과에 법률 자문 요청 후 진행.',
      knowhow:
        '금융재산 압류가 부동산 공매보다 회수 속도가 빠름. 체납자 소득·예금 조회를 먼저 하고 부동산 압류는 최후 수단으로 활용.',
      attachments: ['공유드라이브/징수과/체납관리/공매진행현황', '체납처분 매뉴얼_최신.pdf'],
      relatedIds: [],
      status: 'active',
    },
  },
];

export async function seedSupabase(): Promise<number> {
  // 기존 데이터 전체 물리 삭제 (초기화)
  const { data: existingIds } = await supabase.from('handovers').select('id');
  if (existingIds && existingIds.length > 0) {
    const ids = existingIds.map((r: Record<string, unknown>) => r.id as string);
    await supabase.from('handover_histories').delete().in('handover_id', ids);
    await supabase.from('handover_reports').delete().in('handover_id', ids);
    await supabase.from('handovers').delete().in('id', ids);
  }

  const rows = SEED_RECORDS.map(({ input: r, author }) => ({
    department: r.department,
    task_name: r.taskName,
    description: r.description,
    priority: r.priority,
    schedules: r.schedules,
    checklist: r.checklist,
    systems: r.systems,
    laws: r.laws,
    cautions: r.cautions,
    knowhow: r.knowhow,
    attachments: r.attachments,
    related_ids: r.relatedIds,
    status: r.status,
    created_by: author,
  }));

  const { data, error } = await supabase.from('handovers').insert(rows).select();
  if (error) throw new Error(error.message);

  const inserted = (data ?? []) as Record<string, unknown>[];

  // 각 레코드에 작성자 이름으로 생성 이력 남기기
  if (inserted.length > 0) {
    const histories = inserted.map((row, i) => ({
      handover_id: row.id,
      editor_name: SEED_RECORDS[i]?.author ?? '익명',
      change_type: 'create',
      before_data: null,
      after_data: row,
      changed_fields: [],
    }));
    await supabase.from('handover_histories').insert(histories);
  }

  // 관련 업무 연결 (task_name → id 맵 빌드 후 쌍으로 연결)
  const idByTask: Record<string, string> = {};
  for (const row of inserted) {
    idByTask[row.task_name as string] = row.id as string;
  }

  const RELATIONS: Record<string, string[]> = {
    '본예산 편성':              ['지방세 체납 관리 및 징수', '버스 준공영제 정산'],
    '지방세 체납 관리 및 징수': ['본예산 편성'],
    '버스 준공영제 정산':       ['본예산 편성'],
    '기초연금 지급':            ['국민기초생활 급여 관리', '찾아가는 복지서비스 (방문상담)'],
    '국민기초생활 급여 관리':   ['기초연금 지급', '찾아가는 복지서비스 (방문상담)'],
    '찾아가는 복지서비스 (방문상담)': ['기초연금 지급', '국민기초생활 급여 관리'],
    '재난안전대책본부 운영':    ['정보시스템 운영 관리'],
    '정보시스템 운영 관리':     ['재난안전대책본부 운영'],
  };

  for (const [taskName, relatedTasks] of Object.entries(RELATIONS)) {
    const id = idByTask[taskName];
    if (!id) continue;
    const relatedIds = relatedTasks.map((t) => idByTask[t]).filter(Boolean);
    if (relatedIds.length > 0) {
      await supabase.from('handovers').update({ related_ids: relatedIds }).eq('id', id);
    }
  }

  return inserted.length;
}
