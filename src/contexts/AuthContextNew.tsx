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

const MOCK_USERS = [
  {
    id: '1',
    username: 'instructor',
    password: 'password123',
    name: '김강사',
    first_name: '강사',
    last_name: '김',
    organization: '한국대학교'
  },
  {
    id: '2',
    username: 'admin',
    password: 'admin123',
    name: '관리자',
    first_name: '관리자',
    last_name: '시스템',
    organization: '시스템관리팀'
  }
];

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
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const foundUser = MOCK_USERS.find(u => u.username === username && u.password === password);
    
    if (foundUser) {
      const user: User = {
        id: foundUser.id,
        username: foundUser.username,
        name: foundUser.name,
        first_name: foundUser.first_name,
        last_name: foundUser.last_name,
        organization: foundUser.organization
      };
      
      setUser(user);
      localStorage.setItem('user', JSON.stringify(user));
      setIsLoading(false);
      return true;
    }
    
    setIsLoading(false);
    return false;
  };

  const signup = async (data: SignupData): Promise<boolean> => {
    setIsLoading(true);
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const existingUser = MOCK_USERS.find(u => u.username === data.username);
    if (existingUser) {
      setIsLoading(false);
      return false;
    }
    
    const newUser = {
      id: Date.now().toString(),
      username: data.username,
      password: data.password,
      name: data.name,
      first_name: data.first_name,
      last_name: data.last_name,
      organization: data.organization
    };
    
    const user: User = {
      id: newUser.id,
      username: newUser.username,
      name: newUser.name,
      first_name: newUser.first_name,
      last_name: newUser.last_name,
      organization: newUser.organization
    };
    
    MOCK_USERS.push(newUser);
    
    setUser(user);
    localStorage.setItem('user', JSON.stringify(user));
    setIsLoading(false);
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
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
