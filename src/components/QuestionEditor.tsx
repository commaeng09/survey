import { useState } from 'react';
import type { Question } from '../types/survey';

interface QuestionEditorProps {
  question: Question;
  onUpdate: (question: Question) => void;
  onDelete: () => void;
  onDuplicate: () => void;
}

const QUESTION_TYPES = [
  { value: 'short-text', label: '단답형', icon: '📝' },
  { value: 'long-text', label: '장문형', icon: '📄' },
  { value: 'multiple-choice', label: '객관식', icon: '🔘' },
  { value: 'checkbox', label: '체크박스', icon: '☑️' },
  { value: 'dropdown', label: '드롭다운', icon: '📋' },
  { value: 'rating', label: '평점', icon: '⭐' },
] as const;

export default function QuestionEditor({ question, onUpdate, onDelete, onDuplicate }: QuestionEditorProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const updateQuestion = (updates: Partial<Question>) => {
    onUpdate({ ...question, ...updates });
  };

  const addOption = () => {
    const newOptions = [...(question.options || []), `옵션 ${(question.options?.length || 0) + 1}`];
    updateQuestion({ options: newOptions });
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...(question.options || [])];
    newOptions[index] = value;
    updateQuestion({ options: newOptions });
  };

  const removeOption = (index: number) => {
    const newOptions = question.options?.filter((_, i) => i !== index) || [];
    updateQuestion({ options: newOptions });
  };

  const needsOptions = ['multiple-choice', 'checkbox', 'dropdown'].includes(question.type);

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm mb-4 overflow-hidden">
      {/* Question Header */}
      <div className="border-l-4 border-blue-500 bg-gray-50 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg 
                className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-90' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
            <span className="text-sm font-medium text-gray-600">
              질문 {question.type === 'short-text' ? '단답형' : 
                    question.type === 'long-text' ? '장문형' :
                    question.type === 'multiple-choice' ? '객관식' :
                    question.type === 'checkbox' ? '체크박스' :
                    question.type === 'dropdown' ? '드롭다운' : '평점'}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={onDuplicate}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
              title="질문 복사"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </button>
            <button
              onClick={onDelete}
              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
              title="질문 삭제"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Question Content */}
      {isExpanded && (
        <div className="px-6 py-6 space-y-6">
          {/* Question Title */}
          <div>
            <input
              type="text"
              placeholder="질문을 입력하세요"
              value={question.title}
              onChange={(e) => updateQuestion({ title: e.target.value })}
              className="w-full text-lg font-medium border-0 border-b-2 border-gray-200 focus:border-blue-500 focus:outline-none py-2 bg-transparent placeholder-gray-400"
            />
          </div>

          {/* Question Description */}
          <div>
            <input
              type="text"
              placeholder="질문 설명 (선택사항)"
              value={question.description || ''}
              onChange={(e) => updateQuestion({ description: e.target.value })}
              className="w-full text-sm text-gray-600 border-0 border-b border-gray-200 focus:border-blue-500 focus:outline-none py-2 bg-transparent placeholder-gray-400"
            />
          </div>

          {/* Question Type Selector */}
          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium text-gray-700">질문 유형:</label>
            <select
              value={question.type}
              onChange={(e) => updateQuestion({ type: e.target.value as Question['type'] })}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {QUESTION_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.icon} {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* Options for Multiple Choice, Checkbox, Dropdown */}
          {needsOptions && (
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-700">선택지:</label>
              {question.options?.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div className="flex-shrink-0">
                    {question.type === 'multiple-choice' && (
                      <div className="w-4 h-4 border-2 border-gray-300 rounded-full"></div>
                    )}
                    {question.type === 'checkbox' && (
                      <div className="w-4 h-4 border-2 border-gray-300 rounded"></div>
                    )}
                    {question.type === 'dropdown' && (
                      <span className="text-gray-400 text-sm">{index + 1}.</span>
                    )}
                  </div>
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => updateOption(index, e.target.value)}
                    className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder={`선택지 ${index + 1}`}
                  />
                  {question.options && question.options.length > 1 && (
                    <button
                      onClick={() => removeOption(index)}
                      className="p-1 text-gray-400 hover:text-red-600"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={addOption}
                className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 text-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span>선택지 추가</span>
              </button>
            </div>
          )}

          {/* Rating Scale Preview */}
          {question.type === 'rating' && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">평점 미리보기:</label>
              <div className="flex items-center space-x-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg key={star} className="w-6 h-6 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                ))}
              </div>
            </div>
          )}

          {/* Required Toggle */}
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id={`required-${question.id}`}
              checked={question.required}
              onChange={(e) => updateQuestion({ required: e.target.checked })}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor={`required-${question.id}`} className="text-sm text-gray-700">
              필수 질문
            </label>
          </div>
        </div>
      )}
    </div>
  );
}
