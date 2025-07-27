import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
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
    status: 'published'
  },
  {
    id: '3',
    title: '취업 준비 현황 조사',
    description: '훈련생들의 취업 준비 현황과 지원 필요 사항을 파악합니다.',
    questions: [
      { id: 'q1', type: 'multiple-choice', title: '현재 취업 준비 단계는?', required: true, options: ['이력서 작성', '포트폴리오 준비', '면접 준비', '취업 완료'] },
      { id: 'q2', type: 'short-text', title: '희망하는 직무는?', required: true },
      { id: 'q3', type: 'dropdown', title: '관심 있는 회사 규모는?', required: false, options: ['스타트업', '중소기업', '대기업', '공공기관'] }
    ],
    createdAt: new Date('2025-01-10'),
    updatedAt: new Date('2025-01-18'),
    status: 'closed',
    startDate: new Date('2025-01-10T09:00:00'),
    endDate: new Date('2025-01-18T18:00:00')
  }
];

type ResponseData = {
  [questionId: string]: string | string[] | number;
};

export default function SurveyResponsePage() {
  const { id } = useParams<{ id: string }>();
  
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [responses, setResponses] = useState<ResponseData>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [errors, setErrors] = useState<{ [questionId: string]: string }>({});

  useEffect(() => {
    // 설문지 데이터 로드
    const foundSurvey = MOCK_SURVEYS.find(s => s.id === id);
    setSurvey(foundSurvey || null);
  }, [id]);

  if (!survey) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">설문지를 찾을 수 없습니다</h2>
          <p className="text-gray-600">요청하신 설문지가 존재하지 않거나 삭제되었습니다.</p>
        </div>
      </div>
    );
  }

  if (survey.status === 'draft') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-yellow-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">설문이 아직 공개되지 않았습니다</h2>
          <p className="text-gray-600">이 설문지는 현재 준비 중입니다.</p>
        </div>
      </div>
    );
  }

  if (survey.status === 'closed') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">설문이 마감되었습니다</h2>
          <p className="text-gray-600">응답 기간이 종료되어 더 이상 응답할 수 없습니다.</p>
        </div>
      </div>
    );
  }

  // 배포 기간 체크
  const now = new Date();
  
  // 시작일이 설정되어 있고 아직 시작되지 않은 경우
  if (survey.startDate && now < survey.startDate) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-yellow-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">설문이 아직 시작되지 않았습니다</h2>
          <p className="text-gray-600 mb-2">
            설문 시작일: {survey.startDate.toLocaleDateString('ko-KR')} {survey.startDate.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
          </p>
          <p className="text-gray-500">설정된 시간이 되면 설문에 참여할 수 있습니다.</p>
        </div>
      </div>
    );
  }

  // 종료일이 설정되어 있고 이미 종료된 경우
  if (survey.endDate && now > survey.endDate) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">설문 응답 기간이 종료되었습니다</h2>
          <p className="text-gray-600 mb-2">
            설문 종료일: {survey.endDate.toLocaleDateString('ko-KR')} {survey.endDate.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
          </p>
          <p className="text-gray-500">설문 응답 기간이 만료되어 더 이상 참여할 수 없습니다.</p>
        </div>
      </div>
    );
  }

  if (isCompleted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">응답이 완료되었습니다!</h2>
          <p className="text-gray-600 mb-6">소중한 의견을 주셔서 감사합니다. 응답 내용은 교육 개선에 활용될 예정입니다.</p>
          <button
            onClick={() => window.close()}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
          >
            창 닫기
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = survey.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === survey.questions.length - 1;

  const handleResponseChange = (questionId: string, value: string | string[] | number) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: value
    }));
    
    // 에러 클리어
    if (errors[questionId]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[questionId];
        return newErrors;
      });
    }
  };

  const validateCurrentQuestion = (): boolean => {
    if (!currentQuestion.required) return true;
    
    const response = responses[currentQuestion.id];
    
    if (!response || 
        (typeof response === 'string' && response.trim() === '') ||
        (Array.isArray(response) && response.length === 0) ||
        (typeof response === 'number' && response === 0)) {
      
      setErrors(prev => ({
        ...prev,
        [currentQuestion.id]: '이 질문은 필수입니다.'
      }));
      return false;
    }
    
    return true;
  };

  const handleNext = () => {
    if (!validateCurrentQuestion()) return;
    
    if (isLastQuestion) {
      handleSubmit();
    } else {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    // 모든 필수 질문 검증
    const newErrors: { [questionId: string]: string } = {};
    
    survey.questions.forEach(question => {
      if (question.required) {
        const response = responses[question.id];
        if (!response || 
            (typeof response === 'string' && response.trim() === '') ||
            (Array.isArray(response) && response.length === 0) ||
            (typeof response === 'number' && response === 0)) {
          newErrors[question.id] = '이 질문은 필수입니다.';
        }
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      // 첫 번째 에러가 있는 질문으로 이동
      const firstErrorIndex = survey.questions.findIndex(q => newErrors[q.id]);
      setCurrentQuestionIndex(firstErrorIndex);
      return;
    }

    setIsSubmitting(true);
    
    try {
      // 실제로는 API 호출
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('응답 제출:', responses);
      setIsCompleted(true);
    } catch (error) {
      console.error('제출 오류:', error);
      alert('응답 제출 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderQuestion = (question: Question) => {
    const response = responses[question.id];
    const error = errors[question.id];

    switch (question.type) {
      case 'short-text':
        return (
          <div>
            <input
              type="text"
              value={(response as string) || ''}
              onChange={(e) => handleResponseChange(question.id, e.target.value)}
              placeholder="답변을 입력하세요"
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                error ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
          </div>
        );

      case 'long-text':
        return (
          <div>
            <textarea
              value={(response as string) || ''}
              onChange={(e) => handleResponseChange(question.id, e.target.value)}
              placeholder="답변을 입력하세요"
              rows={4}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${
                error ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
          </div>
        );

      case 'multiple-choice':
        return (
          <div>
            <div className="space-y-3">
              {question.options?.map((option, index) => (
                <label key={index} className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name={question.id}
                    value={option}
                    checked={(response as string) === option}
                    onChange={(e) => handleResponseChange(question.id, e.target.value)}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-gray-700">{option}</span>
                </label>
              ))}
            </div>
            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
          </div>
        );

      case 'checkbox':
        return (
          <div>
            <div className="space-y-3">
              {question.options?.map((option, index) => (
                <label key={index} className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    value={option}
                    checked={((response as string[]) || []).includes(option)}
                    onChange={(e) => {
                      const currentResponses = (response as string[]) || [];
                      if (e.target.checked) {
                        handleResponseChange(question.id, [...currentResponses, option]);
                      } else {
                        handleResponseChange(question.id, currentResponses.filter(r => r !== option));
                      }
                    }}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500 rounded"
                  />
                  <span className="text-gray-700">{option}</span>
                </label>
              ))}
            </div>
            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
          </div>
        );

      case 'dropdown':
        return (
          <div>
            <select
              value={(response as string) || ''}
              onChange={(e) => handleResponseChange(question.id, e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                error ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">선택해주세요</option>
              {question.options?.map((option, index) => (
                <option key={index} value={option}>
                  {option}
                </option>
              ))}
            </select>
            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
          </div>
        );

      case 'rating':
        return (
          <div>
            <div className="flex items-center justify-center space-x-2">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  type="button"
                  onClick={() => handleResponseChange(question.id, rating)}
                  className={`w-12 h-12 rounded-full border-2 font-medium transition-colors ${
                    (response as number) === rating
                      ? 'bg-blue-600 border-blue-600 text-white'
                      : 'border-gray-300 text-gray-700 hover:border-blue-300'
                  }`}
                >
                  {rating}
                </button>
              ))}
            </div>
            <div className="flex justify-between text-sm text-gray-500 mt-2">
              <span>매우 불만족</span>
              <span>매우 만족</span>
            </div>
            {error && <p className="mt-2 text-sm text-red-600 text-center">{error}</p>}
          </div>
        );

      default:
        return <div className="text-gray-500">지원하지 않는 질문 유형입니다.</div>;
    }
  };

  const progressPercentage = ((currentQuestionIndex + 1) / survey.questions.length) * 100;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">{survey.title}</h1>
            </div>
            <div className="text-sm text-gray-500">
              {currentQuestionIndex + 1} / {survey.questions.length}
            </div>
          </div>
        </div>
      </header>

      {/* 진행률 바 */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-2 bg-gray-200 rounded-full">
            <div
              className="h-2 bg-blue-600 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        {/* 설문지 소개 (첫 번째 질문일 때만) */}
        {currentQuestionIndex === 0 && (
          <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{survey.title}</h2>
            <p className="text-gray-600 text-lg leading-relaxed mb-4">{survey.description}</p>
            
            {/* 배포 기간 정보 */}
            {(survey.startDate || survey.endDate) && (
              <div className="border-t pt-4 mt-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">📅 설문 기간</h3>
                <div className="text-sm text-gray-600 space-y-1">
                  {survey.startDate && (
                    <p>
                      <span className="font-medium">시작:</span> {survey.startDate.toLocaleDateString('ko-KR')} {survey.startDate.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  )}
                  {survey.endDate && (
                    <p>
                      <span className="font-medium">종료:</span> {survey.endDate.toLocaleDateString('ko-KR')} {survey.endDate.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 현재 질문 */}
        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="mb-8">
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              {currentQuestion.title}
              {currentQuestion.required && (
                <span className="text-red-500 ml-1">*</span>
              )}
            </h3>
            {!currentQuestion.required && (
              <p className="text-sm text-gray-500">선택사항</p>
            )}
          </div>

          <div className="mb-8">
            {renderQuestion(currentQuestion)}
          </div>

          {/* 네비게이션 버튼 */}
          <div className="flex justify-between">
            <button
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
              className={`px-6 py-3 rounded-md transition-colors ${
                currentQuestionIndex === 0
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
              }`}
            >
              이전
            </button>

            <button
              onClick={handleNext}
              disabled={isSubmitting}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  제출 중...
                </>
              ) : isLastQuestion ? '제출' : '다음'}
            </button>
          </div>
        </div>

        {/* 질문 요약 (하단) */}
        <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
          <h4 className="text-sm font-medium text-gray-700 mb-4">진행 상황</h4>
          <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
            {survey.questions.map((_, index) => (
              <div
                key={index}
                className={`h-2 rounded-full ${
                  index < currentQuestionIndex
                    ? 'bg-green-500'
                    : index === currentQuestionIndex
                    ? 'bg-blue-500'
                    : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-2">
            <span>완료</span>
            <span>현재</span>
            <span>남은 질문</span>
          </div>
        </div>
      </div>
    </div>
  );
}
