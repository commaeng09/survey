import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContextNew';
import { surveyAPI } from '../services/api';
import type { Survey } from '../types/survey';

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadSurveys = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        console.log('📊 Loading surveys from backend...');
        
        // API가 이미 정규화된 배열을 반환하므로 직접 사용
        const backendSurveys = await surveyAPI.getMySurveys();
        console.log('📋 Backend surveys received:', backendSurveys);
        
        const mappedSurveys = backendSurveys.map((s: any) => ({
          id: s.id,
          title: s.title,
          description: s.description || '',
          status: s.status === 'published' ? 'published' : (s.status || 'draft'),
          createdAt: s.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
          updatedAt: s.updated_at?.split('T')[0] || new Date().toISOString().split('T')[0],
          responses: Array.isArray(s.responses) ? s.responses : [],
          questions: s.questions || [],
          creator: s.creator || user?.username,
          isPublic: s.status === 'published'
        }));
        
        console.log('✅ Mapped surveys:', mappedSurveys);
        setSurveys(mappedSurveys);
        
      } catch (error) {
        console.error('❌ 대시보드 설문 로드 실패:', error);
        setSurveys([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadSurveys();
  }, [user]);

  // 안전한 통계 계산 함수들
  const getTotalSurveys = () => surveys.length;
  const getActiveSurveys = () => surveys.filter(s => s.status === 'published').length;
  const getDraftSurveys = () => surveys.filter(s => s.status === 'draft').length;
  const getTotalResponses = () => surveys.reduce((sum, s) => sum + (s.responses?.length || 0), 0);

  const handleCreateSurvey = () => {
    navigate('/surveys/create');
  };

  const handleEditSurvey = (surveyId: string) => {
    navigate(`/surveys/edit/${surveyId}`);
  };

  const handleViewAnalytics = (surveyId: string) => {
    navigate(`/surveys/${surveyId}/analytics`);
  };

  const handleShareSurvey = (surveyId: string) => {
    copyShareLink(surveyId);
  };

  const handleDeleteSurvey = (surveyId: string) => {
    deleteSurvey(surveyId);
  };

  const handleImportSurvey = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const surveyData = JSON.parse(event.target?.result as string);
            const newSurvey: Survey = {
              ...surveyData,
              id: `survey-${Date.now()}`,
              createdAt: new Date().toISOString().split('T')[0],
              updatedAt: new Date().toISOString().split('T')[0],
              creator: user?.username || '',
              responses: []
            };
            
            const existingSurveys = JSON.parse(localStorage.getItem('user_surveys') || '[]');
            existingSurveys.push(newSurvey);
            localStorage.setItem('user_surveys', JSON.stringify(existingSurveys));
            
            setSurveys(prev => [...prev, newSurvey]);
            alert('설문을 성공적으로 가져왔습니다!');
          } catch {
            alert('설문 파일을 읽을 수 없습니다. JSON 형식인지 확인해주세요.');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };
  
  const handleExportSurvey = (survey: Survey) => {
    const exportData = {
      title: survey.title,
      description: survey.description,
      questions: survey.questions || [],
      isPublic: survey.status === 'published',
      status: 'draft'
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `${survey.title.replace(/[^a-z0-9]/gi, '_')}_survey.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    alert('설문이 JSON 파일로 내보내기되었습니다!');
  };

  const copyShareLink = (surveyId: string) => {
    if (surveyId.startsWith('survey-')) {
      alert('⚠️ 이 설문조사는 로컬에만 저장되어 있습니다.\n실제 공유하려면 백엔드에 연결된 상태에서 설문조사를 다시 생성해주세요.');
      return;
    }
    
    const shareUrl = `${window.location.origin}/survey/${surveyId}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      alert('설문 링크가 클립보드에 복사되었습니다!');
    }).catch(() => {
      const textArea = document.createElement('textarea');
      textArea.value = shareUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert('설문 링크가 클립보드에 복사되었습니다!');
    });
  };

  const deleteSurvey = async (surveyId: string) => {
    if (!confirm('정말로 이 설문을 삭제하시겠습니까?')) {
      return;
    }

    try {
      await surveyAPI.deleteSurvey(surveyId);
      setSurveys(prev => prev.filter(s => s.id !== surveyId));
      alert('설문이 삭제되었습니다.');
    } catch (error) {
      console.error('설문 삭제 실패:', error);
      const userSurveys = JSON.parse(localStorage.getItem('user_surveys') || '[]');
      const updatedSurveys = userSurveys.filter((s: any) => s.id !== surveyId);
      localStorage.setItem('user_surveys', JSON.stringify(updatedSurveys));
      setSurveys(prev => prev.filter(s => s.id !== surveyId));
      alert('설문이 삭제되었습니다.');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return '진행중';
      case 'draft': return '초안';
      case 'closed': return '종료';
      default: return '알 수 없음';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link 
                to="/" 
                className="text-xl font-semibold text-gray-900 hover:text-gray-700 transition-colors"
              >
                설문지 관리 시스템
              </Link>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-600">
                안녕하세요, {user?.name}님
              </span>
              <Link 
                to="/"
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                홈
              </Link>
              <button
                onClick={logout}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                로그아웃
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">대시보드</h1>
          <p className="mt-2 text-gray-600">설문조사를 관리하고 결과를 확인하세요.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">총 설문</p>
                <p className="text-2xl font-semibold text-gray-900">{getTotalSurveys()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">진행중</p>
                <p className="text-2xl font-semibold text-gray-900">{getActiveSurveys()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">초안</p>
                <p className="text-2xl font-semibold text-gray-900">{getDraftSurveys()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">총 응답</p>
                <p className="text-2xl font-semibold text-gray-900">{getTotalResponses()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <button 
              onClick={handleCreateSurvey}
              className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              새 설문 만들기
            </button>
            <button 
              onClick={handleImportSurvey}
              className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
              </svg>
              설문 가져오기
            </button>
          </div>
        </div>

        {/* Surveys List */}
        <div className="bg-white shadow-sm rounded-lg border">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">내 설문조사</h2>
          </div>
          
          <div className="divide-y divide-gray-200">
            {Array.isArray(surveys) && surveys.map((survey) => (
              <div key={survey.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center">
                      <h3 className="text-lg font-medium text-gray-900 mr-3">
                        {survey.title}
                      </h3>
                      {survey.id.startsWith('survey-') && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 mr-2">
                          💾 로컬
                        </span>
                      )}
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(survey.status)}`}>
                        {getStatusText(survey.status)}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-gray-600">{survey.description}</p>
                    <div className="mt-2 flex items-center text-sm text-gray-500">
                      <span>생성일: {survey.createdAt}</span>
                      <span className="mx-2">•</span>
                      <span>응답 수: {Array.isArray(survey.responses) ? survey.responses.length : 0}개</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    <button 
                      onClick={() => handleEditSurvey(survey.id)}
                      className="text-gray-400 hover:text-gray-600 p-1 rounded-md transition-colors"
                      title="편집"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                    <button 
                      onClick={() => handleViewAnalytics(survey.id)}
                      className="text-gray-400 hover:text-gray-600 p-1 rounded-md transition-colors"
                      title="분석 보기"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </button>
                    <button 
                      onClick={() => handleShareSurvey(survey.id)}
                      className="text-gray-400 hover:text-gray-600 p-1 rounded-md transition-colors"
                      title="공유"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                      </svg>
                    </button>
                    <button 
                      onClick={() => handleExportSurvey(survey)}
                      className="text-gray-400 hover:text-gray-600 p-1 rounded-md transition-colors"
                      title="내보내기"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                      </svg>
                    </button>
                    <button 
                      onClick={() => handleDeleteSurvey(survey.id)}
                      className="text-gray-400 hover:text-red-600 p-1 rounded-md transition-colors"
                      title="삭제"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Empty State */}
        {(!Array.isArray(surveys) || surveys.length === 0) && (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-2 text-sm font-semibold text-gray-900">설문이 없습니다</h3>
            <p className="mt-1 text-sm text-gray-500">첫 번째 설문조사를 만들어보세요.</p>
            <div className="mt-6">
              <button 
                onClick={handleCreateSurvey}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                새 설문 만들기
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
