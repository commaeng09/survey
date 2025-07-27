// 설문조사 API 테스트 스크립트
const API_BASE_URL = 'https://survey-backend-dgiy.onrender.com/api';

// 1. 로그인 테스트
async function testLogin() {
  console.log('1. 로그인 테스트 시작...');
  
  const response = await fetch(`${API_BASE_URL}/auth/login/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      username: 'admin',
      password: 'admin123'
    })
  });
  
  console.log('로그인 응답 상태:', response.status);
  const data = await response.json();
  console.log('로그인 응답 데이터:', data);
  
  if (response.ok && data.access) {
    return data.access;
  } else {
    throw new Error('로그인 실패');
  }
}

// 2. 설문조사 생성 테스트
async function testCreateSurvey(token) {
  console.log('\n2. 설문조사 생성 테스트 시작...');
  
  const surveyData = {
    title: '테스트 설문조사',
    description: '이것은 API 테스트용 설문조사입니다.',
    status: 'draft',
    questions: [
      {
        text: '첫 번째 질문',
        description: '단답형 질문입니다.',
        type: 'text',
        required: true,
        order: 1,
        options: []
      },
      {
        text: '두 번째 질문',
        description: '객관식 질문입니다.',
        type: 'radio',
        required: true,
        order: 2,
        options: ['선택지 1', '선택지 2', '선택지 3']
      }
    ]
  };
  
  console.log('전송할 설문조사 데이터:', JSON.stringify(surveyData, null, 2));
  
  const response = await fetch(`${API_BASE_URL}/surveys/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(surveyData)
  });
  
  console.log('설문조사 생성 응답 상태:', response.status);
  const data = await response.text();
  console.log('설문조사 생성 응답 데이터:', data);
  
  if (response.ok) {
    console.log('✅ 설문조사 생성 성공!');
    return JSON.parse(data);
  } else {
    console.error('❌ 설문조사 생성 실패');
    throw new Error(`설문조사 생성 실패: ${response.status} - ${data}`);
  }
}

// 메인 테스트 실행
async function runTests() {
  try {
    console.log('=== 설문조사 API 테스트 시작 ===\n');
    
    const token = await testLogin();
    console.log('✅ 로그인 성공, 토큰:', token.substring(0, 20) + '...');
    
    const survey = await testCreateSurvey(token);
    console.log('✅ 설문조사 생성 성공, ID:', survey.id);
    
    console.log('\n=== 모든 테스트 완료 ===');
  } catch (error) {
    console.error('❌ 테스트 실패:', error.message);
  }
}

// Node.js 환경에서 실행
if (typeof fetch === 'undefined') {
  console.log('Node.js 환경에서는 fetch 폴리필이 필요합니다.');
  console.log('브라우저 콘솔에서 이 스크립트를 실행해주세요.');
} else {
  runTests();
}
