
import { Question, UserAnswer } from "@/types/exam";

interface QuestionPaletteProps {
  questions: Question[];
  currentQuestionIndex: number;
  userAnswers: UserAnswer[];
  onQuestionClick: (index: number) => void;
}

export const QuestionPalette = ({
  questions,
  currentQuestionIndex,
  userAnswers,
  onQuestionClick,
}: QuestionPaletteProps) => {
  return (
    <div className="p-4">
      <h4 className="font-medium mb-4">Question Palette</h4>
      <div className="grid grid-cols-5 gap-2">
        {Array.from({ length: 25 }, (_, i) => {
          const question = questions[i];
          const answer = userAnswers.find(a => question && a.questionId === question.id);
          const isUnanswered = !answer || answer.selectedOption === null;
          const isMarked = answer?.isMarkedForReview;
          
          let bgColor = "bg-gray-200";
          let textColor = "text-gray-600";
          
          if (question) {
            if (isMarked && answer?.selectedOption !== null) {
              bgColor = "bg-purple-400";
              textColor = "text-white";
            } else if (isMarked) {
              bgColor = "bg-purple-400";
              textColor = "text-white";
            } else if (isUnanswered) {
              bgColor = "bg-red-500";
              textColor = "text-white";
            } else if (answer?.selectedOption !== null) {
              bgColor = "bg-green-500";
              textColor = "text-white";
            }
          }

          return (
            <button
              key={i}
              className={`
                relative w-full aspect-square rounded text-sm font-medium transition-colors
                ${i === currentQuestionIndex ? "ring-2 ring-blue-500" : ""}
                ${bgColor} ${textColor}
              `}
              onClick={() => question && onQuestionClick(i)}
              disabled={!question}
            >
              {i + 1}
              {isMarked && answer?.selectedOption !== null && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
