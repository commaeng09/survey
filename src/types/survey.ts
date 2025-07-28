// 설문지 질문 타입 정의
export interface Question {
  id: string;
  type: 'short-text' | 'long-text' | 'multiple-choice' | 'checkbox' | 'dropdown' | 'rating' | 'text' | 'textarea' | 'radio';
  title?: string; // Frontend property
  text?: string;  // Backend property  
  description?: string;
  required: boolean;
  options?: string[]; // 객관식, 체크박스, 드롭다운용
  order?: number; // Backend property
}

// 설문지 타입 정의
export interface Survey {
  id: string;
  title: string;
  description: string;
  questions: Question[];
  creator: string;
  isPublic: boolean;
  status: 'draft' | 'published' | 'closed';
  createdAt: string;
  updatedAt: string;
  responses: SurveyResponse[];
  startDate?: string;
  endDate?: string;
}

// 설문 응답 타입
export interface SurveyResponse {
  id: string;
  surveyId: string;
  respondentId?: string;
  answers: Answer[];
  submittedAt: string;
}

// 답변 타입
export interface Answer {
  questionId: string;
  value: string | string[];
}
