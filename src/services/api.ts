import type { Survey } from '../types/survey';

// API 기본 설정
const API_BASE_URL = import.meta.env.DEV
  ? 'http://localhost:8000/api'
  : 'https://survey-backend-dgiy.onrender.com/api';

console.log('🚀 API Mode:', import.meta.env.DEV ? 'DEVELOPMENT' : 'PRODUCTION');
console.log('🚀 Using API:', API_BASE_URL);

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

  try {
    console.log(`🚀 API Request: ${config.method || 'GET'} ${API_BASE_URL}${endpoint}`);
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    console.log(`📡 Response status: ${response.status}`);
    
    if (!response.ok) {
      if (response.status === 401) {
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
  getMySurveys: async (): Promise<Survey[]> => {
    const response = await apiRequest('/surveys/');
    // 백엔드 응답 구조를 정규화하여 항상 배열을 반환
    if (Array.isArray(response)) {
      return response;
    }
    if (response && Array.isArray(response.results)) {
      return response.results;
    }
    console.warn('Unexpected API response structure for getMySurveys:', response);
    return []; // 어떤 경우에도 빈 배열을 반환하여 타입 오류 방지
  },

  // 단일 설문조사 조회
  getSurvey: (id: string) => apiRequest(`/surveys/${id}/`),
  
  // 설문조사 생성
  createSurvey: (surveyData: any) => {
    console.log('📤 API: Sending survey data:', surveyData);
    return apiRequest('/surveys/', {
      method: 'POST',
      body: JSON.stringify(surveyData),
    });
  },
  
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
  getPublicSurvey: async (id: string): Promise<Survey> => {
    console.log('📤 API: Fetching public survey with ID:', id);
    return fetch(`${API_BASE_URL}/public/${id}/`)
      .then(res => {
        console.log('📡 Public survey response status:', res.status);
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        }
        return res.json();
      })
      .then(data => {
        console.log('✅ Public survey data received:', data);
        return data;
      })
      .catch(error => {
        console.error('❌ Public survey fetch failed:', error);
        throw error;
      });
  },
  
  // 설문조사 응답 제출
  submitResponse: async (id: string, responseData: any) => {
    const url = `${API_BASE_URL}/public/${id}/submit/`;
    console.log('🚀 submitResponse URL:', url);
    console.log('🚀 submitResponse data:', responseData);
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(responseData),
      });
      
      console.log('📡 submitResponse response status:', response.status);
      console.log('📡 submitResponse response ok:', response.ok);
      
      const result = await response.json();
      console.log('📡 submitResponse result:', result);
      
      if (!response.ok) {
        console.error('❌ submitResponse failed with status:', response.status);
        console.error('❌ submitResponse error details:', result);
        throw new Error(`HTTP ${response.status}: ${JSON.stringify(result)}`);
      }
      
      return result;
    } catch (error) {
      console.error('💥 submitResponse network error:', error);
      throw error;
    }
  },
  
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
