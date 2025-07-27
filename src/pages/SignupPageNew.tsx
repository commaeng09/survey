import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth, type SignupData } from '../contexts/AuthContextNew';
import { surveyAPI } from '../services/api';

export default function SignupPage() {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    password_confirm: '',
    name: '',
    first_name: '',
    last_name: '',
    organization: '',
    email: '',
    user_type: 'student'
  });
  const [error, setError] = useState('');
  const [usernameStatus, setUsernameStatus] = useState<{
    checking: boolean;
    available?: boolean;
    message?: string;
  }>({ checking: false });
  const { signup, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // 사용자명 변경 시 중복 확인
    if (name === 'username') {
      if (value.length >= 3) {
        checkUsername(value);
      } else {
        setUsernameStatus({ 
          checking: false, 
          available: false, 
          message: value.length > 0 ? '아이디는 3자 이상이어야 합니다.' : '' 
        });
      }
    }
  };

  const checkUsername = async (username: string) => {
    if (username.length < 3) {
      setUsernameStatus({
        checking: false,
        available: false,
        message: '아이디는 3자 이상이어야 합니다.'
      });
      return;
    }

    setUsernameStatus({ checking: true });
    
    try {
      console.log('🔍 Checking username:', username);
      const response = await surveyAPI.checkUsername(username);
      console.log('✅ Username check response:', response);
      
      setUsernameStatus({
        checking: false,
        available: response.available,
        message: response.message
      });
    } catch (error) {
      console.error('❌ Username check failed:', error);
      setUsernameStatus({
        checking: false,
        available: false,
        message: '중복 확인 중 오류가 발생했습니다.'
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // 아이디 길이 확인
    if (formData.username.length < 3) {
      setError('아이디는 3자 이상이어야 합니다.');
      return;
    }

    // 사용자명 중복 확인 - 명시적으로 체크
    console.log('🔍 Final username status check:', usernameStatus);
    
    if (usernameStatus.checking) {
      setError('아이디 중복 확인 중입니다. 잠시 기다려주세요.');
      return;
    }
    
    if (usernameStatus.available !== true) {
      setError('아이디 중복 확인이 필요하거나 이미 사용 중인 아이디입니다.');
      return;
    }

    if (formData.password !== formData.password_confirm) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }

    try {
      const success = await signup(formData as SignupData);
      if (success) {
        navigate('/dashboard');
      } else {
        setError('회원가입 중 오류가 발생했습니다. 다시 시도해주세요.');
      }
    } catch (err) {
      setError('회원가입 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">회원가입</h2>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                아이디
              </label>
              <div className="mt-1">
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  placeholder="영문, 숫자를 포함한 4-20자"
                  className={`appearance-none block w-full px-3 py-2 border rounded-md placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 sm:text-sm ${
                    usernameStatus.available === true
                      ? 'border-green-300 focus:ring-green-500 focus:border-green-500'
                      : usernameStatus.available === false
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                      : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                  }`}
                  value={formData.username}
                  onChange={handleChange}
                />
                {usernameStatus.checking && (
                  <p className="mt-1 text-sm text-gray-500">중복 확인 중...</p>
                )}
                {usernameStatus.message && !usernameStatus.checking && (
                  <p className={`mt-1 text-sm ${usernameStatus.available ? 'text-green-600' : 'text-red-600'}`}>
                    {usernameStatus.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                이름
              </label>
              <div className="mt-1">
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                이메일
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="your@email.com"
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="first_name" className="block text-sm font-medium text-gray-700">
                  성
                </label>
                <div className="mt-1">
                  <input
                    id="first_name"
                    name="first_name"
                    type="text"
                    required
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    value={formData.first_name}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="last_name" className="block text-sm font-medium text-gray-700">
                  이름
                </label>
                <div className="mt-1">
                  <input
                    id="last_name"
                    name="last_name"
                    type="text"
                    required
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    value={formData.last_name}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                비밀번호
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <label htmlFor="password_confirm" className="block text-sm font-medium text-gray-700">
                비밀번호 확인
              </label>
              <div className="mt-1">
                <input
                  id="password_confirm"
                  name="password_confirm"
                  type="password"
                  required
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={formData.password_confirm}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <label htmlFor="organization" className="block text-sm font-medium text-gray-700">
                소속
              </label>
              <div className="mt-1">
                <input
                  id="organization"
                  name="organization"
                  type="text"
                  required
                  placeholder="회사명, 학교명, 기관명 등"
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={formData.organization}
                  onChange={handleChange}
                />
              </div>
            </div>

            {error && (
              <div className="rounded-md bg-red-50 p-4">
                <div className="text-sm text-red-700">{error}</div>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {isLoading ? '가입 중...' : '회원가입'}
              </button>
            </div>

            <div className="text-center">
              <Link
                to="/login"
                className="text-sm text-blue-600 hover:text-blue-500"
              >
                이미 계정이 있으신가요? 로그인
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
