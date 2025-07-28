import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { surveyAPI } from '../services/api';
import type { Survey, Question } from '../types/survey';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

export default function AnalyticsPage() {
  const { id } = useParams<{ id: string }>();
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d' | 'all'>('30d');
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [rawResponses, setRawResponses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showResponsesModal, setShowResponsesModal] = useState(false);
  const [selectedQuestionForResponses, setSelectedQuestionForResponses] = useState<Question | null>(null);
  const [viewMode, setViewMode] = useState<'chart' | 'table'>('chart');

  useEffect(() => {
    const fetchSurveyAndAnalytics = async () => {
      if (!id) {
        console.log('❌ No survey ID provided');
        return;
      }
      
      try {
        setLoading(true);
        setError(null);
        console.log('🔍 Starting to fetch survey and analytics for ID:', id);
        
        // 설문지 정보 가져오기 (API 우선, 실패시 로컬 저장소)
        let surveyData: Survey | null = null;
        try {
          console.log('📡 Trying to fetch survey from API...');
          surveyData = await surveyAPI.getSurvey(id);
          console.log('✅ Survey data from API:', surveyData);
        } catch (apiError) {
          console.log('❌ API 호출 실패, 로컬 데이터 사용:', apiError);
          // 로컬 저장소에서 설문지 데이터 가져오기
          const allSurveys = JSON.parse(localStorage.getItem('surveys') || '[]');
          console.log('💾 All surveys in localStorage:', allSurveys);
          surveyData = allSurveys.find((s: Survey) => s.id === id) || null;
          console.log('📋 Found survey in localStorage:', surveyData);
        }
        
        if (!surveyData) {
          console.log('❌ No survey data found for ID:', id);
          setError('설문지를 찾을 수 없습니다.');
          return;
        }
        
        console.log('✅ Survey data loaded:', surveyData);
        setSurvey(surveyData);

        // 백엔드에서 응답 데이터 가져오기
        try {
          console.log('🔍 Fetching responses from backend for survey:', id);
          const backendResponses = await surveyAPI.getResponses(id);
          console.log('📊 Backend responses received:', backendResponses);
          
          if (backendResponses && backendResponses.length > 0) {
            console.log('✅ Found backend responses, converting...');
            console.log('🔍 Raw backend response structure:', JSON.stringify(backendResponses[0], null, 2));
            
            // 백엔드 응답 데이터를 로컬 형식으로 변환
            const convertedResponses = backendResponses.map((resp: any, index: number) => {
              console.log(`🔄 Converting response ${index + 1}:`, resp);
              
              try {
                // answers 구조 확인
                const responses: any = {};
                
                // resp.answers가 존재하고 배열인지 확인
                if (resp.answers && Array.isArray(resp.answers)) {
                  console.log(`📝 Processing ${resp.answers.length} answers for response ${index + 1}`);
                  
                  resp.answers.forEach((answer: any, answerIndex: number) => {
                    console.log(`� Processing answer ${answerIndex + 1}:`, answer);
                    
                    try {
                      // 다양한 구조 지원
                      let questionId = null;
                      let answerValue = null;
                      
                      // Question ID 추출
                      if (answer.question && typeof answer.question === 'object' && answer.question.id) {
                        questionId = answer.question.id;
                      } else if (answer.question_id) {
                        questionId = answer.question_id;
                      } else if (answer.questionId) {
                        questionId = answer.questionId;
                      } else if (typeof answer.question === 'string') {
                        questionId = answer.question;
                      }
                      
                      // Answer Value 추출
                      if (answer.text_answer !== undefined && answer.text_answer !== null) {
                        answerValue = answer.text_answer;
                      } else if (answer.choice_answers !== undefined && answer.choice_answers !== null) {
                        answerValue = answer.choice_answers;
                      } else if (answer.answer !== undefined && answer.answer !== null) {
                        answerValue = answer.answer;
                      } else if (answer.value !== undefined && answer.value !== null) {
                        answerValue = answer.value;
                      }
                      
                      console.log(`🔍 Extracted - questionId: ${questionId}, answerValue:`, answerValue);
                      
                      if (questionId && answerValue !== null && answerValue !== undefined) {
                        responses[questionId] = answerValue;
                        console.log(`✅ Mapped question ${questionId} -> ${JSON.stringify(answerValue)}`);
                      } else {
                        console.warn(`❌ Failed to extract question ID or answer value:`, {
                          questionId,
                          answerValue,
                          originalAnswer: answer
                        });
                      }
                    } catch (answerError) {
                      console.error(`❌ Error processing answer ${answerIndex + 1}:`, answerError, answer);
                    }
                  });
                } else {
                  console.warn(`⚠️ No valid answers array found in response ${index + 1}:`, resp);
                }
                
                const convertedResponse = {
                  id: resp.id || `response_${index + 1}`,
                  surveyId: id,
                  respondentName: resp.respondent_email || resp.respondent_name || `Anonymous_${index + 1}`,
                  responses: responses,
                  submittedAt: resp.submitted_at || resp.created_at || new Date().toISOString()
                };
                
                console.log(`✅ Converted response ${index + 1}:`, convertedResponse);
                return convertedResponse;
                
              } catch (responseError) {
                console.error(`❌ Error converting response ${index + 1}:`, responseError, resp);
                return {
                  id: `error_response_${index + 1}`,
                  surveyId: id,
                  respondentName: `Error_${index + 1}`,
                  responses: {},
                  submittedAt: new Date().toISOString()
                };
              }
            });
            
            console.log('📝 Converted responses:', convertedResponses);
            console.log('📊 Total converted responses:', convertedResponses.length);
            console.log('📋 Response data summary:', convertedResponses.map((r: any) => ({
              id: r.id,
              responseKeys: Object.keys(r.responses),
              responseCount: Object.keys(r.responses).length
            })));
            
            setRawResponses(convertedResponses);
            const processedAnalytics = processResponsesForAnalytics(surveyData, convertedResponses);
            console.log('📈 Final processed analytics:', processedAnalytics);
            setAnalytics(processedAnalytics);
          } else {
            // 백엔드에 응답이 없으면 로컬 스토리지 확인
            console.log('📱 No backend responses, checking local storage');
            const localResponses = JSON.parse(localStorage.getItem(`survey_responses_${id}`) || '[]');
            console.log('💾 Local responses found:', localResponses);
            if (localResponses.length > 0) {
              console.log('✅ Using local responses for analytics');
              setRawResponses(localResponses);
              const processedAnalytics = processResponsesForAnalytics(surveyData, localResponses);
              console.log('📈 Processed analytics:', processedAnalytics);
              setAnalytics(processedAnalytics);
            } else {
              console.log('❌ No responses found anywhere');
              setAnalytics(null);
            }
          }
        } catch (analyticsError) {
          console.log('❌ Analytics API 호출 실패, 로컬 데이터 처리:', analyticsError);
          // 로컬 저장소에서 응답 데이터 가져오기
          const responses = JSON.parse(localStorage.getItem(`survey_responses_${id}`) || '[]');
          console.log('💾 Fallback local responses:', responses);
          if (responses.length > 0) {
            console.log('✅ Using fallback local responses');
            setRawResponses(responses);
            const processedAnalytics = processResponsesForAnalytics(surveyData, responses);
            console.log('📈 Fallback processed analytics:', processedAnalytics);
            setAnalytics(processedAnalytics);
          } else {
            console.log('❌ No fallback responses found');
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

      // 응답 데이터 구조 확인 및 추출
      const questionResponses = responses
        .map(r => {
          // 두 가지 구조 지원: r.responses[question.id] 또는 r.answers[question.id]
          const answer = (r.responses && r.responses[question.id]) || (r.answers && r.answers[question.id]);
          return answer;
        })
        .filter(answer => answer !== undefined && answer !== null && answer !== '');
      
      console.log(`Found ${questionResponses.length} responses for question ${question.id}:`, questionResponses);
      
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
          
          // 각 옵션에 대해 카운트 초기화
          options.forEach(option => {
            checkboxChoices[option] = 0;
          });
          
          // 응답 분석
          questionResponses.forEach(response => {
            let selectedOptions: string[] = [];
            
            // 다양한 형식의 응답 처리
            if (Array.isArray(response)) {
              selectedOptions = response;
            } else if (typeof response === 'string') {
              try {
                // JSON 문자열인 경우 파싱 시도
                const parsed = JSON.parse(response);
                if (Array.isArray(parsed)) {
                  selectedOptions = parsed;
                } else {
                  selectedOptions = [response];
                }
              } catch {
                // JSON이 아니면 단일 값으로 처리
                selectedOptions = [response];
              }
            }
            
            // 선택된 옵션들에 대해 카운트 증가
            selectedOptions.forEach(option => {
              if (checkboxChoices.hasOwnProperty(option)) {
                checkboxChoices[option]++;
              }
            });
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

  const getQuestionResponses = (questionId: string) => {
    return rawResponses
      .map(r => {
        const answer = (r.responses && r.responses[questionId]) || (r.answers && r.answers[questionId]);
        return {
          id: r.id,
          respondentName: r.respondentName || 'Anonymous',
          submittedAt: r.submittedAt,
          answer: answer
        };
      })
      .filter(r => r.answer !== undefined && r.answer !== null && r.answer !== '');
  };

  const showQuestionResponses = (question: Question) => {
    setSelectedQuestionForResponses(question);
    setShowResponsesModal(true);
  };

  const createChartData = (question: Question, questionData: any) => {
    const colors = [
      '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
      '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6B7280'
    ];

    switch (question.type) {
      case 'rating':
        return {
          type: 'bar',
          data: {
            labels: ['1점', '2점', '3점', '4점', '5점'],
            datasets: [{
              label: '응답 수',
              data: questionData.data,
              backgroundColor: colors.slice(0, 5),
              borderColor: colors.slice(0, 5).map(color => color + '80'),
              borderWidth: 1
            }]
          },
          options: {
            responsive: true,
            plugins: {
              legend: {
                display: false
              },
              title: {
                display: true,
                text: `평균: ${questionData.average.toFixed(1)}점`
              }
            },
            scales: {
              y: {
                beginAtZero: true,
                ticks: {
                  stepSize: 1
                }
              }
            }
          }
        };

      case 'multiple-choice':
        const mcLabels = Object.keys(questionData.data);
        const mcValues = Object.values(questionData.data) as number[];
        return {
          type: 'pie',
          data: {
            labels: mcLabels,
            datasets: [{
              data: mcValues,
              backgroundColor: colors.slice(0, mcLabels.length),
              borderColor: '#ffffff',
              borderWidth: 2
            }]
          },
          options: {
            responsive: true,
            plugins: {
              legend: {
                position: 'bottom' as const
              }
            }
          }
        };

      case 'checkbox':
        const cbLabels = Object.keys(questionData.data);
        const cbValues = Object.values(questionData.data) as number[];
        return {
          type: 'bar',
          data: {
            labels: cbLabels,
            datasets: [{
              label: '선택 횟수',
              data: cbValues,
              backgroundColor: '#8B5CF6',
              borderColor: '#7C3AED',
              borderWidth: 1
            }]
          },
          options: {
            responsive: true,
            plugins: {
              legend: {
                display: false
              }
            },
            scales: {
              y: {
                beginAtZero: true,
                ticks: {
                  stepSize: 1
                }
              }
            }
          }
        };

      default:
        return null;
    }
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
    const chartData = createChartData(question, questionData);
    
    switch (question.type) {
      case 'rating':
        const ratingLabels = ['1점', '2점', '3점', '4점', '5점'];
        const maxRating = Math.max(...questionData.data);
        
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="text-lg font-medium text-gray-900">
                평균 점수: {questionData.average.toFixed(1)}점
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setViewMode(viewMode === 'chart' ? 'table' : 'chart')}
                  className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                >
                  {viewMode === 'chart' ? '표로 보기' : '차트로 보기'}
                </button>
                <button
                  onClick={() => showQuestionResponses(question)}
                  className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
                >
                  개별 응답 보기
                </button>
              </div>
            </div>
            
            {viewMode === 'chart' && chartData ? (
              <div className="bg-white p-4 rounded-lg border">
                <Bar data={chartData.data} options={chartData.options} />
              </div>
            ) : (
              <div className="space-y-2">
                {ratingLabels.map((label, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <span className="w-12 text-sm text-gray-600">{label}</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-6 relative">
                      <div
                        className="bg-blue-500 h-6 rounded-full flex items-center justify-end pr-2"
                        style={{ width: `${maxRating > 0 ? (questionData.data[index] / maxRating) * 100 : 0}%` }}
                      >
                        <span className="text-white text-xs font-medium">
                          {questionData.data[index]}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 'multiple-choice':
        const total = Object.values(questionData.data).reduce((sum: number, count: any) => sum + count, 0);
        const maxChoice = Math.max(...Object.values(questionData.data) as number[]);
        
        return (
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-600">
                총 {total}개의 응답
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setViewMode(viewMode === 'chart' ? 'table' : 'chart')}
                  className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                >
                  {viewMode === 'chart' ? '표로 보기' : '차트로 보기'}
                </button>
                <button
                  onClick={() => showQuestionResponses(question)}
                  className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
                >
                  개별 응답 보기
                </button>
              </div>
            </div>

            {viewMode === 'chart' && chartData ? (
              <div className="bg-white p-4 rounded-lg border">
                <Pie data={chartData.data} options={chartData.options} />
              </div>
            ) : (
              Object.entries(questionData.data).map(([option, count]: [string, any]) => (
                <div key={option} className="flex items-center space-x-3">
                  <span className="w-24 text-sm text-gray-600 truncate">{option}</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-6 relative">
                    <div
                      className="bg-green-500 h-6 rounded-full flex items-center justify-end pr-2"
                      style={{ width: `${maxChoice > 0 ? (count / maxChoice) * 100 : 0}%` }}
                    >
                      <span className="text-white text-xs font-medium">
                        {count} ({Math.round((count / total) * 100)}%)
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        );

      case 'checkbox':
        const maxCheckbox = Math.max(...Object.values(questionData.data) as number[]);
        
        return (
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-600">
                다중선택 응답 통계
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setViewMode(viewMode === 'chart' ? 'table' : 'chart')}
                  className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                >
                  {viewMode === 'chart' ? '표로 보기' : '차트로 보기'}
                </button>
                <button
                  onClick={() => showQuestionResponses(question)}
                  className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
                >
                  개별 응답 보기
                </button>
              </div>
            </div>

            {viewMode === 'chart' && chartData ? (
              <div className="bg-white p-4 rounded-lg border">
                <Bar data={chartData.data} options={chartData.options} />
              </div>
            ) : (
              Object.entries(questionData.data).map(([option, count]: [string, any]) => (
                <div key={option} className="flex items-center space-x-3">
                  <span className="w-24 text-sm text-gray-600 truncate">{option}</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-6 relative">
                    <div
                      className="bg-purple-500 h-6 rounded-full flex items-center justify-end pr-2"
                      style={{ width: `${maxCheckbox > 0 ? (count / maxCheckbox) * 100 : 0}%` }}
                    >
                      <span className="text-white text-xs font-medium">
                        {count} ({Math.round((count / (analytics?.totalResponses || 1)) * 100)}%)
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        );

      case 'short-text':
      case 'long-text':
        return (
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-600">
                총 {questionData.responses.length}개의 응답
              </div>
              <button
                onClick={() => showQuestionResponses(question)}
                className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
              >
                모든 응답 보기
              </button>
            </div>
            <div className="max-h-64 overflow-y-auto space-y-2">
              {questionData.responses.slice(0, 5).map((response: string, index: number) => (
                <div key={index} className="p-3 bg-gray-50 rounded-lg border">
                  <p className="text-sm text-gray-700">{response}</p>
                </div>
              ))}
              {questionData.responses.length > 5 && (
                <div className="text-center py-2">
                  <button 
                    onClick={() => showQuestionResponses(question)}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    더 보기 (+{questionData.responses.length - 5}개)
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

      {/* 개별 응답 모달 */}
      {showResponsesModal && selectedQuestionForResponses && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] m-4">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-lg font-medium text-gray-900">
                개별 응답: {selectedQuestionForResponses.title}
              </h3>
              <button
                onClick={() => setShowResponsesModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[70vh]">
              {(() => {
                const responses = getQuestionResponses(selectedQuestionForResponses.id);
                
                if (responses.length === 0) {
                  return (
                    <div className="text-center py-8 text-gray-500">
                      이 질문에 대한 응답이 없습니다.
                    </div>
                  );
                }
                
                return (
                  <div className="space-y-4">
                    <div className="text-sm text-gray-600 mb-4">
                      총 {responses.length}개의 응답
                    </div>
                    
                    {responses.map((response, index) => (
                      <div key={response.id || index} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div className="text-sm text-gray-500">
                            응답자: {response.respondentName}
                          </div>
                          <div className="text-xs text-gray-400">
                            {response.submittedAt ? new Date(response.submittedAt).toLocaleString('ko-KR') : '시간 정보 없음'}
                          </div>
                        </div>
                        
                        <div className="mt-2">
                          {selectedQuestionForResponses.type === 'checkbox' && Array.isArray(response.answer) ? (
                            <div className="flex flex-wrap gap-1">
                              {response.answer.map((item, idx) => (
                                <span key={idx} className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                                  {item}
                                </span>
                              ))}
                            </div>
                          ) : selectedQuestionForResponses.type === 'rating' ? (
                            <div className="flex items-center space-x-2">
                              <span className="text-lg font-medium">{response.answer}점</span>
                              <div className="flex">
                                {[1, 2, 3, 4, 5].map(star => (
                                  <svg key={star} className={`w-5 h-5 ${parseInt(response.answer) >= star ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                  </svg>
                                ))}
                              </div>
                            </div>
                          ) : (
                            <p className="text-gray-700">{response.answer}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
            
            <div className="flex justify-end p-6 border-t">
              <button
                onClick={() => setShowResponsesModal(false)}
                className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-md transition-colors"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
