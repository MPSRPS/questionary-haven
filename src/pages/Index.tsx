
import { useState } from "react";
import { Timer, ArrowLeft, ArrowRight } from "lucide-react";

const Index = () => {
  const [activeSubject, setActiveSubject] = useState("Mathematics");
  const [currentQuestion, setCurrentQuestion] = useState(6);
  const [timeLeft, setTimeLeft] = useState("01:54:11");

  // Mock data for the progress section
  const progress = {
    attempted: 6,
    marked: 0,
    notAnswered: 0,
    notVisited: 19,
  };

  const subjects = ["Physics", "Chemistry", "Mathematics"];
  const totalQuestions = 25;

  // Generate question numbers array
  const questionNumbers = Array.from({ length: totalQuestions }, (_, i) => i + 1);

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
            {subjects.map((subject) => (
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
                {questionNumbers.map((num) => (
                  <button
                    key={num}
                    className={`${
                      num === currentQuestion
                        ? "bg-green-500 text-white"
                        : num < currentQuestion
                        ? "bg-gray-100"
                        : "bg-gray-200"
                    } rounded p-2 text-sm font-medium`}
                    onClick={() => setCurrentQuestion(num)}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Question Area */}
          <div className="col-span-9 bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-medium">Question {currentQuestion}</h2>
              <div className="flex gap-2">
                <span className="text-green-600">+4</span>
                <span className="text-red-600">-1</span>
              </div>
            </div>

            {/* Question content would go here */}
            <div className="min-h-[400px]">
              {/* Question content placeholder */}
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8">
              <button
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                onClick={() => setCurrentQuestion((prev) => Math.max(1, prev - 1))}
              >
                <ArrowLeft className="w-4 h-4" />
                Previous
              </button>
              <button className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700">
                Clear Response
              </button>
              <button className="px-6 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200">
                Mark for Review & Next
              </button>
              <button
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                onClick={() => setCurrentQuestion((prev) => Math.min(totalQuestions, prev + 1))}
              >
                Save & Next
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
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
          <button className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            Submit Test
          </button>
        </div>
      </footer>
    </div>
  );
};

export default Index;
