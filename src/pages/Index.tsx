import { useState, useEffect } from "react";
import { Timer, ArrowLeft, ArrowRight, Check, Flag, X, Maximize2, Minimize2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog } from "@/components/ui/dialog";

interface Question {
  id: number;
  text: string;
  options: string[];
  subject: string;
  correct_answer: number;
}

interface UserAnswer {
  questionId: number;
  selectedOption: number | null;
  isMarkedForReview: boolean;
}

const Index = () => {
  const [activeSubject, setActiveSubject] = useState("Physics");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(6900);
  const [allQuestions, setAllQuestions] = useState<Question[]>([]);
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState({
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

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

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

  const getQuestionStatus = (questionId: number) => {
    const answer = userAnswers.find((a) => a.questionId === questionId);
    if (!answer || answer.selectedOption === null) return "not-answered";
    if (answer.isMarkedForReview) {
      return "marked-answered";
    }
    return "answered";
  };

  const calculateProgress = (subject: string) => {
    const subjectQuestions = allQuestions.filter(q => q.subject === subject);
    const answeredQuestions = userAnswers.filter(a => 
      subjectQuestions.some(q => q.id === a.questionId) && a.selectedOption !== null
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

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-screen-2xl mx-auto px-4 py-2 flex justify-between items-center">
          <h1 className="text-xl font-semibold text-blue-600">JEE Prep Master</h1>
          <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2 font-medium">
            <Timer className="w-4 h-4" />
            <span>{formatTime(timeLeft)}</span>
          </div>
          <button
            onClick={toggleFullscreen}
            className="text-gray-600 hover:text-gray-800"
          >
            {isFullscreen ? (
              <Minimize2 className="w-5 h-5" />
            ) : (
              <Maximize2 className="w-5 h-5" />
            )}
          </button>
        </div>
        <div className="max-w-screen-2xl mx-auto border-t flex justify-between items-center">
          <div className="flex">
            {["Physics", "Chemistry", "Mathematics"].map((subject) => (
              <button
                key={subject}
                className={`px-8 py-3 text-sm font-medium transition-colors ${
                  activeSubject === subject
                    ? "bg-blue-600 text-white"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
                onClick={() => {
                  setActiveSubject(subject);
                  setCurrentQuestionIndex(0);
                }}
              >
                {subject}
              </button>
            ))}
          </div>
          <div className="px-4">
            <select className="border rounded px-3 py-1.5 text-sm">
              <option>English</option>
              <option>Hindi</option>
            </select>
          </div>
        </div>
      </header>

      <div className="max-w-screen-2xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-[320px,1fr] gap-6">
        <div className="bg-white rounded-lg shadow lg:sticky lg:top-[120px] self-start">
          <div className="p-4">
            <div className="flex items-center gap-4 mb-2">
              <div className="w-14 h-14 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 p-[2px]">
                <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
                  <span className="text-blue-600 font-medium">JD</span>
                </div>
              </div>
              <div>
                <h3 className="font-medium">John Doe</h3>
                <p className="text-sm text-gray-500 mb-2">Roll No: JEE2024001</p>
                <div className="bg-green-100 text-green-700 text-xs font-medium px-2 py-1 rounded-full inline-block">
                  Test in Progress
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-gray-600">{activeSubject} Progress</span>
                <div className="flex-1 ml-3">
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500" 
                      style={{
                        width: `${calculateProgress(activeSubject)}%`
                      }}
                    />
                  </div>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-green-600">○</span>
                  <span className="text-gray-600">{userAnswers.filter(a => 
                    allQuestions.find(q => q.id === a.questionId)?.subject === activeSubject && 
                    !a.isMarkedForReview
                  ).length} Attempted</span>
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

            <div className="p-4">
              <h4 className="font-medium mb-4">Question Palette</h4>
              <div className="grid grid-cols-5 gap-2">
                {Array.from({ length: 25 }, (_, i) => {
                  const question = questions[i];
                  const status = question ? getQuestionStatus(question.id) : "not-visited";
                  const answer = userAnswers.find(a => question && a.questionId === question.id);
                  const isUnanswered = !answer || answer.selectedOption === null;
                  
                  let bgColor = "bg-gray-200";
                  let textColor = "text-gray-600";
                  
                  if (question) {
                    if (isUnanswered) {
                      bgColor = "bg-red-500";
                      textColor = "text-white";
                    } else if (answer?.isMarkedForReview) {
                      bgColor = "bg-purple-400";
                      textColor = "text-white";
                    } else {
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
                      onClick={() => question && setCurrentQuestionIndex(i)}
                      disabled={!question}
                    >
                      {i + 1}
                      {answer?.isMarkedForReview && answer.selectedOption !== null && (
                        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <button
            className="w-full py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors"
            onClick={calculateResults}
          >
            Submit Test
          </button>
        </div>

        <div className="lg:sticky lg:top-[120px] self-start">
          {currentQuestion && (
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-medium">Question {currentQuestionIndex + 1}</h2>
                  <div className="flex items-center gap-3">
                    <span className="text-green-600 text-sm">+4</span>
                    <span className="text-red-600 text-sm">-1</span>
                  </div>
                </div>

                <div className="space-y-6">
                  <p className="text-gray-800">{currentQuestion.text}</p>
                  <div className="space-y-3">
                    {currentQuestion.options.map((option, idx) => (
                      <button
                        key={idx}
                        className={`w-full text-left p-4 rounded border text-sm transition-colors ${
                          userAnswers.find((a) => a.questionId === currentQuestion.id)?.selectedOption === idx
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 hover:bg-gray-50"
                        }`}
                        onClick={() => handleAnswerSelect(idx)}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-4 space-y-4">
                <div className="flex justify-between">
                  <button
                    className="px-6 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm font-medium"
                    onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
                    disabled={currentQuestionIndex === 0}
                  >
                    {"<< Previous"}
                  </button>
                  <button
                    className="px-6 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm font-medium"
                    onClick={() => setCurrentQuestionIndex((prev) => Math.min(questions.length - 1, prev + 1))}
                    disabled={currentQuestionIndex === questions.length - 1}
                  >
                    {"Next >>"}
                  </button>
                </div>
                <div className="flex justify-between">
                  <div className="space-x-3">
                    <button
                      className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm font-medium"
                      onClick={toggleMarkForReview}
                    >
                      Mark for Review & Next
                    </button>
                    <button
                      className="px-6 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 text-sm font-medium"
                      onClick={() => {
                        const answer = userAnswers.find(a => a.questionId === currentQuestion.id);
                        if (answer) {
                          setUserAnswers(prev => prev.filter(a => a.questionId !== currentQuestion.id));
                        }
                      }}
                    >
                      Clear Response
                    </button>
                  </div>
                  <button
                    className="px-6 py-2 bg-green-500 text-white rounded hover:bg-green-600 text-sm font-medium"
                    onClick={() => setCurrentQuestionIndex((prev) => Math.min(questions.length - 1, prev + 1))}
                  >
                    Save & Next
                  </button>
                </div>
              </div>
            </div>
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
