// 설문지 질문 타입 정의
export interface Question {
  id: string;
  type: 'short-text' | 'long-text' | 'multiple-choice' | 'checkbox' | 'dropdown' | 'rating';
  title: string;
  description?: string;
  required: boolean;
  options?: string[]; // 객관식, 체크박스, 드롭다운용
}

// 설문지 타입 정의
export interface Survey {
  id: string;
  title: string;
  description: string;
  questions: Question[];
  createdAt: Date;
  updatedAt: Date;
  status: 'draft' | 'published' | 'closed';
  startDate?: Date; // 배포 시작일
  endDate?: Date;   // 배포 종료일
}
