import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContextNew';
import { surveyAPI } from '../services/api';
import QuestionEditor from '../components/QuestionEditor';
import type { Survey, Question } from '../types/survey';

export default function SurveyCreatePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [survey, setSurvey] = useState<Partial<Survey>>({
    title: '',
    description: '',
    questions: []
  });

  const [isPublic, setIsPublic] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const addQuestion = () => {
    const newQuestion: Question = {
      id: `q-${Date.now()}`,
      type: 'short-text',
      title: '제목 없는 질문',
      description: '',
      required: false,
      options: []
    };

    setSurvey(prev => ({
      ...prev,
      questions: [...(prev.questions || []), newQuestion]
    }));
  };

  const updateQuestion = (questionId: string, updatedQuestion: Question) => {
    setSurvey(prev => ({
      ...prev,
      questions: prev.questions?.map(q => 
        q.id === questionId ? updatedQuestion : q
      )
    }));
  };

  const deleteQuestion = (questionId: string) => {
    setSurvey(prev => ({
      ...prev,
      questions: prev.questions?.filter(q => q.id !== questionId)
    }));
  };

  const duplicateQuestion = (questionId: string) => {
    const questionToDuplicate = survey.questions?.find(q => q.id === questionId);
    if (questionToDuplicate) {
      const duplicatedQuestion: Question = {
        ...questionToDuplicate,
        id: `q-${Date.now()}`,
        title: `${questionToDuplicate.title} (복사본)`
      };
      
      setSurvey(prev => ({
        ...prev,
        questions: [...(prev.questions || []), duplicatedQuestion]
      }));
    }
  };

  const saveSurvey = async (status: 'draft' | 'published') => {
    if (!survey.title?.trim()) {
      alert('설문 제목을 입력해주세요.');
      return;
    }

    if (!survey.questions || survey.questions.length === 0) {
      alert('최소 1개의 질문을 추가해주세요.');
      return;
    }

    setIsSaving(true);

    try {
      // Django API에 설문 생성 요청
      const surveyData = {
        title: survey.title,
        description: survey.description || '',
        questions: survey.questions,
        is_public: isPublic,
        status: status
      };

      const response = await surveyAPI.createSurvey(surveyData);
      
      alert(status === 'draft' ? '설문이 임시저장되었습니다.' : '설문이 발행되었습니다.');
      navigate('/dashboard');
    } catch (error) {
      console.error('설문 저장 실패:', error);
      
      // 백엔드 연결 실패 시 로컬 스토리지에 임시 저장
      try {
        const newSurvey: Survey = {
          id: `survey-${Date.now()}`,
          title: survey.title!,
          description: survey.description || '',
          questions: survey.questions!,
          creator: user?.username || '',
          isPublic,
          status: status,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          responses: []
        };

        const existingSurveys = JSON.parse(localStorage.getItem('user_surveys') || '[]');
        existingSurveys.push(newSurvey);
        localStorage.setItem('user_surveys', JSON.stringify(existingSurveys));

        alert(`백엔드 연결 실패. 로컬에 ${status === 'draft' ? '임시저장' : '저장'}되었습니다.`);
        navigate('/dashboard');
      } catch (localError) {
        console.error('로컬 저장도 실패:', localError);
        alert('설문 저장 중 오류가 발생했습니다.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link 
                to="/dashboard"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                ← 대시보드로 돌아가기
              </Link>
              <h1 className="text-xl font-semibold text-gray-900">새 설문 만들기</h1>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => saveSurvey('draft')}
                disabled={isSaving}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
              >
                {isSaving ? '저장 중...' : '임시저장'}
              </button>
              <button
                onClick={() => saveSurvey('published')}
                disabled={isSaving}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {isSaving ? '발행 중...' : '발행'}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Survey Info */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                설문 제목 *
              </label>
              <input
                type="text"
                id="title"
                value={survey.title || ''}
                onChange={(e) => setSurvey(prev => ({ ...prev, title: e.target.value }))}
                placeholder="설문 제목을 입력하세요"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                설문 설명
              </label>
              <textarea
                id="description"
                value={survey.description || ''}
                onChange={(e) => setSurvey(prev => ({ ...prev, description: e.target.value }))}
                placeholder="설문에 대한 간단한 설명을 입력하세요"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="isPublic"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="isPublic" className="ml-2 block text-sm text-gray-700">
                공개 설문으로 만들기 (누구나 응답 가능)
              </label>
            </div>
          </div>
        </div>

        {/* Questions */}
        <div className="space-y-4">
          {survey.questions?.map((question, index) => (
            <QuestionEditor
              key={question.id}
              question={question}
              onUpdate={(updatedQuestion) => updateQuestion(question.id, updatedQuestion)}
              onDelete={() => deleteQuestion(question.id)}
              onDuplicate={() => duplicateQuestion(question.id)}
            />
          ))}
        </div>

        {/* Add Question Button */}
        <div className="mt-6">
          <button
            onClick={addQuestion}
            className="w-full flex items-center justify-center px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-500 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            질문 추가
          </button>
        </div>

        {/* Empty State */}
        {(!survey.questions || survey.questions.length === 0) && (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm border">
            <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">질문이 없습니다</h3>
            <p className="text-gray-600 mb-4">첫 번째 질문을 추가하여 설문을 시작하세요.</p>
            <button
              onClick={addQuestion}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              첫 번째 질문 추가
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
