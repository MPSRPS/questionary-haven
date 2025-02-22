
import { UserAnswer, Question } from "@/types/exam";

interface ProgressProps {
  activeSubject: string;
  progress: number;
  userAnswers: UserAnswer[];
  allQuestions: Question[];
}

export const Progress = ({ activeSubject, progress, userAnswers, allQuestions }: ProgressProps) => {
  return (
    <div className="p-4 border-b">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-gray-600">{activeSubject} Progress</span>
        <div className="flex-1 ml-3">
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-500" 
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2">
          <span className="text-green-600">○</span>
          <span className="text-gray-600">
            {userAnswers.filter(a => 
              allQuestions.find(q => q.id === a.questionId)?.subject === activeSubject && 
              !a.isMarkedForReview
            ).length} Attempted
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-purple-600">○</span>
          <span className="text-gray-600">Marked</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-red-600">○</span>
          <span className="text-gray-600">Not Answered</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-gray-400">○</span>
          <span className="text-gray-600">25 Not Visited</span>
        </div>
      </div>
    </div>
  );
};
