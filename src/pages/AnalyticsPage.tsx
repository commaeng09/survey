import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import type { Survey, Question } from '../types/survey';

// 임시 설문지 데이터 (실제로는 API에서 가져올 데이터)
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
    status: 'published'
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
    status: 'closed'
  }
];

// 임시 응답 데이터
const MOCK_ANALYTICS = {
  '1': {
    totalResponses: 42,
    completionRate: 93.3,
    averageTime: 8.5, // 분
    responses: {
      'q1': {
        type: 'rating',
        data: [2, 5, 12, 18, 5], // 1점부터 5점까지 응답 수
        average: 3.7
      },
      'q2': {
        type: 'multiple-choice',
        data: {
          '프로그래밍': 18,
          '데이터베이스': 15,
          '네트워크': 9
        }
      },
      'q3': {
        type: 'long-text',
        responses: [
          '실습 시간이 더 필요합니다',
          '프로젝트 기반 학습이 도움이 됩니다',
          '온라인 자료를 더 제공해주세요',
          '멘토링 시간을 늘려주세요'
        ]
      }
    }
  },
  '3': {
    totalResponses: 35,
    completionRate: 92.1,
    averageTime: 5.2,
    responses: {
      'q1': {
        type: 'multiple-choice',
        data: {
          '이력서 작성': 8,
          '포트폴리오 준비': 15,
          '면접 준비': 9,
          '취업 완료': 3
        }
      },
      'q2': {
        type: 'short-text',
        responses: [
          '프론트엔드 개발자',
          '백엔드 개발자',
          '풀스택 개발자',
          '데이터 분석가',
          'UI/UX 디자이너'
        ]
      }
    }
  }
};

export default function AnalyticsPage() {
  const { id } = useParams<{ id: string }>();
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d' | 'all'>('30d');

  const survey = MOCK_SURVEYS.find(s => s.id === id);
  const analytics = MOCK_ANALYTICS[id as keyof typeof MOCK_ANALYTICS];

  if (!survey) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">설문지를 찾을 수 없습니다</h2>
          <Link to="/dashboard" className="text-blue-600 hover:text-blue-800">
            대시보드로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">응답 데이터가 없습니다</h2>
          <p className="text-gray-600 mb-4">아직 응답이 수집되지 않았습니다.</p>
          <Link to="/dashboard" className="text-blue-600 hover:text-blue-800">
            대시보드로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  const renderQuestionAnalytics = (question: Question, questionData: any) => {
    switch (question.type) {
      case 'rating':
        const ratingLabels = ['1점', '2점', '3점', '4점', '5점'];
        const maxRating = Math.max(...questionData.data);
        
        return (
          <div className="space-y-4">
            <div className="text-lg font-medium text-gray-900">
              평균 점수: {questionData.average}점
            </div>
            <div className="space-y-2">
              {ratingLabels.map((label, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <span className="w-12 text-sm text-gray-600">{label}</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-6 relative">
                    <div
                      className="bg-blue-500 h-6 rounded-full flex items-center justify-end pr-2"
                      style={{ width: `${(questionData.data[index] / maxRating) * 100}%` }}
                    >
                      <span className="text-white text-xs font-medium">
                        {questionData.data[index]}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'multiple-choice':
        const total = Object.values(questionData.data).reduce((sum: number, count: any) => sum + count, 0);
        const maxChoice = Math.max(...Object.values(questionData.data) as number[]);
        
        return (
          <div className="space-y-3">
            {Object.entries(questionData.data).map(([option, count]: [string, any]) => (
              <div key={option} className="flex items-center space-x-3">
                <span className="w-24 text-sm text-gray-600 truncate">{option}</span>
                <div className="flex-1 bg-gray-200 rounded-full h-6 relative">
                  <div
                    className="bg-green-500 h-6 rounded-full flex items-center justify-end pr-2"
                    style={{ width: `${(count / maxChoice) * 100}%` }}
                  >
                    <span className="text-white text-xs font-medium">
                      {count} ({Math.round((count / total) * 100)}%)
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        );

      case 'checkbox':
        const maxCheckbox = Math.max(...Object.values(questionData.data) as number[]);
        
        return (
          <div className="space-y-3">
            {Object.entries(questionData.data).map(([option, count]: [string, any]) => (
              <div key={option} className="flex items-center space-x-3">
                <span className="w-24 text-sm text-gray-600 truncate">{option}</span>
                <div className="flex-1 bg-gray-200 rounded-full h-6 relative">
                  <div
                    className="bg-purple-500 h-6 rounded-full flex items-center justify-end pr-2"
                    style={{ width: `${(count / maxCheckbox) * 100}%` }}
                  >
                    <span className="text-white text-xs font-medium">
                      {count} ({Math.round((count / analytics.totalResponses) * 100)}%)
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        );

      case 'short-text':
      case 'long-text':
        return (
          <div className="space-y-3">
            <div className="text-sm text-gray-600 mb-3">
              총 {questionData.responses.length}개의 응답
            </div>
            <div className="max-h-64 overflow-y-auto space-y-2">
              {questionData.responses.slice(0, 10).map((response: string, index: number) => (
                <div key={index} className="p-3 bg-gray-50 rounded-lg border">
                  <p className="text-sm text-gray-700">{response}</p>
                </div>
              ))}
              {questionData.responses.length > 10 && (
                <div className="text-center py-2">
                  <button className="text-blue-600 hover:text-blue-800 text-sm">
                    더 보기 (+{questionData.responses.length - 10}개)
                  </button>
                </div>
              )}
            </div>
          </div>
        );

      default:
        return <div className="text-gray-500">지원하지 않는 질문 유형입니다.</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link to="/dashboard" className="text-gray-600 hover:text-gray-900">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </Link>
              <h1 className="text-xl font-semibold text-gray-900">응답 분석</h1>
            </div>
            
            <div className="flex items-center space-x-3">
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value as any)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="7d">최근 7일</option>
                <option value="30d">최근 30일</option>
                <option value="90d">최근 90일</option>
                <option value="all">전체 기간</option>
              </select>
              
              <button className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors">
                <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                내보내기
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* 설문지 정보 */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{survey.title}</h2>
          <p className="text-gray-600 mb-4">{survey.description}</p>
          <div className="flex items-center space-x-6 text-sm text-gray-500">
            <span>생성일: {survey.createdAt.toLocaleDateString('ko-KR')}</span>
            <span>마지막 수정: {survey.updatedAt.toLocaleDateString('ko-KR')}</span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              survey.status === 'published' ? 'bg-green-100 text-green-800' :
              survey.status === 'closed' ? 'bg-red-100 text-red-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {survey.status === 'published' ? '배포중' :
               survey.status === 'closed' ? '마감' : '초안'}
            </span>
          </div>
        </div>

        {/* 통계 요약 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      총 응답수
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {analytics.totalResponses}개
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
                      완료율
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {analytics.completionRate}%
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
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      평균 소요시간
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {analytics.averageTime}분
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 질문별 분석 */}
        <div className="space-y-6">
          {survey.questions.map((question, index) => {
            const questionData = (analytics.responses as any)[question.id];
            
            return (
              <div key={question.id} className="bg-white shadow rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">
                    질문 {index + 1}: {question.title}
                  </h3>
                  <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                    <span className="capitalize">
                      {question.type === 'rating' ? '평점' :
                       question.type === 'multiple-choice' ? '객관식' :
                       question.type === 'checkbox' ? '다중선택' :
                       question.type === 'short-text' ? '단답형' :
                       question.type === 'long-text' ? '장문형' :
                       question.type === 'dropdown' ? '드롭다운' : question.type}
                    </span>
                    {question.required && (
                      <span className="text-red-500">필수</span>
                    )}
                  </div>
                </div>
                
                <div className="p-6">
                  {questionData ? (
                    renderQuestionAnalytics(question, questionData)
                  ) : (
                    <div className="text-gray-500 text-center py-8">
                      이 질문에 대한 응답이 없습니다.
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
