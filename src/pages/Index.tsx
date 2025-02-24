import { useState, useEffect, useCallback, useMemo } from "react";
import { Timer, ArrowLeft, ArrowRight, Check, Flag, X, Maximize2, Minimize2, User } from "lucide-react";
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

interface SubjectProgress {
  correct: number;
  total: number;
}

interface Results {
  totalScore: number;
  correctAnswers: number;
  wrongAnswers: number;
  subjectWise: Record<string, SubjectProgress>;
}

const INITIAL_RESULTS: Results = {
  totalScore: 0,
  correctAnswers: 0,
  wrongAnswers: 0,
  subjectWise: {
    Physics: { correct: 0, total: 0 },
    Chemistry: { correct: 0, total: 0 },
    Mathematics: { correct: 0, total: 0 },
  },
};

const Index = () => {
  const [activeSubject, setActiveSubject] = useState("Physics");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(6900);
  const [allQuestions, setAllQuestions] = useState<Question[]>([]);
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
  const [visitedQuestions, setVisitedQuestions] = useState<Set<number>>(new Set());
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState<Results>(INITIAL_RESULTS);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const questions = useMemo(() => 
    allQuestions.filter(q => q.subject === activeSubject),
    [allQuestions, activeSubject]
  );

  const currentQuestion = questions[currentQuestionIndex];

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
      try {
        const { data, error } = await supabase
          .from("questions")
          .select("*");

        if (error) throw error;
        setAllQuestions(data || []);
      } catch (error) {
        console.error("Error fetching questions:", error);
      }
    };

    fetchAllQuestions();
  }, []);

  useEffect(() => {
    if (questions[currentQuestionIndex]?.id) {
      setVisitedQuestions(prev => new Set([...prev, questions[currentQuestionIndex].id]));
    }
  }, [currentQuestionIndex, questions]);

  const handleAnswerSelect = useCallback((optionIndex: number) => {
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
  }, [currentQuestion?.id]);

  const toggleMarkForReview = useCallback(() => {
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
  }, [currentQuestion?.id]);

  const getQuestionStatus = useCallback((questionId: number) => {
    const answer = userAnswers.find((a) => a.questionId === questionId);
    const isVisited = visitedQuestions.has(questionId);

    if (!isVisited) {
      return {
        bgColor: "bg-gray-200",
        textColor: "text-gray-600",
        showGreenDot: false
      };
    }

    if (!answer || answer.selectedOption === null) {
      return {
        bgColor: answer?.isMarkedForReview ? "bg-purple-400" : "bg-red-500",
        textColor: "text-white",
        showGreenDot: false
      };
    }

    if (answer.isMarkedForReview) {
      return {
        bgColor: "bg-purple-400",
        textColor: "text-white",
        showGreenDot: answer.selectedOption !== null
      };
    }

    return {
      bgColor: "bg-green-500",
      textColor: "text-white",
      showGreenDot: false
    };
  }, [userAnswers, visitedQuestions]);

  const calculateProgress = useCallback((subject: string) => {
    const subjectQuestions = allQuestions.filter(q => q.subject === subject);
    const answeredQuestions = userAnswers.filter(a => 
      subjectQuestions.some(q => q.id === a.questionId) && a.selectedOption !== null
    );
    return (answeredQuestions.length / (subjectQuestions.length || 1)) * 100;
  }, [allQuestions, userAnswers]);

  const calculateResults = useCallback(() => {
    let correct = 0;
    let wrong = 0;
    const subjectResults = {
      Physics: { correct: 0, total: 0 },
      Chemistry: { correct: 0, total: 0 },
      Mathematics: { correct: 0, total: 0 },
    };

    allQuestions.forEach(question => {
      subjectResults[question.subject as keyof typeof subjectResults].total++;
      
      const answer = userAnswers.find((a) => a.questionId === question.id);
      if (answer?.selectedOption === question.correct_answer - 1) {
        correct++;
        subjectResults[question.subject as keyof typeof subjectResults].correct++;
      } else if (answer?.selectedOption !== null) {
        wrong++;
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
  }, [allQuestions, userAnswers]);

  const formatTime = useCallback((seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

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

      <div className="flex flex-1 h-[84vh] flex-col md:flex-row">
        <div className="w-full md:w-1/4 bg-white shadow-lg border-r border-gray-200 overflow-hidden">
          <div className="p-4 flex flex-col h-full">
            <div className="flex-1 overflow-auto">
              <div className="relative w-full h-[95px] bg-gray-100 border border-gray-300 shadow-md p-4 flex items-center">
                <div className="absolute top-[13px] left-[10px] w-[70px] h-[70px] rounded-full bg-gradient-to-r from-blue-500 to-purple-500 p-1 shadow-md">
                  <div className="w-full h-full bg-white flex items-center justify-center rounded-full">
                    <User className="w-10 h-10 text-gray-500" />
                  </div>
                </div>

                <div className="absolute top-[13px] left-[101px]">
                  <h3 className="text-lg font-medium text-gray-800 leading-[26px]">
                    John Doe
                  </h3>
                  <p className="text-sm text-gray-500 leading-[22px]">
                    Roll No: JEE2024001
                  </p>
                </div>

                <button className="absolute top-[65px] left-[101px] w-[95px] h-[23px] text-green-800 text-xs font-medium bg-green-100 hover:bg-green-200 active:bg-green-300 flex items-center justify-center rounded-full">
                  Test in Progress
                </button>
              </div>

              <div className="mt-4">
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
                      <span className="text-gray-600">{userAnswers.filter(a => !a.isMarkedForReview).length} Attempted</span>
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
                      if (!question) {
                        return (
                          <button
                            key={i}
                            className="w-full p-1.5 rounded text-center text-xs font-medium bg-[#F1F1F1] text-gray-600"
                            disabled
                          >
                            {i + 1}
                          </button>
                        );
                      }

                      const status = getQuestionStatus(question.id);

                      return (
                        <button
                          key={i}
                          className={`
                            relative w-full p-1.5 rounded text-center text-xs font-medium transition-colors
                            ${i === currentQuestionIndex ? "ring-2 ring-blue-500" : ""}
                            ${status.bgColor} ${status.textColor}
                          `}
                          onClick={() => setCurrentQuestionIndex(i)}
                        >
                          {i + 1}
                          {status.showGreenDot && (
                            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
            
            <button
              className="mt-4 w-full py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors"
              onClick={calculateResults}
            >
              Submit Test
            </button>
          </div>
        </div>

        <div className="w-full md:w-3/4 p-4 bg-gray-50">
          <div className="p-4 h-full flex flex-col">
            {currentQuestion && (
              <div className="bg-white rounded-lg shadow flex-1">
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
