import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContextNew';
import ProtectedRoute from './components/ProtectedRoute';
import HomePageNew from './pages/HomePageNew';
import LoginPageNew from './pages/LoginPageNew';
import SignupPageNew from './pages/SignupPageNew';
import DashboardPageNew from './pages/DashboardPageNew';
import SurveyCreatePage from './pages/SurveyCreatePage';
import AnalyticsPage from './pages/AnalyticsPage';
import SurveyResponsePage from './pages/SurveyResponsePage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<HomePageNew />} />
          <Route path="/login" element={<LoginPageNew />} />
          <Route path="/signup" element={<SignupPageNew />} />
          
          {/* 보호된 라우트들 */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <DashboardPageNew />
            </ProtectedRoute>
          } />
          <Route path="/survey/create" element={
            <ProtectedRoute>
              <SurveyCreatePage />
            </ProtectedRoute>
          } />
          <Route path="/analytics" element={
            <ProtectedRoute>
              <AnalyticsPage />
            </ProtectedRoute>
          } />
          <Route path="/survey/:id" element={<SurveyResponsePage />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
