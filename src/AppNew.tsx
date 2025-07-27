import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContextNew';
import ProtectedRoute from './components/ProtectedRoute';
import HomePage from './pages/HomePage';
import LoginPageNew from './pages/LoginPageNew';
import SignupPageNew from './pages/SignupPageNew';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPageNew />} />
          <Route path="/signup" element={<SignupPageNew />} />
          
          {/* 보호된 라우트들 */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <div className="min-h-screen bg-gray-50 p-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">대시보드</h1>
                <p className="text-gray-600">로그인된 사용자만 볼 수 있는 페이지입니다.</p>
                <div className="mt-6">
                  <p className="text-sm text-gray-500">
                    앞으로 설문 관리 기능이 여기에 추가될 예정입니다.
                  </p>
                </div>
              </div>
            </ProtectedRoute>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
