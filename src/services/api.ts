// API 기본 설정 - Render.com 새로운 백엔드 (2025-01-27 핵폭탄 버전)
// 캐시 버스터: v2.0.0-render-force-update  
// ⚡ VERCEL 캐시 무시하고 강제로 새 URL 사용
const FORCE_NEW_API_URL = 'https://survey-backend-dgiy.onrender.com/api';
const API_BASE_URL = FORCE_NEW_API_URL; // 완전 하드코딩으로 강제!

console.log('🎯 FINAL API URL:', API_BASE_URL);
console.log('🔥 Force URL:', FORCE_NEW_API_URL);

// API 요청 헬퍼 함수
const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('authToken');
  const user = localStorage.getItem('user');
  
  console.log('🔑 Current token:', token ? 'EXISTS' : 'NOT_FOUND');
  console.log('👤 Current user:', user ? JSON.parse(user) : 'NOT_FOUND');
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  try {
    console.log(`🚀 API Request: ${config.method || 'GET'} ${API_BASE_URL}${endpoint}`);
    console.log('📝 Request config:', config);
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    
    console.log(`📡 Response status: ${response.status}`);
    
    if (!response.ok) {
      if (response.status === 401) {
        // 토큰이 만료되었거나 유효하지 않음
        console.warn('🔒 Authentication failed - removing tokens');
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
        throw new Error('Authentication required');
      }
      
      const errorData = await response.text();
      console.error(`❌ API Error ${response.status}:`, errorData);
      throw new Error(`API Error: ${response.status} - ${errorData}`);
    }
    
    const result = await response.json();
    console.log('✅ API Response:', result);
    return result;
  } catch (error) {
    console.error('💥 API Request failed:', error);
    throw error;
  }
};

// 인증 API
export const authAPI = {
  login: (credentials: { username: string; password: string }) =>
    apiRequest('/auth/login/', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),
  
  register: (userData: { username: string; email: string; password: string; password_confirm: string; first_name: string; last_name: string }) =>
    apiRequest('/auth/register/', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),
  
  logout: (refreshToken: string) =>
    apiRequest('/auth/logout/', {
      method: 'POST',
      body: JSON.stringify({ refresh: refreshToken }),
    }),
  
  getProfile: () => apiRequest('/auth/profile/'),
};

// 설문조사 API
export const surveyAPI = {
  // 내 설문조사 목록
  getMySurveys: () => apiRequest('/surveys/'),
  
  // 단일 설문조사 조회
  getSurvey: (id: string) => apiRequest(`/surveys/${id}/`),
  
  // 설문조사 생성
  createSurvey: (surveyData: any) =>
    apiRequest('/surveys/', {
      method: 'POST',
      body: JSON.stringify(surveyData),
    }),
  
  // 설문조사 수정
  updateSurvey: (id: string, surveyData: any) =>
    apiRequest(`/surveys/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(surveyData),
    }),
  
  // 설문조사 삭제
  deleteSurvey: (id: string) =>
    apiRequest(`/surveys/${id}/`, {
      method: 'DELETE',
    }),
  
  // 설문조사 복제
  duplicateSurvey: (id: string) =>
    apiRequest(`/surveys/${id}/duplicate/`, {
      method: 'POST',
    }),
  
  // 공개 설문조사 조회 (응답용)
  getPublicSurvey: (id: string) =>
    fetch(`${API_BASE_URL}/public/${id}/`).then(res => res.json()),
  
  // 설문조사 응답 제출
  submitResponse: (id: string, responseData: any) =>
    fetch(`${API_BASE_URL}/public/${id}/submit/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(responseData),
    }).then(res => res.json()),
  
  // 설문조사 분석 데이터
  getAnalytics: (id: string) =>
    apiRequest(`/surveys/${id}/analytics/`),
  
  // 설문조사 응답 목록
  getResponses: (id: string) =>
    apiRequest(`/surveys/${id}/responses/`),
  
  // 사용자명 중복 확인
  checkUsername: (username: string) =>
    apiRequest(`/auth/check-username/`, {
      method: 'POST',
      body: JSON.stringify({ username }),
    }),
};

export default apiRequest;
