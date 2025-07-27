import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import type { Survey, Question } from '../types/survey';
import QuestionEditor from '../components/QuestionEditor';

export default function CreateSurveyPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const [survey, setSurvey] = useState<Survey>({
    id: 'temp-id',
    title: '제목 없는 설문지',
    description: '',
    questions: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    status: 'draft'
  });

  const [previewMode, setPreviewMode] = useState(false);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [publishedSurveyUrl, setPublishedSurveyUrl] = useState('');

  // 질문 추가
  const addQuestion = (type: Question['type'] = 'short-text') => {
    const newQuestion: Question = {
      id: `q-${Date.now()}`,
      type,
      title: '',
      description: '',
      required: false,
      ...(type === 'multiple-choice' || type === 'checkbox' || type === 'dropdown' 
        ? { options: ['옵션 1'] } 
        : {})
    };

    setSurvey(prev => ({
      ...prev,
      questions: [...prev.questions, newQuestion],
      updatedAt: new Date()
    }));
  };

  // 질문 업데이트
  const updateQuestion = (questionId: string, updatedQuestion: Question) => {
    setSurvey(prev => ({
      ...prev,
      questions: prev.questions.map(q => 
        q.id === questionId ? updatedQuestion : q
      ),
      updatedAt: new Date()
    }));
  };

  // 질문 삭제
  const deleteQuestion = (questionId: string) => {
    setSurvey(prev => ({
      ...prev,
      questions: prev.questions.filter(q => q.id !== questionId),
      updatedAt: new Date()
    }));
  };

  // 질문 복사
  const duplicateQuestion = (questionId: string) => {
    const questionToDuplicate = survey.questions.find(q => q.id === questionId);
    if (questionToDuplicate) {
      const duplicatedQuestion: Question = {
        ...questionToDuplicate,
        id: `q-${Date.now()}`,
        title: `${questionToDuplicate.title} (복사본)`
      };
      
      const questionIndex = survey.questions.findIndex(q => q.id === questionId);
      const newQuestions = [...survey.questions];
      newQuestions.splice(questionIndex + 1, 0, duplicatedQuestion);
      
      setSurvey(prev => ({
        ...prev,
        questions: newQuestions,
        updatedAt: new Date()
      }));
    }
  };

  // 설문지 저장
  const saveSurvey = () => {
    // 실제로는 API 호출
    console.log('설문지 저장:', survey);
    alert('설문지가 저장되었습니다!');
  };

  // 설문지 배포
  const publishSurvey = () => {
    if (!survey.title.trim()) {
      alert('설문지 제목을 입력해주세요.');
      return;
    }
    if (survey.questions.length === 0) {
      alert('최소 하나의 질문을 추가해주세요.');
      return;
    }
    
    // 새로운 ID 생성 (실제로는 서버에서 생성)
    const newSurveyId = `survey-${Date.now()}`;
    const publishedSurvey = {
      ...survey,
      id: newSurveyId,
      status: 'published' as const,
      updatedAt: new Date()
    };
    
    // 실제로는 API 호출하여 서버에 저장
    console.log('설문지 배포:', publishedSurvey);
    
    // 배포된 설문지 URL 생성
    const surveyUrl = `${window.location.origin}/survey/${newSurveyId}`;
    setPublishedSurveyUrl(surveyUrl);
    
    // 설문지 상태 업데이트
    setSurvey(publishedSurvey);
    
    // 배포 모달 표시
    setShowPublishModal(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link to="/" className="text-gray-600 hover:text-gray-900">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </Link>
              <h1 className="text-xl font-semibold text-gray-900">설문지 생성</h1>
              <span className="text-sm text-gray-500">
                {survey.status === 'draft' ? '초안' : '배포됨'}
              </span>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setPreviewMode(!previewMode)}
                className="px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
              >
                <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                {previewMode ? '편집' : '미리보기'}
              </button>
              
              <button
                onClick={saveSurvey}
                className="px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
              >
                저장
              </button>
              
              <button
                onClick={publishSurvey}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
              >
                배포
              </button>

              {/* 사용자 메뉴 */}
              <div className="flex items-center space-x-3 border-l border-gray-200 pl-3 ml-3">
                <span className="text-sm text-gray-700">
                  <span className="font-medium">{user?.name}</span>님
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

      <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {!previewMode ? (
          /* 편집 모드 */
          <div className="space-y-6">
            {/* 설문지 헤더 */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="space-y-4">
                <input
                  type="text"
                  value={survey.title}
                  onChange={(e) => setSurvey(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="설문지 제목을 입력하세요"
                  className="w-full text-2xl font-bold border-0 border-b-2 border-gray-200 focus:border-blue-500 focus:outline-none py-3 bg-transparent placeholder-gray-400"
                />
                <textarea
                  value={survey.description}
                  onChange={(e) => setSurvey(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="설문지 설명을 입력하세요 (선택사항)"
                  rows={3}
                  className="w-full text-gray-600 border-0 border-b border-gray-200 focus:border-blue-500 focus:outline-none py-2 bg-transparent placeholder-gray-400 resize-none"
                />
                
                {/* 배포 기간 설정 */}
                <div className="border-t pt-4 mt-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">배포 기간 설정</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        시작일
                      </label>
                      <input
                        type="datetime-local"
                        value={survey.startDate ? new Date(survey.startDate.getTime() - survey.startDate.getTimezoneOffset() * 60000).toISOString().slice(0, 16) : ''}
                        onChange={(e) => setSurvey(prev => ({ 
                          ...prev, 
                          startDate: e.target.value ? new Date(e.target.value) : undefined 
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        종료일
                      </label>
                      <input
                        type="datetime-local"
                        value={survey.endDate ? new Date(survey.endDate.getTime() - survey.endDate.getTimezoneOffset() * 60000).toISOString().slice(0, 16) : ''}
                        onChange={(e) => setSurvey(prev => ({ 
                          ...prev, 
                          endDate: e.target.value ? new Date(e.target.value) : undefined 
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  <p className="mt-2 text-sm text-gray-500">
                    배포 기간을 설정하지 않으면 수동으로 배포를 시작하고 종료할 수 있습니다.
                  </p>
                </div>
              </div>
            </div>

            {/* 질문 목록 */}
            {survey.questions.map((question) => (
              <QuestionEditor
                key={question.id}
                question={question}
                onUpdate={(updatedQuestion) => updateQuestion(question.id, updatedQuestion)}
                onDelete={() => deleteQuestion(question.id)}
                onDuplicate={() => duplicateQuestion(question.id)}
              />
            ))}

            {/* 질문 추가 버튼들 */}
            <div className="bg-white rounded-lg border-2 border-dashed border-gray-300 p-8">
              <div className="text-center">
                <h3 className="text-lg font-medium text-gray-900 mb-4">질문 추가</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <button
                    onClick={() => addQuestion('short-text')}
                    className="flex items-center justify-center p-4 border border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
                  >
                    <div className="text-center">
                      <div className="text-2xl mb-2">📝</div>
                      <div className="text-sm font-medium">단답형</div>
                    </div>
                  </button>
                  
                  <button
                    onClick={() => addQuestion('long-text')}
                    className="flex items-center justify-center p-4 border border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
                  >
                    <div className="text-center">
                      <div className="text-2xl mb-2">📄</div>
                      <div className="text-sm font-medium">장문형</div>
                    </div>
                  </button>
                  
                  <button
                    onClick={() => addQuestion('multiple-choice')}
                    className="flex items-center justify-center p-4 border border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
                  >
                    <div className="text-center">
                      <div className="text-2xl mb-2">🔘</div>
                      <div className="text-sm font-medium">객관식</div>
                    </div>
                  </button>
                  
                  <button
                    onClick={() => addQuestion('checkbox')}
                    className="flex items-center justify-center p-4 border border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
                  >
                    <div className="text-center">
                      <div className="text-2xl mb-2">☑️</div>
                      <div className="text-sm font-medium">체크박스</div>
                    </div>
                  </button>
                  
                  <button
                    onClick={() => addQuestion('dropdown')}
                    className="flex items-center justify-center p-4 border border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
                  >
                    <div className="text-center">
                      <div className="text-2xl mb-2">📋</div>
                      <div className="text-sm font-medium">드롭다운</div>
                    </div>
                  </button>
                  
                  <button
                    onClick={() => addQuestion('rating')}
                    className="flex items-center justify-center p-4 border border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
                  >
                    <div className="text-center">
                      <div className="text-2xl mb-2">⭐</div>
                      <div className="text-sm font-medium">평점</div>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* 미리보기 모드 */
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <div className="max-w-2xl mx-auto">
              {/* 설문지 헤더 */}
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                  {survey.title || '제목 없는 설문지'}
                </h1>
                {survey.description && (
                  <p className="text-gray-600 text-lg leading-relaxed">
                    {survey.description}
                  </p>
                )}
              </div>

              {/* 질문 미리보기 */}
              {survey.questions.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-gray-400 text-lg">아직 질문이 없습니다.</div>
                  <div className="text-gray-400 text-sm mt-2">편집 모드에서 질문을 추가해보세요.</div>
                </div>
              ) : (
                <div className="space-y-8">
                  {survey.questions.map((question, index) => (
                    <div key={question.id} className="border-b border-gray-200 pb-8 last:border-b-0">
                      <div className="mb-4">
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          {index + 1}. {question.title || '제목 없는 질문'}
                          {question.required && <span className="text-red-500 ml-1">*</span>}
                        </h3>
                        {question.description && (
                          <p className="text-gray-600 text-sm">{question.description}</p>
                        )}
                      </div>

                      {/* 질문 타입별 미리보기 */}
                      {question.type === 'short-text' && (
                        <input
                          type="text"
                          placeholder="답변을 입력하세요"
                          className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          disabled
                        />
                      )}

                      {question.type === 'long-text' && (
                        <textarea
                          placeholder="답변을 입력하세요"
                          rows={4}
                          className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                          disabled
                        />
                      )}

                      {question.type === 'multiple-choice' && (
                        <div className="space-y-2">
                          {question.options?.map((option, optionIndex) => (
                            <label key={optionIndex} className="flex items-center space-x-3 cursor-pointer">
                              <input type="radio" name={`question-${question.id}`} className="text-blue-600" disabled />
                              <span className="text-gray-700">{option}</span>
                            </label>
                          ))}
                        </div>
                      )}

                      {question.type === 'checkbox' && (
                        <div className="space-y-2">
                          {question.options?.map((option, optionIndex) => (
                            <label key={optionIndex} className="flex items-center space-x-3 cursor-pointer">
                              <input type="checkbox" className="text-blue-600 rounded" disabled />
                              <span className="text-gray-700">{option}</span>
                            </label>
                          ))}
                        </div>
                      )}

                      {question.type === 'dropdown' && (
                        <select className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" disabled>
                          <option>선택하세요</option>
                          {question.options?.map((option, optionIndex) => (
                            <option key={optionIndex} value={option}>{option}</option>
                          ))}
                        </select>
                      )}

                      {question.type === 'rating' && (
                        <div className="flex items-center space-x-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <svg key={star} className="w-8 h-8 text-gray-300 cursor-pointer hover:text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                            </svg>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}

                  <div className="pt-6">
                    <button
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-medium transition-colors"
                      disabled
                    >
                      제출
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 배포 성공 모달 */}
      {showPublishModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">배포 완료!</h3>
                  <p className="text-gray-600 text-sm">설문지가 성공적으로 배포되었습니다.</p>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  설문지 URL
                </label>
                <div className="flex">
                  <input
                    type="text"
                    value={publishedSurveyUrl}
                    readOnly
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md bg-gray-50 text-sm"
                  />
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(publishedSurveyUrl);
                      alert('링크가 클립보드에 복사되었습니다!');
                    }}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-r-md text-sm transition-colors"
                  >
                    복사
                  </button>
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowPublishModal(false);
                    navigate('/dashboard');
                  }}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
                >
                  대시보드로 이동
                </button>
                <button
                  onClick={() => window.open(publishedSurveyUrl, '_blank')}
                  className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors"
                >
                  설문지 보기
                </button>
              </div>

              <button
                onClick={() => setShowPublishModal(false)}
                className="w-full mt-3 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                계속 편집하기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
