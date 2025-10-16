// 시뮬레이션 프리셋과 프롬프트 생성기 (프론트 공용 상수)

export type SimulationStep = {
  step: number;
  name: string;
};

export type SimulationScenario = {
  id: string;
  title: string;
  category: '등록' | '금융' | '의료' | '일반' | '통신' | '부동산';
  backgroundImage: string;
  officerName: string;
  tone: string; // 예: 친절하고 공식적인 말투
  steps: SimulationStep[];
  initialMessage: string;
  // 리스트 표시용 선택 속성
  duration?: string;
  difficulty?: '초급' | '중급' | '고급';
  description?: string;
};

export function buildSystemPrompt(scenario: SimulationScenario): string {
  const { title, officerName, steps, tone } = scenario;
  const stepsText = steps
    .map((step) => `${step.step}단계: ${step.name}`)
    .join('\n');
  const exampleJson = `\n\n\`\`\`json\n{\n  "current_step": 2,\n  "steps_status": [\n    ${steps
    .map(
      (step, i) =>
        `{"step": ${step.step}, "name": "${step.name}", "status": "${
          i === 0 ? 'completed' : i === 1 ? 'in_progress' : 'pending'
        }"}`
    )
    .join(',\n')}\n  ]\n}\n\`\`\``;

  return `당신은 ${officerName}입니다. ${title}를 처리하며, 다음 단계로 진행합니다:\n\n${stepsText}\n\n${tone}로 응대하며, 필요한 서류나 정보를 요청하고, 각 단계의 진행 상황을 마지막에 JSON 형태로 제공해주세요.\n마크다운 형식으로 대답하지말고, 담당자가 자연스럽게 대화하듯이 말 해주세요.\n\n예시 응답:\n"안녕하세요, ${title} 관련 업무이시군요. 먼저 필요한 서류를 확인해드릴게요."${exampleJson}`;
}

// 아래 중복 정의 블록은 제거되었습니다 (단일 소스 유지)

export const SIMULATION_SCENARIOS: Record<string, SimulationScenario> = {
  'visa-extension': {
    id: 'visa-extension',
    title: 'D-2 비자 연장',
    category: '등록',
    backgroundImage: '/audio_image.png',
    officerName: '출입국관리소 직원',
    initialMessage: '안녕하세요, 어떻게 오셨어요?',
    steps: [
      { step: 1, name: '방문 목적 확인 및 번호표 발급 안내' },
      {
        step: 2,
        name: '비자연장신청서, 여권, 외국인등록증, 표준입학허가서 접수',
      },
      {
        step: 3,
        name: '재학증명서 학기/성적 확인, 등록금납입증명서 금액 검토',
      },
      { step: 4, name: '학업 연속성, 출석률, 졸업예정일 등 체류사유 질문' },
      { step: 5, name: '통장잔고증명서(300만원 이상), 수수료 6만원 납부' },
      { step: 6, name: '접수증 발급 및 7-10일 후 결과 확인 방법 안내' },
      { step: 7, name: '연장 허가 시 외국인등록증 변경신고 및 체류카드 갱신' },
    ],
    tone: '공손하고 명확한 톤',
    duration: '15-20분',
    difficulty: '중급',
    description: '출입국관리소에서 학생비자 연장 신청 절차를 체험해보세요',
  },
  'bank-account': {
    id: 'bank-account',
    title: '은행 계좌 개설',
    category: '금융',
    backgroundImage: '/audio_image.png',
    officerName: '은행 직원',
    initialMessage: '안녕하세요, 계좌 개설 도움을 드리겠습니다.',
    steps: [
      { step: 1, name: '방문 목적 확인 및 대기번호 안내' },
      { step: 2, name: '외국인등록증, 여권, 비자 스티커 확인 및 복사본 제출' },
      { step: 3, name: '입출금통장, 적금, 예금 상품별 금리 및 조건 설명' },
      {
        step: 4,
        name: '계좌개설신청서 작성 - 주소, 연락처, 직업, 거래목적 기입',
      },
      { step: 5, name: '최소 1만원 이상 초기입금, 현금 또는 타행이체로 처리' },
      { step: 6, name: '6자리 비밀번호 설정, 보안카드 20매 또는 OTP 선택' },
      { step: 7, name: '체크카드 신청서 작성, 카드 디자인 선택, 7일 후 수령' },
      { step: 8, name: '인터넷뱅킹 가입동의서 서명, 공동인증서 발급 안내' },
    ],
    tone: '친절하고 전문적인 톤',
    duration: '20-25분',
    difficulty: '초급',
    description: '한국 은행에서 외국인 계좌 개설 과정을 연습해보세요',
  },

  'phone-activation': {
    id: 'phone-activation',
    title: '휴대폰 개통',
    category: '통신',
    backgroundImage: '/audio_image.png',
    officerName: '통신사 매장 직원',
    initialMessage: '안녕하세요, 휴대폰 개통 도와드리겠습니다.',
    steps: [
      { step: 1, name: '방문 목적 확인 및 대기 접수' },
      {
        step: 2,
        name: '5G/LTE 무제한, 데이터 50GB/100GB 요금제별 월 요금 비교',
      },
      { step: 3, name: '외국인등록증, 여권 확인 및 체류기간 6개월 이상 검토' },
      {
        step: 4,
        name: '신용조회 동의서 서명, CB점수 확인, 보증금 3-10만원 결정',
      },
      { step: 5, name: '통신서비스이용계약서 작성, 요금제 최종 선택 및 서명' },
      {
        step: 6,
        name: 'USIM 카드 발급, 휴대폰 삽입, APN 설정 및 네트워크 확인',
      },
      { step: 7, name: '발신/수신 테스트, 문자 전송, 데이터 연결 확인' },
      { step: 8, name: 'T멤버십, 국제로밍, 부가서비스 안내 및 앱 설치' },
    ],
    tone: '친절하고 신속한 톤',
    duration: '15-20분',
    difficulty: '초급',
    description: '매장에서 휴대폰 개통 과정을 단계별로 연습해보세요',
  },
  'health-insurance': {
    id: 'health-insurance',
    title: '건강보험 가입',
    category: '의료',
    backgroundImage: '/audio_image.png',
    officerName: '국민건강보험공단 직원',
    initialMessage: '안녕하세요, 건강보험 가입 안내 도와드리겠습니다.',
    steps: [
      { step: 1, name: '방문 목적 확인, 6개월 이상 체류자 자격 요건 검토' },
      { step: 2, name: '외국인등록증, 여권, D-2/D-4/E-7 등 체류자격 확인' },
      { step: 3, name: '재직증명서, 급여명세서 3개월, 소득금액증명원 제출' },
      { step: 4, name: '건강보험가입신청서, 피부양자신고서 작성 및 서명' },
      {
        step: 5,
        name: '월 소득 기준 보험료 산정, 계좌이체 또는 가상계좌 납부',
      },
      { step: 6, name: '건강보험증 7-10일 내 등기우편 발송, 임시확인서 발급' },
      { step: 7, name: '병의원 이용 시 본인부담금 30%, 약국 본인부담금 설명' },
    ],
    tone: '정확하고 안내 중심 톤',
    duration: '20분',
    difficulty: '중급',
    description: '외국인의 건강보험 가입 절차를 미리 경험해보세요',
  },
  'housing-contract': {
    id: 'housing-contract',
    title: '부동산 임대차 계약',
    category: '부동산',
    backgroundImage: '/audio_image.png',
    officerName: '부동산 중개사',
    initialMessage: '안녕하세요, 임대차 계약 절차를 안내해드리겠습니다.',
    steps: [
      { step: 1, name: '희망 지역, 면적, 월세/전세 예산, 입주시기 상세 확인' },
      { step: 2, name: '보증금 1000만원, 월세 50만원 등 구체적 금액 협의' },
      {
        step: 3,
        name: '외국인등록증, 여권, 재직증명서, 급여명세서 3개월 제출',
      },
      { step: 4, name: '임대차계약서 특약조항, 수선의무, 원상복구 조항 설명' },
      {
        step: 5,
        name: '관리비 항목별 내역, 공과금 분담, 인터넷/주차비 별도 확인',
      },
      { step: 6, name: '계약금 10% 현금지급, 중개수수료 0.5% 카드결제' },
      { step: 7, name: '열쇠 2개 인수, 입주 체크리스트 작성, 하자 확인' },
      {
        step: 8,
        name: '주민센터 전입신고 14일 내, 인터넷/가스/전기 개통 안내',
      },
    ],
    tone: '신뢰감 있고 차분한 톤',
    duration: '25-35분',
    difficulty: '고급',
    description: '임대차 계약 전 과정을 실제처럼 시뮬레이션해보세요',
  },
};

export const SIMULATION_SCENARIO_LIST: SimulationScenario[] =
  Object.values(SIMULATION_SCENARIOS);

export const getScenarioById = (id: string): SimulationScenario | undefined =>
  SIMULATION_SCENARIOS[id];

export const getSystemPromptForScenario = (
  scenario: SimulationScenario
): string => buildSystemPrompt(scenario);
