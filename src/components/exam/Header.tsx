
import { Timer, Maximize2, Minimize2 } from "lucide-react";

interface HeaderProps {
  timeLeft: number;
  activeSubject: string;
  isFullscreen: boolean;
  onSubjectChange: (subject: string) => void;
  onToggleFullscreen: () => void;
}

const formatTime = (seconds: number) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
};

export const Header = ({
  timeLeft,
  activeSubject,
  isFullscreen,
  onSubjectChange,
  onToggleFullscreen,
}: HeaderProps) => {
  return (
    <header className="bg-white border-b sticky top-0 z-10">
      <div className="max-w-screen-2xl mx-auto px-4 py-2 flex justify-between items-center">
        <h1 className="text-xl font-semibold text-blue-600">JEE Prep Master</h1>
        <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2 font-medium">
          <Timer className="w-4 h-4" />
          <span>{formatTime(timeLeft)}</span>
        </div>
        <button
          onClick={onToggleFullscreen}
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
              onClick={() => onSubjectChange(subject)}
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
  );
};
