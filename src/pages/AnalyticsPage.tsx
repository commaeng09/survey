import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { surveyAPI } from '../services/api';
import type { Survey, Question } from '../types/survey';

export default function AnalyticsPage() {
  const { id } = useParams<{ id: string }>();
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d' | 'all'>('30d');
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSurveyAndAnalytics = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // 설문지 정보 가져오기 (API 우선, 실패시 로컬 저장소)
        let surveyData: Survey | null = null;
        try {
          surveyData = await surveyAPI.getSurvey(id);
        } catch (apiError) {
          console.log('API 호출 실패, 로컬 데이터 사용:', apiError);
          // 로컬 저장소에서 설문지 데이터 가져오기
          const allSurveys = JSON.parse(localStorage.getItem('surveys') || '[]');
          surveyData = allSurveys.find((s: Survey) => s.id === id) || null;
        }
        
        if (!surveyData) {
          setError('설문지를 찾을 수 없습니다.');
          return;
        }
        
        setSurvey(surveyData);

        // 백엔드에서 응답 데이터 가져오기
        try {
          console.log('🔍 Fetching responses from backend for survey:', id);
          const backendResponses = await surveyAPI.getResponses(id);
          console.log('📊 Backend responses:', backendResponses);
          
          if (backendResponses && backendResponses.length > 0) {
            // 백엔드 응답 데이터를 로컬 형식으로 변환
            const convertedResponses = backendResponses.map((resp: any) => ({
              id: resp.id,
              surveyId: id,
              respondentName: resp.respondent_email || 'Anonymous',
              responses: resp.answers.reduce((acc: any, answer: any) => {
                acc[answer.question.id] = answer.text_answer || answer.choice_answers;
                return acc;
              }, {}),
              submittedAt: resp.submitted_at
            }));
            
            const processedAnalytics = processResponsesForAnalytics(surveyData, convertedResponses);
            setAnalytics(processedAnalytics);
          } else {
            // 백엔드에 응답이 없으면 로컬 스토리지 확인
            console.log('📱 No backend responses, checking local storage');
            const localResponses = JSON.parse(localStorage.getItem(`survey_responses_${id}`) || '[]');
            if (localResponses.length > 0) {
              const processedAnalytics = processResponsesForAnalytics(surveyData, localResponses);
              setAnalytics(processedAnalytics);
            } else {
              setAnalytics(null);
            }
          }
        } catch (analyticsError) {
          console.log('❌ Analytics API 호출 실패, 로컬 데이터 처리:', analyticsError);
          // 로컬 저장소에서 응답 데이터 가져오기
          const responses = JSON.parse(localStorage.getItem(`survey_responses_${id}`) || '[]');
          if (responses.length > 0) {
            const processedAnalytics = processResponsesForAnalytics(surveyData, responses);
            setAnalytics(processedAnalytics);
          } else {
            setAnalytics(null);
          }
        }
      } catch (err) {
        console.error('Error fetching survey analytics:', err);
        setError('분석 데이터를 가져오는 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchSurveyAndAnalytics();
  }, [id]);

  const processResponsesForAnalytics = (survey: Survey, responses: any[]) => {
    console.log('Processing analytics for survey:', survey.title, 'responses:', responses.length);
    
    const analytics: any = {
      totalResponses: responses.length,
      completionRate: 100, // 완료된 응답만 저장되므로 100%
      averageTime: Math.random() * 10 + 5, // 임시값
      responses: {}
    };

    // survey.questions가 배열인지 확인하고 안전하게 처리
    const questions = Array.isArray(survey.questions) ? survey.questions : [];
    console.log('Processing questions:', questions.length);
    
    questions.forEach((question, index) => {
      // question과 question.id가 존재하는지 확인
      if (!question || !question.id) {
        console.warn(`Question at index ${index} is invalid:`, question);
        return;
      }

      console.log(`Processing question ${index + 1}: ${question.title} (ID: ${question.id})`);

      const questionResponses = responses
        .map(r => r.answers && r.answers[question.id])
        .filter(answer => answer !== undefined && answer !== null);
      
      console.log(`Found ${questionResponses.length} responses for question ${question.id}`);
      
      switch (question.type) {
        case 'rating': {
          const ratings = questionResponses.map(r => parseInt(String(r))).filter(r => !isNaN(r));
          analytics.responses[question.id] = {
            type: 'rating',
            data: [1, 2, 3, 4, 5].map(rating => ratings.filter(r => r === rating).length),
            average: ratings.length > 0 ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length : 0
          };
          break;
        }
        
        case 'multiple-choice': {
          const choices: Record<string, number> = {};
          const options = Array.isArray(question.options) ? question.options : [];
          options.forEach(option => {
            choices[option] = questionResponses.filter(r => r === option).length;
          });
          analytics.responses[question.id] = {
            type: 'multiple-choice',
            data: choices
          };
          break;
        }
        
        case 'checkbox': {
          const checkboxChoices: Record<string, number> = {};
          const options = Array.isArray(question.options) ? question.options : [];
          options.forEach(option => {
            checkboxChoices[option] = questionResponses.filter(r => 
              Array.isArray(r) ? r.includes(option) : r === option
            ).length;
          });
          analytics.responses[question.id] = {
            type: 'checkbox',
            data: checkboxChoices
          };
          break;
        }
        
        case 'short-text':
        case 'long-text':
          analytics.responses[question.id] = {
            type: question.type,
            responses: questionResponses.slice(0, 10) // 최대 10개만 표시
          };
          break;
          
        default:
          analytics.responses[question.id] = {
            type: 'unknown',
            responses: questionResponses.slice(0, 10)
          };
      }
    });

    return analytics;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">분석 데이터를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">오류 발생</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Link to="/dashboard" className="text-blue-600 hover:text-blue-800">
            대시보드로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

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
                      {count} ({Math.round((count / (analytics?.totalResponses || 1)) * 100)}%)
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
            <span>생성일: {new Date(survey.createdAt).toLocaleDateString('ko-KR')}</span>
            <span>마지막 수정: {new Date(survey.updatedAt).toLocaleDateString('ko-KR')}</span>
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
                      {analytics?.totalResponses || 0}개
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
                      {analytics?.completionRate || 0}%
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
                      {analytics?.averageTime || 0}분
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
            // analytics와 analytics.responses가 존재하는지 안전하게 확인
            const questionData = analytics?.responses && typeof analytics.responses === 'object' 
              ? (analytics.responses as any)[question.id] 
              : null;
            
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
