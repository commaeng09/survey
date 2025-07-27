import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import type { Survey } from '../types/survey';

// 임시 데이터 (실제로는 API에서 가져올 데이터)
const MOCK_SURVEYS: Survey[] = [
  {
    id: '1',
    title: '교육 만족도 조사',
    description: '이번 분기 교육과정에 대한 훈련생들의 만족도를 조사합니다.',
    questions: [
      { id: 'q1', type: 'rating', title: '전반적인 교육 만족도는?', required: true },
      { id: 'q2', type: 'multiple-choice', title: '가장 도움이 된 과목은?', required: true, options: ['프로그래밍', '데이터베이스', '네트워크'] },
      { id: 'q3', type: 'long-text', title: '개선사항이 있다면 자유롭게 작성해주세요.', required: false }
    ],
    createdAt: new Date('2025-01-20'),
    updatedAt: new Date('2025-01-22'),
    status: 'published',
    startDate: new Date('2025-01-22T09:00:00'),
    endDate: new Date('2025-01-31T18:00:00')
  },
  {
    id: '2',
    title: '온라인 강의 피드백',
    description: '온라인 강의 시스템에 대한 피드백을 수집합니다.',
    questions: [
      { id: 'q1', type: 'rating', title: '온라인 강의 화질은 어땠나요?', required: true },
      { id: 'q2', type: 'checkbox', title: '어떤 기능이 필요하다고 생각하시나요?', required: false, options: ['화면 공유', '채팅', '녹화 기능', '퀴즈'] }
    ],
    createdAt: new Date('2025-01-15'),
    updatedAt: new Date('2025-01-15'),
    status: 'draft'
  },
  {
    id: '3',
    title: '취업 준비 현황 조사',
    description: '훈련생들의 취업 준비 현황과 지원 필요 사항을 파악합니다.',
    questions: [
      { id: 'q1', type: 'multiple-choice', title: '현재 취업 준비 단계는?', required: true, options: ['이력서 작성', '포트폴리오 준비', '면접 준비', '취업 완료'] },
      { id: 'q2', type: 'short-text', title: '희망하는 직무는?', required: true }
    ],
    createdAt: new Date('2025-01-10'),
    updatedAt: new Date('2025-01-18'),
    status: 'closed',
    startDate: new Date('2025-01-10T09:00:00'),
    endDate: new Date('2025-01-18T18:00:00')
  }
];

// 임시 응답 데이터
const MOCK_RESPONSES = {
  '1': { total: 45, completed: 42 },
  '2': { total: 0, completed: 0 },
  '3': { total: 38, completed: 35 }
};

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const [surveys, setSurveys] = useState<Survey[]>(MOCK_SURVEYS);
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'draft' | 'published' | 'closed'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingDates, setEditingDates] = useState<string | null>(null);
  const [tempStartDate, setTempStartDate] = useState<string>('');
  const [tempEndDate, setTempEndDate] = useState<string>('');

  // 필터링된 설문지 목록
  const filteredSurveys = surveys.filter(survey => {
    const matchesStatus = selectedStatus === 'all' || survey.status === selectedStatus;
    const matchesSearch = survey.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         survey.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // 설문지 삭제
  const deleteSurvey = (surveyId: string) => {
    if (confirm('정말로 이 설문지를 삭제하시겠습니까?')) {
      setSurveys(prev => prev.filter(s => s.id !== surveyId));
    }
  };

  // 설문지 복사
  const duplicateSurvey = (surveyId: string) => {
    const surveyToDuplicate = surveys.find(s => s.id === surveyId);
    if (surveyToDuplicate) {
      const duplicatedSurvey: Survey = {
        ...surveyToDuplicate,
        id: `${Date.now()}`,
        title: `${surveyToDuplicate.title} (복사본)`,
        status: 'draft',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      setSurveys(prev => [duplicatedSurvey, ...prev]);
    }
  };

  // 상태 변경
  const changeStatus = (surveyId: string, newStatus: Survey['status']) => {
    setSurveys(prev => prev.map(s => 
      s.id === surveyId 
        ? { ...s, status: newStatus, updatedAt: new Date() }
        : s
    ));
  };

  // 배포 기간 편집 시작
  const startEditingDates = (surveyId: string) => {
    const survey = surveys.find(s => s.id === surveyId);
    if (survey) {
      setEditingDates(surveyId);
      setTempStartDate(survey.startDate ? 
        new Date(survey.startDate.getTime() - survey.startDate.getTimezoneOffset() * 60000).toISOString().slice(0, 16) : '');
      setTempEndDate(survey.endDate ? 
        new Date(survey.endDate.getTime() - survey.endDate.getTimezoneOffset() * 60000).toISOString().slice(0, 16) : '');
    }
  };

  // 배포 기간 저장
  const saveDates = () => {
    if (editingDates) {
      setSurveys(prev => prev.map(s => 
        s.id === editingDates 
          ? { 
              ...s, 
              startDate: tempStartDate ? new Date(tempStartDate) : undefined,
              endDate: tempEndDate ? new Date(tempEndDate) : undefined,
              updatedAt: new Date() 
            }
          : s
      ));
      setEditingDates(null);
      setTempStartDate('');
      setTempEndDate('');
    }
  };

  // 배포 기간 편집 취소
  const cancelEditingDates = () => {
    setEditingDates(null);
    setTempStartDate('');
    setTempEndDate('');
  };

  const getStatusColor = (status: Survey['status']) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'published': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: Survey['status']) => {
    switch (status) {
      case 'draft': return '초안';
      case 'published': return '배포중';
      case 'closed': return '마감';
      default: return '알 수 없음';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link to="/" className="text-gray-600 hover:text-gray-900">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </Link>
              <h1 className="text-xl font-semibold text-gray-900">설문지 관리</h1>
            </div>
            
            <div className="flex items-center space-x-3">
              <Link
                to="/create"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
              >
                <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                새 설문지
              </Link>
              
              {/* 사용자 메뉴 */}
              <div className="flex items-center space-x-3 border-l border-gray-200 pl-3">
                <span className="text-sm text-gray-700">
                  안녕하세요, <span className="font-medium">{user?.name}</span>님
                </span>
                <button
                  onClick={() => {
                    if (confirm('로그아웃 하시겠습니까?')) {
                      logout();
                    }
                  }}
                  className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                >
                  로그아웃
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      전체 설문지
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {surveys.length}개
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      배포중
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {surveys.filter(s => s.status === 'published').length}개
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      초안
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {surveys.filter(s => s.status === 'draft').length}개
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      총 응답
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {Object.values(MOCK_RESPONSES).reduce((acc, curr) => acc + curr.completed, 0)}개
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 필터 및 검색 */}
        <div className="bg-white shadow rounded-lg mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
              <div className="flex items-center space-x-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mr-2">상태:</label>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value as any)}
                    className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">전체</option>
                    <option value="draft">초안</option>
                    <option value="published">배포중</option>
                    <option value="closed">마감</option>
                  </select>
                </div>
              </div>
              
              <div className="flex-1 max-w-lg">
                <input
                  type="text"
                  placeholder="설문지 제목이나 설명으로 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 설문지 목록 */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {filteredSurveys.length === 0 ? (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">설문지가 없습니다</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm ? '검색 조건에 맞는 설문지가 없습니다.' : '첫 번째 설문지를 만들어보세요.'}
              </p>
              <div className="mt-6">
                <Link
                  to="/create"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  새 설문지 만들기
                </Link>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredSurveys.map((survey) => {
                const responses = MOCK_RESPONSES[survey.id as keyof typeof MOCK_RESPONSES] || { total: 0, completed: 0 };
                
                return (
                  <div key={survey.id} className="p-4 sm:p-6 hover:bg-gray-50">
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between space-y-4 lg:space-y-0">
                      <div className="flex-1 min-w-0 space-y-3">
                        {/* 제목과 상태 */}
                        <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
                          <h3 className="text-lg font-medium text-gray-900 break-words line-clamp-2">
                            {survey.title}
                          </h3>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium shrink-0 ${getStatusColor(survey.status)}`}>
                            {getStatusText(survey.status)}
                          </span>
                        </div>
                        
                        {/* 설명 */}
                        <p className="text-sm text-gray-600 break-words line-clamp-3 leading-relaxed">
                          {survey.description}
                        </p>
                        
                        {/* 메타 정보 - 반응형 그리드 */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-2 text-sm text-gray-500">
                          <span className="flex items-center">
                            <svg className="w-4 h-4 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            질문 {survey.questions.length}개
                          </span>
                          <span className="flex items-center">
                            <svg className="w-4 h-4 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 515.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            응답 {responses.completed}/{responses.total}
                          </span>
                          <span className="flex items-center">
                            <svg className="w-4 h-4 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="truncate">생성: {survey.createdAt.toLocaleDateString('ko-KR')}</span>
                          </span>
                          <span className="flex items-center">
                            <svg className="w-4 h-4 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            <span className="truncate">수정: {survey.updatedAt.toLocaleDateString('ko-KR')}</span>
                          </span>
                          {survey.startDate && (
                            <span className="flex items-center text-blue-600 col-span-1 sm:col-span-2 lg:col-span-1">
                              <span className="mr-1">📅</span>
                              <span className="truncate">
                                시작: {survey.startDate.toLocaleDateString('ko-KR')} {survey.startDate.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </span>
                          )}
                          {survey.endDate && (
                            <span className="flex items-center text-red-600 col-span-1 sm:col-span-2 lg:col-span-1">
                              <span className="mr-1">⏰</span>
                              <span className="truncate">
                                종료: {survey.endDate.toLocaleDateString('ko-KR')} {survey.endDate.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {/* 액션 버튼들 */}
                      <div className="flex flex-wrap lg:flex-col xl:flex-row items-start gap-1 lg:ml-4 shrink-0">
                        {/* 첫 번째 행 - 주요 액션들 */}
                        <div className="flex flex-wrap gap-1">
                          {/* 미리보기/응답 링크 */}
                          <Link
                            to={`/survey/${survey.id}`}
                            target="_blank"
                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            title="응답 페이지 보기"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </Link>

                          {/* 편집 */}
                          <Link
                            to={`/create?id=${survey.id}`}
                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            title="편집"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </Link>

                          {/* 분석 */}
                          {survey.status !== 'draft' && (
                            <Link
                              to={`/analytics/${survey.id}`}
                              className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
                              title="응답 분석"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                              </svg>
                            </Link>
                          )}

                          {/* 배포 기간 편집 */}
                          <button
                            onClick={() => startEditingDates(survey.id)}
                            className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                            title="배포 기간 편집"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </button>
                        </div>

                        {/* 두 번째 행 - 추가 액션들 */}
                        <div className="flex flex-wrap gap-1">
                          {/* 공유 링크 복사 */}
                          <button
                            onClick={() => {
                              const url = `${window.location.origin}/survey/${survey.id}`;
                              navigator.clipboard.writeText(url).then(() => {
                                alert('설문지 링크가 클립보드에 복사되었습니다!');
                              }).catch(() => {
                                alert('링크 복사에 실패했습니다.');
                              });
                            }}
                            className="p-2 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded transition-colors"
                            title="설문지 링크 복사"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                            </svg>
                          </button>

                          {/* 복사 */}
                          <button
                            onClick={() => duplicateSurvey(survey.id)}
                            className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded transition-colors"
                            title="복사"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                          </button>

                          {/* 삭제 */}
                          <button
                            onClick={() => deleteSurvey(survey.id)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                            title="삭제"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>

                        {/* 상태 변경 드롭다운 - 전체 너비 */}
                        <div className="w-full sm:w-auto mt-2 lg:mt-0">
                          <select
                            value={survey.status}
                            onChange={(e) => changeStatus(survey.id, e.target.value as Survey['status'])}
                            className="w-full sm:w-auto text-sm border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                          >
                            <option value="draft">초안</option>
                            <option value="published">배포</option>
                            <option value="closed">마감</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* 배포 기간 편집 모달 */}
      {editingDates && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">배포 기간 편집</h3>
                <button
                  onClick={cancelEditingDates}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    시작 일시
                  </label>
                  <input
                    type="datetime-local"
                    value={tempStartDate}
                    onChange={(e) => setTempStartDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    종료 일시
                  </label>
                  <input
                    type="datetime-local"
                    value={tempEndDate}
                    onChange={(e) => setTempEndDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="text-sm text-gray-500">
                  <p>• 시작일을 설정하지 않으면 즉시 배포됩니다.</p>
                  <p>• 종료일을 설정하지 않으면 수동으로 마감해야 합니다.</p>
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={cancelEditingDates}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                >
                  취소
                </button>
                <button
                  onClick={saveDates}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
                >
                  저장
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
