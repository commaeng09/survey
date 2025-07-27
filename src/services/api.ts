// API 기본 설정
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

// API 요청 헬퍼 함수
const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('authToken');
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  
  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }
  
  return response.json();
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
};

export default apiRequest;
