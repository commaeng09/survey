import React, { createContext, useContext, useState, useEffect } from 'react';

export interface User {
  id: string;
  username: string;
  name: string;
  first_name: string;
  last_name: string;
  organization: string;
}

export interface SignupData {
  username: string;
  password: string;
  password_confirm: string;
  name: string;
  first_name: string;
  last_name: string;
  organization: string;
  email?: string;
  user_type?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  signup: (data: SignupData) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Failed to parse saved user:', error);
        localStorage.removeItem('user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      const response = await fetch('https://survey-backend-dgiy.onrender.com/api/auth/login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        const data = await response.json();
        const user: User = {
          id: data.user.id,
          username: data.user.username,
          name: `${data.user.first_name} ${data.user.last_name}`,
          first_name: data.user.first_name,
          last_name: data.user.last_name,
          organization: data.user.organization || ''
        };
        
        setUser(user);
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('authToken', data.tokens.access);
        setIsLoading(false);
        return true;
      }
    } catch (error) {
      console.error('Login error:', error);
    }
    
    setIsLoading(false);
    return false;
  };

  const signup = async (data: SignupData): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      console.log('🚀 Starting signup process for:', data.username);
      console.log('📝 Signup data:', { ...data, password: '[HIDDEN]', password_confirm: '[HIDDEN]' });
      
      const requestBody = {
        username: data.username,
        password: data.password,
        password_confirm: data.password_confirm,
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        user_type: data.user_type,
        organization: data.organization
      };
      
      console.log('🌐 Making API request to:', 'https://survey-backend-dgiy.onrender.com/api/auth/register/');
      
      const response = await fetch('https://survey-backend-dgiy.onrender.com/api/auth/register/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      console.log('📡 Signup response status:', response.status);
      console.log('📡 Signup response ok:', response.ok);

      if (response.ok) {
        const responseData = await response.json();
        console.log('✅ Signup successful:', responseData);
        
        const user: User = {
          id: responseData.user.id,
          username: responseData.user.username,
          name: `${responseData.user.first_name} ${responseData.user.last_name}`,
          first_name: responseData.user.first_name,
          last_name: responseData.user.last_name,
          organization: responseData.user.organization || ''
        };
        
        setUser(user);
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('authToken', responseData.tokens.access);
        setIsLoading(false);
        return true;
      } else {
        const errorData = await response.text();
        console.error('❌ Signup failed with status:', response.status);
        console.error('❌ Error response:', errorData);
      }
    } catch (error) {
      console.error('💥 Signup error:', error);
      console.error('💥 Error type:', error instanceof Error ? error.name : typeof error);
      console.error('💥 Error message:', error instanceof Error ? error.message : String(error));
      
      // 네트워크 오류인지 확인
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        console.error('🌐 Network connectivity issue detected');
      }
    }
    
    setIsLoading(false);
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('authToken');
  };

  const isAuthenticated = !!user;

  const value: AuthContextType = {
    user,
    isLoading,
    login,
    signup,
    logout,
    isAuthenticated,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const TEST_ACCOUNTS = [
  {
    username: 'instructor',
    password: 'password123',
    name: '김강사 (테스트)',
    organization: '한국대학교'
  },
  {
    username: 'admin',
    password: 'admin123', 
    name: '관리자 (테스트)',
    organization: '시스템관리팀'
  }
];

// DashboardPageNew.tsx 개선
useEffect(() => {
  const loadSurveys = async () => {
    try {
      console.log('📊 Loading surveys from backend...');
      
      // 백엔드에서 설문 목록을 가져오려고 시도
      const response = await surveyAPI.getMySurveys();
      console.log('📡 Backend response structure:', response);
      
      // 응답이 배열인지 확인하고, 아니면 results 속성을 찾아보기
      let backendSurveys = [];
      if (Array.isArray(response)) {
        backendSurveys = response;
      } else if (response && Array.isArray(response.results)) {
        backendSurveys = response.results;
      } else if (response && Array.isArray(response.data)) {
        backendSurveys = response.data;
      } else {
        console.warn('⚠️ Unexpected response structure:', response);
        throw new Error('Invalid response format');
      }
      
      console.log('📋 Processed backend surveys:', backendSurveys);
      
      // 백엔드 데이터를 대시보드 형식으로 변환
      const mappedSurveys = backendSurveys.map((s: any) => ({
        id: s.id,
        title: s.title,
        description: s.description,
        status: s.status,
        createdAt: s.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
        responses: Array.isArray(s.responses) ? s.responses : []
      }));
      
      console.log('✅ Mapped surveys:', mappedSurveys);
      setSurveys(mappedSurveys);
      
    } catch (error) {
      console.log('❌ 백엔드 연결 실패, 로컬 데이터 사용:', error);
      
      // 백엔드 연결 실패 시 로컬 스토리지 사용
      const userSurveys = JSON.parse(localStorage.getItem('user_surveys') || '[]');
      const currentUserSurveys = userSurveys.filter((s: any) => s.creator === user?.username);
      
      if (currentUserSurveys.length === 0) {
        setSurveys([]);
      } else {
        const mappedSurveys = currentUserSurveys.map((s: any) => ({
          id: s.id,
          title: s.title,
          description: s.description,
          status: s.status,
          createdAt: s.createdAt.split('T')[0],
          responses: Array.isArray(s.responses) ? s.responses : []
        }));
        setSurveys(mappedSurveys);
      }
    }
  };

  if (user) {
    loadSurveys();
  }
}, [user]);

// 페이지로 돌아올 때마다 설문 목록을 새로고침하는 효과 추가
useEffect(() => {
  const handleFocus = () => {
    if (user) {
      // 페이지가 포커스될 때 설문 목록 다시 로드
      console.log('🔄 Page focused, reloading surveys...');
      loadSurveys();
    }
  };

  window.addEventListener('focus', handleFocus);
  return () => window.removeEventListener('focus', handleFocus);
}, [user]);
