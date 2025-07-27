import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { authAPI } from '../services/api';

// 사용자 타입 정의
export interface User {
  id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'instructor' | 'admin';
}

// 회원가입 데이터 타입
export interface SignupData {
  username: string;
  email: string;
  password: string;
  password_confirm: string;
  first_name: string;
  last_name: string;
  role: 'instructor' | 'admin';
}

// 인증 컨텍스트 타입
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  signup: (data: SignupData) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

// 컨텍스트 생성
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 임시 사용자 데이터 (실제로는 서버에서 관리)
const MOCK_USERS = [
  {
    id: '1',
    email: 'instructor@example.com',
    password: 'password123',
    name: '김강사',
    role: 'instructor' as const
  },
  {
    id: '2',
    email: 'admin@example.com',
    password: 'admin123',
    name: '관리자',
    role: 'admin' as const
  }
];

// AuthProvider 컴포넌트
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 앱 시작 시 로컬스토리지에서 사용자 정보 복원
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

  // 로그인 함수
  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    // 실제 환경에서는 API 호출
    await new Promise(resolve => setTimeout(resolve, 1000)); // 로딩 시뮬레이션
    
    const foundUser = MOCK_USERS.find(u => u.email === email && u.password === password);
    
    if (foundUser) {
      const user: User = {
        id: foundUser.id,
        email: foundUser.email,
        name: foundUser.name,
        role: foundUser.role
      };
      
      setUser(user);
      localStorage.setItem('user', JSON.stringify(user));
      setIsLoading(false);
      return true;
    }
    
    setIsLoading(false);
    return false;
  };

  // 회원가입 함수
  const signup = async (data: SignupData): Promise<boolean> => {
    setIsLoading(true);
    
    // 실제 환경에서는 API 호출
    await new Promise(resolve => setTimeout(resolve, 1000)); // 로딩 시뮬레이션
    
    // 이메일 중복 확인
    const existingUser = MOCK_USERS.find(u => u.email === data.email);
    if (existingUser) {
      setIsLoading(false);
      return false; // 이미 존재하는 이메일
    }
    
    // 새 사용자 생성
    const newUser = {
      id: `${Date.now()}`,
      email: data.email,
      password: data.password,
      name: data.name,
      role: data.role
    };
    
    // MOCK_USERS에 추가 (실제로는 서버에 저장)
    MOCK_USERS.push(newUser);
    
    // 자동 로그인
    const user: User = {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role
    };
    
    setUser(user);
    localStorage.setItem('user', JSON.stringify(user));
    setIsLoading(false);
    return true;
  };

  // 로그아웃 함수
  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const value: AuthContextType = {
    user,
    isLoading,
    login,
    signup,
    logout,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// 훅으로 컨텍스트 사용
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
