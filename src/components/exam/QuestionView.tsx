
import { Question, UserAnswer } from "@/types/exam";

interface QuestionViewProps {
  question: Question;
  currentQuestionIndex: number;
  userAnswers: UserAnswer[];
  onAnswerSelect: (optionIndex: number) => void;
  onPrevious: () => void;
  onNext: () => void;
  onMarkForReview: () => void;
  onClearResponse: () => void;
  totalQuestions: number;
}

export const QuestionView = ({
  question,
  currentQuestionIndex,
  userAnswers,
  onAnswerSelect,
  onPrevious,
  onNext,
  onMarkForReview,
  onClearResponse,
  totalQuestions,
}: QuestionViewProps) => {
  return (
    <div className="bg-white rounded-lg shadow flex flex-col h-full">
      <div className="p-6 border-b flex-grow">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-medium">Question {currentQuestionIndex + 1}</h2>
          <div className="flex items-center gap-3">
            <span className="text-green-600 text-sm">+4</span>
            <span className="text-red-600 text-sm">-1</span>
          </div>
        </div>

        <div className="space-y-6">
          <p className="text-gray-800">{question.text}</p>
          <div className="space-y-3">
            {question.options.map((option, idx) => (
              <button
                key={idx}
                className={`w-full text-left p-4 rounded border text-sm transition-colors ${
                  userAnswers.find((a) => a.questionId === question.id)?.selectedOption === idx
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:bg-gray-50"
                }`}
                onClick={() => onAnswerSelect(idx)}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4 border-t mt-auto">
        <div className="flex justify-between">
          <button
            className="px-6 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 text-sm font-medium"
            onClick={onPrevious}
            disabled={currentQuestionIndex === 0}
          >
            {"<<Previous"}
          </button>
          <button
            className="px-6 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 text-sm font-medium"
            onClick={onNext}
            disabled={currentQuestionIndex === totalQuestions - 1}
          >
            {"Next>>"}
          </button>
        </div>
        <div className="flex justify-between">
          <div className="space-x-3">
            <button
              className="px-6 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 text-sm font-medium"
              onClick={onMarkForReview}
            >
              Mark for Review & Next
            </button>
            <button
              className="px-6 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 text-sm font-medium"
              onClick={onClearResponse}
            >
              Clear Response
            </button>
          </div>
          <button
            className="px-6 py-2 bg-green-500 text-white rounded hover:bg-green-600 text-sm font-medium"
            onClick={onNext}
          >
            Save & Next
          </button>
        </div>
      </div>
    </div>
  );
};
