
export interface Question {
  id: number;
  text: string;
  options: string[];
  subject: string;
  correct_answer: number;
}

export interface UserAnswer {
  questionId: number;
  selectedOption: number | null;
  isMarkedForReview: boolean;
}

export interface SubjectResults {
  correct: number;
  total: number;
}

export interface ExamResults {
  totalScore: number;
  correctAnswers: number;
  wrongAnswers: number;
  subjectWise: {
    Physics: SubjectResults;
    Chemistry: SubjectResults;
    Mathematics: SubjectResults;
  };
}
