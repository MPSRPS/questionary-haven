
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog } from "@/components/ui/dialog";
import { Header } from "@/components/exam/Header";
import { UserProfile } from "@/components/exam/UserProfile";
import { Progress } from "@/components/exam/Progress";
import { QuestionPalette } from "@/components/exam/QuestionPalette";
import { QuestionView } from "@/components/exam/QuestionView";
import { Question, UserAnswer, ExamResults } from "@/types/exam";

const Index = () => {
  const [activeSubject, setActiveSubject] = useState("Physics");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(6900);
  const [allQuestions, setAllQuestions] = useState<Question[]>([]);
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState<ExamResults>({
    totalScore: 0,
    correctAnswers: 0,
    wrongAnswers: 0,
    subjectWise: {
      Physics: { correct: 0, total: 0 },
      Chemistry: { correct: 0, total: 0 },
      Mathematics: { correct: 0, total: 0 },
    },
  });
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0) {
          clearInterval(timer);
          calculateResults();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchAllQuestions = async () => {
      const { data, error } = await supabase
        .from("questions")
        .select("*");

      if (error) {
        console.error("Error fetching questions:", error);
        return;
      }

      setAllQuestions(data || []);
    };

    fetchAllQuestions();
  }, []);

  const questions = allQuestions.filter(q => q.subject === activeSubject);
  const currentQuestion = questions[currentQuestionIndex];

  const handleAnswerSelect = (optionIndex: number) => {
    setUserAnswers((prev) => {
      const existing = prev.find((a) => a.questionId === currentQuestion.id);
      if (existing) {
        return prev.map((a) =>
          a.questionId === currentQuestion.id
            ? { ...a, selectedOption: optionIndex }
            : a
        );
      }
      return [...prev, { 
        questionId: currentQuestion.id, 
        selectedOption: optionIndex,
        isMarkedForReview: false 
      }];
    });
  };

  const toggleMarkForReview = () => {
    setUserAnswers((prev) => {
      const existing = prev.find((a) => a.questionId === currentQuestion.id);
      if (existing) {
        return prev.map((a) =>
          a.questionId === currentQuestion.id
            ? { ...a, isMarkedForReview: !a.isMarkedForReview }
            : a
        );
      }
      return [...prev, { 
        questionId: currentQuestion.id, 
        selectedOption: null,
        isMarkedForReview: true 
      }];
    });
  };

  const calculateProgress = (subject: string) => {
    const subjectQuestions = allQuestions.filter(q => q.subject === subject);
    const answeredQuestions = userAnswers.filter(a => 
      subjectQuestions.some(q => q.id === a.questionId)
    );
    return (answeredQuestions.length / (subjectQuestions.length || 1)) * 100;
  };

  const calculateResults = () => {
    let correct = 0;
    let wrong = 0;
    const subjectResults = {
      Physics: { correct: 0, total: 0 },
      Chemistry: { correct: 0, total: 0 },
      Mathematics: { correct: 0, total: 0 },
    };

    allQuestions.forEach(question => {
      subjectResults[question.subject as keyof typeof subjectResults].total++;
    });

    allQuestions.forEach((question) => {
      const answer = userAnswers.find((a) => a.questionId === question.id);
      if (answer) {
        if (answer.selectedOption === question.correct_answer - 1) {
          correct++;
          subjectResults[question.subject as keyof typeof subjectResults].correct++;
        } else {
          wrong++;
        }
      }
    });

    const totalScore = correct * 4 - wrong;
    setResults({
      totalScore,
      correctAnswers: correct,
      wrongAnswers: wrong,
      subjectWise: subjectResults,
    });
    setShowResults(true);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleNextQuestion = () => {
    setCurrentQuestionIndex((prev) => Math.min(questions.length - 1, prev + 1));
  };

  const handlePreviousQuestion = () => {
    setCurrentQuestionIndex((prev) => Math.max(0, prev - 1));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        timeLeft={timeLeft}
        activeSubject={activeSubject}
        isFullscreen={isFullscreen}
        onSubjectChange={(subject) => {
          setActiveSubject(subject);
          setCurrentQuestionIndex(0);
        }}
        onToggleFullscreen={toggleFullscreen}
      />

      <div className="max-w-screen-2xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-[320px,1fr] gap-6">
        <div className="bg-white rounded-lg shadow lg:sticky lg:top-[120px] self-start">
          <UserProfile />
          <Progress
            activeSubject={activeSubject}
            progress={calculateProgress(activeSubject)}
            userAnswers={userAnswers}
            allQuestions={allQuestions}
          />
          <QuestionPalette
            questions={questions}
            currentQuestionIndex={currentQuestionIndex}
            userAnswers={userAnswers}
            onQuestionClick={setCurrentQuestionIndex}
          />
          <div className="p-4 border-t">
            <button
              className="w-full py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors"
              onClick={calculateResults}
            >
              Submit Test
            </button>
          </div>
        </div>

        <div className="lg:sticky lg:top-[120px] self-start">
          {currentQuestion && (
            <QuestionView
              question={currentQuestion}
              currentQuestionIndex={currentQuestionIndex}
              userAnswers={userAnswers}
              onAnswerSelect={handleAnswerSelect}
              onPrevious={handlePreviousQuestion}
              onNext={handleNextQuestion}
              onMarkForReview={toggleMarkForReview}
              onClearResponse={() => {
                const answer = userAnswers.find(a => a.questionId === currentQuestion.id);
                if (answer) {
                  setUserAnswers(prev => prev.filter(a => a.questionId !== currentQuestion.id));
                }
              }}
              totalQuestions={questions.length}
            />
          )}
        </div>
      </div>

      {showResults && (
        <Dialog open={showResults} onOpenChange={setShowResults}>
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white rounded-lg p-8 max-w-md w-full">
              <div className="text-center mb-6">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="w-6 h-6 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Test Completed!</h2>
                <div className="text-4xl font-bold text-blue-600 mb-4">
                  {results.totalScore}
                </div>
                <p className="text-gray-600">Total Score</p>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-green-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {results.correctAnswers}
                  </div>
                  <p className="text-sm text-green-800">Correct Answers</p>
                </div>
                <div className="bg-red-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {results.wrongAnswers}
                  </div>
                  <p className="text-sm text-red-800">Wrong Answers</p>
                </div>
              </div>

              <h3 className="font-bold mb-4">Subject-wise Performance</h3>
              <div className="space-y-4">
                {Object.entries(results.subjectWise).map(([subject, data]) => (
                  <div key={subject} className="flex justify-between items-center">
                    <span>{subject}</span>
                    <span className="text-gray-600">
                      {data.correct} / {data.total} correct
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
};

export default Index;
