import { useState, useEffect } from "react";
import { Timer, ArrowLeft, ArrowRight, Check } from "lucide-react";
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
}

const Index = () => {
  const [activeSubject, setActiveSubject] = useState("Mathematics");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState("01:54:11");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState({
    totalScore: 0,
    correctAnswers: 0,
    wrongAnswers: 0,
    subjectWise: {
      Physics: { correct: 0, total: 5 },
      Chemistry: { correct: 0, total: 5 },
      Mathematics: { correct: 0, total: 5 },
    },
  });

  // Fetch questions for the current subject
  useEffect(() => {
    const fetchQuestions = async () => {
      const { data, error } = await supabase
        .from("questions")
        .select("*")
        .eq("subject", activeSubject);

      if (error) {
        console.error("Error fetching questions:", error);
        return;
      }

      setQuestions(data || []);
      setCurrentQuestionIndex(0);
    };

    fetchQuestions();
  }, [activeSubject]);

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
      return [...prev, { questionId: currentQuestion.id, selectedOption: optionIndex }];
    });
  };

  const calculateResults = () => {
    let correct = 0;
    let wrong = 0;
    const subjectResults = {
      Physics: { correct: 0, total: 5 },
      Chemistry: { correct: 0, total: 5 },
      Mathematics: { correct: 0, total: 5 },
    };

    questions.forEach((question) => {
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

  const progress = {
    attempted: userAnswers.length,
    marked: 0,
    notAnswered: questions.length - userAnswers.length,
    notVisited: 0,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-700">JEE Prep Master</h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Timer className="w-5 h-5 text-gray-600" />
              <span className="text-lg font-medium">{timeLeft}</span>
            </div>
            <select className="border rounded-md px-2 py-1">
              <option>English</option>
            </select>
          </div>
        </div>
      </header>

      {/* Subject Tabs */}
      <div className="border-b bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8" aria-label="Subjects">
            {["Physics", "Chemistry", "Mathematics"].map((subject) => (
              <button
                key={subject}
                className={`${
                  activeSubject === subject
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                onClick={() => setActiveSubject(subject)}
              >
                {subject}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-12 gap-8">
          {/* Left Sidebar */}
          <div className="col-span-3 bg-white rounded-lg shadow p-6">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-12 h-12 bg-gray-200 rounded-full" />
              <div>
                <h3 className="font-medium">John Doe</h3>
                <p className="text-sm text-gray-500">Roll No: JEE2024001</p>
              </div>
            </div>
            <div className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded inline-block mb-6">
              Test in Progress
            </div>

            {/* Progress */}
            <div className="space-y-4 mb-8">
              <h4 className="font-medium">Mathematics Progress</h4>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-green-500 w-1/4" />
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full" />
                  <span>{progress.attempted} Attempted</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-purple-500 rounded-full" />
                  <span>{progress.marked} Marked</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-red-500 rounded-full" />
                  <span>{progress.notAnswered} Not Answered</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-gray-500 rounded-full" />
                  <span>{progress.notVisited} Not Visited</span>
                </div>
              </div>
            </div>

            {/* Question Palette */}
            <div>
              <h4 className="font-medium mb-4">Question Palette</h4>
              <div className="grid grid-cols-5 gap-2">
                {Array.from({ length: 25 }, (_, i) => i + 1).map((num) => (
                  <button
                    key={num}
                    className={`${
                      num === currentQuestionIndex + 1
                        ? "bg-green-500 text-white"
                        : userAnswers.some((answer) => answer.questionId === questions[num - 1]?.id)
                        ? "bg-gray-100"
                        : "bg-gray-200"
                    } rounded p-2 text-sm font-medium`}
                    onClick={() =>
                      setCurrentQuestionIndex(
                        questions.findIndex((q) => q.id === questions[num - 1]?.id)
                      )
                    }
                    disabled={!questions[num - 1]}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Question Area */}
          <div className="col-span-9 bg-white rounded-lg shadow p-6">
            {currentQuestion && (
              <>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-medium">
                    Question {currentQuestionIndex + 1}
                  </h2>
                  <div className="flex gap-2">
                    <span className="text-green-600">+4</span>
                    <span className="text-red-600">-1</span>
                  </div>
                </div>

                <div className="space-y-6">
                  <p className="text-gray-800">{currentQuestion.text}</p>
                  <div className="space-y-3">
                    {currentQuestion.options.map((option, idx) => (
                      <button
                        key={idx}
                        className={`w-full text-left p-4 rounded-lg border ${
                          userAnswers.find((a) => a.questionId === currentQuestion.id)
                            ?.selectedOption === idx
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 hover:border-blue-200"
                        }`}
                        onClick={() => handleAnswerSelect(idx)}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between mt-8">
                  <button
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    onClick={() =>
                      setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))
                    }
                    disabled={currentQuestionIndex === 0}
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Previous
                  </button>
                  <button
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
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
              </>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <button className="flex items-center gap-2 text-blue-600">
            <span className="w-5 h-5 flex items-center justify-center bg-blue-100 rounded">
              i
            </span>
            Instructions
          </button>
          <button
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            onClick={calculateResults}
          >
            Submit Test
          </button>
        </div>
      </footer>

      {/* Results Dialog */}
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
