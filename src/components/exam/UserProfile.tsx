
export const UserProfile = () => {
  return (
    <div className="p-4 border-b">
      <div className="flex items-center gap-4">
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
  );
};
