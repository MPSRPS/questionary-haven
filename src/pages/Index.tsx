import { useState, useEffect } from "react";
import { Timer, ArrowLeft, ArrowRight, Check, Flag } from "lucide-react";
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
  const [activeSubject, setActiveSubject] = useState("Mathematics");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(6900); // 1:55:00 in seconds
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
    if (!answer) return "not-visited";
    if (answer.isMarkedForReview) {
      return answer.selectedOption !== null ? "marked-answered" : "marked";
    }
    return answer.selectedOption !== null ? "answered" : "not-answered";
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <header className="bg-white shadow-lg border-b border-blue-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            JEE Prep Master
          </h1>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-lg">
              <Timer className="w-5 h-5 text-blue-600" />
              <span className={`text-lg font-medium ${timeLeft < 300 ? 'text-red-600 animate-pulse' : 'text-blue-600'}`}>
                {formatTime(timeLeft)}
              </span>
            </div>
            <select className="border rounded-lg px-3 py-2 bg-white shadow-sm focus:ring-2 focus:ring-blue-500 outline-none">
              <option>English</option>
            </select>
          </div>
        </div>
      </header>

      <div className="border-b bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8" aria-label="Subjects">
            {["Physics", "Chemistry", "Mathematics"].map((subject) => (
              <button
                key={subject}
                className={`${
                  activeSubject === subject
                    ? "border-blue-500 text-blue-600 bg-blue-50"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50"
                } whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm transition-all duration-200`}
                onClick={() => {
                  setActiveSubject(subject);
                  setCurrentQuestionIndex(0);
                }}
              >
                {subject}
              </button>
            ))}
          </nav>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-12 gap-8">
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-blue-100">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold">
                  JD
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">John Doe</h3>
                  <p className="text-sm text-gray-500">Roll No: JEE2024001</p>
                </div>
              </div>
              <div className="text-xs bg-green-100 text-green-800 px-3 py-1.5 rounded-full inline-block mb-6 font-medium">
                Test in Progress
              </div>

              <div className="space-y-4 mb-8">
                <h4 className="font-medium text-gray-900">{activeSubject} Progress</h4>
                <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 transition-all duration-300" 
                    style={{
                      width: `${(userAnswers.filter(a => !a.isMarkedForReview).length / questions.length) * 100}%`
                    }}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-green-500 rounded-full" />
                    <span className="text-gray-600">Answered</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-purple-500 rounded-full" />
                    <span className="text-gray-600">Marked</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-red-500 rounded-full" />
                    <span className="text-gray-600">Not Answered</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-gray-300 rounded-full" />
                    <span className="text-gray-600">Not Visited</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-4">Question Palette</h4>
                <div className="grid grid-cols-5 gap-2">
                  {questions.map((question, idx) => {
                    const status = getQuestionStatus(question.id);
                    return (
                      <button
                        key={question.id}
                        className={`relative w-10 h-10 rounded-lg font-medium text-sm transition-all duration-200 ${
                          idx === currentQuestionIndex
                            ? "ring-2 ring-blue-500"
                            : ""
                        } ${
                          status === "answered"
                            ? "bg-green-500 text-white"
                            : status === "not-answered"
                            ? "bg-red-500 text-white"
                            : status === "marked"
                            ? "bg-purple-500 text-white"
                            : status === "marked-answered"
                            ? "bg-purple-500 text-white"
                            : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                        }`}
                        onClick={() => setCurrentQuestionIndex(idx)}
                      >
                        {idx + 1}
                        {status === "marked-answered" && (
                          <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-9">
            {currentQuestion && (
              <div className="bg-white rounded-xl shadow-sm p-6 border border-blue-100">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-medium text-gray-900">
                    Question {currentQuestionIndex + 1}
                  </h2>
                  <div className="flex gap-3 text-sm">
                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded">+4</span>
                    <span className="px-2 py-1 bg-red-100 text-red-700 rounded">-1</span>
                  </div>
                </div>

                <div className="space-y-6">
                  <p className="text-gray-800 text-lg">{currentQuestion.text}</p>
                  <div className="space-y-3">
                    {currentQuestion.options.map((option, idx) => (
                      <button
                        key={idx}
                        className={`w-full text-left p-4 rounded-lg border transition-all duration-200 ${
                          userAnswers.find((a) => a.questionId === currentQuestion.id)
                            ?.selectedOption === idx
                            ? "border-blue-500 bg-blue-50 text-blue-700"
                            : "border-gray-200 hover:border-blue-200 hover:bg-blue-50"
                        }`}
                        onClick={() => handleAnswerSelect(idx)}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between mt-8">
                  <div className="flex gap-3">
                    <button
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      onClick={() =>
                        setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))
                      }
                      disabled={currentQuestionIndex === 0}
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Previous
                    </button>
                    <button
                      className="flex items-center gap-2 px-4 py-2 border border-blue-200 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                      onClick={toggleMarkForReview}
                    >
                      <Flag className="w-4 h-4" />
                      Mark for Review
                    </button>
                  </div>
                  <button
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    onClick={() =>
                      setCurrentQuestionIndex((prev) =>
                        Math.min(questions.length - 1, prev + 1)
                      )
                    }
                    disabled={currentQuestionIndex === questions.length - 1}
                  >
                    Save & Next
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-blue-100 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <button className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors">
            <span className="w-5 h-5 flex items-center justify-center bg-blue-100 rounded">
              i
            </span>
            Instructions
          </button>
          <button
            className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            onClick={calculateResults}
          >
            Submit Test
          </button>
        </div>
      </footer>

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
